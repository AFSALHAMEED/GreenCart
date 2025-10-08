import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Customer from "../model/Customer.js";

export const register = async (req, res) => {
  try {
    const {
      firstName,
      email,
      password,
      phoneNumber,
      street,
      city,
      country,
      pincode,
      state,
    } = req.body;
    if (!firstName || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Details" });
    }
    const existingUser = await Customer.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email Already Exist" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Customer.create({
      name: firstName,
      email,
      password: hashedPassword,
      phone: phoneNumber,
      street,
      city,
      country,
      pincode,
      state,
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_Key, {
      expiresIn: "1d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({
      success: true,
      user: { name: user.name, email: user.email, isAdmin: !!user.isAdmin },
    });
  } catch (error) {
    console.log("error: ", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res
        .status(400)
        .json({ success: false, message: "Email and Password are required" });
    }
    const user = await Customer.findOne({ email });
    console.log("user: ", user);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email or Password are invalid",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_Key, {
      expiresIn: "1d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({
      success: true,
      user: { name: user.name, email: user.email, isAdmin: !!user.isAdmin },
    });
  } catch (error) {
    console.log("error: ", error);
    return res.status(401).json({ success: false, message: error.message });
  }
};

export const isAuth = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId).select("-password");
    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("error: ", error);
    return res.status(403).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    console.log("error: ", error);
    return res.json({ success: false, message: error.message });
  }
};
