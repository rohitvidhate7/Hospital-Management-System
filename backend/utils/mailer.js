const nodemailer = require('nodemailer');

const hasSmtpConfig = () => {
  return (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
};

const createTransporter = () => {
  if (!hasSmtpConfig()) {
    return null;
  }

  // FIXED: createTransport (not createTransporter)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@medcare.local';
  const transporter = createTransporter();

  if (!transporter) {
    console.log('\n[MAIL_FALLBACK] SMTP not configured - using preview:');
    console.log('💡 Edit backend/.env.local → Add Gmail App Password');
    console.log({ to, from, subject, text });
    return { sent: false, reason: 'SMTP not configured (check .env.local)' };
  }

  // Verify SMTP connection
  try {
    await transporter.verify();
    console.log(`✅ SMTP ready: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
  } catch (verifyError) {
    console.error(`❌ SMTP failed: ${verifyError.message}`);
    if (verifyError.message.includes('535-5.7.8')) {
      console.log('\n🚨 GMAIL APP PASSWORD NEEDED:');
      console.log('1. myaccount.google.com/apppasswords');
      console.log('2. Generate for "Mail"');
      console.log('3. SMTP_PASS=16charcode (no spaces)');
      console.log('4. npm run dev');
    }
    return { sent: false, reason: `SMTP error: ${verifyError.message}` };
  }

  // Send
  try {
    const result = await transporter.sendMail({ from, to, subject, text, html });
    console.log(`📧 SENT → ${to}`);
    return { sent: true, messageId: result.messageId };
  } catch (sendError) {
    console.error(`❌ Send error: ${sendError.message}`);
    return { sent: false, reason: sendError.message };
  }
};

module.exports = { sendEmail };
