import { errorResponse } from "../Utils/responseHandler.js";

export const errorHandler = (err, req, res, next) => {
  console.error("Express Error Handler:", err.stack || err.message);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  return errorResponse(res, err.message || "Internal Server Error", statusCode, err);
};
