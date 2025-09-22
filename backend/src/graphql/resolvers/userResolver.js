const { User, Role } = require('../../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
  Query: {
    users: async () => {
      return User.find().populate('roles');
    },
    user: async (_, { id }) => {
      return User.findById(id).populate('roles');
    },
    me: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return User.findById(user._id).populate('roles');
    },
  },

  Mutation: {
    createUser: async (_, { input }) => {
      const { first_name, last_name, email, password, roleIds, isActive } = input;

      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error('User with this email already exists');

      const username = email.split('@')[0]; 

      const roles = roleIds ? await Role.find({ _id: { $in: roleIds } }) : [];

      const newUser = new User({ 
        first_name, 
        last_name, 
        email, 
        username,
        password, 
        roles,
        isActive: isActive !== undefined ? isActive : true
      });
      await newUser.save();
      return newUser.populate('roles');
    },

    updateUser: async (_, { id, input }) => {
      const user = await User.findById(id);
      if (!user) throw new Error('User not found');

      if (input.password) {
        const salt = await bcrypt.genSalt(10);
        input.password = await bcrypt.hash(input.password, salt);
      }

      if (input.roleIds) {
        input.roles = await Role.find({ _id: { $in: input.roleIds } });
        delete input.roleIds;
      }

      Object.assign(user, input);
      await user.save();
      return user.populate('roles');
    },

    deleteUser: async (_, { id }) => {
      const res = await User.findByIdAndDelete(id);
      return !!res;
    },

    register: async (_, { input }) => {
      const { first_name, last_name, email, password, roleIds } = input;

      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error('User with this email already exists');

      const roles = roleIds ? await Role.find({ _id: { $in: roleIds } }) : [];

      const newUser = new User({ first_name, last_name, email, password, roles });
      await newUser.save();
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser._id, email: newUser.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      return {
        token,
        user: await newUser.populate('roles')
      };
    },
  },
};