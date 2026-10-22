import { User } from "../models/users.model.js";
import { ApiError } from "../utils/ApiErrorHandler.js";
import { ApiResponse } from "../utils/ApiResponseHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 10 * 24 * 60 * 60 * 1000,
};

const generateRefreshAndAcessToken = async (user) => {
  // const user = await User.findById(userId)
  const refreshToken = await user.generateRefreshToken();
  const accessToken = await user.generateAccessToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { refreshToken, accessToken };
};

export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body || {};

  const cleanUsername = typeof username === "string" ? username.trim() : "";
  const cleanEmail = typeof email === "string" ? email.trim() : "";
  const cleanPassword =
    password !== undefined && password !== null ? String(password).trim() : "";

  if (!cleanUsername || !cleanEmail || !cleanPassword) {
    throw new ApiError(400, "All fields (username, email, password) are required");
  }

  const existingUser = await User.findOne({
    $or: [{ username: cleanUsername }, { email: cleanEmail }],
  });
  if (existingUser) {
    throw new ApiError(400, "User with this username or email already exists");
  }

  const user = await User.create({
    username: cleanUsername,
    email: cleanEmail,
    password: cleanPassword,
  });

  if (!user) {
    throw new ApiError(500, "failed to register user");
  }

  const { refreshToken, accessToken } = await generateRefreshAndAcessToken(user);
  const registeredUser = { _id: user._id, username: user.username, email: user.email };

  res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(new ApiResponse(200, "registered user successfully", registeredUser));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { login, password } = req.body;
  if (!login) {
    throw new ApiError(401, "username or email required");
  }

  if (!password) {
    throw new ApiError(401, "password is required");
  }

  const user = await User.findOne({
    $or: [{ username: login }, { email: login }],
  }).select("+password");
  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(String(password));
  if (!isPasswordCorrect) {
    throw new ApiError(401, "password is incorrect");
  }

  const { refreshToken, accessToken } =
    await generateRefreshAndAcessToken(user);
  const loggedInUser = {
    _id: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
  };

  res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(new ApiResponse(200, "user is logged in successfully", loggedInUser));
});

export const logOutUser = asyncHandler(async (req, res) => {
  const user = req.user;
  await User.findByIdAndUpdate(
    user?._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      returnDocument: "after",
    },
  );

  res
    .status(200)
    .clearCookie("refreshToken", cookieOptions)
    .clearCookie("accessToken", cookieOptions)
    .json(new ApiResponse(200, "user logged out successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;

  res.status(200).json(new ApiResponse(200, "current user found", {
    _id: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    currency: user.currency,
    monthlyBudget: user.monthlyBudget,
  }));
});

export const refreshTokens = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken ||
  req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "unauthorized access", ["token not provided"]);
  }
  const decoded = await jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  if (!decoded) {
    throw new ApiError(401, "invalid token");
  }

  const user = await User.findById(decoded?._id);

  if (!user || user?.refreshToken !== token) {
    throw new ApiError(404, "user not found");
  }
  const { refreshToken, accessToken } =
    await generateRefreshAndAcessToken(user);

  await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        refreshToken: refreshToken,
      },
    },
    {
      returnDocument: "after",
    },
  );
  const response = {
    refreshToken,
    accessToken,
  };

  res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(new ApiResponse(200, "refreshed tokens successfully", response));
});


export const deleteUser = asyncHandler(async (req, res) => {
  const user = req.user;

  await User.findByIdAndDelete({ _id: user._id });

  res
    .status(200)
    .clearCookie("refreshToken", cookieOptions)
    .clearCookie("accessToken", cookieOptions)
    .json(new ApiResponse(200, "user deleted"));
});
