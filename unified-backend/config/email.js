/**
 * Email Configuration
 * Handles Nodemailer setup for sending order notifications
 */

import nodemailer from 'nodemailer';

/**
 * Create and export email transporter
 * Supports both Gmail (via app password) and custom SMTP servers
 */
const createEmailTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailHost = process.env.EMAIL_HOST;
  const emailPort = process.env.EMAIL_PORT;

  // Validate required environment variables
  if (!emailUser || !emailPassword) {
    console.warn('⚠️  Email credentials not configured. Email notifications will be disabled.');
    return null;
  }

  // For Gmail or other standard services
  if (emailService === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword // Use Gmail App Password, not regular password
      }
    });
  }

  // For custom SMTP servers
  return nodemailer.createTransport({
    host: emailHost,
    port: emailPort || 587,
    secure: emailPort === 465, // true for 465, false for other ports
    auth: {
      user: emailUser,
      pass: emailPassword
    }
  });
};

export const emailTransporter = createEmailTransporter();

export const emailConfig = {
  fromEmail: process.env.EMAIL_FROM || process.env.EMAIL_USER,
  fromName: process.env.EMAIL_FROM_NAME || 'E-Commerce Store',
  supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER
};
