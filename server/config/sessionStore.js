// server/config/sessionStore.js

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

/*
const sessionStore = new MySQLStore({
  host: 'localhost',
  port: 3306,
  user: 'root',                   // MySQLのユーザー名
  password: 'LV~8VNbnAYt2',       // MySQLのパスワード
  database: 'research_spa',       // 使用するデータベース
});
*/

// セッションストアの設定
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});


module.exports = sessionStore;