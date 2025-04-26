import express from "express";
import authUser from "../middleware/authUser.js";
import {
  getAllOrder,
  getOrder,
  placeOrderCOD,
  placeOrderStripe,
} from "../controller/orderController.js";
import authSeller from "../middleware/authSeller.js";

const orderRouter = express.Router();

orderRouter.post("/cod", authUser, placeOrderCOD);
orderRouter.post("/stripe", authUser, placeOrderStripe);
orderRouter.get("/user", authUser, getOrder);
orderRouter.get("/seller", authSeller, getAllOrder);

export default orderRouter;
