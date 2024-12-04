// server/server.js

const express = require('express'); // Expressフレームワーク
const http = require('http'); // HTTPサーバーの作成用
const path = require('path'); // パス操作用
const cookieParser = require('cookie-parser'); // クッキーのパース用
const session = require('express-session'); // セッション管理用
const MySQLStore = require('express-mysql-session')(session);  // MySQLを使ったセッションストア
const bodyParser = require('body-parser');  // リクエストボディのパース用
const cors = require('cors'); // クロスオリジンリクエスト許可用
const util = require('util'); // オブジェクトの整形表示用

const sessionMiddleware = require('./middlewares/sessionMiddleware');
const socketHandler = require('./sockets/socketHandler');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();
const port = 3001;

// ミドルウェア設定
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000', // クライアントのURL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // クッキーを使用する場合
}));
app.use(cookieParser());
app.use(sessionMiddleware);

// ルーティング設定
app.use('/api/auth', authRoutes);
app.use('/api/image-classing/projects', projectRoutes);

// 静的ファイルの提供設定
app.use('/uploads', (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ success: false, message: '未認証' });
  }
}, express.static(path.join(__dirname, '..', 'uploads'),{
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // 追加
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  },
}));

// フロントエンドのルートをサポート
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/public', 'index.html'));
});

// HTTPサーバーの作成
const server = http.createServer(app);

// Socket.IOの設定とハンドリング
socketHandler(server, sessionMiddleware);

// サーバーの起動
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});