// client/src/pages/HomePage/HomePage.tsx

import React, { useState, Suspense, useContext, useCallback } from 'react';
import NewProjectModal from '../../components/HomePage/NewProjectModal/NewProjectModal.tsx';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner.tsx';
import './HomePage.css';
import { AuthContext } from '../../contexts/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import useProjects from '../../hooks/useProjects.ts';
import Sidebar from '../../components/SidebarAll/Sidebar/Sidebar.tsx';
import api from '../../api.ts';

const ProjectCard = React.lazy(() => import('../../components/HomePage/ProjectCard/ProjectCard.tsx'));
const NewProjectCard = React.lazy(() => import('../../components/HomePage/NewProjectCard/NewProjectCard.tsx'));
const Setting = React.lazy(() => import('../../components/HomePage/Setting/Setting.tsx'));

const HomePage: React.FC = () => {
  const { projects, loading, error, refreshProjects } = useProjects();
  const { user } = useContext(AuthContext); // useContext を使用してユーザー情報を取得
  const [selectedMenu, setSelectedMenu] = useState<'Project' | 'Setting' | 'Label' | 'Check'>('Project');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleCreateProject = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleProjectCreated = useCallback((newProject: string) => {
    refreshProjects();
  }, [refreshProjects]);

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('本当にこのプロジェクトを削除しますか？')) return;

    try {
      const response = await api.delete(`/api/image-classing/projects/${projectId}`);
      if (response.data.success) {
        refreshProjects();
      } else {
        alert(response.data.message || 'プロジェクトの削除に失敗しました。');
      }
    } catch (error: any) {
      alert(error.message || 'プロジェクト削除中にエラーが発生しました。');
    }
  };

  const handleRenameProject = async (projectId: string, newProjectName: string) => {
    try {
      const response = await api.put(`/api/image-classing/projects/${projectId}/rename`, { newProjectName });
      if (response.data.success) {
        refreshProjects();
      } else {
        alert(response.data.message || 'プロジェクトのリネームに失敗しました。');
      }
    } catch (error: any) {
      alert(error.message || 'プロジェクトリネーム中にエラーが発生しました。');
    }
  };

  // イベントハンドラーをメモ化
  const handleSelectMenu = useCallback((menu: 'Project' | 'Setting' | 'Label' | 'Check') => {
    setSelectedMenu(menu);
  }, []);

  return (
    <>
      <Sidebar
        username={user?.username || 'User'}
        selectedMenu={selectedMenu}
        onSelectMenu={handleSelectMenu}
        page="home"
        projectId="" // Provide a valid projectId or an empty string if not applicable
      />
      <main className="main-content">
        {selectedMenu === 'Project' && (
          <>
            <h1>Project</h1>
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : (
              <div className="project-grid">
                <Suspense fallback={<div>Loading Projects...</div>}>
                  {projects.length > 0 ? (
                    projects.map((project) => (
                      <ProjectCard
                        key={project}
                        title={project}
                        onDelete={() => handleDeleteProject(project)}
                        onRename={(newTitle) => handleRenameProject(project, newTitle)}
                        onClick={() => navigate(`/project/${project}`)}
                      />
                    ))
                  ) : (
                    <p>プロジェクトがありません。</p>
                  )}
                  <NewProjectCard onCreate={handleCreateProject} />
                </Suspense>
              </div>
            )}
          </>
        )}
        {selectedMenu === 'Setting' && (
          <Suspense fallback={<div>Loading Settings...</div>}>
            <Setting />
          </Suspense>
        )}
      </main>
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </>
  );
};

export default HomePage;