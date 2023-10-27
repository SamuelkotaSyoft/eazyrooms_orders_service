import express from "express";
import { commonGetRequestValidationSchema } from "../validationSchema/orders/commonSchema.js";
import { validateRequest } from "../helpers/validatorErrorHandling.js";
import { matchedData } from "express-validator";
import Order from "../models/orderModel.js";
import { commonGetOrdersValidationSchema } from "../validationSchema/orders/getOrdersValidationSchema.js";
import paginatior from "../helpers/filters/paginator.js";
const router = express.Router();

async function getByLocationId(req, res) {
  const { location } = req.params;
  const requestData = matchedData(req);
  const filterObj = {};
  if (requestData.status) {
    filterObj.status = requestData.status;
  }
  if (requestData.active) {
    filterObj.active = requestData.active;
  }
  if (location) {
    filterObj.location = location;
  }
  if (requestData.orderStatus) {
    filterObj.orderStatus = {
      $in: [requestData.orderStatus],
    };
  }
  const { page, limit, skip } = paginatior(requestData);

  try {
    const queryResult = await Order.find(filterObj)
      .sort({ updatedAt: -1 })
      .populate("products.product")
      .populate("products.addOns.addOn")
      .populate("guest room store block floor storeLocation")
      .populate({
        path: "location",
        select: ["currency"],
      })
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
  "/:location",
  commonGetRequestValidationSchema,
  commonGetOrdersValidationSchema,
  validateRequest,
  getByLocationId
);
