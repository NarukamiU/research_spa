// client/src/pages/LoginPage/LoginPage.tsx

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext.tsx';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, refreshAuth } = useContext(AuthContext);

  // ユーザーが既に認証されている場合、トップページにリダイレクト
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    if (username && password) {
      try {
        const response = await axios.post(
          'http://localhost:3001/api/auth/login',
          { username, password },
          { withCredentials: true }
        );
        if (response.data.success) {
          refreshAuth(); // 認証状態を更新
          navigate('/');
        } else {
          alert('Login failed');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Login error');
      }
    }
  };

  const handleRegister = async () => {
    if (username && password) {
      try {
        const response = await axios.post(
          'http://localhost:3001/api/auth/register',
          { username, password },
          { withCredentials: true }
        );
        if (response.data.success) {
          alert('Registered successfully!');
        } else {
          alert('Registration failed');
        }
      } catch (error) {
        console.error('Registration error:', error);
        alert('Registration error');
      }
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password" // 修正: type 属性を正しく設定
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default Login;