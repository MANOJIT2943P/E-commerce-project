# Nodemailer Setup Guide - Order Notifications

This guide explains how to configure Nodemailer for sending order confirmation emails in the e-commerce application.

## Overview

Nodemailer is already installed in the project. When a customer successfully places an order, the system will automatically send them a professional HTML email confirmation with:

- Order ID and order details
- List of purchased products with quantities and prices
- Total amount
- Shipping address and contact information
- Order status
- Next steps information

## Prerequisites

- Node.js installed
- Email account (Gmail recommended, or custom SMTP server)
- For Gmail: 2-Factor Authentication enabled on your Google Account

## Setup Instructions

### Option 1: Gmail (Recommended for Testing)

#### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com
2. Click "Security" in the left sidebar
3. Scroll down to "2-Step Verification" and enable it
4. Follow Google's verification process

#### Step 2: Generate App Password

1. Go to Google App Passwords: https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select "Windows Computer" (or your OS) as the device
4. Google will generate a 16-character password
5. Copy this password (without spaces)

#### Step 3: Configure Environment Variables

Add these to your `.env` file:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # Replace with your 16-character app password (without spaces)
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=E-Commerce Store
SUPPORT_EMAIL=support@ecommerce.com
```

### Option 2: Custom SMTP Server

If you're using a different email provider (SendGrid, Mailgun, Zoho, etc.), configure:

```env
# Email Configuration
EMAIL_SERVICE=custom
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=your-email@example.com
EMAIL_FROM_NAME=E-Commerce Store
SUPPORT_EMAIL=support@ecommerce.com
```

Replace the host and port with your provider's SMTP details.

### Step 4: Test Email Configuration

After configuring your environment variables, the system will automatically:

1. Validate email credentials on startup
2. Send confirmation emails when orders are placed
3. Log success/failure messages in the console

You should see logs like:

- ✓ Order confirmation email sent: <message-id>
- ✗ Failed to send order confirmation email: <error-message>

## Email Features

### Order Confirmation Email

- **Triggered**: When a customer successfully completes checkout
- **Recipient**: Customer's email address
- **Subject**: Order Confirmation - Order #XXXXXXXX
- **Content**: Professional HTML template with:
  - Order ID and date
  - Product details (name, quantity, price)
  - Shipping address
  - Total amount
  - Contact information
  - Next steps

### Email Service Files

1. **config/email.js**
   - Email transporter configuration
   - Supports Gmail and custom SMTP
   - Validates credentials on startup

2. **utils/emailService.js**
   - `sendOrderConfirmationEmail()` - Send order confirmation
   - `sendOrderStatusUpdateEmail()` - Send status updates (future use)
   - HTML email template generation

3. **controllers/orderController.js**
   - Calls `sendOrderConfirmationEmail()` after successful checkout
   - Non-blocking: Email sending doesn't delay the checkout response

## Important Notes

### Email Sending is Non-Blocking

- Email notifications are sent asynchronously
- If email fails, the order is still successfully created
- Errors are logged to the console
- The customer sees a successful checkout response

### Gmail App Passwords

- Never use your regular Gmail password
- Always use the 16-character app password
- App passwords expire if you reset your Google password

### Security

- Never commit `.env` files with real credentials to version control
- Keep `.env` files out of your repository
- Rotate passwords periodically
- Use environment-specific email addresses

## Troubleshooting

### "Email transporter not configured" Warning

**Problem**: You see this warning when placing orders
**Solution**:

- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are set in `.env`
- Restart the backend server after updating `.env`
- Check that credentials are correct

### "Failed to send order confirmation email"

**Problem**: Email sending is failing
**Solutions**:

- For Gmail: Verify you're using the 16-character app password (not your regular password)
- For Gmail: Check that 2-Factor Authentication is enabled
- For Custom SMTP: Verify host, port, username, and password are correct
- Check firewall/network restrictions on port 587 (or your SMTP port)
- Verify the email address in `EMAIL_FROM` is valid for your account

### Gmail "Less secure app access" Error

**Problem**: "Less secure app access was turned off"
**Solution**:

- Don't enable "Less secure app access"
- Use the App Password method instead (recommended)
- Generate an app password as described in the setup instructions

### Testing Email Configuration

To manually test email sending:

```javascript
// In Node.js REPL
import { sendOrderConfirmationEmail } from "./utils/emailService.js";

const testOrder = {
  _id: "test123",
  createdAt: new Date(),
  items: [{ productName: "Test Product", quantity: 1, priceSnapshot: 99.99 }],
  totalAmount: 99.99,
  shippingAddress: {
    addressLine1: "123 Test St",
    city: "Test City",
    state: "TS",
    postalCode: "12345",
    country: "Test Country",
  },
};

const testContact = {
  fullName: "Test User",
  email: "your-test-email@gmail.com",
};

await sendOrderConfirmationEmail(testOrder, testContact.email, testContact);
```

## Future Enhancements

The email service is designed to be extensible. You can easily add:

1. **Order Shipped Notification**

   ```javascript
   sendOrderStatusUpdateEmail(
     order,
     email,
     "Shipped",
     "Your order has been dispatched...",
   );
   ```

2. **Delivery Confirmation**

   ```javascript
   sendOrderStatusUpdateEmail(
     order,
     email,
     "Delivered",
     "Your order was delivered...",
   );
   ```

3. **Abandoned Cart Reminder**
   - Send emails to users with items in cart but no checkout

4. **Invoice Generation**
   - Attach PDF invoice to confirmation email

5. **Admin Notifications**
   - Notify admins when new orders are placed

## File Structure

```
unified-backend/
├── config/
│   └── email.js                    # Email transporter configuration
├── utils/
│   └── emailService.js             # Email sending functions
├── controllers/
│   └── orderController.js          # Updated to send emails
├── .env.example                    # Email configuration template
└── README.md                        # This file
```

## Support

If you encounter any issues:

1. Check console logs for error messages
2. Verify all environment variables are correctly set
3. Test with a simple order to see email logs
4. Review this guide's troubleshooting section
5. Check the Nodemailer documentation: https://nodemailer.com

---

**Last Updated**: May 2026
**Nodemailer Version**: Latest (installed via npm)
