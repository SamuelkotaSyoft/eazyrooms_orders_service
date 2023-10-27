import { body, param } from "express-validator";
import Guest from "../../models/guestModel.js";
import blockModel from "../../models/blockModel.js";
import roomModel from "../../models/roomModel.js";
import floorModel from "../../models/floorModel.js";
import cartModel from "../../models/cartModel.js";
import Store from "../../models/storeModel.js";
import storeModel from "../../models/storeModel.js";
import productModel from "../../models/productModel.js";
import locationModel from "../../models/locationModel.js";
const createOrderByWhatsappValidationSchema = [
  body("products.*.product").custom(async (productId) => {
    const product = await productModel.findOne({ _id: productId });
    if (!product) {
      return Promise.reject(
        "Product is required and should be a valid ObjectId"
      );
    }
  }),
  body("products.*.quantity").isInt({ min: 1 }),
  body("products.*.addOns").optional().isArray(),
  body("instructions").isString().optional(),
  body("paymentMethod")
    .isString()
    .notEmpty()
    .matches(/^(cash|card|wallet|online|bank|upi|check|other)$/i)
    .withMessage(
      "PaymentMethod is required and should one of cash|card|wallet|online|bank|upi|check|other"
    ),

  body("store").custom(async (storeId) => {
    const store = await Store.findOne({ _id: storeId, status: true });
    if (!store) {
      throw new Error("Store is required and should be a valid ObjectId");
    }
  }),
  body("orderSource").optional({ values: "falsy" }),
  body("paymentStatus")
    .isString()
    .notEmpty()
    .matches(
      /^(pending|paid|failed|cancelled|refunded|preAuthorized|authorized)$/i
    )
    .withMessage(
      "PaymentStatus is required and should be one pending|paid|failed|cancelled|refunded|preAuthorized|authorized"
    ),
  body("block").optional({ values: null | undefined }),

  body("floor").optional({ values: null | undefined }),

  body("room")
    .optional({ values: "falsy" })
    .custom(async (roomId) => {
      await roomModel.findOne({ _id: roomId, status: true });
    })
    .withMessage("Room is required and should be a valid ObjectId"),
  body("location").custom(async (locationId) => {
    const isValidLocation = await locationModel.findOne({
      _id: locationId,
    });
    if (!isValidLocation) {
      throw new Error("Invalid locationId");
    }
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
export { createOrderByWhatsappValidationSchema };
