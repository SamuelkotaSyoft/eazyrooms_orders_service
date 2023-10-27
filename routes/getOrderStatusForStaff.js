import express from "express";
import Order from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { commonGetRequestValidationSchema } from "../validationSchema/orders/commonSchema.js";
import { validateRequest } from "../helpers/validatorErrorHandling.js";
import { matchedData } from "express-validator";
import { commonGetOrdersValidationSchema } from "../validationSchema/orders/getOrdersValidationSchema.js";
import verifyToken from "../helpers/verifyToken.js";
import sortByDate from "../helpers/filters/sortByDate.js";
const router = express.Router();
async function getStaffOrders(req, res) {
  try {
    const requestData = matchedData(req);
    const filterObj = {
      status: true,
    };
    const role = req.user_info.role;

    if (requestData.orderStatus) {
      if (typeof requestData.orderStatus === "string") {
        filterObj.orderStatus = requestData.orderStatus;
      } else {
        filterObj.orderStatus = {
          $in: requestData.orderStatus,
        };
      }
    } else {
      if (role === "staff") {
        filterObj.orderStatus = {
          $in: ["readyForDelivery", "outForDelivery", "delivered"],
        };
      }
    }

    if (requestData.status) {
      filterObj.status = requestData.status;
    }
    const uid = req.user_info.main_uid;
    sortByDate(requestData, filterObj);
    const staff = await userModel.findOne({ uid: uid });
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

    if (!staff) {
      res.status(400).json({ status: false, error: "Invalid staff" });
      return;
    }
    console.log(filterObj);
    const query = await Order.aggregate([
      {
        $match: filterObj,
      },
      {
        $group: {
          _id: "$orderStatus",
          totalCount: { $sum: 1 },
        },
      },
    ]);

    const result = {
      ordered: 0,
      scheduled: 0,
      adminAccepted: 0,
      accepted: 0,
      rejected: 0,
      preparing: 0,
      readyForDelivery: 0,
      delivered: 0,
    };

    query.forEach((status) => {
      result[status._id] = status.totalCount;
    });

    const totalOrderCount = await Order.countDocuments(filterObj).exec();
    res.status(200).json({
      status: true,
      data: { ...result, totalOrderCount },
    });
  } catch (err) {
    res.status(500).json({ status: false, error: err });
  }
}
export default router.get(
  "/",
  verifyToken,
  commonGetRequestValidationSchema,
  commonGetOrdersValidationSchema,
  validateRequest,
  getStaffOrders
);
