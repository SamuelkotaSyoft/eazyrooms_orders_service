import mongoose from "mongoose";

import { addressSubSchema } from "./addressSubSchema.js";

const locationSchema = mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Property",
    },
    name: {
      type: String,
    },
    images: {
      type: [String],
      required: false,
    },
    address: {
      type: addressSubSchema,
      required: false,
    },
    locationAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    locationType: {
      type: String,
      required: true,
    },
    roomCount: {
      type: Number,
      required: true,
      min: 1,
    },

    standarCheckInTime: {
      type: String,
      required: false,
      default: "14:00",
    },
    standarCheckOutTime: {
      type: String,
      required: false,
      default: "2:00",
    },
    website: {
      type: String,
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    status: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Location", locationSchema);
