// client/src/pages/LoginPage/LoginPage.tsx

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext.tsx';
import './LoginPage.css';
import useLogin from '../../hooks/useLogin.ts';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const { handleLogin, handleRegister } = useLogin(); // フックから関数を取得

  // ユーザーが既に認証されている場合、トップページにリダイレクト
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onLoginClick = () => {
    handleLogin({ username, password });
  };

  const onRegisterClick = () => {
    handleRegister({ username, password });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">ログイン</h2>
        <input
          type="text"
          placeholder="ユーザー名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="login-input"
        />
        <input
          type="password" 
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />
        <div className="button-group">
          <button onClick={onLoginClick} className="login-button">ログイン</button>
          <button onClick={onRegisterClick} className="register-button">登録</button>
        </div>
      </div>
    </div>
  );
};

export default Login;