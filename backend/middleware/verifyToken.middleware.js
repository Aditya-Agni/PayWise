import jwt  from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrorHandler.js";
import { User } from "../models/users.model.js";

export const verifyTokens = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");



    if(!token){
        throw new ApiError(401,"user is not logged in")
    }

  const decoded = await jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
  );

  if (!decoded) {
    throw new ApiError(401, "invalid token");
  }

  const user = await User.findById(decoded._id).select(
    " -password -refreshToken ",
  );
  if (!user) {
    throw new ApiError(404, "user not found");
  }

  req.user = user;
  next()
});
