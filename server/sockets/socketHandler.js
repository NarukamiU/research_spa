// server/sockets/socketHandler.js

const { Server } = require('socket.io');
const util = require('util');
const cookieParser = require('cookie-parser'); // 追加

// セッションIDとSocketのマッピング
const sessionSocketMap = new Map();

// セッションIDとタイマーのマッピング
const sessionTimerMap = new Map();


module.exports = (server, sessionMiddleware) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000', // クライアントのURL
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Socket.IOとExpressセッションの共有
  io.use((socket, next) => {
    cookieParser()(socket.request, socket.request.res || {}, (err) => {
      if (err) return next(err);
      sessionMiddleware(socket.request, socket.request.res || {}, next);
    });
  });


  io.on('connection', (socket) => {
    const req = socket.request;
    const session = req.session;

    if (session && session.id) {
      const sessionID = session.id;

      // セッションIDとSocketをマッピング
      sessionSocketMap.set(sessionID, socket);

      // セッションの有効期限時間を計算
      const expirationTime = session.cookie.expires
        ? new Date(session.cookie.expires).getTime()
        : Date.now() + session.cookie.maxAge;
      const currentTime = Date.now();
      const remainingTime = expirationTime - currentTime;

      // 既存のタイマーがあればクリア
      if (sessionTimerMap.has(sessionID)) {
        clearTimeout(sessionTimerMap.get(sessionID));
      }

      // セッション期限のタイマーをセット
      const timeout = setTimeout(() => {
        // クライアントにセッション期限切れを通知
        socket.emit('sessionExpired');

        // セッションを破棄
        req.session.destroy((err) => {
          if (err) {
            console.error('Failed to destroy session:', err);
          }
        });

        // マッピングを削除
        sessionSocketMap.delete(sessionID);
        sessionTimerMap.delete(sessionID);
      }, remainingTime);

      // タイマーをマッピングに保存
      sessionTimerMap.set(sessionID, timeout);

      // クライアントからのルーム参加要求を受け取る
      socket.on('joinProject', (projectId) => {
        socket.join(projectId);
        console.log(`Socket ${socket.id} がプロジェクト ${projectId} のルームに参加しました`);
      });

      // Socket切断時の処理
      socket.on('disconnect', () => {
        sessionSocketMap.delete(sessionID);
        if (sessionTimerMap.has(sessionID)) {
          clearTimeout(sessionTimerMap.get(sessionID));
          sessionTimerMap.delete(sessionID);
        }
      });
    }
  });
};

// マップをエクスポート
module.exports.sessionSocketMap = sessionSocketMap;