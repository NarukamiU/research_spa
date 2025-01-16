// server/config/sessionStore.js

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
require('dotenv').config(); // dotenv をロード

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,       // 環境変数を使用
  port: process.env.DB_PORT || 3306,    // 環境変数を使用、デフォルトは3306
  user: process.env.DB_USER,       // 環境変数を使用
  password: process.env.DB_PASSWORD, // 環境変数を使用
  database: process.env.DB_NAME,   // 環境変数を使用
});

module.exports = sessionStore;