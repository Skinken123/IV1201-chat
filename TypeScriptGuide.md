# TypeScript Migration Guide

This guide explains the main changes needed to transition from JavaScript to TypeScript while maintaining existing functionality and following TypeScript standards.

## 🎯 TypeScript vs JavaScript: Main Differences

### **JavaScript Current Patterns:**
- `require()` for module imports
- `module.exports` for exports  
- Dynamic typing with runtime validation
- JSDoc for documentation
- `class` with `constructor()` and properties

### **TypeScript Target Patterns:**
- `import`/`export` for module system
- Strong static typing with interfaces
- Built-in type checking at compile time
- Decorators for metadata (Sequelize models)
- Access modifiers (`public`, `protected`, `private`)

---

## 🔧 **General Changes for All Files**

### **1. Import Statement Conversion**

**Before (JavaScript):**
```javascript
const express = require('express');
const Controller = require('../controller/Controller');
const Logger = require('../util/Logger');
const Validators = require('../util/Validators');
```

**After (TypeScript):**
```typescript
import express, { Router, Request, Response, NextFunction } from 'express';
import { Controller } from '../controller/Controller';
import { Logger } from '../util/Logger';
import { Validators } from '../util/Validators';
```

### **2. Class Definition Changes**

**Before:**
```javascript
class RequestHandler {
  constructor() {
    this.router = express.Router();
    this.logger = new Logger();
  }
}
```

**After:**
```typescript
export abstract class RequestHandler {
  protected router: Router;
  protected logger: Logger;
  protected contr?: Controller;

  constructor() {
    this.router = express.Router();
    this.logger = new Logger();
  }

  abstract get path(): string;
  abstract registerHandler(): Promise<void>;
}
```

### **3. Method Signature Typing**

**Before:**
```javascript
sendHttpResponse(res, status, body) {
  // Implementation
}
```

**After:**
```typescript
sendHttpResponse(res: Response, status: number, body?: any): void {
  // Implementation
}
```

### **4. Property Declarations**

**Before:**
```javascript
constructor() {
  this.property = value;
}
```

**After:**
```typescript
constructor() {
  this.property = value;
}

// Or with explicit typing:
protected property: Type;
```

### **5. Module Export Changes**

**Before:**
```javascript
module.exports = RequestHandler;
```

**After:**
```typescript
export default RequestHandler;
```

---

## 📁 File-Specific Instructions

### **1. RequestHandler.js → RequestHandler.ts**

**Key Changes:**
- Convert to abstract class with typed methods
- Add Express type imports
- Use proper access modifiers
- Add abstract method definitions

**Example Method Conversion:**
```typescript
// Before:
sendHttpResponse(res, status, body) {
  Validators.isIntegerBetween(status, 200, 501);
  // Implementation
}

// After:
sendHttpResponse(res: Response, status: number, body?: any): void {
  Validators.isIntegerBetween(status, 200, 501);
  // Implementation
}
```

### **2. Controller.js → Controller.ts**

**Key Changes:**
- Add proper typing for async methods
- Use Promise return types
- Maintain transaction management with types
- Keep all existing validation patterns

**Example Method Conversion:**
```typescript
// Before:
async login(username) {
  return this.transactionMgr.transaction(async (t1) => {
    Validators.isNonZeroLengthString(username, 'username');
    // Implementation
  });
}

// After:
async login(username: string): Promise<UserDTO | null> {
  return this.transactionMgr.transaction(async (t1) => {
    Validators.isNonZeroLengthString(username, 'username');
    // Implementation
  });
}
```

### **3. ChatDAO.js → ChatDAO.ts**

**Key Changes:**
- Add Sequelize type imports
- Use typed Promise returns
- Maintain VError typing with proper generics
- Keep all existing error handling patterns

**Example Method Conversion:**
```typescript
// Before:
async findUserByUsername(username) {
  try {
    Validators.isNonZeroLengthString(username, 'username');
    const users = await User.findAll({
      where: { username: username },
    });
    return users.map((userModel) => this.createUserDto(userModel));
  } catch (err) {
    // Error handling
  }
}

// After:
async findUserByUsername(username: string): Promise<UserDTO[]> {
  try {
    Validators.isNonZeroLengthString(username, 'username');
    const users = await User.findAll({
      where: { username: username },
    });
    return users.map((userModel) => this.createUserDto(userModel));
  } catch (err) {
    // Error handling with proper typing
  }
}
```

### **4. User.js → User.ts & Msg.js → Msg.ts (Sequelize Models)**

**Key Changes:**
- Add TypeScript interfaces for model attributes
- Use Sequelize TypeScript definitions
- Enable decorators for model configuration
- Add proper property declarations with `!` assertion

**Example Model Conversion:**
```typescript
// Before:
class User extends Sequelize.Model {
  static get USER_MODEL_NAME() {
    return 'users';
  }
}

// After:
interface UserAttributes {
  id: number;
  username: string;
  loggedInUntil: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public loggedInUntil!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  static get USER_MODEL_NAME(): string {
    return 'users';
  }

  static createModel(sequelize: Sequelize): typeof User {
    User.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // ... other fields
    }, {
      sequelize,
      modelName: User.USER_MODEL_NAME,
      paranoid: true,
    });
    return User;
  }

  toDTO(): UserDTO {
    return new UserDTO(
      this.id,
      this.username,
      this.loggedInUntil,
      this.createdAt,
      this.updatedAt,
      this.deletedAt || null
    );
  }
}
```

