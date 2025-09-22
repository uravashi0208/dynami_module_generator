const { Role } = require('../../models');

module.exports = {
  Query: {
    roles: async () => Role.find(),
    role: async (_, { id }) => Role.findById(id),
  },
  Mutation: {
    createRole: async (_, { name }) => {
      const existing = await Role.findOne({ name });
      if (existing) throw new Error('Role already exists');
      return Role.create({ name });
    },
    updateRole: async (_, { id, name, isActive }) => {
      return Role.findByIdAndUpdate(
        id, 
        { name, isActive }, 
        { new: true, runValidators: true }
      );
    },
    deleteRole: async (_, { id }) => {
      const res = await Role.findByIdAndDelete(id);
      return !!res;
    },
  },
};
