// client/src/hooks/useTraining.ts

import { useState, useEffect } from 'react';
import { Socket, io } from 'socket.io-client';

const useTraining = (page: string, projectName: string | undefined) => {
  const [trainingProgress, setTrainingProgress] = useState<string>('');
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (page === 'project' && projectName) {
      const newSocket = io('http://localhost:3001', { withCredentials: true });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to Socket.IO server:', newSocket.id);
        newSocket.emit('joinProject', projectName);
      });

      newSocket.on('trainingProgress', (data: string) => {
        console.log('Training Progress:', data);
        if (data.includes('%')) {
          const match = data.match(/(\d+)%/);
          if (match) {
            const percentage = parseInt(match[1], 10);
            setProgress(percentage);
            console.log('Progress:', percentage);
            setTrainingProgress(`${percentage}%`); // パーセンテージをメッセージに設定
          }
        } else {
          setTrainingProgress(data);
          if (data === '学習が完了しました。') {
            setIsTraining(false);
            setProgress(100);
          }
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [page, projectName]);

  const handleTrain = async () => {
    if (!projectName) return;

    setIsTraining(true);
    setTrainingProgress('学習を開始しています...');
    setProgress(0);

    try {
      const response = await fetch(`/api/image-classing/projects/${projectName}/train`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setTrainingProgress('学習が開始されました。');
      } else {
        setTrainingProgress(data.message || '学習の開始に失敗しました。');
        setIsTraining(false);
      }
    } catch (error: any) {
      setTrainingProgress(error.message || '学習の開始に失敗しました。');
      setIsTraining(false);
    }
  };

  return {
    trainingProgress,
    isTraining,
    progress,
    socket,
    handleTrain
  };
};

export async function fetchModelInfo(projectId: string) {
  const response = await fetch(`/api/image-classing/projects/${projectId}/model-info`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'モデル情報の取得に失敗しました。');
  }

  const data = await response.json();
  return data.modelInfo;
}

export default useTraining;