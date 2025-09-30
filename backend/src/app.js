const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const connectDB = require('./config/db');
const { typeDefs, resolvers } = require('./graphql');
const authMiddleware = require('./middlewares/authMiddleware');
const corsOptions = require('./corsConfig');

const app = express();
app.use(cors(corsOptions)); // enable CORS for frontend dev server

async function startServer() {
  await connectDB();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const auth = await authMiddleware({ req });
      return { user: auth?.user || null };
    },
  });

  await server.start();
  server.applyMiddleware({ app,path: '/graphql', cors: corsOptions });
  return app;
}

module.exports = startServer;
