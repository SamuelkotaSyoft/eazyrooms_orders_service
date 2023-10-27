import mongoose from "mongoose";

const addOnSchema = mongoose.Schema({
  name: String,
  price: Number,
  minQuantity: Number,
  maxQuantity: Number,
});

const productSchema = mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Location",
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    storeCategory: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "StoreCategory",
    },
    name: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    images: {
      type: [String],
      required: false,
    },
    estimatedTime: {
      type: Number,
      required: false,
    },
    initialPrice: {
      type: Number,
      required: false,
      default: 0,
    },
    finalPrice: {
      type: Number,
      required: false,
      default: 0,
    },
    isAddOn: {
      type: Boolean,
      required: false,
      default: false,
    },
    discount: {
      discountType: {
        type: String,
        enum: ["flat", "percentage", "nodiscount"],
        required: false,
        default: "nodiscount",
      },
      discountValue: { type: Number, required: false, default: 0 },
    },
    tax: {
      type: [mongoose.Schema.Types.ObjectId],
      required: false,
      ref: "Tax",
    },
    units: {
      type: String,
      required: false,
    },
    productQuantity: {
      type: Number,
      required: true,
      default: 1,
    },
    minQuantity: {
      type: Number,
      required: false,
      default: 0,
    },
    maxQuantity: {
      type: Number,
      required: false,
      default: 0,
    },
    stock: {
      type: Number,
      required: false,
    },
    sku: {
      type: String,
      required: false,
    },
    tag: {
      type: [mongoose.Schema.Types.ObjectId],
      required: false,
      ref: "ProductTag",
    },
    addOns: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "Product",
      },
    ],
    status: {
      type: Boolean,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: String,
      required: true,
    },
  },
  { timeStamps: true }
);

export default mongoose.model("Product", productSchema);
