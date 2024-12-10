// client/src/hooks/useLabels.ts

import { useState, useEffect } from 'react';
import axios from 'axios';

const useLabels = (projectId: string) => {
  const [labels, setLabels] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const response = await axios.get(
          `/api/image-classing/projects/${projectId}/training-data/labels`,
          { withCredentials: true }
        );
        if (response.data.success) {
          setLabels(response.data.labels);
        } else {
          setError(response.data.message || 'ラベルの取得に失敗しました。');
        }
      } catch (err) {
        console.error(err);
        setError('ラベルの取得中にエラーが発生しました。');
      }
    };
    if (projectId) {
      fetchLabels();
    }
  }, [projectId]);

  return { labels, error };
};

export default useLabels;