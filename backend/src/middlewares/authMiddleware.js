const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');

const authMiddleware = async ({ req }) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  if (!token) return null;

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).populate('roles');
    if (!user) return null;
    return { user };
  } catch (error) {
    return null;
  }
};

module.exports = authMiddleware;