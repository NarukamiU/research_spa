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

// プロミス化
db.query = util.promisify(db.query).bind(db);

module.exports = db;