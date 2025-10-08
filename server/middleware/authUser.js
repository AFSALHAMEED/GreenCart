import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  const { token } = req.cookies;
  console.log("token: ", token);

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_Key);
    console.log("tokenDecode: ", tokenDecode);
    if (tokenDecode) {
      req.user = { userId: tokenDecode.id };
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }
    next();
  } catch (error) {
    console.log("error: ", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

export default authUser;
