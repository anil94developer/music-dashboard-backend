# Payment Bypass Guide - Testing Email Functionality

## Overview
This guide explains how to bypass Cashfree payment gateway for local testing, especially when you want to test email functionality without going through the payment process.

## Why Bypass Payment?
- **Local Testing**: Cashfree doesn't work properly on localhost
- **Email Testing**: Test email sending functionality without payment
- **Faster Development**: Skip payment gateway during development

## How to Enable Bypass Mode

### Step 1: Set Environment Variable

Add this to your `.env` file in the `TunePlusBackend-main` directory:

```env
BYPASS_PAYMENT=true
```

Or set it to `1`:

```env
BYPASS_PAYMENT=1
```

### Step 2: Restart Your Backend Server

After adding the environment variable, restart your Node.js backend server:

```bash
# Stop the current server (Ctrl+C)
# Then start it again
npm start
# or
node index.js
```

### Step 3: Test Registration

1. Go to your registration page: `http://localhost/tuneplus/website/company-register.php`
2. Fill in the registration form
3. Select a membership plan
4. Submit the form

**What happens:**
- ✅ Payment gateway is **skipped**
- ✅ Company is **directly registered**
- ✅ Email is **sent** with login credentials
- ✅ No Cashfree redirect happens

## Console Logs

When bypass mode is enabled, you'll see these logs in your backend console:

```
⚠️ ========================================
⚠️ PAYMENT BYPASS MODE ENABLED
⚠️ Skipping Cashfree payment gateway
⚠️ Directly registering company...
⚠️ ========================================
✅ Company registered successfully (Payment bypassed)
✅ Email should be sent to: user@example.com
```

## Email Testing

After registration, check:

1. **Backend Console**: Look for email sending logs:
   - `✅ SMTP Server is ready to send emails`
   - `✅ Email sent successfully!`
   - Or error messages if email fails

2. **User's Email Inbox**: Check the email address used in registration
   - Subject: "Welcome to Our Platform"
   - Contains: Login credentials (email and password)

3. **Email Configuration**: Make sure these are set in `.env`:
   ```env
   EMAIL_USER=your-email@yourdomain.com
   EMAIL_PASSWORD=your-email-password
   ```

## Disable Bypass Mode

To go back to normal payment flow:

1. Remove or set to `false` in `.env`:
   ```env
   BYPASS_PAYMENT=false
   ```
   Or simply remove the line

2. Restart your backend server

## Important Notes

⚠️ **WARNING**: 
- **NEVER** enable bypass mode in production
- This is **ONLY** for local testing
- Always disable before deploying to production

✅ **Safe to Use**:
- Local development
- Email testing
- Registration flow testing

## Troubleshooting

### Email Not Sending?
1. Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
2. Check backend console for SMTP errors
3. Verify email credentials are correct
4. Check spam folder

### Registration Fails?
1. Check backend console for error messages
2. Verify all required fields are filled
3. Check if email already exists in database

### Bypass Not Working?
1. Make sure `BYPASS_PAYMENT=true` is in `.env`
2. Restart backend server after adding environment variable
3. Check console logs for bypass mode messages

## Response Format

When bypass is enabled, the API returns:

```json
{
  "status": true,
  "message": "Company registered successfully (Payment bypassed for testing)",
  "data": {
    "orderId": "ORDER_...",
    "paymentSessionId": "BYPASS_...",
    "paymentUrl": null,
    "amount": 599,
    "membership": {
      "name": "Rising Artist",
      "duration": 12,
      "durationType": "months"
    },
    "bypassMode": true,
    "registrationData": {...},
    "message": "Payment bypassed - Company registered directly. Check email for login credentials."
  }
}
```

---

**Last Updated**: After implementing payment bypass feature

