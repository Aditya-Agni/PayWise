import { RecurringPayment } from "../models/recurringPayment.model.js";
import { sendEmail } from "../utils/sendEmail.js";

/**
 * Formats a clean, modern HTML email for upcoming payment reminders
 */
const generateReminderEmailHtml = ({ username, serviceName, amount, dueDate, daysLeftText, paymentMethod }) => {
  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);

  const formattedDate = new Date(dueDate).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f9fa; margin: 0; padding: 20px; color: #1a1a1a; }
      .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #ebebeb; }
      .header { background: #0f172a; padding: 28px 32px; text-align: left; }
      .logo { font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; }
      .logo span { color: #38bdf8; }
      .content { padding: 32px; }
      .greeting { font-size: 18px; font-weight: 600; margin-bottom: 12px; }
      .lead { font-size: 15px; color: #525252; line-height: 1.5; margin-bottom: 24px; }
      .bill-card { background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; margin-bottom: 24px; }
      .bill-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
      .bill-row:last-child { margin-bottom: 0; padding-top: 12px; border-top: 1px dashed #cbd5e1; }
      .label { color: #64748b; }
      .value { font-weight: 600; color: #0f172a; text-align: right; }
      .amount-badge { font-size: 22px; font-weight: 700; color: #0f172a; }
      .alert-tag { display: inline-block; background: #fef3c7; color: #b45309; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
      .footer { background: #f8fafc; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">Pay<span>Wise</span></div>
      </div>
      <div class="content">
        <div class="alert-tag">⏰ ${daysLeftText}</div>
        <div class="greeting">Hi ${username || "there"},</div>
        <div class="lead">This is a quick reminder that your recurring payment for <strong>${serviceName}</strong> is due soon.</div>
        
        <div class="bill-card">
          <div class="bill-row">
            <span class="label">Service / Subscription</span>
            <span class="value">${serviceName}</span>
          </div>
          <div class="bill-row">
            <span class="label">Due Date</span>
            <span class="value">${formattedDate}</span>
          </div>
          <div class="bill-row">
            <span class="label">Payment Method</span>
            <span class="value">${paymentMethod || "UPI"}</span>
          </div>
          <div class="bill-row">
            <span class="label">Amount Due</span>
            <span class="amount-badge">${formattedAmount}</span>
          </div>
        </div>
        
        <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin: 0;">
          Make sure your account has sufficient balance to avoid service interruptions. Once paid, remember to mark it as paid in your PayWise dashboard!
        </p>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} PayWise. Automated reminder for your recurring commitments.
      </div>
    </div>
  </body>
  </html>
  `;
};

/**
 * Checks for upcoming recurring payments and sends alert emails
 * @param {number} daysAhead - How many days ahead to look for due bills (default: 3 days)
 * @returns {Promise<Object>} Summary of alerts sent
 */
export const checkAndSendDueAlerts = async (daysAhead = 3) => {
  console.log(`[PayWise Alerts] Starting check for bills due in next ${daysAhead} days...`);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

  const windowEnd = new Date(startOfToday);
  windowEnd.setDate(windowEnd.getDate() + daysAhead);
  windowEnd.setHours(23, 59, 59, 999);

  // Find active recurring payments due within the window
  const upcomingPayments = await RecurringPayment.find({
    status: "active",
    nextDueDate: { $gte: startOfToday, $lte: windowEnd },
  }).populate("user", "username email");

  console.log(`[PayWise Alerts] Found ${upcomingPayments.length} active bills in due window.`);

  let sentCount = 0;
  const results = [];

  for (const item of upcomingPayments) {
    const user = item.user;

    // Check if user has an email
    if (!user || !user.email) {
      console.log(`[PayWise Alerts] Skipping item "${item.name}": user has no email address`);
      continue;
    }

    // Prevent duplicate emails: don't alert if an alert was already sent today
    if (item.lastAlertSentDate) {
      const lastAlertDate = new Date(item.lastAlertSentDate);
      if (lastAlertDate >= startOfToday) {
        console.log(`[PayWise Alerts] Skipping "${item.name}" for ${user.email}: already alerted today`);
        continue;
      }
    }

    // Calculate days remaining
    const dueDate = new Date(item.nextDueDate);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let daysLeftText = "Upcoming Payment Due";
    if (diffDays <= 0) {
      daysLeftText = "Payment Due Today!";
    } else if (diffDays === 1) {
      daysLeftText = "Payment Due Tomorrow!";
    } else {
      daysLeftText = `Payment Due in ${diffDays} Days`;
    }

    const html = generateReminderEmailHtml({
      username: user.username,
      serviceName: item.name,
      amount: item.amount,
      dueDate: item.nextDueDate,
      daysLeftText,
      paymentMethod: item.paymentMethod,
    });

    try {
      await sendEmail({
        to: user.email,
        subject: `[Reminder] Your ${item.name} payment of ₹${item.amount} is ${daysLeftText.toLowerCase()}`,
        html,
      });

      // Update last alert sent date
      item.lastAlertSentDate = new Date();
      await item.save();

      sentCount++;
      results.push({
        id: item._id,
        name: item.name,
        userEmail: user.email,
        daysLeftText,
        status: "sent",
      });
    } catch (err) {
      console.error(`[PayWise Alerts] Error sending alert for "${item.name}":`, err.message);
      results.push({
        id: item._id,
        name: item.name,
        userEmail: user.email,
        status: "failed",
        error: err.message,
      });
    }
  }

  console.log(`[PayWise Alerts] Completed check. Sent ${sentCount} reminder emails.`);
  return {
    success: true,
    sentCount,
    totalFound: upcomingPayments.length,
    results,
  };
};

export default checkAndSendDueAlerts;
