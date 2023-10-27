import express from "express";
import { commonGetRequestValidationSchema } from "../validationSchema/orders/commonSchema.js";
import { validateRequest } from "../helpers/validatorErrorHandling.js";
import { matchedData } from "express-validator";
import Order from "../models/orderModel.js";
const router = express.Router();

async function getOrderByStoreId(req, res) {
  const { storeId } = req.params;
  const requestData = matchedData(req);
  const filterObj = {};
  if (requestData.status) {
    filterObj.status = requestData.status;
  }
  if (requestData.active) {
    filterObj.active = requestData.active;
  }
  if (storeId) {
    filterObj.store = storeId;
  }
  let page = null;
  let limit = null;
  let skip = 0;
  if (requestData.page && requestData.limit) {
    page = parseInt(requestData.page);
    limit = parseInt(requestData.limit);
    skip = (page - 1) * limit;
  }
  try {
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
  "/:storeId",
  commonGetRequestValidationSchema,
  validateRequest,
  getOrderByStoreId
);
