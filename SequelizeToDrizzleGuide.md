# Sequelize to DrizzleORM Migration Guide

This guide details the transition from Sequelize to DrizzleORM for the IV1201 Chat Application. It highlights the philosophical differences and provides concrete "Before vs. After" code examples based on your existing codebase.

## 1. Core Philosophy & Key Differences

| Feature | Sequelize (Current) | DrizzleORM (Target) |
| :--- | :--- | :--- |
| **Paradigm** | **Object-Relational Mapping (ORM)**. You work with Classes (`User`, `Msg`) that "magically" map to database tables. Heavy abstraction. | **SQL-like Query Builder**. You work with schema definitions that mirror SQL. "If you know SQL, you know Drizzle". Lightweight & transparent. |
| **Transactions** | **Implicit / Magic**. Uses `cls-hooked` to store transaction context in a "namespace". You don't pass `tx` objects around; Sequelize "just knows" which transaction to use. | **Explicit**. You must explicitly pass the transaction object (`tx`) to any function that needs to be part of the transaction. |
| **Type Safety** | Runtime checks. TypeScript support is an afterthought (though available). | Built-in type safety (even in JS via JSDoc inference). Schema defines the types. |
| **Soft Deletes** | **Built-in**. `paranoid: true` automatically filters soft-deleted rows. | **Manual**. You define a `deletedAt` column and must explicitly add `.where(isNull(table.deletedAt))` to your queries. |

---

## 2. Setting Up the Database

### Before: Sequelize Connection
*File: `src/integration/ChatDAO.js`*
Sequelize manages a connection pool and uses `cls-hooked` for transaction state.

```javascript
// BEFORE
const cls = require('cls-hooked');
const Sequelize = require('sequelize');

class ChatDAO {
  constructor() {
    const namespace = cls.createNamespace('chat-db');
    Sequelize.useCLS(namespace); // Global magic state
    
    this.database = new Sequelize(..., {
      // Configuration...
    });
    // Models attach themselves to this instance
    User.createModel(this.database);
  }
}
```

### After: Drizzle Setup
*File: `src/drizzle/db.js` & `src/integration/ChatDAO.js`*
Connection logic is cleaner. No global CLS state.

```javascript
// AFTER (src/drizzle/db.js)
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const schema = require('./schema');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  // ...
});

const db = drizzle(pool, { schema });
module.exports = db;
```

```javascript
// AFTER (src/integration/ChatDAO.js)
const db = require('../drizzle/db'); // Import the instance

class ChatDAO {
  constructor() {
    this.db = db; // No CLS setup needed
  }
}
```

---

## 3. Defining Models vs Schema

### Before: Class-based Model
*File: `src/model/User.js`*
Sequelize defines models as classes extending `Sequelize.Model`.

```javascript
// BEFORE
class User extends Sequelize.Model {
  static createModel(sequelize) {
    User.init({
      username: { type: Sequelize.STRING, allowNull: false },
      loggedInUntil: { type: Sequelize.DATE, defaultValue: 0 },
    }, { sequelize, modelName: 'users', paranoid: true }); // 'paranoid' = soft delete
    return User;
  }
}
```

### After: Schema Definition
*File: `src/drizzle/schema.js`*
Drizzle defines tables as objects. It looks much closer to SQL DDL.

```javascript
// AFTER
const { pgTable, serial, text, timestamp } = require('drizzle-orm/pg-core');

const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull(),
  loggedInUntil: timestamp('logged_in_until').default(new Date(0)),
  
  // Manual soft delete column
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

module.exports = { users };
```

---

## 4. Querying Data (Validation & DTOs)

### Before: Finder Method
*File: `src/integration/ChatDAO.js`*
Note how Sequelize returns "Model Instances" that we then convert to DTOs.

```javascript
// BEFORE
async findUserByUsername(username) {
  // ... validators ...
  
  // Returns complex Sequelize implementation objects
  const users = await User.findAll({
    where: { username: username }, // Implicit soft-delete filter
  });
  
  // Must convert to DTO
  return users.map((model) => this.createUserDto(model));
}
```

### After: Select Query
*File: `src/integration/ChatDAO.js`*
Drizzle returns plain JavaScript objects that match the schema. We add explicit soft-delete filtering.

```javascript
// AFTER
const { eq, isNull, and } = require('drizzle-orm');
const { users } = require('../drizzle/schema');

async findUserByUsername(username, tx = this.db) { // Note the 'tx' parameter!
  // ... validators ...
  
  const result = await tx.select()
    .from(users)
    .where(and(
      eq(users.username, username),
      isNull(users.deletedAt) // Explicitly filter out soft-deleted rows!
    ));
    
  // Result is just an array of plain objects: [{ id: 1, username: '...' }]
  return result.map((row) => this.createUserDto(row));
}
```

---

## 5. The Critical Change: Transaction Handling

This is the most important part of the migration. Sequelize uses "Continuations Local Storage" (CLS) to implicitly pass transactions. Drizzle requires you to pass them explicitly.

### Before: Implicit Transactions (Controller Layer)
The `Controller` starts a transaction, but `ChatDAO` doesn't seem to know about it explicitly. It works because of the CLS namespace hook.

```javascript
// BEFORE (src/controller/Controller.js)
async login(username) {
  // 't1' is created, but NOT passed to findUserByUsername!
  return this.transactionMgr.transaction(async (t1) => {
    
    // Magic: ChatDAO uses t1 implicitly because of CLS
    let users = await this.chatDAO.findUserByUsername(username);
    
    if (users.length === 0) {
       // Magic again
      const newUser = await this.chatDAO.createUser(username);
      // ...
    }
  });
}
```

### After: Explicit Transactions
We must update `ChatDAO` methods to accept an optional transaction object (`tx`). If provided, use it. If not, default to valid DB instance (for non-transactional reads, if any).

1.  **Update ChatDAO signature**: `async findUser(username, tx)`
2.  **Update Controller**: Pass the `tx` object manually.

```javascript
// AFTER (src/controller/Controller.js)
async login(username) {
  // 'tx' is the transaction object
  return this.db.transaction(async (tx) => {
    
    // Explicit: We MUST pass 'tx' to the DAO
    let users = await this.chatDAO.findUserByUsername(username, tx);
    
    if (users.length === 0) {
       // Explicit pass here too
      const newUser = await this.chatDAO.createUser(username, tx);
      // ...
    }
  });
}
```

### Summary of Changes

1.  **Refactor Models** -> **Drizzle Schema** (`src/drizzle/schema.js`).
2.  **Refactor DAO**:
    *   Change all queries to Drizzle syntax (`select`, `insert`, etc.).
    *   Add `tx` parameter to all DB methods.
    *   Add logical check: `const queryRunner = tx || this.db;`.
    *   Manually consistency check `deletedAt` IS NULL for reads.
3.  **Refactor Controller**:
    *   Initialize Drizzle DB instead of Sequelize.
    *   Pass the transaction object to every DAO method call.

This approach ensures strict control over database consistency and removes the "magic" that makes debugging Sequelize transaction issues difficult.
