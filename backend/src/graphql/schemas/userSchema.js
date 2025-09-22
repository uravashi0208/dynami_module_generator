const { gql } = require('apollo-server-express');

const userSchema = gql`
  type User {
    id: ID!
    first_name: String!
    last_name: String!
    email: String!
    roles: [Role!]!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input CreateUserInput {
    first_name: String!
    last_name: String!
    email: String!
    password: String!
    roleIds: [ID!]
    isActive: Boolean
  }

  input UpdateUserInput {
    first_name: String
    last_name: String
    email: String
    password: String
    roleIds: [ID!]
    isActive: Boolean
  }

  extend type Query {
    users: [User!]!
    user(id: ID!): User
    me: User
  }

  extend type Mutation {
     createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    register(input: CreateUserInput!): AuthPayload!
    googleLogin(idToken: String!): AuthPayload!
  }

  
`;

module.exports = userSchema;