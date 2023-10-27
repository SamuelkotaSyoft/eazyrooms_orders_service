import express, { request } from "express";
import { matchedData } from "express-validator";
import orderModel from "../models/orderModel.js";
import { validateRequest } from "../helpers/validatorErrorHandling.js";
import guestModel from "../models/guestModel.js";
import bookingModel from "../models/bookingModel.js";
import notify from "../helpers/notifications/notify.js";
const router = express.Router();
import sendEmail from "../helpers/emails/sendEmail.js";
import storeModel from "../models/storeModel.js";
import axios from "axios";
import { createOrderByWhatsappValidationSchema } from "../validationSchema/orders/createOrderByWhatsAppValidationSchema.js";
import { calculateCartTotal } from "../helpers/createCartTotal.js";
import productModel from "../models/productModel.js";
import locationModel from "../models/locationModel.js";

async function creatOrderByWhatsapp(req, res) {
  try {
    const requestData = matchedData(req);
    console.log(requestData);
    if (
      requestData.floor === null ||
      requestData.floor?.includes("undefined") ||
      requestData.floor === ""
    ) {
      delete requestData.floor;
    }
    if (
      requestData.block === null ||
      requestData.block?.includes("undefined") ||
      requestData.block === ""
    ) {
      delete requestData.block;
    }
    let guest = await guestModel.findOne({ _id: requestData.guest });

    const booking = await bookingModel.findOne({
      guests: { $in: guest._id },
      location: guest.location,
    });

    let products = [];
    for (let i = 0; i < requestData.products.length; i++) {
      const productData = await productModel.findOne({
        _id: requestData.products[i].product,
      });
      let addOns = [];
      // for (let j = 0; j < requestData.products[i].addOns?.length; j++) {
      //   const addOnData = await productModel.findOne({
      //     _id: requestData.products[i].addOns[j].addOn,
      //   });
      //   addOns.push({
      //     addOn: addOnData,
      //     quantity: requestData.products[i].addOns[j].quantity,
      //   });
      // }
      products.push({
        product: productData,
        quantity: requestData.products[i].quantity,
        discount: productData.discount,
        addOns: addOns,
      });
    }
    const { addOnTotal, productTotal, discountedPrice, discountingPrice } =
      await calculateCartTotal({
        products: products,
      });
    const location = await locationModel.findOne({
      _id: requestData?.location,
    });
    const order = new orderModel({
      ...requestData,
      products: requestData.products,
      createdBy: guest._id,
      updatedBy: guest._id,
      orderStatus: "ordered",
      addOnPrice: addOnTotal,
      productPrice: productTotal,
      discountPrice: discountingPrice,
      finalPrice: discountedPrice,
      status: true,
      location: location?._id,
      property: location?.property,
      guest: guest._id,
    });
    const writeResult = await order.save();
    const store = await storeModel.findOne({ _id: requestData.store });

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
          phoneNumber: guest?.phoneNumber,
          variables: {
            name: guest?.name,
            orderId: writeResult._id,
            products: products
              .map((product) => {
                return `${product.quantity}x ${product.product.name}`;
              })
              .toString(),
            orderTrackingLink:
              "https://guest.eazyrooms.com/tracking" + writeResult?._id,
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
    try {
      axios.post(`${process.env.SOCKET_SERVICE_URL}/sendOrderListEvents`, {
        orderId: writeResult._id,
        storeId: requestData.store,
      });
    } catch (err) {}
    try {
      await notify({
        userId: guest._id,
        propertyId: location?.property,
        location: [location?._id],
        stores: [writeResult.store],
        role: ["locationAdmin", "storeAdmin"],
        notificationText:
          guest.name +
          " has created an order from  " +
          store.name +
          " through whatsapp" +
          " contains " +
          writeResult.products.length +
          `${writeResult.products.length === 1 ? " product" : " products"}`,
        authToken: req.headers["eazyrooms-token"],
        guest: {
          recive: true,
          id: guest._id,
        },
      });
    } catch (err) {
      console.log(
        err,
        "<<<<error in whatsapp order creation notification>>>>>"
      );
    }

    res.status(200).json({ status: true, data: writeResult });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}

router.post(
  "/:guest",
  createOrderByWhatsappValidationSchema,
  validateRequest,
  creatOrderByWhatsapp
);
export default router;
