const { User } = require('../../models');
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
  },
};
