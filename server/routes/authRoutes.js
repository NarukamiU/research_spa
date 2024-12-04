// server/routes/authRoutes.js
//// ルーティング設定(server.js)
//app.use('/api/auth', authRoutes);

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ログインエンドポイント
router.post('/login', authController.login);

// ログアウトエンドポイント
router.post('/logout', authController.logout);

// プロファイル取得エンドポイント
router.get('/profile', authController.getProfile);

// 登録エンドポイントを追加
router.post('/register', authController.register);

module.exports = router;