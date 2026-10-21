const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');
const User = require('../models/User');
const env = require('../config/env');
const logger = require('../utils/logger');

class NotificationService {
  static transporter = null;

  /**
   * Get or initialize Nodemailer transporter (Ethereal test account or local console)
   */
  static async getTransporter() {
    if (NotificationService.transporter) {
      return NotificationService.transporter;
    }

    if (env.NODE_ENV === 'test') {
      NotificationService.transporter = {
        sendMail: async (mailOptions) => ({ messageId: 'test-mock-id' }),
      };
      return NotificationService.transporter;
    }

    if (env.SMTP_USER && env.SMTP_PASS) {
      NotificationService.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    } else {
      // Default to robust console logging transport in development
      NotificationService.transporter = {
        sendMail: async (mailOptions) => {
          logger.info(`[EMAIL DISPATCH] To: ${mailOptions.to} | Subject: ${mailOptions.subject}`);
          return { messageId: `mock-email-${Date.now()}` };
        },
      };
    }

    return NotificationService.transporter;
  }

  /**
   * Create an in-app notification and dispatch email
   */
  static async notify({
    userId,
    type,
    message,
    vulnerabilityId = null,
    emailSubject = null,
    emailHtml = null,
  }) {
    try {
      if (!userId) return null;

      // 1. In-app notification
      const notification = await Notification.create({
        user: userId,
        type,
        message,
        vulnerability: vulnerabilityId,
      });

      // 2. Email notification
      const user = await User.findById(userId);
      if (user && user.email) {
        const transporter = await NotificationService.getTransporter();
        const subject = emailSubject || `[FlawTrack Alert] ${type.replace(/_/g, ' ')}`;
        const html = emailHtml || `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2563eb;">FlawTrack Notification</h2>
            <p><strong>Type:</strong> ${type}</p>
            <p>${message}</p>
            ${vulnerabilityId ? `<p><a href="${env.FRONTEND_URL}/vulnerabilities/${vulnerabilityId}">View Vulnerability in FlawTrack</a></p>` : ''}
            <hr style="border: 1px solid #eee; margin-top: 20px;" />
            <small style="color: #777;">This is an automated security notification from FlawTrack.</small>
          </div>
        `;

        try {
          const info = await transporter.sendMail({
            from: env.SMTP_FROM,
            to: user.email,
            subject,
            html,
          });
          logger.debug(`Email sent to ${user.email}: ${info.messageId}`);
        } catch (emailErr) {
          logger.warn(`Email sending failed for ${user.email}: ${emailErr.message}`);
        }
      }

      return notification;
    } catch (err) {
      logger.error(`Failed to dispatch notification: ${err.message}`);
      return null;
    }
  }
}

module.exports = NotificationService;
