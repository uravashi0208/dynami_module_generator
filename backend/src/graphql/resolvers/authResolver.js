const { User } = require('../../models');
const emailService = require('../../services/emailService');
const { signToken } = require('../../utils/jwt');

module.exports = {
  Mutation: {
    login: async (_, { input }) => {
      const { email, password } = input;

      const user = await User.findOne({ email }).populate('roles');
      if (!user) throw new Error('Invalid credentials');

      const valid = await user.comparePassword(password);
      if (!valid) throw new Error('Invalid credentials');

      const token = signToken({ id: user._id });
      return { token, user };
    },

   forgotPassword: async (_, { email }) => {
  try {
    const user = await User.findOne({ email });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    // Alternative token generation method
    const generateResetToken = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let token = '';
      for (let i = 0; i < 64; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return token;
    };

    const resetToken = generateResetToken();
    
    // Set reset token and expiry (1 hour from now)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
    await user.save();

    // Send email
    await emailService.sendPasswordResetEmail(
      email, 
      resetToken, 
      user.first_name
    );

    return { 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    };
  } catch (error) {
    console.error('Forgot password error:', error);
    // Still return success to prevent email enumeration
    return { 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    };
  }
},
    resetPassword: async (_, { token, password }) => {
      try {
        const user = await User.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
          throw new Error('Password reset token is invalid or has expired');
        }

        // Update password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        await user.save();

        return { message: 'Password has been reset successfully' };
      } catch (error) {
        console.error('Reset password error:', error);
        throw new Error('Failed to reset password');
      }
    },
  },
};
