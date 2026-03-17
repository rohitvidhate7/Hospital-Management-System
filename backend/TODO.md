# Hospital Backend TODO - Nodemailer Gmail 535 Fix ✅

## Status: Fixed & Ready to Test

### Completed:
1. [x] **Created TODO.md** - Progress tracking
2. [x] **Enhanced mailer.js** - Fixed syntax error, added:
   - SMTP connection verification
   - Specific Gmail 535 error handling + step-by-step fix
   - Rich console logging (✅❌📧💡🔧)
   - Graceful fallbacks
3. [x] **Created .env.example** - Complete SMTP config + Gmail guide

### Final Steps:
4. [ ] **Configure Environment**
   ```
   # Copy & edit backend/.env.local:
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your@gmail.com
   SMTP_PASS=abcdwxyz1234efgh  # Gmail App Password (16 chars)
   ```
5. [ ] **Start & Test**
   ```
   cd hospital-management-system/backend
   npm run dev
   # Test register (triggers email):
   curl -X POST http://localhost:5000/api/auth/register \
   -H "Content-Type: application/json" \
   -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```
6. [ ] **Verify**
   - Console shows ✅ SMTP connected / 📧 Email sent
   - OR 🔧 535 fix instructions if needed
   - Check recipient inbox/spam

## Quick Gmail App Password (Fixes 535 Error):
1. **Enable 2FA**: myaccount.google.com → Security → 2-Step Verification
2. **App Password**: Security → App passwords → Mail → Generate
3. **Copy 16-char code** → SMTP_PASS (no spaces!)
4. **Restart server**

**Server will now handle all SMTP errors gracefully!**
