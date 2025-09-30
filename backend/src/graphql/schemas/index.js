const { gql } = require('apollo-server-express');

const baseSchema = gql`
  type Query
  type Mutation
`;

const userSchema = require('./userSchema');
const roleSchema = require('./roleSchema');
const authSchema = require('./authSchema');
const moduleSchema = require('./moduleSchema')

module.exports = [baseSchema, userSchema, roleSchema, authSchema,moduleSchema];
