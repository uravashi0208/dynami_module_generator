const startServer = require('./app');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 4000;

startServer().then((app) => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
  });
});
