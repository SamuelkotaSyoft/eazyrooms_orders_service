import mongoose from "mongoose";
const producstSubSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    minLength: 1,
  },
  addOns: {
    type: [
      {
        addOn: mongoose.Schema.Types.ObjectId,
        quantity: Number,
      },
    ],
    required: false,
    ref: "Product",
    default: [],
  },
});

const orderSchema = mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Property",
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Location",
    },
    block: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "Block",
    },
    floor: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "Floor",
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "Room",
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Store",
    },
    orderSource: {
      type: String,
      required: false,
      default: "web",
    },
    storeLocation: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "StoreLocation",
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Guest",
    },
    products: [producstSubSchema],
    instructions: {
      type: String,
      required: false,
    },
    orderStatus: {
      //TODO changes this to enum
      //TODO update in validation schema
      type: String,
      enum: [
        "ordered",
        "scheduled",
        "adminAccepted",
        "rejected",
        "preparing",
        "readyForDelivery",
        "outForDelivery",
        "delivered",
      ],
    },
    rejectReason: {
      type: String,
      required: false,
    },
    ///changed this to products
    scheduledDateTime: {
      type: Date,
      required: false,
    },
    estimatedTime: {
      type: Number,
      required: false,
    },
    discountPrice: {
      type: Number,
      required: false,
      default: 0,
    },
    addOnPrice: {
      type: Number,
      required: false,
      default: 0,
    },
    productPrice: {
      type: Number,
      required: false,
      default: 0,
    },
    finalPrice: {
      type: Number,
      required: false,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "User",
    },
    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "cancelled",
        "refunded",
        "preAuthorized",
        "authorized",
        "partiallyRefunded",
        "partiallyPaid",
        "unpaid",
        "unsettled",
        "voided",
        "expired",
      ],
    },
    paymentMethod: {
      type: String,
      enum: [
        "cash",
        "card",
        "online",
        "wallet",
        "bank",
        "upi",
        "cheque",
        "other",
      ],
    },
    status: {
      type: Boolean,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Guest",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Guest",
    },
    tracking: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "Tracking",
    },
    //TODO add this in seperate collection
  },
  { timestamps: true }
);
export default mongoose.model("Order", orderSchema);
