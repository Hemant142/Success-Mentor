import jwt from "jsonwebtoken";
import User from "../Model/People/User.js";
import { errorResponse } from "../Utils/responseHandler.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWTSECRET || "success-mentor-Mk");
      
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return errorResponse(res, "User not found or token invalid", 401);
      }

      req.user = user;
      return next();
    } catch (err) {
      return errorResponse(res, "Not authorized, token failed", 401, err);
    }
  }

  if (!token) {
    return errorResponse(res, "Not authorized, no token provided", 401);
  }
};
