'use strict';

require('dotenv-safe').config();

const isDocker = process.env.DOCKER_DB === 'true';
let connectionString = process.env.DATABASE_URL;

if (isDocker && connectionString.includes('@localhost')) {
    connectionString = connectionString.replace('@localhost', '@postgres');
}

module.exports = {
    schema: './src/drizzle/schema.js',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: connectionString,
    },
};
