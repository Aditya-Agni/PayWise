import cron from "node-cron";
import { checkAndSendDueAlerts } from "../services/alert.service.js";

/**
 * Initializes the automated daily cron job for recurring payment reminders
 */
export const initReminderCron = () => {
  // Runs every day at 09:00 AM server time ('0 9 * * *')
  const cronSchedule = process.env.ALERT_CRON_SCHEDULE || "0 9 * * *";

  cron.schedule(cronSchedule, async () => {
    console.log(`[PayWise Cron Trigger] Running scheduled alert check at ${new Date().toISOString()}...`);
    try {
      await checkAndSendDueAlerts(3);
    } catch (error) {
      console.error("[PayWise Cron Error] Scheduled alert check failed:", error.message);
    }
  });

  console.log(`[PayWise Cron] Daily alert job initialized (Schedule: "${cronSchedule}")`);
};

export default initReminderCron;
