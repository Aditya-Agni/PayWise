import { Router } from "express";
import {
  createRecurringPayment,
  getAllRecurringPayments,
  updateRecurringPayment,
  deleteRecurringPayment,
  markRecurringPaymentPaid,
} from "../controller/recurringPayment.controller.js";
import { verifyTokens } from "../middleware/verifyToken.middleware.js";

const router = Router();

// Recurring payments routes (protected by verifyTokens)
router
  .route("/")
  .get(verifyTokens, getAllRecurringPayments)
  .post(verifyTokens, createRecurringPayment);

router.route("/get-all").get(verifyTokens, getAllRecurringPayments);
router.route("/recurring-add").post(verifyTokens, createRecurringPayment);

router.route("/:id/pay").post(verifyTokens, markRecurringPaymentPaid);

router
  .route("/:id")
  .put(verifyTokens, updateRecurringPayment)
  .patch(verifyTokens, updateRecurringPayment)
  .delete(verifyTokens, deleteRecurringPayment);

export default router;
