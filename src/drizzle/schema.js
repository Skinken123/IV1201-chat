'use strict';

const { pgTable, serial, text, timestamp } = require('drizzle-orm/pg-core');

const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull(),
  loggedInUntil: timestamp('createdAt', { mode: 'date' }).default(new Date(0)), 
  // NOTE: Schema above had 'loggedInUntil' as DATE type in Sequelize. 
  // Checking User.js: loggedInUntil: { type: Sequelize.DATE, allowNull: false, defaultValue: 0 }
  // Sequelize DATE maps to timestamp with time zone in Postgres usually, or just timestamp. 
  // Let's match the column name from the old model if it was different? 
  // User.js doesn't specify 'field', so it defaults to 'loggedInUntil'.
  // However, I should check if the original code used camelCase or snake_case for DB columns.
  // Sequelize by default uses camelCase for columns if not specified otherwise, but standard SQL is snake_case.
  // Let's assume standard Sequelize behavior: it usually preserves camelCase if defined that way in `init`.
  
  // Wait, let's look at ChatDAO.js:
  // this.database = new Sequelize(..., { ... config ... });
  // It doesn't set 'underscored: true'. So columns are likely camelCase in the DB too 'loggedInUntil'.
  // But to be safe and "modern", Drizzle usually prefers snake_case in DB, camelCase in JS.
  // BUT: The user said "do NOT remove or add new functionality". Changing column names is a migration.
  // I must match the EXISTING database schema if I want to avoid running a migration script if possible, OR I should create a migration with Drizzle Kit.
  // The user didn't mention existing data, but implied "hosted in a docker container". 
  // The "createTables" method in ChatDAO performs `sync()`.
  // If I change to Drizzle, Drizzle doesn't auto-sync the same way `sync()` does unless I use `push` or `migrate`.
  // To avoid breaking existing DBs, I should try to match the column names.
  
  loggedInUntil: timestamp('loggedInUntil', { mode: 'date' }).default(new Date(0)),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow(),
  deletedAt: timestamp('deletedAt', { mode: 'date' }),
});

const msgs = pgTable('msgs', {
  id: serial('id').primaryKey(),
  msg: text('msg').notNull(),
  // Foreign key
  userId: serial('UserId').references(() => users.id), // Sequelize default FK naming is ModelId -> UserId
  
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow(),
  deletedAt: timestamp('deletedAt', { mode: 'date' }),
});

module.exports = {
  users,
  msgs,
};
