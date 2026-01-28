# AGENTS.md

This file contains guidelines and commands for agentic coding agents working in this Node.js Express chat application repository.

## Essential Commands

### Development & Build
```bash
# Start development server with auto-restart
npm run start-dev

# Start production server
npm start

# Install dependencies
npm install
```

### Testing
```bash
# Run tests in watch mode (recommended for development)
npm test

# Run tests non-interactively (for CI/automation)
npm run non-interactive-test

# Run a single test by name pattern
node node_modules/jest/bin/jest.js --testNamePattern="test name pattern"

# Run tests for specific file
node node_modules/jest/bin/jest.js path/to/test.test.js
```

### Linting & Code Quality
```bash
# Run ESLint (Google style guide)
npx eslint .

# Run ESLint on specific file
npx eslint src/path/to/file.js

# Fix auto-fixable ESLint issues
npx eslint . --fix
```

## Code Style Guidelines

### File Structure
- Every JavaScript file MUST start with `'use strict';`
- Use `const` for all requires and variable declarations
- No default exports - always use `module.exports`
- End files with `module.exports = ClassName;` for classes

### Import/Require Patterns
```javascript
'use strict';

const ExternalLibrary = require('external-library');
const LocalClass = require('../path/to/LocalClass');
const { specificMethod } = require('library'); // Only when needed
```

### Class & Function Documentation
- All classes and public methods MUST have JSDoc comments
- Use @param, @return, and @throws tags consistently
- Parameter descriptions should be descriptive and clear

```javascript
/**
 * Brief description of the class.
 *
 * @param {type} paramName Description of parameter
 * @throws {ErrorType} Description of when error is thrown
 */
class ClassName {
  /**
   * Brief description of the method.
   *
   * @param {string} arg1 Description of first argument
   * @param {number} arg2 Description of second argument
   * @return {ReturnType} Description of return value
   * @throws {AssertionError} When validation fails
   */
  methodName(arg1, arg2) {
    // Implementation
  }
}
```

### Naming Conventions
- **Classes**: PascalCase (e.g., `UserController`, `MessageDTO`)
- **Methods/Variables**: camelCase (e.g., `getUserById`, `userName`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_MESSAGE_LENGTH`)
- **Private methods**: Prefix with underscore or use eslint-disable comment

### Error Handling
- Use the custom Validators class for input validation
- Throw AssertionError for validation failures
- Use VError for wrapping and propagating errors with context
- Always include variable names in validation error messages

```javascript
// Validation pattern
Validators.isNonZeroLengthString(username, 'username');
Validators.isPositiveInteger(userId, 'userId');
Validators.isInstanceOf(user, UserDTO, 'user', 'UserDTO');

// Error wrapping pattern
throw new WError({'cause': originalError}, 'Descriptive error message');
```

## Architecture Patterns

### Layered Architecture
Follow the strict layer separation: **Controller → Integration → Model**

- **Controller** (`src/controller/`): Business logic, no direct database calls
- **Integration** (`src/integration/`): Database operations only (ChatDAO)
- **Models** (`src/model/`): Data structures and Sequelize models
- **API** (`src/api/`): HTTP request handling and routing

### DTO Pattern
- Use Data Transfer Objects for all data passed between layers
- DTO classes validate input in their constructors
- Never pass raw database objects between layers

```javascript
// Example DTO usage
const userDTO = new UserDTO(id, username, loggedInUntil, createdAt, updatedAt, deletedAt);
```

### Transaction Management
- All database operations must use transactions
- Use `this.transactionMgr.transaction(async (t1) => { ... })` pattern
- Transaction manager is obtained from ChatDAO

```javascript
async someMethod(param) {
  return this.transactionMgr.transaction(async (t1) => {
    Validators.isNonZeroLengthString(param, 'param');
    // Database operations here
    return result;
  });
}
```

### Request Handler Pattern
- All API handlers inherit from RequestHandler class
- Use Express Router for routing
- Send responses using `sendHttpResponse(res, status, body)` method

```javascript
class SomeHandler extends RequestHandler {
  constructor() {
    super();
    this.router.get('/endpoint', this.handleRequest.bind(this));
  }

  async handleRequest(req, res) {
    try {
      // Business logic
      this.sendHttpResponse(res, 200, responseData);
    } catch (err) {
      this.sendHttpResponse(res, 500, err.message);
    }
  }
}
```

## Testing Guidelines

### Test Structure
- Use Jest with `describe()` and `test()` blocks
- Test files should be in `__tests__/` directory
- Mirror the source directory structure in tests

```javascript
'use strict';

const ClassToTest = require('../../src/path/to/Class');

describe('tests for methodName', () => {
  test('called with valid arguments', () => {
    const result = ClassToTest.methodName('validArg');
    expect(result).toBeDefined();
  });

  test('called with invalid argument throws error', () => {
    try {
      ClassToTest.methodName(null);
      fail('methodName accepted null');
    } catch (err) {
      expect(err.name).toContain('AssertionError');
    }
  });
});
```

### Test Configuration
- Jest ignores MySQL tests by default (see package.json)
- Use `--runInBand` for sequential test execution
- Use `--detectOpenHandles` to handle database connections
- Use `--forceExit` for clean test termination

### Integration vs Unit Tests
- Unit tests: Test individual classes in isolation
- Integration tests: Test database interactions (in `__tests__/integration/`)
- Use Supertest for API endpoint testing

## Environment & Configuration

### Environment Variables
- Use dotenv-safe for configuration management
- Copy `.env.example` to `.env` and set actual values
- Required variables: `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_DIALECT`, `SERVER_PORT`, `SERVER_HOST`

### Database Configuration
- Uses Sequelize ORM with MariaDB/PostgreSQL support
- Database dialect controlled by `DB_DIALECT` environment variable
- Tables are auto-created by the application on startup

## Common Patterns & Best Practices

### Validation
- Always validate inputs using the Validators class
- Include parameter names in error messages for better debugging
- Validate at layer boundaries (Controller methods, DTO constructors)

### Error Logging
- Use the Logger class for consistent error logging
- Logger.logException() handles VError cause chains automatically
- Log errors before sending HTTP responses

### Module Exports
- Use `module.exports = ClassName;` for classes
- Use `module.exports = functionName;` for functions
- No default exports - always use named exports

### ESLint Configuration
- Follows Google JavaScript Style Guide
- ES2018 syntax is supported
- No custom rules defined - stick to Google defaults

## Development Workflow

1. **Before making changes**: Run existing tests to ensure baseline
2. **During development**: Use `npm run start-dev` for auto-restart
3. **After changes**: Run `npm test` and `npx eslint .`
4. **Before committing**: Ensure all tests pass and no lint errors
5. **Single test debugging**: Use Jest's test name pattern matching

## File Organization

```
src/
├── api/           # HTTP request handlers and routing
├── controller/    # Business logic layer
├── integration/   # Database operations (DAO)
├── model/         # Data models and DTOs
├── util/          # Utility classes (Validators, Logger)
└── server.js      # Application entry point

__tests__/         # Test files mirroring src structure
```

This AGENTS.md file should be updated when architectural patterns, coding standards, or tool configurations change.