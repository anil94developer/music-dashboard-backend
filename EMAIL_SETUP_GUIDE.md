# Email Configuration Guide

## Problem: Registration Emails Not Being Sent

If registration emails are not being sent, check the following:

## 1. Environment Variables Setup

The email functionality requires two environment variables:
- `EMAIL_USER` - Your Hostinger email address (e.g., `noreply@yourdomain.com`)
- `EMAIL_PASSWORD` - Your Hostinger email password or app password

### How to Set Environment Variables:

#### For Local Development:
Create a `.env` file in the `TunePlusBackend-main` directory:

```env
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASSWORD=your-email-password
```

#### For Production (Render.com or other hosting):
1. Go to your hosting platform's dashboard
2. Navigate to Environment Variables section
3. Add:
   - `EMAIL_USER` = your email address
   - `EMAIL_PASSWORD` = your email password

## 2. Hostinger SMTP Configuration

The code is configured to use Hostinger SMTP:
- **Host**: `smtp.hostinger.com`
- **Port**: `465` (SSL)
- **Secure**: `true`

### To use a different email provider:

Edit `TunePlusBackend-main/services/companyServices.js` and update the transporter configuration:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-provider.com', // Change this
  port: 465, // or 587 for STARTTLS
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

## 3. Testing Email Configuration

After setting environment variables, restart your server and check the console logs:

### Success Messages:
- ✅ `Email configuration loaded successfully`
- ✅ `SMTP Server is ready to send emails`
- ✅ `Email sent successfully!`

### Error Messages:
- ❌ `EMAIL_USER or EMAIL_PASSWORD not set in environment variables`
- ❌ `SMTP Connection Error: [error details]`
- ❌ `Error sending email: [error details]`

## 4. Common Issues and Solutions

### Issue 1: Environment Variables Not Loaded
**Solution**: 
- Make sure `.env` file exists in the backend root directory
- Restart the server after adding environment variables
- Check that `dotenv.config()` is called in `index.js` (it is on line 43)

### Issue 2: SMTP Authentication Failed
**Solution**:
- Verify email and password are correct
- For Hostinger, make sure you're using the full email address
- Check if your email account requires an "App Password" instead of regular password

### Issue 3: Connection Timeout
**Solution**:
- Check firewall settings
- Verify SMTP server address and port
- Try using port 587 with `secure: false` for STARTTLS

### Issue 4: Emails Going to Spam
**Solution**:
- Set up SPF, DKIM, and DMARC records for your domain
- Use a proper "from" address (not a generic one)
- Include proper email headers

## 5. Debugging Steps

1. **Check Environment Variables**:
   ```javascript
   console.log('EMAIL_USER:', process.env.EMAIL_USER);
   console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET');
   ```

2. **Test SMTP Connection**:
   The code now automatically verifies SMTP connection before sending emails. Check server logs for connection status.

3. **Check Server Logs**:
   After a registration attempt, check the console for:
   - Email configuration status
   - SMTP connection status
   - Email sending success/failure messages
   - Detailed error information if sending fails

## 6. Current Email Template

The registration email includes:
- Welcome message with user's first name
- Login credentials (email and temporary password)
- Login link to the dashboard
- Professional HTML template with dark theme

## 7. Email Sending Behavior

- Emails are sent **asynchronously** (non-blocking)
- Registration will **succeed even if email fails**
- Errors are logged to console but don't block registration
- Users can still login using "Forgot Password" if email is not received

## 8. Next Steps

1. Set up environment variables (`EMAIL_USER` and `EMAIL_PASSWORD`)
2. Restart your backend server
3. Test registration and check server logs
4. Verify email is received in inbox (check spam folder too)
5. If still not working, check the detailed error logs in console

---

**Last Updated**: After adding improved error handling and SMTP verification

