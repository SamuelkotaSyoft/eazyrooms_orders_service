import mongoose from "mongoose";

const productSubScheama = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  },
  hasAddOn: {
    type: Boolean,
    required: false,
    default: false,
  },
  addOns: [
    {
      addOn: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "Product",
      },
      quantity: Number,
    },
  ],
  quantity: Number,
});
const cartSchema = mongoose.Schema({
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "Guest",
  },
  uuid: {
    type: String,
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Location",
  },
  products: {
    type: [productSubScheama],
  },
});

export default mongoose.model("Cart", cartSchema);
