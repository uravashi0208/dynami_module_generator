const { gql } = require('apollo-server-express');

const authSchema = gql`
  type AuthPayload {
    token: String!
    user: User!
  }

  type MessagePayload {
    message: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  extend type Mutation {
    login(input: LoginInput!): AuthPayload!
    forgotPassword(email: String!): MessagePayload!
    resetPassword(token: String!, password: String!): MessagePayload!
  }
`;

module.exports = authSchema;