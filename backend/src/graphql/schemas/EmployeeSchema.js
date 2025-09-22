const { gql } = require('apollo-server-express');

const employeeSchema = gql(`
  type Employee {
    id: ID!
    name: String
    salary: Float
    createdAt: String!
    updatedAt: String!
  }

  input CreateEmployeeInput {
    name: String!
    salary: Float!
  }

  input UpdateEmployeeInput {
    name: String
    salary: Float
  }

  extend type Query {
    employees: [Employee!]!
    employee(id: ID!): Employee
  }

  extend type Mutation {
    createEmployee(input: CreateEmployeeInput!): Employee!
    updateEmployee(id: ID!, input: UpdateEmployeeInput!): Employee!
    deleteEmployee(id: ID!): Boolean!
  }
`);

module.exports = employeeSchema;