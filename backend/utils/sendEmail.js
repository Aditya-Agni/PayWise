import nodemailer from "nodemailer";

/**
 * Creates and configures the Nodemailer transporter
 */
const createTransporter = () => {
  const user = process.env.EMAIL_USER?.trim() || "";
  const pass = process.env.EMAIL_PASS?.replace(/\s+/g, "").trim() || "";
  const host = process.env.EMAIL_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.EMAIL_PORT) || 587;

  // If using Gmail, using service: 'gmail' is the most reliable configuration
  if (host.includes("gmail") || user.endsWith("@gmail.com")) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  }

  // Standard SMTP configuration
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Send an email notification
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.text] - Plain text fallback
 * @returns {Promise<Object>} Nodemailer send info
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) {
    throw new Error("Recipient email address ('to') is required to send email");
  }

  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || `"PayWise Alerts" <${process.env.EMAIL_USER}>`;

  const mailOptions = {
    from,
    to,
    subject,
    text: text || html.replace(/<[^>]+>/g, ""), // strip html tags for text fallback
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[PayWise Email] Email sent successfully to ${to} (MessageId: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error(`[PayWise Email Error] Failed to send email to ${to}:`, error.message);
    throw error;
  }
};

export default sendEmail;
