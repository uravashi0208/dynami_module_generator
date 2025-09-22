const Testing = require('../../models');

module.exports = {
  Query: {
    testings: async () => {
      return Testing.find();
    },
    testing: async (_, { id }) => {
      return Testing.findById(id);
    }
  },

  Mutation: {
    createTesting: async (_, { input }) => {
      const testing = new Testing(input);
      await testing.save();
      return testing;
    },
    
    updateTesting: async (_, { id, input }) => {
      const testing = await Testing.findById(id);
      if (!testing) {
        throw new Error('Testing not found');
      }
      
      Object.assign(testing, input);
      await testing.save();
      return testing;
    },
    
    deleteTesting: async (_, { id }) => {
      const result = await Testing.findByIdAndDelete(id);
      return !!result;
    }
  }
};