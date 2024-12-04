// server/middlewares/sessionMiddleware.js

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const db = require('../config/db'); // 修正: 共通のデータベース接続を使用
require('dotenv').config(); // dotenv をロード

const sessionStore = new MySQLStore({}, db); // セッションストアにデータベース接続を渡す

const sessionMiddleware = session({
  key: 'session_cookie_name',
  secret: process.env.SESSION_SECRET, // 環境変数を使用
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // 本番環境では true に設定
    sameSite: 'lax',
    maxAge: 1000 * 60 * 10 * 10, // 10分 x 10 = 100分@
  },
  rolling: true,
});

module.exports = sessionMiddleware;