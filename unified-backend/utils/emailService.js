/**
 * Email Service
 * Handles sending order confirmation and notification emails
 */

import { emailTransporter, emailConfig } from '../config/email.js';

/**
 * Generate HTML email template for order confirmation
 * @param {Object} order - Order object
 * @param {Object} customerContact - Customer contact information
 * @returns {string} HTML email template
 */
const generateOrderConfirmationHTML = (order, customerContact) => {
  const itemsHTML = order.items
    .map(
      item =>
        `
        <tr style="border-bottom: 1px solid #eee; padding: 10px 0;">
          <td style="padding: 10px; text-align: left; color: #333;">${item.productName}</td>
          <td style="padding: 10px; text-align: center; color: #333;">${item.quantity}</td>
          <td style="padding: 10px; text-align: right; color: #333;">$${item.priceSnapshot.toFixed(2)}</td>
          <td style="padding: 10px; text-align: right; color: #333;">$${(item.priceSnapshot * item.quantity).toFixed(2)}</td>
        </tr>
      `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f5f5f5;
                margin: 0;
                padding: 0;
            }
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
            }
            .content {
                padding: 30px 20px;
            }
            .greeting {
                font-size: 16px;
                color: #333;
                margin-bottom: 20px;
            }
            .order-details {
                background-color: #f9f9f9;
                padding: 20px;
                border-radius: 6px;
                margin: 20px 0;
            }
            .order-id {
                font-size: 14px;
                color: #666;
                margin-bottom: 15px;
            }
            .order-id strong {
                color: #333;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            th {
                background-color: #f0f0f0;
                padding: 12px;
                text-align: left;
                font-weight: 600;
                color: #333;
                border-bottom: 2px solid #667eea;
            }
            td {
                padding: 12px;
            }
            .total-row {
                background-color: #f0f0f0;
                font-weight: 600;
                font-size: 16px;
                color: #333;
            }
            .shipping-info {
                margin-top: 25px;
                padding-top: 20px;
                border-top: 1px solid #eee;
            }
            .shipping-info h3 {
                margin: 0 0 10px 0;
                color: #333;
                font-size: 14px;
            }
            .shipping-info p {
                margin: 5px 0;
                color: #666;
                font-size: 13px;
                line-height: 1.6;
            }
            .footer {
                background-color: #f9f9f9;
                padding: 20px;
                text-align: center;
                border-top: 1px solid #eee;
                font-size: 12px;
                color: #666;
            }
            .footer p {
                margin: 5px 0;
            }
            .footer a {
                color: #667eea;
                text-decoration: none;
            }
            .status-badge {
                display: inline-block;
                background-color: #ffa500;
                color: white;
                padding: 6px 12px;
                border-radius: 4px;
                font-size: 13px;
                font-weight: 600;
                margin-top: 10px;
            }
            .thank-you {
                color: #667eea;
                font-weight: 600;
                margin-bottom: 10px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>✓ Order Confirmation</h1>
            </div>
            
            <div class="content">
                <div class="greeting">
                    <p>Hi <strong>${customerContact.fullName}</strong>,</p>
                    <p>Thank you for your order! We're excited to process it.</p>
                </div>
                
                <div class="order-details">
                    <div class="order-id">
                        <strong>Order ID:</strong> ${order._id}
                    </div>
                    <div class="order-id">
                        <strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                    </div>
                    <div class="order-id">
                        <strong>Status:</strong> <span class="status-badge">${order.orderStatus}</span>
                    </div>
                </div>
                
                <h3 style="color: #333; margin-top: 25px;">Order Summary</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th style="text-align: center;">Quantity</th>
                            <th style="text-align: right;">Price</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                        <tr class="total-row">
                            <td colspan="3" style="text-align: right; padding-right: 10px;">Total Amount:</td>
                            <td style="text-align: right;">$${order.totalAmount.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="shipping-info">
                    <h3>Shipping Address</h3>
                    <p>
                        ${order.shippingAddress.addressLine1}<br>
                        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
                        ${order.shippingAddress.country}
                    </p>
                    
                    <h3 style="margin-top: 15px;">Contact Information</h3>
                    <p>
                        Email: <a href="mailto:${customerContact.email}">${customerContact.email}</a><br>
                        Phone: ${customerContact.phone}
                    </p>
                </div>
                
                <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p class="thank-you">What's Next?</p>
                    <p style="color: #666; font-size: 14px;">
                        Your order is now being prepared. You'll receive a shipping notification with tracking information as soon as your items are dispatched.
                    </p>
                </div>
            </div>
            
            <div class="footer">
                <p>If you have any questions about your order, please don't hesitate to contact us.</p>
                <p>Email: <a href="mailto:${emailConfig.supportEmail}">${emailConfig.supportEmail}</a></p>
                <p style="margin-top: 15px; color: #999;">
                    © ${new Date().getFullYear()} E-Commerce Store. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

/**
 * Send order confirmation email
 * @param {Object} order - Order object with _id, items, totalAmount, etc.
 * @param {string} customerEmail - Customer email address
 * @param {Object} customerContact - Customer contact information
 * @returns {Promise<boolean>} True if email was sent successfully
 */
export const sendOrderConfirmationEmail = async (order, customerEmail, customerContact) => {
  try {
    // Check if email transporter is configured
    if (!emailTransporter) {
      console.warn('Email transporter not configured. Skipping email notification for order:', order._id);
      return false;
    }

    const mailOptions = {
      from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
      to: customerEmail,
      subject: `Order Confirmation - Order #${order._id.toString().slice(-8).toUpperCase()}`,
      html: generateOrderConfirmationHTML(order, customerContact)
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('✓ Order confirmation email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('✗ Failed to send order confirmation email:', error.message);
    // Don't throw error - we don't want email failure to block order creation
    return false;
  }
};

/**
 * Send order status update email (for future use: shipped, delivered, etc.)
 * @param {Object} order - Order object
 * @param {string} customerEmail - Customer email address
 * @param {string} status - New order status
 * @param {string} message - Custom message
 * @returns {Promise<boolean>}
 */
export const sendOrderStatusUpdateEmail = async (order, customerEmail, status, message = '') => {
  try {
    if (!emailTransporter) {
      console.warn('Email transporter not configured. Skipping status update email.');
      return false;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 20px auto; background: white; padding: 30px; border-radius: 8px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 4px; }
          .status { font-size: 24px; font-weight: bold; color: #667eea; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Update</h1>
          </div>
          <p>Hi ${order.customerContact.fullName},</p>
          <div class="status">Status: ${status}</div>
          <p>${message}</p>
          <p>Order ID: <strong>${order._id}</strong></p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
      to: customerEmail,
      subject: `Order Update - Order #${order._id.toString().slice(-8).toUpperCase()} is ${status}`,
      html: htmlContent
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('✓ Order status update email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('✗ Failed to send order status update email:', error.message);
    return false;
  }
};
