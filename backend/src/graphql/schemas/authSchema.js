const { gql } = require('apollo-server-express');

const authSchema = gql`
  type AuthPayload {
    token: String!
    user: User!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  extend type Mutation {
    login(input: LoginInput!): AuthPayload!
  }
`;
module.exports = authSchema;
