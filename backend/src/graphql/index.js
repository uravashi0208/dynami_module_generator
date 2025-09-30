const { mergeResolvers, mergeTypeDefs } = require('@graphql-tools/merge');
const userSchema = require('./schemas/userSchema');
const roleSchema = require('./schemas/roleSchema');
const authSchema = require('./schemas/authSchema');
const moduleSchema = require('./schemas/moduleSchema');
const baseSchema = require('./schemas/index');

const userResolver = require('./resolvers/userResolver');
const roleResolver = require('./resolvers/roleResolver');
const authResolver = require('./resolvers/authResolver');
const moduleResolver = require('./resolvers/moduleResolver');

const typeDefs = [baseSchema, userSchema, roleSchema, authSchema,moduleSchema];
const resolvers = [userResolver, roleResolver, authResolver,moduleResolver];

module.exports = {
  typeDefs,
  resolvers,
};
