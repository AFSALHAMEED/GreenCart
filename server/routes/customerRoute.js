import express from "express";

import authUser from "../middleware/authUser.js";
import {
  isAuth,
  login,
  logout,
  register,
} from "../controller/customerController.js";

const customerRoute = express.Router();

customerRoute.post("/register", register);
customerRoute.post("/login", login);
customerRoute.get("/is-auth", authUser, isAuth);
customerRoute.get("/logout", logout);

export default customerRoute;
