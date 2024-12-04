// client/src/contexts/AuthContext.tsx

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  refreshAuth: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: true,
  user: null,
  refreshAuth: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const navigate = useNavigate();

  const checkAuth = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/auth/profile', { withCredentials: true });
      if (response.data.success) {
        setIsAuthenticated(true);
        setUser(response.data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // Socket.IOの接続
    const newSocket = io('http://localhost:3001', {
      withCredentials: true,
    });

    setSocket(newSocket);

    // 'sessionExpired'イベントのリスナー
    newSocket.on('sessionExpired', () => {
      setIsAuthenticated(false);
      setUser(null);
      navigate('/login');
    });

    // クリーンアップ時にSocketを切断
    return () => {
      newSocket.disconnect();
    };
  }, [navigate]);

  const refreshAuth = () => {
    setLoading(true);
    checkAuth();
  };

  // ログアウト関数を定義
  const logout = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/auth/logout', {}, { withCredentials: true });
      if (response.data.success) {
        setIsAuthenticated(false);
        setUser(null);
        navigate('/login');
      } else {
        console.error('ログアウト失敗:', response.data.message);
        alert('ログアウトに失敗しました。');
      }
    } catch (error) {
      console.error('ログアウトエラー:', error);
      alert('ログアウト中にエラーが発生しました。');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, user, refreshAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};