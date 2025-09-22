const { mergeResolvers, mergeTypeDefs } = require('@graphql-tools/merge');
const userSchema = require('./schemas/userSchema');
const roleSchema = require('./schemas/roleSchema');
const authSchema = require('./schemas/authSchema');
const moduleSchema = require('./schemas/moduleSchema');
const baseSchema = require('./schemas/index');
const employeeSchema = require('./schemas/EmployeeSchema');
const testingSchema = require('./schemas/TestingSchema');

const userResolver = require('./resolvers/userResolver');
const roleResolver = require('./resolvers/roleResolver');
const authResolver = require('./resolvers/authResolver');
const moduleResolver = require('./resolvers/moduleResolver');
const EmployeeResolver = require('./resolvers/EmployeeResolver');
const TestingResolver = require('./resolvers/TestingResolver');

const typeDefs = [baseSchema, userSchema, roleSchema, authSchema,moduleSchema,employeeSchema,testingSchema];;;;
const resolvers = [userResolver, roleResolver, authResolver,moduleResolver,EmployeeResolver,TestingResolver];;;;

module.exports = {
  typeDefs,
  resolvers,
};
