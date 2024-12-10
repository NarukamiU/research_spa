// client/src/hooks/useLogin.ts

import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext.tsx';

interface UseLoginProps {
  username: string;
  password: string;
}

const useLogin = () => {
  const navigate = useNavigate();
  const { refreshAuth } = useContext(AuthContext);

  const handleLogin = async ({ username, password }: UseLoginProps) => {
    if (username && password) {
      try {
        const response = await axios.post(
          '/api/auth/login',
          { username, password },
          { withCredentials: true }
        );
        if (response.data.success) {
          refreshAuth(); // 認証状態を更新
          navigate('/');
        } else {
          alert('ログインに失敗しました。');
        }
      } catch (error: any) {
        console.error('ログインエラー:', error);
        alert('ログイン中にエラーが発生しました。');
      }
    } else {
      alert('ユーザー名とパスワードを入力してください。');
    }
  };

  const handleRegister = async ({ username, password }: UseLoginProps) => {
    if (username && password) {
      try {
        const response = await axios.post(
          '/api/auth/register',
          { username, password },
          { withCredentials: true }
        );
        if (response.data.success) {
          alert('登録に成功しました！');
        } else {
          alert('登録に失敗しました。');
        }
      } catch (error: any) {
        console.error('登録エラー:', error);
        alert('登録中にエラーが発生しました。');
      }
    } else {
      alert('ユーザー名とパスワードを入力してください。');
    }
  };

  return { handleLogin, handleRegister };
};

export default useLogin;