// schemas/module.js
const { gql } = require('apollo-server-express');

const moduleSchema = gql`
  type Field {
    name: String!
    label: String!
    dataType: String!
    isRequired: Boolean!
    isUnique: Boolean!
    ref: String
  }

  type Module {
    id: ID!
    name: String!
    fields: [Field!]!
    createdAt: String!
  }

  input FieldInput {
    name: String!
    label: String!
    dataType: String!
    isRequired: Boolean
    isUnique: Boolean
    ref: String
  }

  input CreateModuleInput {
    name: String!
    fields: [FieldInput!]!
  }

  input UpdateModuleInput {
    fields: [FieldInput!]
  }

  extend type Query {
    modules: [Module!]!
    module(name: String!): Module
  }

  extend type Mutation {
    createModule(input: CreateModuleInput!): Module!
    updateModule(name: String!, input: UpdateModuleInput!): Module!
    deleteModule(name: String!): Boolean!
  }
`;

module.exports = moduleSchema;