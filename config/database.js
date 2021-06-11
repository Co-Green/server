const mysql = require('mysql2/promise');
const {logger} = require('./winston');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PW,
    database: process.env.DB
});

module.exports = {
    pool: pool
};