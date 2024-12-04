// client/src/hooks/useProjects.ts
import { useEffect, useState, useContext } from 'react';
import api from '../api.ts';
import { AuthContext } from '../contexts/AuthContext.tsx';

interface UseProjectsReturn {
  projects: string[];
  loading: boolean;
  error: string | null;
  refreshProjects: () => void;
}

const useProjects = (): UseProjectsReturn => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/image-classing/projects');
      if (response.data.success) {
        setProjects(response.data.projects);
      } else {
        setError(response.data.message || 'プロジェクト一覧の取得に失敗しました。');
        console.error('プロジェクト一覧取得失敗:', response.data.message);
      }
    } catch (error: any) {
      setError(error.message || 'プロジェクト取得中にエラーが発生しました。');
      console.error('プロジェクト取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  return { projects, loading, error, refreshProjects: fetchProjects };
};

export default useProjects;