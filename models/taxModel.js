import mongoose from "mongoose";

const taxSchema = mongoose.Schema(
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

    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: false,
    },

    taxValue: {
      type: Number,
      required: true,
    },

    createdBy: {
      type: String,
      required: true,
      ref: "User",
    },

    updatedBy: {
      type: String,
      required: true,
      ref: "User",
    },
    active: {
      type: Boolean,
    },
    status: {
      type: Boolean,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Tax", taxSchema);