### **5. UserDTO.js → UserDTO.ts & MsgDTO.js → MsgDTO.ts**

**Key Changes:**
- Add constructor parameter typing
- Use public property declarations in constructor
- Maintain all validation logic
- Keep JSDoc documentation as comments

**Example DTO Conversion:**
```typescript
// Before:
class UserDTO {
  constructor(id, username, loggedInUntil, createdAt, updatedAt, deletedAt) {
    Validators.isPositiveInteger(id, 'id');
    Validators.isNonZeroLengthString(username, 'username');
    // ... validation
    this.id = id;
    this.username = username;
    // ... property assignment
  }
}

// After:
export class UserDTO {
  constructor(
    public readonly id: number,
    public username: string,
    public loggedInUntil: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null
  ) {
    Validators.isPositiveInteger(id, 'id');
    Validators.isNonZeroLengthString(username, 'username');
    // ... validation continues
  }
}
```

### **6. server.js → server.ts**

**Key Changes:**
- Import type definitions for Express
- Use proper server startup typing
- Add environment variable typing
- Handle potential null server.address()

**Example Server Conversion:**
```typescript
// Before:
const server = app.listen(
    process.env.SERVER_PORT,
    process.env.SERVER_HOST,
    () => {
      console.log(
        `Server up at ${server.address().address}:${server.address().port}`,
      );
    },
);

// After:
const server = app.listen(
    process.env.SERVER_PORT,
    process.env.SERVER_HOST,
    () => {
      const address = server.address();
      console.log(
        `Server up at ${address?.address}:${address?.port}`
      );
    },
);
```

---

## ⚙️ **Setup Requirements**

### **1. TypeScript Configuration (tsconfig.json)**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strictPropertyInitialization": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "__tests__"]
}
```

### **2. Package.json Scripts Update**
```json
{
  "scripts": {
    "build": "tsc",
    "start-dev": "NODE_ENV=development && nodemon --exec ts-node src/server.ts",
    "start": "NODE_ENV=production && node dist/server.js",
    "test": "jest --runInBand --watchAll --detectOpenHandles --silent --coverage"
  }
}
```

### **3. Required Dependencies**
```bash
npm install --save-dev typescript @types/node @types/express @types/jsonwebtoken @types/validator @types/sequelize @types/verror ts-node
npm install --save-dev @types/jest @types/supertest
```

---

## 🔧 **TypeScript Standards to Follow**

### **1. Strict Typing**
- Use `strict: true` for maximum type safety
- Add explicit type annotations to all parameters and returns
- Use interface definitions for data contracts
- Leverage type inference where appropriate

### **2. Access Modifiers**
- Use `public`, `protected`, `private` explicitly
- `readonly` for immutable properties
- `!` assertion for definite assignment assertion
- `?` for optional properties

### **3. Module System**
- Use ES6 `import`/`export` syntax
- Use type-only imports where possible
- Prefer default exports for main classes

### **4. Error Handling**
- Maintain `unknown` type for caught errors
- Use type assertions for known error types
- Keep VError wrapping pattern with proper typing

### **5. Sequelize Integration**
- Enable decorators for model definitions
- Use proper interface definitions for models
- Maintain paranoid soft delete patterns
- Use typed Promise returns for all database operations

---

## 🚀 **Migration Strategy**

### **Phase 1: Foundation**
1. Install TypeScript dependencies
2. Create `tsconfig.json`
3. Update `package.json` scripts
4. Convert utility classes (Validators, Logger)

### **Phase 2: Data Layer**
1. Convert DTO classes (UserDTO, MsgDTO)
2. Convert Sequelize models (User, Msg)
3. Update ChatDAO with proper typing
4. Maintain all existing functionality

### **Phase 3: Business Layer**
1. Convert Controller with typed methods
2. Maintain transaction management
3. Keep all validation patterns
4. Update API handlers

### **Phase 4: API Layer**
1. Convert RequestHandler base class
2. Convert UserApi and MsgApi
3. Convert Authorization middleware
4. Update server.js entry point

### **Phase 5: Testing & Build**
1. Update Jest configuration for TypeScript
2. Verify all functionality works
3. Run existing tests
4. Set up build pipeline

---

## 💡 **Benefits of Migration**

### **Immediate Benefits:**
- ✅ **Compile-time error detection**
- ✅ **Better IDE support** (IntelliSense, autocomplete)
- ✅ **Self-documenting code** through types
- ✅ **Safer refactoring** with type guidance
- ✅ **Interface contracts** between layers

### **Long-term Benefits:**
- ✅ **Easier maintenance** with typed code
- ✅ **Better onboarding** for new developers
- ✅ **Reduced runtime errors** through type checking
- ✅ **Improved API documentation** through types
- ✅ **Better debugging** with source maps

---

## 🎯 **Key Success Metrics**

### **Migration Complete When:**
- All files compile without TypeScript errors
- All existing tests pass with TypeScript code
- API contracts remain unchanged (frontend unaffected)
- Database operations work identically
- Authentication and authorization function properly

### **Quality Indicators:**
- `tsc --noEmit` shows no type errors
- Jest tests pass with full coverage
- Production build generates correct JavaScript
- Development server starts with ts-node
- All endpoints respond correctly

This guide provides a complete roadmap for converting your well-structured JavaScript backend to TypeScript while maintaining all functionality and architectural patterns.