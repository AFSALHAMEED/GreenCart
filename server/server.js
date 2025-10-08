import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import "dotenv/config";
import userRouter from "./routes/userRoutes.js";
import sellerRouter from "./routes/sellerRoutes.js";
import connectCloudinary from "./config/cloudinary.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRouter.js";
import addressRouter from "./routes/addressRouter.js";
import orderRouter from "./routes/orderRoute.js";
import { stripWebhooks } from "./controller/orderController.js";
import bodyParser from "body-parser";
import bookRouter from "./routes/bookingRoute.js";
import customerRoute from "./routes/customerRoute.js";

const app = express();

const port = process.env.PORT || 4000;

const allowedOrigin = [
  "http://localhost:5173",
  "https://green-cart-delta.vercel.app",
  "https://mantra-test-fronr-end.vercel.app",
];

await connectDB();
await connectCloudinary();

app.use(cookieParser());
app.use(cors({ origin: allowedOrigin, credentials: true }));

app.post(
  "/stripe",
  bodyParser.raw({ type: "application/json" }),
  stripWebhooks
);
app.use(express.json());

app.get("/", (req, res) => res.send("APi is working "));

app.use("/api/user", userRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);
app.use("/api/book", bookRouter);
app.use("/api/customer", customerRoute);

app.listen(port, () => {
  console.log(`server is running on port : http://localhost:${port}`);
});
