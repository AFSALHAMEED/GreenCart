import jwt from "jsonwebtoken";

const authSeller = async (req, res, next) => {
  const { sellerToken } = req.cookies;
  if (!sellerToken) {
    return res.json({ success: false, message: "Not authorized" });
  }
  try {
    const tokenDecode = jwt.verify(sellerToken, process.env.JWT_Key);
    if (tokenDecode.email === process.env.SELLER_EMAIL) {
      next();
    } else {
      return res.json({ success: false, message: "Not authorized" });
    }
  } catch (error) {
    console.log("error: ", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

export default authSeller;
