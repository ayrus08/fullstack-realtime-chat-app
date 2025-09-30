import Jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    // token name == jwt

    const token = req.cookies.jwt;

    if (!token)
      return res.status(401).json({ message: "Unauthorized!! No token!!" });

    const decodedToken = Jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken)
      return res
        .status(401)
        .json({ message: "Unauthorized!! Invalid token!!" });

    const user = await User.findById(decodedToken.userId).select("-password");

    if (!user) return res.status(404).json({ message: "User not found!" });

    req.user = user;

    next();
  } catch (error) {
    console.log("error in protectRoute middleware : ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
