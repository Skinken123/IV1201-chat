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

## Installation

1. Install node.js
1. Clone this git repository
1. Only for Windows users:
   1. Change line 11 in `package.json` to`"start-dev": "SET NODE_ENV=development & nodemon src/server"`
   1. Change line 12 in `package.json` to`"start": "SET NODE_ENV=production & nodemon src/server"`
1. Install all required npm packages by giving the command `npm run install-all` (installs both backend and frontend dependencies)

## Start the Application

### Development (Both Backend and Frontend)
1. Copy the file `.env.example` to a file called `.env` and specify values for all settings.
1. Create the database. You do not have to create any tables in the database, they will be created by the application.
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
