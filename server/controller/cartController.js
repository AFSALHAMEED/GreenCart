import User from "../model/User.js";

export const updateCart = async (req, res) => {
  try {
    const { userId } = req.user;
    const { cartItem } = req.body;
    await User.findByIdAndUpdate(userId, { cartItem });
    res.json({ success: true, message: "Cart Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
