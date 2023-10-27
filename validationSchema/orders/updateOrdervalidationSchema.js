import { body, param } from "express-validator";
import Guest from "../../models/guestModel.js";
import blockModel from "../../models/blockModel.js";
import roomModel from "../../models/roomModel.js";
import floorModel from "../../models/floorModel.js";
import userModel from "../../models/userModel.js";
import orderModel from "../../models/orderModel.js";
const updateOrderValidationSchema = [
  body("instructions").isString().optional(),
  body("orderId").custom(async (orderId) => {
    const isValidOrderId = await orderModel.findOne({
      _id: orderId,
      status: true,
    });
    if (!isValidOrderId) {
      throw new Error("Invalid orderId");
    }
  }),
  body("paymentStatus")
    .optional()
    .matches(
      /^(pending|paid|failed|cancelled|refunded|preAuthorized|authorized)$/i
    ),
  body("block")
    .optional({ values: null | undefined })
    .custom(async (blockId) => {
      await blockModel.findOne({ _id: blockId, status: true });
    })
    .withMessage("Block is required and should be a valid ObjectId"),
  body("floor")
    .optional({ values: null | undefined })
    .custom(async (floorId) => {
      await floorModel.findOne({ _id: floorId, status: true });
    })
    .withMessage("Floor is required and should be a valid ObjectId"),

  body("room")
    .optional({ values: null | undefined })
    .custom(async (roomId) => {
      await roomModel.findOne({ _id: roomId, status: true });
    })
    .withMessage("Room is required and should be a valid ObjectId"),

  // param("guest")
  //   .optional({ values: null | undefined })
  //   .custom(async (guest) => {
  //     await Guest.findOne({ guest: guest, status: true });
  //   })
  //   .withMessage("guest is required and should be a valid ObjectId"),

  body("orderStatus")
    .optional()
    .matches(
      /^(ordered|scheduled|adminAccepted|outForDelivery|accepted|rejected|preparing|readyForDelivery|delivered)$/i
    ),
  //TODO revert back to this
  // .custom((orderStatus, { req }) => {
  //   // const status = [
  //   //   "ordered",
  //   //   "scheduled",
  //   //   "adminAccepted",
  //   //   "preparing",
  //   //   "readyForDelivery",
  //   //   "outForDelivery",
  //   //   "pickedUpAndDelivered",
  //   // ];
  //   // if (orderStatus === "rejected") {
  //   //   if (req.body.rejectReason) {
  //   //     return true;
  //   //   } else {
  //   //     throw new Error(
  //   //       "rejectReason is required when orderStatus is rejected"
  //   //     );
  //   //   }
  //   // } else {
  //   //   return true;
  //   // }
  // }),
  body("rejectReason").isString().optional(),
  body("estimatedTime").isNumeric().optional(),
  body("assignedTo")
    .optional()
    .custom(async (assignedTo) => {
      const validStaff = await userModel.findOne({
        _id: assignedTo,
      });
      if (!validStaff) {
        throw new Error("assignedTo should be a valid staff id");
      }
    }),
];
export { updateOrderValidationSchema };
