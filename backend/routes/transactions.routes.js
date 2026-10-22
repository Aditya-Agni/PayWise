import { Router } from "express";
import {
  createTransaction,
  editTransaction,
  deleteTransaction,
} from "../controller/transactions.controller.js";
import { verifyTokens } from "../middleware/verifyToken.middleware.js";

const router = Router();

// Transaction routes (protected by verifyTokens)
router.route("/transaction-add").post(verifyTokens, createTransaction);
router
  .route("/transaction-edit/:id")
  .put(verifyTokens, editTransaction)
  .patch(verifyTokens, editTransaction);
router
  .route("/transaction-delete/:id")
  .delete(verifyTokens, deleteTransaction);

export default router;
