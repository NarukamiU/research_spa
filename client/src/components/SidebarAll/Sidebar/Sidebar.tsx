// client/src/components/Sidebar/Sidebar.tsx
import React from 'react';
import HamburgerMenu from '../HamburgerMenu/HamburgerMenu.tsx';
import './Sidebar.css';
import useTraining from '../../../hooks/useTraining.ts';

interface SidebarProps {
  username: string;
  selectedMenu: 'Project' | 'Setting' | 'Label' | 'Check';
  onSelectMenu: (menu: 'Project' | 'Setting' | 'Label' | 'Check') => void;
  page: 'home' | 'project';
  projectId: string;   // 必要に応じて追加
  // 他の必要なプロパティがあればここに追加
}


const Sidebar: React.FC<SidebarProps> = ({
  username,
  selectedMenu,
  onSelectMenu,
  page,
  projectId,   // 必要に応じて追加
  // 他のプロパティがあればここに追加
}) => {
  const { trainingProgress, isTraining, progress, handleTrain } = useTraining(page, projectId);
  console.log('Current Progress:', progress); // デバッグ用ログ

  return (
    <div className="sidebar">
      <HamburgerMenu username={username || 'User'} />
      <ul className="sidebar-menu">
        {page === 'home' ? (
          <>
            <li
              className={selectedMenu === 'Project' ? 'active' : ''}
              onClick={() => onSelectMenu('Project')}
            >
              Project
            </li>
            <li
              className={selectedMenu === 'Setting' ? 'active' : ''}
              onClick={() => onSelectMenu('Setting')}
            >
              Setting
            </li>
          </>
        ) : page === 'project' ? (
          <>
            <li className="project-name">
              {projectId}
            </li>
            <li
              className={selectedMenu === 'Label' ? 'active' : ''}
              onClick={() => onSelectMenu('Label')}
            >
              Label
            </li>
            <li
              className={selectedMenu === 'Check' ? 'active' : ''}
              onClick={() => onSelectMenu('Check')}
            >
              Check
            </li>
            {/* Train Button */}
            <li className="train-button-container">
              <button
                className="train-button"
                onClick={handleTrain}
                disabled={isTraining}
              >
                {isTraining ? '学習中...' : '学習開始'}
              </button>
              {/* Training Progress Message */}
              {trainingProgress && (
                <p className="training-message">{trainingProgress}</p>
              )}
            </li>
          </>
        ) : null}
      </ul>
    </div>
  );
};

export default Sidebar;