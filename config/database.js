const mysql = require('mysql2/promise');
const {logger} = require('./winston');

const pool = mysql.createPool({
    host: 'cogreeninstance.cstoukt6aqdn.ap-northeast-2.rds.amazonaws.com',
    user: 'admin',
    port: 3306,
    password: 'cogreen123_',
    database: 'cogreenDB'
});

module.exports = {
    pool: pool
};