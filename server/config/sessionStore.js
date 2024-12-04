// server/config/sessionStore.js

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const sessionStore = new MySQLStore({
  host: 'localhost',
  port: 3306,
  user: 'root',                   // MySQLのユーザー名
  password: 'LV~8VNbnAYt2',       // MySQLのパスワード
  database: 'research_spa',       // 使用するデータベース
});

module.exports = sessionStore;