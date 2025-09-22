const { gql } = require('apollo-server-express');

const testingSchema = gql(`
  type Testing {
    id: ID!
    name: String
    lastname: String
    createdAt: String!
    updatedAt: String!
  }

  input CreateTestingInput {
    name: String!
    lastname: String!
  }

  input UpdateTestingInput {
    name: String
    lastname: String
  }

  extend type Query {
    testings: [Testing!]!
    testing(id: ID!): Testing
  }

  extend type Mutation {
    createTesting(input: CreateTestingInput!): Testing!
    updateTesting(id: ID!, input: UpdateTestingInput!): Testing!
    deleteTesting(id: ID!): Boolean!
  }
`);

module.exports = testingSchema;