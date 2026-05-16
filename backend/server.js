console.log('--- SERVER STARTING UP ---');
console.log('Port:', process.env.PORT);

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Ensure DATABASE_URL always has a value (Railway may not have it set)
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./prisma/dev.db';
  console.log('Using default DATABASE_URL: file:./prisma/dev.db');
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'f9e8a7b6c5d4e3f2g1h0i9j8k7l6m5n4';
}
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');
const commentRoutes = require('./routes/comments');
const activityRoutes = require('./routes/activities');

const app = express();
const server = http.createServer(app);

// CORS - echo back the request origin (required when credentials: true)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use(express.json());

const io = new Server(server, {
  cors: { origin: '*' }
});

// Inject socket.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/activities', activityRoutes);

io.on('connection', (socket) => {
  console.log('WebSocket connected:', socket.id);
  socket.on('disconnect', () => console.log('WebSocket disconnected:', socket.id));
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

