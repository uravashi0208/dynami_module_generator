// constants/messages.js
const MESSAGES = {
  SUCCESS: {
    // Auth messages
    LOGIN: 'Login successful',
    REGISTER: 'Registration successful',
    LOGOUT: 'Logout successful',
    PASSWORD_RESET_REQUEST: 'If an account with that email exists, a password reset link has been sent.',
    PASSWORD_RESET: 'Password has been reset successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
    
    // User messages
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    USER_DELETED: 'User deleted successfully',
    
    // General messages
    OPERATION_SUCCESS: 'Operation completed successfully',
    DATA_RETRIEVED: 'Data retrieved successfully'
  },
  ERROR: {
    // Auth errors
    INVALID_CREDENTIALS: 'Invalid credentials',
    INVALID_TOKEN: 'Password reset token is invalid or has expired',
    RESET_FAILED: 'Failed to reset password',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    TOKEN_EXPIRED: 'Token has expired',
    
    // User errors
    USER_NOT_FOUND: 'User not found',
    USER_EXISTS: 'User already exists',
    USER_CREATE_FAILED: 'Failed to create user',
    USER_UPDATE_FAILED: 'Failed to update user',
    USER_DELETE_FAILED: 'Failed to delete user',
    
    // Validation errors
    VALIDATION_ERROR: 'Validation failed',
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please provide a valid email address',
    PASSWORD_TOO_WEAK: 'Password is too weak',
    
    // Server errors
    INTERNAL_ERROR: 'Internal server error',
    DATABASE_ERROR: 'Database operation failed',
    NETWORK_ERROR: 'Network error occurred',
    
    // General errors
    NOT_FOUND: 'Resource not found',
    OPERATION_FAILED: 'Operation failed',
    INVALID_INPUT: 'Invalid input provided'
  },
  INFO: {
    WELCOME: 'Welcome to our application',
    PROCEED: 'Please proceed with the operation',
    CHECK_EMAIL: 'Please check your email for further instructions'
  }
};

// Helper functions for consistent responses
const responseHelper = {
  success: (message, data = null) => ({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  }),

  error: (message, errorCode = null, details = null) => ({
    success: false,
    message,
    errorCode,
    details,
    timestamp: new Date().toISOString()
  }),

  // Auth specific helpers
  authSuccess: (token, user, message = MESSAGES.SUCCESS.LOGIN) => ({
    success: true,
    message,
    token,
    user,
    timestamp: new Date().toISOString()
  }),

  messageOnly: (message, success = true) => ({
    success,
    message,
    timestamp: new Date().toISOString()
  })
};

module.exports = {
  MESSAGES,
  responseHelper
};