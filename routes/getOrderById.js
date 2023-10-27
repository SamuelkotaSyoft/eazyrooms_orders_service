import express from "express";
import { commonGetRequestValidationSchema } from "../validationSchema/orders/commonSchema.js";
import { validateRequest } from "../helpers/validatorErrorHandling.js";
import { matchedData } from "express-validator";
import Order from "../models/orderModel.js";
const router = express.Router();

async function getOrderById(req, res) {
  const { orderId } = req.params;
  const requestData = matchedData(req);
  const filterObj = {};
  if (requestData.status) {
    filterObj.status = requestData.status;
  }
  if (requestData.active) {
    filterObj.active = requestData.active;
  }
  if (orderId) {
    filterObj._id = orderId;
  }

  try {
    const queryResult = await Order.findOne(filterObj)
      .populate("products.product")
      .populate("products.addOns.addOn")
      .populate("guest tracking")
      .populate({
        path: "location",
        select: ["currency"],
      });

    res.status(200).json({
      status: true,
      data: queryResult,
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}
export default router.get(
  "/:orderId",
  commonGetRequestValidationSchema,
  validateRequest,
  getOrderById
);
