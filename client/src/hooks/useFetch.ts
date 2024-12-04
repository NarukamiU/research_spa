// client/src/hooks/useFetch.ts
import { useState, useEffect } from 'react';
import api from '../api.ts';

const useFetch = <T,>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(url);
        if (response.data.success) {
          setData(response.data.data);
        } else {
          setError(response.data.message || '取得に失敗しました。');
        }
      } catch (err: any) {
        setError(err.message || '取得中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};

export default useFetch;