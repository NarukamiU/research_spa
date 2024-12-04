// server/controllers/authController.js

const bcrypt = require('bcrypt');
const db = require('../config/db'); // 共通のデータベース接続を使用
const util = require('util');
const path = require('path');
const fs = require('fs').promises;


// プロミス化
const query = db.query;

// ログイン処理
exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'ユーザー名とパスワードが必要です。' });
  }

  try {
    const results = await query('SELECT * FROM users WHERE username = ?', [username]);
    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'ユーザーが存在しません。' });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.userId = user.id;
      req.session.username = user.username;
      console.log('Session:', util.inspect(req.session, false, null, true));
      return res.json({ success: true, message: 'ログイン成功' });
    } else {
      console.log('Password mismatch');
      return res.json({ success: false, message: 'パスワードが間違っています' });
    }
  } catch (error) {
    console.error('ログインエラー:', error);
    return res.status(500).json({ success: false, message: 'ログイン中にエラーが発生しました。' });
  }
};

// ログアウト処理
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log('Failed to destroy session:', err);
      return res.json({ success: false, message: 'ログアウト失敗' });
    }
    res.clearCookie('session_cookie_name');
    console.log('Session:', util.inspect(req.session, false, null, true));
    return res.json({ success: true, message: 'ログアウト成功' });
  });
};

// プロファイル取得
exports.getProfile = (req, res) => {
  if (req.session && req.session.userId) {
    console.log('Session:', util.inspect(req.session, false, null, true));
    return res.json({ success: true, user: { id: req.session.userId, username: req.session.username } });
  } else {
    console.log('Session:', util.inspect(req.session, false, null, true));
    return res.json({ success: false, message: '未認証' });
  }
};

// 登録処理
exports.register = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'ユーザー名とパスワードが必要です。' });
  }

  try {
    // ユーザー名の重複チェック
    const existingUsers = await query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ success: false, message: '既に存在するユーザー名です。' });
    }

    // パスワードのハッシュ化
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 新規ユーザーの挿入
    await query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

    // ユーザー用ディレクトリの作成
    const userDir = path.join(__dirname, '..', '..', 'uploads', username, 'image-classing');
    await fs.mkdir(userDir, { recursive: true });

    return res.status(201).json({ success: true, message: 'ユーザー登録が完了しました。' });
  } catch (error) {
    console.error('登録エラー:', error);
    return res.status(500).json({ success: false, message: '登録中にエラーが発生しました。' });
  }
};