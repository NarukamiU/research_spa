// server/config/db.js

const mysql = require('mysql2');
const util = require('util');
require('dotenv').config(); // dotenv をロード

const db = mysql.createConnection({
  host: process.env.DB_HOST,       // 環境変数を使用
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
/*
const db = mysql.createConnection({
  host: process.env.DB_HOST,         // Renderで設定したDB_HOST
  port: process.env.DB_PORT,         // Renderで設定したDB_PORT
  user: process.env.DB_USER,         // Renderで設定したDB_USER
  password: process.env.DB_PASSWORD, // Renderで設定したDB_PASSWORD
  database: process.env.DB_NAME,     // Renderで設定したDB_NAME
  ssl: {
    rejectUnauthorized: true,        // 必要に応じて設定
  },
});
*/

// プロミス化
db.query = util.promisify(db.query).bind(db);

module.exports = db;