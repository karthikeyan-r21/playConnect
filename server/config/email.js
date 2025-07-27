const nodemailer = require('nodemailer');

// Create test account for development
const createTestTransporter = async () => {
  // For development: use Ethereal fake SMTP service
  const testAccount = await nodemailer.createTestAccount();
  
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

// For production: use Gmail
const createGmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendOTPEmail = async (email, otp) => {
  try {
    // Choose transporter based on environment
    let transporter;
    
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Use Gmail if credentials are provided
      transporter = createGmailTransporter();
      console.log('📧 Using Gmail for email sending');
    } else {
      // Use test email for development
      transporter = await createTestTransporter();
      console.log('🧪 Using test email service (Ethereal)');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'playconnect@test.com',
      to: email,
      subject: 'PlayConnect - Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">PlayConnect Password Reset</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
            <h3 style="color: #007bff;">Your OTP Code</h3>
            <div style="font-size: 32px; font-weight: bold; color: #28a745; letter-spacing: 5px; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #6c757d; margin-top: 20px;">
              This OTP is valid for <strong>5 minutes</strong> only.
            </p>
            <p style="color: #dc3545; font-size: 14px;">
              If you didn't request this, please ignore this email.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    if (!process.env.EMAIL_USER) {
      // For test emails, show preview URL
      console.log('🔗 Preview URL:', nodemailer.getTestMessageUrl(result));
      console.log('✅ Test email sent successfully');
    } else {
      console.log(`✅ Email sent successfully to ${email}`);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ Email sending failed to ${email}:`, error.message);
    throw new Error('Failed to send email');
  }
};

module.exports = { sendOTPEmail };