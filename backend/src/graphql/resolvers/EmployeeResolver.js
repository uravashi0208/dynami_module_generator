const { Employee } = require("../../models");

module.exports = {
  Query: {
    employees: async () => {
      return Employee.find();
    },
    employee: async (_, { id }) => {
      return Employee.findById(id);
    }
  },

  Mutation: {
    createEmployee: async (_, { input }) => {
      const employee = new Employee(input);
      await employee.save();
      return employee;
    },
    
    updateEmployee: async (_, { id, input }) => {
      const employee = await Employee.findById(id);
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      Object.assign(employee, input);
      await employee.save();
      return employee;
    },
    
    deleteEmployee: async (_, { id }) => {
      const result = await Employee.findByIdAndDelete(id);
      return !!result;
    }
  }
};