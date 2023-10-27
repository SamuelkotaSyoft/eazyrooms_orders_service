import express from "express";
import Order from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { commonGetRequestValidationSchema } from "../validationSchema/orders/commonSchema.js";
import { validateRequest } from "../helpers/validatorErrorHandling.js";
import { matchedData } from "express-validator";
import { commonGetOrdersValidationSchema } from "../validationSchema/orders/getOrdersValidationSchema.js";
import verifyToken from "../helpers/verifyToken.js";
import sortByDate from "../helpers/filters/sortByDate.js";
import paginatior from "../helpers/filters/paginator.js";
import paginatedResponse from "../helpers/responses/paginatedResponse.js";
const router = express.Router();
async function getStaffOrders(req, res) {
  const requestData = matchedData(req);
  const role = req.user_info.role;
  /**
   * filter
   */
  const filterObj = {
    status: true,
  };
  /**pagination */
  const { page, limit, skip } = paginatior(requestData);
  /**
   * startig the filter
   */
  if (requestData.status) {
    filterObj.status = requestData.status;
  }
  /**
   * this is used since we are using the same api for getting all orders for diffrent status
   */
  if (requestData.orderStatus) {
    filterObj.orderStatus = {
      $in: [requestData.orderStatus],
    };
  } else {
    /**
     * orderStatus is empty and is a staff , send him the readyfordelivery orders
     */
    if (role === "staff") {
      filterObj.orderStatus = {
        $in: ["readyForDelivery"],
      };
    }
  }

  /**
   * checking if the staff is valid or not
   */
  const staffId = req.user_info.main_uid;
  const staff = await userModel.findOne({ uid: staffId });
  if (!staff) {
    res.status(400).json({ status: false, error: "Invalid Staff" });
    return;
  }
  const validStaffModel = {
    store: staff?.stores,
    block: staff?.blocks,
    floor: staff?.floors,
    room: staff?.rooms,
    location: [staff?.location],
    property: [staff?.property],
  };
  Object.keys(validStaffModel).forEach((key) => {
    if (
      validStaffModel[key] === undefined ||
      validStaffModel[key] === null ||
      validStaffModel[key] === "" ||
      validStaffModel[key]?.length === 0
    ) {
      delete validStaffModel[key];
    } else {
      filterObj[key] = { $in: validStaffModel[key] };
    }
  });

  /**
   * default sort by lastWeek
   * and sort it
   */
  if (!requestData.sortBy) requestData.sortBy = "lastWeek";
  sortByDate(requestData, filterObj);

  const query = Order.find(filterObj)
    .sort({ updatedAt: -1 })
    .populate("products.product")
    .populate("products.addOns.addOn")
    .populate("guest")
    .populate("room")
    .populate("block")
    .populate("floor")
    .skip(skip)
    .limit(limit);
  const queryResult = await query.exec();
  const ordersCount = await Order.countDocuments(filterObj).exec();
  const result = paginatedResponse({
    queryKey: "orders",
    queryResult: queryResult,
    totalCount: ordersCount,
    page: Number(page),
    limit: limit,
  });
  res.status(200).json(result);
}
export default router.get(
  "/",
  verifyToken,
  commonGetRequestValidationSchema,
  commonGetOrdersValidationSchema,
  validateRequest,
  getStaffOrders
);
