import express from "express";
import { commonGetRequestValidationSchema } from "../validationSchema/orders/commonSchema.js";
import { validateRequest } from "../helpers/validatorErrorHandling.js";
import { matchedData } from "express-validator";
import Order from "../models/orderModel.js";
import verifyToken from "../helpers/verifyToken.js";
import userModel from "../models/userModel.js";
import paginatior from "../helpers/filters/paginator.js";
const router = express.Router();

async function getOrderByPropertyId(req, res) {
  try {
    const requestData = matchedData(req);
    const filterObj = {};
    const uid = req.user_info.main_uid;
    if (requestData.status) {
      filterObj.status = requestData.status;
    }
    if (requestData.active) {
      filterObj.active = requestData.active;
    }
    const user = await userModel.findOne({ uid: uid });
    if (user.property) {
      filterObj.property = user.property;
    }
    const { page, limit, skip } = paginatior(requestData);

    const queryResult = await Order.find(filterObj)
      .populate("products.product")
      .populate("products.addOns.addOn")
      .populate("guest")
      .skip(skip)
      .limit(limit);

    const ordersCount = await Order.countDocuments(filterObj).exec();

    res.status(200).json({
      status: true,
      data: {
        orders: queryResult,
        page: Number(requestData.page),
        limit: limit,
        totalPageCount: Math.ceil(ordersCount / limit),
        totalCount: ordersCount,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}
export default router.get(
  "/",
  verifyToken,
  commonGetRequestValidationSchema,
  validateRequest,
  getOrderByPropertyId
);
