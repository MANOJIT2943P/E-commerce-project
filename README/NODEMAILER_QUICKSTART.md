# Nodemailer Quick Start - Email Notifications

**Status**: ✅ Implemented  
**Purpose**: Send order confirmation emails after customer checkout

## Quick Setup (5 minutes)

### For Gmail Users (Recommended)

1. **Enable 2FA & Get App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Generate "Mail" app password for your device
   - Copy the 16-character password

2. **Update .env File**

   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # Your app password
   EMAIL_FROM=your-email@gmail.com
   EMAIL_FROM_NAME=E-Commerce Store
   SUPPORT_EMAIL=support@ecommerce.com
   ```

3. **Restart Server**

   ```bash
   npm start
   # or for development
   npm run dev
   ```

4. **Test**: Place an order - check your inbox!

## Configuration Reference

| Variable          | Required | Example            | Notes                         |
| ----------------- | -------- | ------------------ | ----------------------------- |
| `EMAIL_SERVICE`   | Yes      | `gmail`            | Use `custom` for SMTP servers |
| `EMAIL_USER`      | Yes      | `user@gmail.com`   | Your email account            |
| `EMAIL_PASSWORD`  | Yes      | App password       | Never use real Gmail password |
| `EMAIL_FROM`      | No       | `user@gmail.com`   | Sender email address          |
| `EMAIL_FROM_NAME` | No       | `My Store`         | Display name in emails        |
| `SUPPORT_EMAIL`   | No       | `support@site.com` | Support contact email         |

## What's Included

✅ **Nodemailer Integration**

- Auto-configured on startup
- Sends HTML emails with professional styling

✅ **Order Confirmation Email**

- Triggered after successful checkout
- Includes order details, products, total, shipping address
- Professional HTML template

✅ **Non-Blocking**

- Email sends asynchronously
- Order confirmation shown immediately to customer
- Email failures don't affect order creation

✅ **Error Handling**

- Graceful fallback if email fails
- Console logs for debugging
- Optional feature (works without email too)

## Files Modified/Created

| File                             | Purpose                    |
| -------------------------------- | -------------------------- |
| `config/email.js`                | 🆕 Email transporter setup |
| `utils/emailService.js`          | 🆕 Email sending functions |
| `controllers/orderController.js` | ✏️ Added email trigger     |
| `.env.example`                   | ✏️ Added email config vars |

## Testing Email

**Option 1: Place a Test Order**

- Add item to cart
- Checkout with valid email
- Check inbox (check spam folder too!)

**Option 2: Manual Test** (see NODEMAILER_SETUP.md for code snippet)

## Troubleshooting

| Issue                                       | Solution                                                    |
| ------------------------------------------- | ----------------------------------------------------------- |
| No emails received                          | Check .env is configured, restart server                    |
| "Failed to send" error                      | Verify app password (not Gmail password), check 2FA enabled |
| Warning: "Email transporter not configured" | Set EMAIL_USER and EMAIL_PASSWORD in .env                   |
| Email in spam folder                        | Add sender to contacts, whitelist domain                    |

## Common SMTP Settings

**Gmail**

```env
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

**Outlook/Office365**

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
```

**SendGrid**

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxxxxxxxxxxx
```

**Mailgun**

```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
```

## Next Steps

1. ✅ Configure email credentials in `.env`
2. ✅ Restart backend server
3. ✅ Test by placing an order
4. ✅ Monitor console logs for email status
5. 🚀 Deploy to production with real email account

## Additional Features

Ready to add more? See NODEMAILER_SETUP.md for:

- Order status update emails (Shipped, Delivered)
- Abandoned cart reminders
- Admin order notifications
- Invoice attachments

---

**Documentation**: See [NODEMAILER_SETUP.md](NODEMAILER_SETUP.md) for full setup guide
