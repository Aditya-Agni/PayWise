import { Router } from "express";
import { getCurrentUser, deleteUser, loginUser, logOutUser, refreshTokens, registerUser } from "../controller/user.controller.js";
import { verifyTokens } from "../middleware/verifyToken.middleware.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser);
router.route("/logout").post(verifyTokens,logOutUser);
router.route("/current-user").get(verifyTokens, getCurrentUser);
router.route("/delete").delete(verifyTokens, deleteUser);







export default router
