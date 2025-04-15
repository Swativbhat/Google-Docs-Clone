const http = require('http');
const app = require('./app');
const { init: initSocket } = require('./services/socketService');
require('dotenv').config();
const passport = require('passport');
require('./config/passport');
app.use(passport.initialize());

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});