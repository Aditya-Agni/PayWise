import { Router } from "express";
import { verifyTokens } from "../middleware/verifyToken.middleware.js";
import {
  spendingAnalysis,
  unusualSpending,
  recurringForecast,
  financialHealth,
} from "../controller/ai.controller.js";

const router = Router();

// All AI endpoints require authentication
router.use(verifyTokens);

router.post("/spending-analysis", spendingAnalysis);
router.post("/unusual-spending", unusualSpending);
router.post("/recurring-forecast", recurringForecast);
router.post("/financial-health", financialHealth);

export default router;
