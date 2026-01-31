'use strict';

const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const schema = require('./schema');

// Determine if we need to adjust the host for Docker
const isDocker = process.env.DOCKER_DB === 'true';

let connectionString = process.env.DATABASE_URL;

if (isDocker && connectionString.includes('@localhost')) {
    // If running in Docker mode but URL says localhost, switch to 'postgres'
    connectionString = connectionString.replace('@localhost', '@postgres');
}

const pool = new Pool({
    connectionString: connectionString,
});

const db = drizzle(pool, { schema });

module.exports = db;
