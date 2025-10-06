const { User } = require('../../models');
const emailService = require('../../services/emailService');
const { signToken } = require('../../utils/jwt');
const { MESSAGES } = require('../../constants/messages');

module.exports = {
  Mutation: {
    login: async (_, { input }) => {
      const { email, password } = input;

      try {
        const user = await User.findOne({ email }).populate('roles');
        if (!user) {
          throw new Error(MESSAGES.ERROR.INVALID_CREDENTIALS);
        }

        const valid = await user.comparePassword(password);
        if (!valid) {
          throw new Error(MESSAGES.ERROR.INVALID_CREDENTIALS);
        }

        const token = signToken({ id: user._id });
        
        return {
          token,
          user
        };
      } catch (error) {
        throw new Error(error.message || MESSAGES.ERROR.INVALID_CREDENTIALS);
      }
    },

   forgotPassword: async (_, { email }) => {
      try {
        const user = await User.findOne({ email });
        
        // Always return success to prevent email enumeration
        if (!user) {
          return {
            message: MESSAGES.ERROR.USER_NOT_FOUND
          };
        }

        // Token generation
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
        user.resetPasswordExpires = Date.now() + 3600000;
        
        await user.save();

        // Send email
        await emailService.sendPasswordResetEmail(email, resetToken, user.first_name);

        return {
          message: MESSAGES.SUCCESS.PASSWORD_RESET_REQUEST
        };
      } catch (error) {
        throw new Error(error.message || MESSAGES.SUCCESS.PASSWORD_RESET_REQUEST);
      }
    },

    resetPassword: async (_, { token, password }) => {
      try {
        const user = await User.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
          throw new Error(MESSAGES.ERROR.INVALID_TOKEN);
        }

        // Update password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        await user.save();

        return {
          message: MESSAGES.SUCCESS.PASSWORD_RESET
        };
      } catch (error) {
        throw new Error(error.message || MESSAGES.ERROR.RESET_FAILED);
      }
    },
  },
};
