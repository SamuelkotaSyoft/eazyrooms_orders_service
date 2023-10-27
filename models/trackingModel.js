import mongoose from "mongoose";
const TrackingSchema = mongoose.Schema({
  ordered: {
    status: {
      type: Boolean,
      required: false,
      default: false,
    },
    date: {
      type: Date,
      required: false,
      default: Date.now,
    },
  },
  accepted: {
    status: {
      type: Boolean,
      required: false,
      default: false,
    },
    date: {
      type: Date,
      required: false,
      default: Date.now,
    },
  },
  preparing: {
    status: {
      type: Boolean,
      required: false,
      default: false,
    },
    date: {
      type: Date,
      required: false,
      default: Date.now,
    },
  },
  delivered: {
    status: {
      type: Boolean,
      required: false,
      default: false,
    },
    date: {
      type: Date,
      required: false,
      default: Date.now,
    },
  },
});
export default mongoose.model("Tracking", TrackingSchema);
