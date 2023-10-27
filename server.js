import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import "./firebase-config.js";
import "./models/productModel.js";
import "./models/roomModel.js";
import "./models/locationModel.js";
import "./models/taxModel.js";
const app = express();
const port = 3009;
app.use(cors());
app.use(express.json());

/**
 *
 * dotenv config
 */
const __dirname = path.resolve();
dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

/**
 *
 * connect to mongodb
 */
await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
console.log("MONGODB CONNECTED...");

/**
 *
 * routes
 */
app.use("/createOrder", (await import("./routes/createOrders.js")).default);
app.use(
  "/creatOrderByWhatsapp",
  (await import("./routes/createOrderByWhatsApp.js")).default
);
app.use("/getOrderById", (await import("./routes/getOrderById.js")).default);

app.use(
  "/getOrderByStoreId",
  (await import("./routes/getOrderByStoreId.js")).default
);
app.use(
  "/getOrdersByLocationId",
  (await import("./routes/getOrderByLocationId.js")).default
);
app.use(
  "/updateOrdersById",
  (await import("./routes/updateOrderById.js")).default
);

app.use(
  "/getOrdersByPropertyId",
  (await import("./routes/getOrdersByPropertyId.js")).default
);
app.use(
  "/getOrdersByGuestId",
  (await import("./routes/getOrdersByGuestId.js")).default
);

app.use(
  "/getStaffOrders",
  (await import("./routes/getOrdersByStaffId.js")).default
);

app.use(
  "/getOrderStatus",
  (await import("./routes/getOrderStatusForStaff.js")).default
);
/**
 *
 * start listening to requests
 */
app.listen(port, () => {
  console.log(`Orders service listening on port ${port}`);
});

app.get("/", (req, res) => {
  res.status(200).json({ status: "OK", service: "Orders Service" });
});
