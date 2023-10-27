import express from "express";
import { matchedData } from "express-validator";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import notify from "../helpers/notifications/notify.js";
import { updateOrderValidationSchema } from "../validationSchema/orders/updateOrdervalidationSchema.js";
import { validateRequest } from "../helpers/validatorErrorHandling.js";
import verifyToken from "../helpers/verifyToken.js";
import userModel from "../models/userModel.js";
import guestModel from "../models/guestModel.js";
import sendEmail from "../helpers/emails/sendEmail.js";
import roomModel from "../models/roomModel.js";
import axios from "axios";
import trackingModel from "../models/trackingModel.js";
import productModel from "../models/productModel.js";
import storeModel from "../models/storeModel.js";

const router = express.Router();

async function updateOrderById(req, res) {
  try {
    const role = req.user_info.role;

    const requestData = matchedData(req);
    const uid = req.user_info.main_uid;
    const user = await userModel.findOne({ uid: uid });
    let assignedTo = null;
    if (requestData.orderStatus === "outForDelivery") {
      if (role === "staff") {
        assignedTo = user._id;
      }
    }

    const query = Order.findByIdAndUpdate(
      {
        _id: requestData.orderId,
      },
      {
        ...requestData,
        updatedBy: user._id,
        ...(assignedTo && { assignedTo }),
      },
      { new: true }
    );

    const order = await query.exec();
    if (order.orderStatus === "rejected") {
      for (let p = 0; p < order.products.length; p++) {
        //update product stock
        const product = await productModel.findOne({
          _id: order.products[p].product,
        });
        console.log({ product });
        const productStock =
          Number(product.stock ?? 0) + Number(order.products[p].quantity);
        console.log({ productStock });
        await productModel.updateOne(
          { _id: order.products[p].product },
          { stock: productStock }
        );
      }
    }

    const update = {};

    if (requestData.orderStatus === "adminAccepted") {
      update.accepted = {
        status: true,
        date: new Date(),
      };
    } else if (requestData.orderStatus === "preparing") {
      update.preparing = {
        status: true,
        date: new Date(),
      };
    } else if (requestData.orderStatus === "delivered") {
      update.delivered = {
        status: true,
        date: new Date(),
      };
    }

    await trackingModel.findOneAndUpdate({ _id: order.tracking }, update);
    let sendToGuest = null;
    if (
      order.orderStatus === "rejected" ||
      order.orderStatus === "delivered" ||
      order.orderStatus === "scheduled" ||
      order.orderStatus === "outForDelivery" ||
      order.orderStatus === "adminAccepted"
    ) {
      sendToGuest = order.guest;
    }
    axios.post(`${process.env.SOCKET_SERVICE_URL}/sendOrderListEvents`, {
      orderId: order._id,
      storeId: order.store,
      guest: sendToGuest,
      status:
        order.orderStatus === "adminAccepted" ? "accepted" : order.orderStatus,
      staffId: order?.assignedTo,
      includeAllStaff:
        requestData?.orderStatus === "readyForDelivery" ? true : false,
    });
    const guest = await guestModel.findOne({ _id: order.guest });
    let source = "";
    if (order.room) {
      const room = await roomModel.findOne({ _id: order.room });
      source = room.name;
    } else {
      const store = await storeModel.findOne({ _id: order.store });
      source = store.name;
    }
    let notification = {
      notificationType: "accepted",
      notificationText: user.fullName + " has updated an order from " + source,
    };
    const orderStatus = requestData?.orderStatus;
    if (orderStatus === "rejected") {
      notification.notificationType = "rejected";
    } else if (
      orderStatus === "outForDelivery" ||
      orderStatus === "preparing" ||
      orderStatus === "scheduled"
    ) {
      notification.notificationType = "warning";
    } else {
      notification.notificationType = "accepted";
    }
    //TODO CHANGE HERE in case of rejected
    if (requestData?.orderStatus) {
      notification.notificationText =
        user.fullName +
        " has updated an order from " +
        source +
        "to" +
        " " +
        requestData.orderStatus;
    }
    console.log({ guest: order.guest });

    try {
      await notify({
        userId: user._id,
        propertyId: user.property,
        location: [order.location],
        stores: [order.store],
        role: ["locationAdmin", "storeAdmin"],
        notificationText: notification.notificationText,
        authToken: req.headers["eazyrooms-token"],
        guest: {
          recive: true,
          id: order.guest,
        },
        notificationType: notification.notificationType,
      });
    } catch (error) {
      console.log(error);
    }

    try {
      await notify({
        userId: user._id,
        propertyId: user.property,
        location: [order.location],
        stores: [order.store],
        role: ["locationAdmin", "storeAdmin"],
        notificationText: notification.notificationText,
        authToken: req.headers["eazyrooms-token"],
        guest: {
          recive: true,
          id: order.guest,
        },
        notificationType: notification.notificationType,
      });
    } catch (error) {
      console.log(error);
    }

    try {
      if (guest?.email) {
        await sendEmail({
          email: guest?.email,
          subject: `Order ${requestData?.orderStatus}`,
          templateName: "orderStatusTemplate",
          variables: {
            fullName: guest.name,
            orderStatus: requestData?.orderStatus,
          },
          authToken: req.headers["eazyrooms-token"],
        });
      }
    } catch (error) {
      console.log(error);
    }

    // send whatsapp message to guest
    try {
      if (
        orderStatus === "ordered" ||
        orderStatus === "adminAccepted" ||
        orderStatus === "outForDelivery" ||
        orderStatus === "rejected" ||
        orderStatus === "scheduled"
      ) {
        await axios.post(
          process.env.CAMPAIGNS_SERVICE_URL + "/sendTransactionalWAMessage",
          {
            templateName: "order_status_update",
            phoneNumber: guest?.phoneNumber?.replace("+", ""),
            variables: {
              name: guest?.name,
              orderId: requestData.orderId.substring(
                requestData.orderId.length - 6
              ),
              orderStatus: requestData?.orderStatus,
              trackLink:
                "https://guest.eazyrooms.com/tracking/" + requestData.orderId,
            },
          }
        );
      }
    } catch (error) {
      console.log(error);
    }

    // delivered order message
    try {
      if (requestData?.orderStatus === "delivered") {
        await axios.post(
          process.env.CAMPAIGNS_SERVICE_URL + "/sendTransactionalWAMessage",
          {
            templateName: "order_fulfilled",
            phoneNumber: guest?.phoneNumber?.replace("+", ""),
            variables: {
              name: guest?.name,
              orderId: requestData.orderId,
            },
          }
        );
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: "Delivered message could not be sent" });
    }
    res.status(200).json({ message: "Order updated successfully" });
  } catch (err) {
    console.log({ err });
    res.status(500).json({ error: err });
  }
}

export default router.patch(
  "/",
  updateOrderValidationSchema,
  verifyToken,
  validateRequest,
  updateOrderById
);
