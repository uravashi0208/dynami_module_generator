const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendPasswordResetEmail(email, resetToken, firstName = 'User') {
    const resetLink = `${process.env.FRONTEND_URL}/auth/new-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@yourapp.com',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #f8f9fa; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #fff; }
                .button { 
                    display: inline-block; 
                    padding: 12px 24px; 
                    background: #007bff; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 4px; 
                    margin: 20px 0;
                }
                .footer { 
                    margin-top: 20px; 
                    padding: 20px; 
                    background: #f8f9fa; 
                    text-align: center; 
                    font-size: 12px; 
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Hello ${firstName},</p>
                    <p>You requested to reset your password. Click the button below to create a new password:</p>
                    <div style="text-align: center;">
                        <a href="${resetLink}" class="button">Reset Password</a>
                    </div>
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p>${resetLink}</p>
                    <p>This link will expire in 1 hour for security reasons.</p>
                    <p>If you didn't request this reset, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}

module.exports = new EmailService();