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
import useProjectPageUI from '../../hooks/useProjectPageUI.ts';
import './ProjectPage.css';

interface SelectedImage {
  projectId: string;
  labelName: string;
  imageName: string;
}



const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useContext(AuthContext);
  const { project, error: projectError } = useProjectData(projectId || '');
  const { labels, error: labelsError } = useLabels(projectId || '');

  const {
    selectedMenu,
    setSelectedMenu,
    isMoveModalOpen,
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
  } = useProjectPageUI(labels);


  // 追加: selectedImages の状態
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  console.log('Selected Images:', selectedImages);
  return (
    <div className="project-page">
      <Sidebar
        username={user?.username || 'User'}
        selectedMenu={selectedMenu}
        onSelectMenu={setSelectedMenu as (menu: 'Project' | 'Setting' | 'Label' | 'Check') => void}
        page="project"
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
                openLightbox={openLightbox}
                setSelectedImages={setSelectedImages}
              />
            )}
            {selectedMenu === 'Check' && (
              <Check
                projectId={project?.id || ''}
                user={user}
                openLightbox={openLightbox}
                setSelectedImages={setSelectedImages}
              />
            )}
            {isMoveModalOpen && selectedMenu === 'Label'&& (
              <MoveModal
                labels={labels}
                targetLabel={targetLabel}
                setTargetLabel={setTargetLabel}
                selectedImages={selectedImages}
                handleMoveImages={handleMoveImages}
                closeMoveModal={closeMoveModal}
                dataType='training' 
              />
            )}
            {isMoveModalOpen && selectedMenu === 'Check' && (
              <MoveModal
              labels={labels}
              targetLabel={targetLabel}
              setTargetLabel={setTargetLabel}
              selectedImages={selectedImages} 
              handleMoveImages={handleMoveImages}
              closeMoveModal={closeMoveModal}
              dataType="verify"
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