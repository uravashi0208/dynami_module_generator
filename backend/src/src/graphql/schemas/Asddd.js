const { gql } = require('apollo-server-express');

const asdddSchema = gql(`
  type Asddd {
    id: ID!
    sdsd: String
    createdAt: String!
    updatedAt: String!
  }

  input CreateAsdddInput {
    sdsd: String!
  }

  input UpdateAsdddInput {
    sdsd: String
  }

  extend type Query {
    asddds: [Asddd!]!
    asddd(id: ID!): Asddd
  }

  extend type Mutation {
    createAsddd(input: CreateAsdddInput!): Asddd!
    updateAsddd(id: ID!, input: UpdateAsdddInput!): Asddd!
    deleteAsddd(id: ID!): Boolean!
  }
`);

module.exports = asdddSchema;