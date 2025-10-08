import express from "express";
import authUser from "../middleware/authUser.js";
import {
  addBooking,
  getAllBookings,
  getMyBooking,
} from "../controller/bookController.js";

const bookRouter = express.Router();

bookRouter.post("/add-book", authUser, addBooking);
bookRouter.get("/my-booking", authUser, getMyBooking);
bookRouter.get("/allBookingList", authUser, getAllBookings);

export default bookRouter;
