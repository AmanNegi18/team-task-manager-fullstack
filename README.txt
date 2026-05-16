================================================================================
                     THE WORKSHOP - TEAM TASK MANAGER
                          Full-Stack Web Application
================================================================================

LIVE DEMO
---------
  Frontend : https://helpful-connection-xpds-production.up.railway.app/
  Backend  : https://team-task-manager-fullstack-production-b61d.up.railway.app/
  Health   : https://team-task-manager-fullstack-production-b61d.up.railway.app/health

================================================================================
ABOUT THE PROJECT
================================================================================

The Workshop is a full-stack Team Task Manager built for collaborative project
management. It features role-based access control (Admin/Member), a Kanban-style
drag-and-drop task board, real-time updates via WebSockets, and a live activity
feed — all wrapped in a sleek dark-mode UI.

================================================================================
TECH STACK
================================================================================

FRONTEND
  - React (Vite)
  - Axios (HTTP client)
  - Socket.IO Client (real-time updates)
  - @hello-pangea/dnd (drag and drop)
  - Lucide React (icons)
  - Vanilla CSS with CSS variables

BACKEND
  - Node.js + Express.js
  - Prisma ORM (with SQLite)
  - JSON Web Tokens (JWT) for authentication
  - bcryptjs for password hashing
  - Socket.IO for real-time WebSocket events
  - dotenv for environment variable management

DEPLOYMENT
  - Railway (frontend + backend as separate services)
  - GitHub (version control + auto-deploy trigger)

================================================================================
PROJECT STRUCTURE
================================================================================

team-task-manager-fullstack/
│
├── backend/
│   ├── config/
│   │   └── db.js                  # Prisma client initialization
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT auth middleware
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── dev.db                 # SQLite database file
│   ├── routes/
│   │   ├── auth.js                # Register / Login / Me
│   │   ├── projects.js            # CRUD for projects
│   │   ├── tasks.js               # CRUD for tasks
│   │   ├── users.js               # User management (Admin)
│   │   ├── comments.js            # Task comments
│   │   ├── activities.js          # Activity feed
│   │   └── dashboard.js           # Metrics endpoint
│   ├── .env                       # Local environment variables (not committed)
│   ├── package.json
│   └── server.js                  # Main Express server entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ActivityFeed.jsx   # Live activity feed component
│   │   │   ├── MembersBoard.jsx   # Team members management
│   │   │   ├── ProjectsBoard.jsx  # Projects list & creation
│   │   │   └── TasksBoard.jsx     # Kanban board with drag & drop
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Auth state & login/register/logout
│   │   │   └── SocketContext.jsx  # WebSocket connection management
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx      # Main dashboard page
│   │   │   └── Login.jsx          # Login / Register page
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css              # Global styles & CSS variables
│   ├── .env                       # Local env (not committed)
│   ├── .env.production            # Production env (not committed)
│   ├── vite.config.js
│   └── package.json
│
└── README.txt                     # This file

================================================================================
FEATURES
================================================================================

AUTHENTICATION
  - User registration and login with JWT
  - Persistent sessions via localStorage
  - Role-based access: ADMIN and MEMBER

PROJECTS (Admin only)
  - Create and delete projects
  - View all projects with task count and owner

TASKS (Kanban Board)
  - Create, view, and delete tasks (Admin only)
  - Drag and drop tasks between columns: To Do / In Progress / Done
  - Assign tasks to team members
  - Set priority: HIGH / MEDIUM / LOW
  - Set due date
  - View task details in a modal

COMMENTS
  - Add comments to tasks
  - Real-time comment updates via WebSocket

TEAM MEMBERS (Admin only)
  - View all team members
  - Add new members with role assignment
  - Delete members

ACTIVITY FEED
  - Live feed of recent actions across all projects
  - Updates in real-time via Socket.IO

DASHBOARD METRICS
  - Total projects
  - Total tasks assigned
  - Overdue tasks
  - Completed tasks

REAL-TIME UPDATES
  - Socket.IO events for task updates, comments, and activity

================================================================================
LOCAL DEVELOPMENT SETUP
================================================================================

PREREQUISITES
  - Node.js v18+
  - npm v9+
  - Git

STEP 1 - Clone the repository
  git clone https://github.com/AmanNegi18/team-task-manager-fullstack.git
  cd team-task-manager-fullstack

STEP 2 - Setup Backend
  cd backend
  npm install
  npx prisma generate

  Create a .env file in /backend with:
    DATABASE_URL="file:./prisma/dev.db"
    JWT_SECRET="your_secret_key_here"

  Start the backend:
    npm run dev       (development with nodemon)
    npm start         (production)

STEP 3 - Setup Frontend
  cd ../frontend
  npm install

  Create a .env file in /frontend with:
    VITE_API_URL=http://localhost:5000

  Start the frontend:
    npm run dev

  Frontend will be available at: http://localhost:5173

================================================================================
ENVIRONMENT VARIABLES
================================================================================

BACKEND (.env)
  DATABASE_URL   - SQLite connection string (e.g. file:./prisma/dev.db)
  JWT_SECRET     - Secret key for signing JWT tokens
  PORT           - Server port (default: 5000) — DO NOT set on Railway

FRONTEND (.env / .env.production)
  VITE_API_URL   - Base URL of the backend API

================================================================================
DEPLOYMENT (Railway)
================================================================================

BACKEND SERVICE
  - Root Directory : /backend
  - Start Command  : npm start (runs prisma generate && node server.js)
  - Environment Variables to set in Railway:
      DATABASE_URL = file:./dev.db
      JWT_SECRET   = <your_secret>
      (Do NOT set PORT — Railway manages this automatically)

FRONTEND SERVICE
  - Root Directory : /frontend
  - Build Command  : npm run build
  - Start Command  : (serve static files via Railway's static hosting or Vite)
  - Environment Variables to set in Railway:
      VITE_API_URL = https://<your-backend-url>.up.railway.app

================================================================================
API ENDPOINTS
================================================================================

AUTH
  POST   /api/auth/register   - Register a new user
  POST   /api/auth/login      - Login and get JWT token
  GET    /api/auth/me         - Get current user (requires token)

PROJECTS
  GET    /api/projects        - Get all projects
  POST   /api/projects        - Create a project (Admin)
  DELETE /api/projects/:id    - Delete a project (Admin)

TASKS
  GET    /api/tasks           - Get all tasks
  POST   /api/tasks           - Create a task (Admin)
  PUT    /api/tasks/:id       - Update task status
  DELETE /api/tasks/:id       - Delete a task (Admin)

USERS
  GET    /api/users           - Get all users
  POST   /api/users           - Create a user (Admin)
  DELETE /api/users/:id       - Delete a user (Admin)

COMMENTS
  GET    /api/comments/:taskId  - Get comments for a task
  POST   /api/comments          - Add a comment

ACTIVITIES
  GET    /api/activities      - Get recent activity log

DASHBOARD
  GET    /api/dashboard/metrics - Get dashboard stats

HEALTH
  GET    /health              - Server health check

================================================================================
ROLES & PERMISSIONS
================================================================================

  ADMIN  - Full access: create/delete projects, tasks, members; view everything
  MEMBER - Read access: view projects, tasks, team; add comments; update nothing

================================================================================
AUTHOR
================================================================================

  Aman Negi
  GitHub : https://github.com/AmanNegi18

================================================================================
