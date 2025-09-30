const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const connectDB = require('./config/db');
const { typeDefs, resolvers } = require('./graphql');
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();
const corsOptions = {
  origin: [
    'http://localhost:4200', // Angular dev server
    'http://localhost:3000', // React dev server
    'https://dynami-module-generator.vercel.app', // Your Vercel frontend
    'https://*.vercel.app' // All Vercel subdomains
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions)); // enable CORS for frontend dev server

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
  server.applyMiddleware({ app, path: '/graphql',cors: corsOptions });

  return app;
}

module.exports = startServer;
