// client/src/hooks/useProjectData.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Project {
  id: string;
  name: string;
  path: string;
  // 他のプロジェクト関連データ
}

const useProjectData = (projectId: string) => {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`/api/image-classing/projects/${projectId}`, { withCredentials: true });
        console.log('API Response:', response.data); // デバッグ用
        if (response.data.success) {
          setProject(response.data.project);
        } else {
          console.error('プロジェクト取得失敗:', response.data.message);
          setError(response.data.message || 'プロジェクトの取得に失敗しました。');
        }
      } catch (error: any) {
        console.error('プロジェクト取得エラー:', error);
        setError('プロジェクトの取得中にエラーが発生しました。');
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  return { project, error };
};

export default useProjectData;