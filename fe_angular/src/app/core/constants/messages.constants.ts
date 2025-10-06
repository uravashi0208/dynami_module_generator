export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Login successful! Welcome back.',
    REGISTER: 'Registration successful! Welcome aboard.',
    LOGOUT: 'You have been logged out successfully.',
    PASSWORD_RESET_REQUEST: 'If an account with that email exists, a password reset link has been sent.',
    PASSWORD_RESET: 'Password has been reset successfully. You can now login with your new password.',
    PROFILE_UPDATED: 'Profile updated successfully.'
  },
  ERROR: {
    INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
    INVALID_TOKEN: 'Password reset token is invalid or has expired.',
    RESET_FAILED: 'Failed to reset password. Please try again.',
    LOGIN_FAILED: 'Login failed. Please check your credentials and try again.',
    REGISTRATION_FAILED: 'Registration failed. Please try again.',
    NETWORK_ERROR: 'Network error occurred. Please check your connection.',
    UNAUTHORIZED: 'Unauthorized access. Please login again.',
    REQUIRED_FIELDS: 'Please fill all required fields correctly.',
    SERVER_ERROR: 'Server error occurred. Please try again later.'
  },
  INFO: {
    WELCOME: 'Welcome back!',
    PROCESSING: 'Processing your request...',
    LOADING: 'Loading...'
  }
};