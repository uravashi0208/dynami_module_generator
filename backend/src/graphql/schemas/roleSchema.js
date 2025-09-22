const { gql } = require('apollo-server-express');

const roleSchema = gql`
  type Role {
    id: ID!
    name: String!
    isActive: Boolean!
  }

  extend type Query {
    roles: [Role!]!
    role(id: ID!): Role
  }

  extend type Mutation {
    createRole(name: String!): Role!
    updateRole(id: ID!, name: String, isActive: Boolean): Role!
    deleteRole(id: ID!): Boolean!
  }
`;

module.exports = roleSchema;
