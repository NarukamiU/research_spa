// client/src/hooks/useVerificationResults.ts
import { useState, useEffect } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

interface ImageData {
  name: string;
  confidences: number[];
  url: string;
}

interface VerificationResults {
  classes: string[];
  images: ImageData[];
  execTime_ms: number;
}

interface UseVerificationResultsProps {
  projectId: string;
  user: { username: string } | null;
}

const useVerificationResults = ({ projectId, user }: UseVerificationResultsProps) => {
  const [labels, setLabels] = useState<string[]>([]);
  const [labelImages, setLabelImages] = useState<{ [key: string]: string[] }>({});
  const [verifiedResults, setVerifiedResults] = useState<{ [key: string]: VerificationResults }>({});
  const [validationProgress, setValidationProgress] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCheckLabels();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, user]);

  useEffect(() => {
    if (labels.length > 0) {
      labels.forEach(label => {
        fetchCheckLabelImages(label);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labels]);

  useEffect(() => {
    if (projectId && !socket && user) {
      const newSocket = io('http://localhost:3001', { withCredentials: true });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to Socket.IO server:', newSocket.id);
        newSocket.emit('joinProject', projectId);
      });

      newSocket.on('validationProgress', (data: string) => {
        console.log('Validation Progress:', data);
        setValidationProgress(data);
        if (data === '検証が完了しました。') {
          fetchVerifiedResults();
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
      });

      return () => {
        newSocket.disconnect();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, socket, user]);

  const fetchCheckLabels = async () => {
    if (!user) return;

    try {
      const response = await axios.get(
        `http://localhost:3001/api/image-classing/projects/${projectId}/verify-data/labels`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setLabels(response.data.labels);
        setError(null);
      } else {
        console.error('Checkラベル取得失敗:', response.data.message);
        setError(response.data.message || 'Checkラベルの取得に失敗しました。');
      }
    } catch (error: any) {
      console.error('Checkラベル取得エラー:', error);
      setError('Checkラベル取得中にエラーが発生しました。');
    }
  };

  const fetchCheckLabelImages = async (label: string) => {
    if (!user) return;

    try {
      const response = await axios.get(
        `http://localhost:3001/api/image-classing/projects/${projectId}/verify-data/labels/${label}/images`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setLabelImages(prevState => ({ ...prevState, [label]: response.data.images }));
      } else {
        console.error(`Check画像取得失敗 (${label}):`, response.data.message);
      }
    } catch (error: any) {
      console.error(`Check画像取得エラー (${label}):`, error);
    }
  };

  const fetchVerifiedResults = async () => {
    if (!user) return;

    try {
      const response = await axios.get(
        `http://localhost:3001/api/image-classing/projects/${projectId}/verify-data/verification-results`,
        { withCredentials: true }
      );

      if (response.data.success) {
        const results = response.data.results;
        const updatedResults: { [key: string]: VerificationResults } = {};

        for (const [label, result] of Object.entries(results)) {
          const verificationResult = result as VerificationResults;
          const imagesWithUrls = verificationResult.images.map((image: any) => ({
            ...image,
            url: `http://localhost:3001/uploads/${user.username}/image-classing/${projectId}/verify-data/${label}/${image.name}`,
          }));
          updatedResults[label] = {
            ...verificationResult,
            images: imagesWithUrls,
          };
        }

        setVerifiedResults(updatedResults);
      } else {
        console.error('検証結果取得失敗:', response.data.message);
      }
    } catch (error: any) {
      console.error('検証結果取得エラー:', error);
    }
  };

  const handleVerify = async (label: string) => {
    if (!user) return;

    try {
      const response = await axios.post(
        `http://localhost:3001/api/image-classing/projects/${projectId}/verify-data/labels/${label}/verify`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        alert('検証が開始されました。進捗を確認してください。');
      } else {
        alert(response.data.message || '検証の開始に失敗しました。');
      }
    } catch (error: any) {
      console.error('検証開始エラー:', error);
      alert(error.response?.data?.message || '検証の開始に失敗しました。');
    }
  };

  return {
    labels,
    labelImages,
    verifiedResults,
    validationProgress,
    handleVerify,
    error,
    fetchCheckLabelImages,
  };
};

export default useVerificationResults;