// client/src/pages/ProjectPage/ProjectPage.tsx


import React, { useContext ,useState} from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/SidebarAll/Sidebar/Sidebar.tsx';
import Label from './Label/Label.tsx';
import Check from './Check/Check.tsx';
import Lightbox from '../../components/ProjectPage/Lightbox/Lightbox.tsx';
import MoveModal from '../../components/ProjectPage/MoveModal/MoveModal.tsx';
import { AuthContext } from '../../contexts/AuthContext.tsx';
import useProjectData from '../../hooks/useProjectData.ts';
import useLabels from '../../hooks/useLabels.ts';
import useProjectPage from '../../hooks/useProjectPage.ts';
import './ProjectPage.css';


const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useContext(AuthContext);
  const { project, error: projectError } = useProjectData(projectId || '');
  const { labels, error: labelsError } = useLabels(projectId || '');

  const {
    selectedMenu,
    setSelectedMenu,
    isMoveModalOpen,
    openMoveModal,
    closeMoveModal,
    isLightboxOpen,
    openLightbox,
    closeLightbox,
    lightboxImages,
    currentLightboxIndex,
    targetLabel,
    setTargetLabel,
    handleMoveImages,
    handlePrev,
    handleNext,
  } = useProjectPage(labels);


  // 追加: selectedImages の状態
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  console.log('Selected Images:', selectedImages);
  return (
    <div className="project-page">
      <Sidebar
        username={user?.username || 'User'}
        selectedMenu={selectedMenu}
        onSelectMenu={setSelectedMenu as (menu: 'Label' | 'Check') => void}
        page="project"
        projectName={project?.name || 'プロジェクト名未指定'}
        projectId={project?.id || ''}
      />
      <main className="main-content">
        {projectError && <p className="error-message">{projectError}</p>}
        {labelsError && <p className="error-message">{labelsError}</p>}
        {!projectError && !labelsError && (
          <>
            {selectedMenu === 'Label' && (
              <Label
                projectId={project?.id || ''}
                user={user}
                openMoveModal={openMoveModal}
                openLightbox={openLightbox}
                setSelectedImages={setSelectedImages}
              />
            )}
            {selectedMenu === 'Check' && (
              <Check
                projectId={project?.id || ''}
                user={user}
                openMoveModal={openMoveModal}
                openLightbox={openLightbox}
                setSelectedImages={setSelectedImages}
              />
            )}
            {isMoveModalOpen && selectedMenu === 'Label'&& (
              <MoveModal
                labels={labels}
                targetLabel={targetLabel}
                setTargetLabel={setTargetLabel}
                selectedImages={selectedImages} // `Check` コンポーネントから選択された画像を渡す必要があります
                handleMoveImages={handleMoveImages}
                closeMoveModal={closeMoveModal}
                dataType='training' // `Label` と `Check` で処理を分岐するための情報
              />
            )}
            {isMoveModalOpen && selectedMenu === 'Check' && (
              <MoveModal
              labels={labels}
              targetLabel={targetLabel}
              setTargetLabel={setTargetLabel}
              selectedImages={selectedImages} // `Check` コンポーネントから選択された画像を渡す必要があります
              handleMoveImages={handleMoveImages}
              closeMoveModal={closeMoveModal}
              dataType="verify" // Checkの場合
              />
            )}
            {isLightboxOpen && (
              <Lightbox
                images={lightboxImages}
                currentIndex={currentLightboxIndex}
                onClose={closeLightbox}
                onPrev={handlePrev}
                onNext={handleNext}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ProjectPage;