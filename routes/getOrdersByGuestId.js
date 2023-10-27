import express from "express";
import { commonGetRequestValidationSchema } from "../validationSchema/orders/commonSchema.js";
import { validateRequest } from "../helpers/validatorErrorHandling.js";
import { matchedData } from "express-validator";
import Order from "../models/orderModel.js";
import Guest from "../models/guestModel.js";
const router = express.Router();

async function getOrderByguestId(req, res) {
  const { guestId } = req.params;
  const requestData = matchedData(req);
  const filterObj = {};
  if (requestData.status) {
    filterObj.status = requestData.status;
  }
  if (requestData.active) {
    filterObj.active = requestData.active;
  }
  if (guestId) {
    const guest = await Guest.findOne({ uid: guestId });
    console.log(guest);
    filterObj.guest = guest._id;
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
      .sort({ updatedAt: -1 })
    
      .populate({
        path: "products.product",
        populate: { path: "addOns" },
      })
      .populate({
        path: "products.product",
        populate: { path: "location", select: ["currency"] },
      })

     
      .populate({
        path: "products.product",
        populate: { path: "tax" },
      })
      .populate("products.addOns.addOn")

      .populate("guest tracking store")
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
    console.log({ err });
    res.status(500).json({ error: err });
  }
}
export default router.get(
  "/:guestId",
  commonGetRequestValidationSchema,
  validateRequest,
  getOrderByguestId
);
