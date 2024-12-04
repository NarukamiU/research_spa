// client/src/pages/Check/Check.tsx

import React, { useState } from 'react';
import ImageCard from '../../../components/ProjectPage/ImageCard/ImageCard.tsx';
import MoveModal from '../../../components/ProjectPage/MoveModal/MoveModal.tsx';
import ImageUpload from '../../../components/ProjectPage/ImageUpload/ImageUpload.tsx';
import NewLabel from '../../../components/ProjectPage/NewLabel/NewLabel.tsx';
import RenameLabelModal from '../../../components/ProjectPage/RenameLabelModal/RenameLabelModal.tsx';
import useCheck from '../../../hooks/useCheck.ts';
import './Check.css';

interface CheckProps {
  projectId: string;
  user: { username: string } | null;
  openLightbox: (images: string[], index: number) => void;
  setSelectedImages: (images: SelectedImage[]) => void;
}

interface SelectedImage {
  projectId: string;
  labelName: string;
  imageName: string;
}

const Check: React.FC<CheckProps> = ({
  projectId,
  user,
  openLightbox,
  setSelectedImages
}) => {
  const {
    labels,
    labelImages,
    selectedImages,
    verifiedResults,
    isMoveModalOpen,
    moveModalTargetLabel,
    error,
    handleUploadSuccess,
    handleRenameLabel,
    handleVerify,
    handleDeleteImage,
    handleDeleteLabel,
    handleSelectImage,
    handleMoveImages,
    openMoveModal,
    closeMoveModal,
    setMoveModalTargetLabel,
    handleLabelAdded,
    verificationStatus,
  } = useCheck(projectId, user);

   // State for Rename Modal
   const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
   const [currentLabelToRename, setCurrentLabelToRename] = useState<string>('');

   const openRenameModal = (label: string) => {
     setCurrentLabelToRename(label);
     setIsRenameModalOpen(true);
   };

   const closeRenameModal = () => {
     setIsRenameModalOpen(false);
     setCurrentLabelToRename('');
   };

   const handleRename = (newLabelName: string) => {
     handleRenameLabel(currentLabelToRename, newLabelName);
     closeRenameModal();
   };

  // `selectedImages` が変更されたら親に通知
  React.useEffect(() => {
    setSelectedImages(selectedImages);
    console.log('現在選択中の画像:', selectedImages);
  }, [selectedImages, setSelectedImages]);

  return (
    <div className="check-page">
      <h1>Check Page</h1>

      {error && <p className="error-message">{error}</p>}

      <div className="check-actions">
        <button
          onClick={openMoveModal}
          disabled={selectedImages.length === 0}
          className="move-button"
        >
          選択した画像を移動
        </button>
        <NewLabel
          projectId={projectId}
          onLabelAdded={handleLabelAdded}
          labelType="verify-data" // Set labelType as verify-data
        />
      </div>

      {labels.length > 0 ? (
        <div className="check-labels">
          {labels.map((label) => (
            <div key={label} className="check-label-section">
              <div className="label-header">
                {/* ラベル名と画像数を表示 */}
                <h2>
                  {label} ({labelImages[label]?.length || 0})
                </h2>
                <button
                  className="rename-label-button"
                  onClick={() => openRenameModal(label)}
                >
                  リネーム
                </button>
                <button
                  onClick={() => handleVerify(label)}
                  className="verify-button"
                >
                  検証開始
                </button>
                {/* 検証ステータスを表示 */}
                {verificationStatus[label] && (
                  <p className="verification-status">{verificationStatus[label]}</p>
                )}
                <button
                  onClick={() => handleDeleteLabel(label)}
                  className="delete-label-button"
                >
                  ラベル削除
                </button>
              </div>
              <div className="images-container">
                {labelImages[label]?.length > 0 ? (
                  labelImages[label].map((image) => (
                    <ImageCard
                      key={image}
                      dataUrl={`http://localhost:3001/uploads/${user?.username}/image-classing/${projectId}/verify-data/${label}/${image}?t=${Date.now()}`}
                      projectId={projectId}
                      dataType="verify-data"
                      labelName={label}
                      imageName={image}
                      username={user?.username || ''}
                      altText={image}
                      onDelete={() => handleDeleteImage(label, image)}
                      onMove={() => {
                        handleSelectImage({ projectId, labelName: label, imageName: image });
                        openMoveModal();
                      }}
                      onSelect={() => handleSelectImage({ projectId, labelName: label, imageName: image })}
                      isSelected={selectedImages.some(
                        (img) => img.labelName === label && img.imageName === image
                      )}
                      onOpenLightbox={() => openLightbox(
                        labelImages[label].map(
                          (img) =>
                            `http://localhost:3001/uploads/${user?.username}/image-classing/${projectId}/verify-data/${label}/${img}`
                        ),
                        labelImages[label].indexOf(image)
                      )}
                      verificationData={verifiedResults[image]}
                    />
                  ))
                ) : (
                  <p>画像がありません。</p>
                )}
              </div>

              {/* 画像アップロードボタンの追加 */}
              <ImageUpload
                projectId={projectId}
                labelName={label}
                user={user}
                onUploadSuccess={() => {
                  handleUploadSuccess(label);
                }}
                dataType="verify" // データタイプを指定
              />
            </div>
          ))}
        </div>
      ) : (
        <p>ラベルがありません。</p>
      )}

      {isMoveModalOpen && (
        <MoveModal
          labels={labels}
          targetLabel={moveModalTargetLabel}
          setTargetLabel={setMoveModalTargetLabel}
          selectedImages={selectedImages}
          handleMoveImages={handleMoveImages}
          closeMoveModal={closeMoveModal}
          dataType="verify" // データタイプを指定
        />
      )}
      {/* Rename Label Modal */}
      <RenameLabelModal
        isOpen={isRenameModalOpen}
        onClose={closeRenameModal}
        onRename={handleRename}
        currentLabelName={currentLabelToRename}
      />
    </div>
  );
};

export default Check;