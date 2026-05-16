console.log('--- SERVER STARTING UP ---');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

console.log('Dependencies loaded');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');
const commentRoutes = require('./routes/comments');
const activityRoutes = require('./routes/activities');

const app = express();
const server = http.createServer(app);

// CORS - Set headers on every request
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Immediately respond to OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
});

// HEALTH CHECK (To verify server is alive)
app.get('/health', (req, res) => res.status(200).send('OK'));

app.use(express.json());

const io = new Server(server, {
  cors: { origin: '*' }
});

// Inject socket.io into req object for routes to use
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Serve static frontend files
app.use(express.static('../frontend/dist'));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/activities', activityRoutes);

// Serve index.html for all non-API routes (React Router)
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/../frontend/dist/index.html');
});

io.on('connection', (socket) => {
  console.log('A user connected via WebSocket:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
