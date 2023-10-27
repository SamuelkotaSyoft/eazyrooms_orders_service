import { body, param } from "express-validator";
import Guest from "../../models/guestModel.js";
import blockModel from "../../models/blockModel.js";
import roomModel from "../../models/roomModel.js";
import floorModel from "../../models/floorModel.js";
import cartModel from "../../models/cartModel.js";
import Store from "../../models/storeModel.js";
import storeModel from "../../models/storeModel.js";
import locationModel from "../../models/locationModel.js";
import bookingModel from "../../models/bookingModel.js";
import guestModel from "../../models/guestModel.js";
import mongoose from "mongoose";
import storeLocationModel from "../../models/storeLocationModel.js";
const createOrderValidationSchema = [
  body("cart").custom(async (cartId) => {
    const cart = await cartModel.findOne({ _id: cartId });
    if (!cart) {
      return Promise.reject("Cart is required and should be a valid ObjectId");
    }
  }),
  body("storeLocation")
    .optional({ values: "falsy" })
    .custom(async (storeLocationId, { req }) => {
      if (!mongoose.Types.ObjectId.isValid(storeLocationId)) {
        return Promise.reject("Store location should be a valid ObjectId");
      } else {
        const storeLocation = await storeLocationModel.findOne({
          _id: storeLocationId,
          store: req.body.store,
          status: true,
        });
        if (!storeLocation) {
          return Promise.reject(
            "Store location should be associated with the store"
          );
        }
      }
    }),
  body("instructions").isString().optional(),
  body("paymentMethod")
    .isString()
    .notEmpty()
    .matches(/^(cash|card|wallet|online|bank|upi|check|other)$/i)
    .withMessage(
      "Payment method is required and should one of cash|card|wallet|online|bank|upi|check|other"
    ),

  body("store").custom(async (storeId) => {
    const store = await Store.findOne({ _id: storeId, status: true });
    if (!store) {
      throw new Error("Store is required and should be a valid ObjectId");
    }
  }),
  body("paymentStatus")
    .isString()
    .notEmpty()
    .matches(
      /^(pending|paid|failed|cancelled|refunded|preAuthorized|authorized)$/i
    )
    .withMessage(
      "Payment status is required and should be one pending|paid|failed|cancelled|refunded|preAuthorized|authorized"
    ),

  //!TODO   important to fix this
  body("room")
    .optional({ values: "falsy" })
    .custom(async (roomId, { req }) => {
      const isValidRoom = await roomModel.findOne({
        _id: roomId,
        status: true,
      });
      if (!isValidRoom) {
        throw new Error("Room is required and should be a valid ObjectId");
      }
      // if (req.body?.room) {
      //   const guest = await guestModel.findOne({ uid: req.body.guest });
      //   const booking = await bookingModel.findOne({
      //     roomNumber: roomId,
      //     bookingStatus: "checkedIn",
      //     checkInDate: { $lte: new Date() },
      //     checkOutDate: { $gte: new Date() },
      //   });
      //   if (!booking) {
      //     throw new Error(
      //       "You cannot place an order if the Room is not occupied"
      //     );
      //   }
      // }
    }),

  param("guest")
    .custom(async (guest, { req }) => {
      const store = await storeModel.findOne({ _id: req.body.store });
      await Guest.findOne({
        uid: guest,
        location: store.location,
        status: true,
      });
    })
    .withMessage("Guest is required and should be a valid ObjectId"),
];
export { createOrderValidationSchema };
