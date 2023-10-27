import express, { request } from "express";
import { matchedData } from "express-validator";
import { createOrderValidationSchema } from "../validationSchema/orders/createOrderValidationSchema.js";
import orderModel from "../models/orderModel.js";
import { validateRequest } from "../helpers/validatorErrorHandling.js";
import guestModel from "../models/guestModel.js";
import bookingModel from "../models/bookingModel.js";
import cartModel from "../models/cartModel.js";
import { calculateCartTotal } from "../helpers/createCartTotal.js";
import notify from "../helpers/notifications/notify.js";
const router = express.Router();
import sendEmail from "../helpers/emails/sendEmail.js";
import storeModel from "../models/storeModel.js";
import axios from "axios";
import locationModel from "../models/locationModel.js";
import trackingModel from "../models/trackingModel.js";
import productModel from "../models/productModel.js";
import roomModel from "../models/roomModel.js";
import storeLocationModel from "../models/storeLocationModel.js";

async function createOrder(req, res) {
  try {
    const requestData = matchedData(req);

    const guest = await guestModel.findOne({ uid: requestData.guest });
    let additonalInfo = {};
    if (requestData.room) {
      const room = await roomModel.findOne({ _id: requestData.room });
      additonalInfo.block = room.block;
      additonalInfo.floor = room.floor;
    }
    if (requestData.store) {
      const store = await storeModel.findOne({
        _id: requestData.store,
      });
      additonalInfo.location = store.location;
    }

    let storeLocationInfo = null;
    if (requestData.storeLocation) {
      const storeLocation = await storeLocationModel.findOne({
        _id: requestData.storeLocation,
      });
      storeLocationInfo = storeLocation._id;
    }
    // const booking = await bookingModel.findOne({
    //   guests: { $in: guest._id },
    //   location: guest.location,
    //   bookingStatus: "checkedIn",
    // });
    // if (!booking) {
    //   return res.status(400).json({
    //     status: false,
    //     error: [{ msg: "Guest is not checked in" }],
    //   });
    // }
    const cart = await cartModel
      .findOne({ _id: requestData.cart })
      .populate({ path: "products.product", populate: { path: "addOns" } })
      .populate("products.addOns.addOn");
    const { addOnTotal, productTotal, discountedPrice, discountingPrice } =
      await calculateCartTotal(cart);
    const location = await locationModel.findOne({
      _id: additonalInfo.location,
    });
    if (guest.location !== additonalInfo.location) {
      await guestModel.findByIdAndUpdate(
        { _id: guest._id },
        { location: additonalInfo.location }
      );
    }
    const tracking = new trackingModel({
      ordered: {
        status: true,
        date: new Date(),
      },
    });
    for (let k = 0; k < cart.products.length; k++) {
      if (cart.products[k].product.stock < cart.products[k].quantity) {
        return res.status(400).json({
          status: false,
          error: [{ msg: "Product is out of stock" }],
        });
      }
      if (cart.products[k].quantity < 1) {
        return res.status(400).json({
          status: false,
          error: [{ msg: "Quantity of product cannot be less than 1" }],
        });
      }
    }
    const trackingResult = await tracking.save();

    const order = new orderModel({
      ...requestData,
      ...additonalInfo,
      storeLocation: storeLocationInfo,
      products: cart.products,
      createdBy: guest._id,
      updatedBy: guest._id,
      orderStatus: "ordered",
      addOnPrice: addOnTotal,
      productPrice: productTotal,
      discountPrice: discountingPrice,
      finalPrice: discountedPrice,
      status: true,
      property: location.property,
      guest: guest._id,
      tracking: trackingResult._id,
    });

    const writeResult = await order.save();
    for (let p = 0; p < writeResult.products.length; p++) {
      //update product stock
      const product = await productModel.findOne({
        _id: writeResult.products[p].product,
      });
      const productStock = product.stock - writeResult.products[p].quantity;
      await productModel.updateOne(
        { _id: writeResult.products[p].product },
        { stock: productStock }
      );
    }
    const store = await storeModel.findOne({ _id: requestData.store });

    try {
      axios.post(`${process.env.SOCKET_SERVICE_URL}/sendOrderListEvents`, {
        orderId: writeResult._id,
        storeId: requestData.store,
      });
    } catch (err) {}

    try {
      const name = guest?.name ?? "someone";
      await notify({
        userId: guest._id,
        propertyId: location?.property,
        location: [location?._id],
        stores: [writeResult.store],
        role: ["locationAdmin", "storeAdmin"],
        notificationText:
          name +
          " has created an order from  " +
          store.name +
          " worth " +
          writeResult.finalPrice +
          " which contains " +
          writeResult.products.length +
          `${writeResult.products.length === 1 ? " product" : " products"}`,
        authToken: req.headers["eazyrooms-token"],
        guest: {
          recive: false,
          id: guest._id,
        },
      });
    } catch (err) {
      console.log(err + "error in notification");
    }

    // send email to guest
    try {
      if (guest?.email) {
        await sendEmail({
          email: guest?.email,
          subject: "Order has been Placed",
          templateName: "orderStatusTemplate",
          variables: {
            fullName: guest?.name,
            orderStatus: "placed",
          },
          authToken: req.headers["eazyrooms-token"],
        });
      }
    } catch (error) {
      console.log(error);
    }

    // send WA message to guest
    try {
      await axios.post(
        process.env.CAMPAIGNS_SERVICE_URL + "/sendTransactionalWAMessage",
        {
          templateName: "order_confirm",
          phoneNumber: guest?.phoneNumber?.replace("+", ""),
          variables: {
            name: guest?.name,
            orderId: writeResult._id.substring(writeResult._id.length - 6),
            products: cart.products
              .map((product) => {
                return `${product.quantity}x ${product.product.name}`;
              })
              .toString(),
            orderTrackingLink: "https://guest.eazyrooms.com/" + writeResult._id,
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
    await cartModel.deleteOne({ _id: requestData.cart });
    res.status(200).json({ status: true, data: writeResult });
  } catch (err) {
    console.log({ err });
    res.status(500).json({ error: err });
  }
}

router.post(
  "/:guest",
  createOrderValidationSchema,
  validateRequest,
  createOrder
);
export default router;
