# The Chat Application

This is a full-stack chat application for IV1201 demonstrating modern web development with REST API backend and React frontend.

## Tools

The following software development tools are used.

- Version control (Git)
- Project management (npm)
- Test (Jest and Supertest)
- Automatic restart (nodemon)
- Static analysis (ESLint)
- Frontend build tool (Vite)
- TypeScript (frontend)

## Frameworks

### Backend
- express
- sequelize
- mariadb
- mysql
- jsonwebtoken
- body-parser
- cookie-parser
- dotenv-safe
- express-validator
- verror

### Frontend
- React
- TypeScript
- Vite
- Axios (HTTP client)
- React Router

## Prerequisites

- **Node.js** (v18+ recommended)
- **Docker Desktop** (for containerized PostgreSQL)
- **Git** (for cloning repository)

## Installation

### Option 1: Docker Development Setup (Recommended)

1. Install Docker Desktop and ensure it's running
2. Clone this git repository
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Install all required npm packages:
   ```bash
   npm run install-all
   ```
5. Start development environment with Docker:
   ```bash
   npm run docker-dev
   ```
   - Backend will run on http://localhost:8001
   - Frontend will run on http://localhost:5173
   - PostgreSQL runs in Docker container

### Option 2: Traditional Local Database Setup

1. Install Node.js and PostgreSQL manually
2. Clone this git repository
3. Only for Windows users:
   1. Change line 11 in `package.json` to`"start-dev": "SET NODE_ENV=development & nodemon src/server"`
   1. Change line 12 in `package.json` to`"start": "SET NODE_ENV=production & nodemon src/server"`
4. Copy environment file and configure database manually:
   ```bash
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials
   ```
5. Install all required npm packages:
   ```bash
   npm run install-all
   ```

## Docker Commands

```bash
# Quick Docker setup
./scripts/setup-docker-dev.sh    # Complete Docker setup script

# Database management
npm run docker-up        # Start PostgreSQL container
npm run docker-down      # Stop PostgreSQL container
npm run docker-logs      # View database logs
npm run docker-reset     # Reset database (clears all data)
npm run docker-clean     # Remove container and volumes

# Advanced: pgAdmin (database management UI)
npm run docker-pgadmin   # Start PostgreSQL + pgAdmin UI
# Access pgAdmin at http://localhost:5050
```

## Start the Application

### Development (Both Backend and Frontend)

#### Docker Development (Recommended)
1. Copy the file `.env.example` to a file called `.env` (Docker defaults are pre-configured)
1. Start both backend and frontend by giving the command `npm run docker-dev`
   - Backend will run on http://localhost:8001
   - Frontend will run on http://localhost:5173
   - PostgreSQL runs in Docker container on port 5432

#### Traditional Development
1. Configure environment as above (modify .env for local PostgreSQL)
1. Create a database manually. You do not have to create any tables in the database, they will be created by the application.
1. Start both backend and frontend by giving the command `npm run dev`
   - Backend will run on http://localhost:8001
   - Frontend will run on http://localhost:5173

### Backend Only
1. Configure environment as above
1. Start the backend by giving the command `npm run start-dev`
1. The REST API will be available at http://localhost:8001

### Testing the API
You can test the API using:
- **Frontend Interface**: Navigate to http://localhost:5173 for a simple React interface
- **Insomnia**: Import the file `insomnia-chat-api-requests.json` for all API requests
- **Direct HTTP**: The API endpoints are available at http://localhost:8001

## Execute Tests

The tests are started by giving the command `npm test` in the `server` directory.

## More Documentation

The file `js-rest-api.pdf` is a presentation that provides some background on REST apis, and covers most of the frameworks and apis used in the chat api.
