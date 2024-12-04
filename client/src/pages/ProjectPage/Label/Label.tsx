// client/src/pages/Label/Label.tsx

import React, { useState } from 'react';
import ImageCard from '../../../components/ProjectPage/ImageCard/ImageCard.tsx';
import NewLabel from '../../../components/ProjectPage/NewLabel/NewLabel.tsx';
import ImageUpload from '../../../components/ProjectPage/ImageUpload/ImageUpload.tsx';
import MoveModal from '../../../components/ProjectPage/MoveModal/MoveModal.tsx';
import RenameLabelModal from '../../../components/ProjectPage/RenameLabelModal/RenameLabelModal.tsx';
import useLabel from '../../../hooks/useLabel.ts';
import './Label.css';

interface LabelProps {
  projectId: string;
  user: { username: string } | null;
  openMoveModal: () => void;
  openLightbox: (images: string[], index: number) => void;
  setSelectedImages: (images: SelectedImage[]) => void;
}

interface SelectedImage {
  projectId: string;
  labelName: string;
  imageName: string;
}

const Label: React.FC<LabelProps> = ({
  projectId,
  user,
  openMoveModal,
  openLightbox,
  setSelectedImages,
}) => {
  const {
    labels,
    labelImages,
    selectedImages,
    error,
    handleRenameLabel,
    handleDeleteLabel,
    handleDeleteImage,
    handleSelectImage,
    handleLabelAdded,
    handleMoveImages,
    isMoveModalOpen,
    moveModalTargetLabel,
    setMoveModalTargetLabel,
    closeMoveModal,
  } = useLabel(projectId, user);

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
    <div className="label-gallery">
      <div className="label-actions">
        <NewLabel projectId={projectId} onLabelAdded={handleLabelAdded} labelType='training-data'/>
        <button
          onClick={openMoveModal}
          disabled={selectedImages.length === 0}
          className="move-button"
        >
          選択した画像を移動
        </button>
      </div>
      {error && <p className="error-message">{error}</p>}
      {labels.map((label) => (
        <div key={label} className="label-section">
          <div className="label-header">
            {/* ラベル名と画像数を表示 */}
            <h2>
              {label} ({labelImages[label]?.length || 0})
            </h2>
            {/* リネームボタンをラベル名と画像数の右側に配置 */}
            <button
              className="rename-label-button"
              onClick={() => openRenameModal(label)}
            >
              リネーム
            </button>
            <button
              className="delete-label-button"
              onClick={() => handleDeleteLabel(label)}
            >
              ラベル削除
            </button>
          </div>
          <div className="image-gallery">
            {labelImages[label]?.length > 0 ? (
              labelImages[label].map((image) => (
                <ImageCard
                  key={image}
                  dataUrl={`http://localhost:3001/uploads/${user?.username}/image-classing/${projectId}/training-data/${label}/${image}`}
                  projectId={projectId}
                  dataType="training-data"
                  labelName={label}
                  imageName={image}
                  username={user?.username || ''}
                  altText={image}
                  onDelete={() => handleDeleteImage(label, image)}
                  onSelect={() => handleSelectImage({ projectId, labelName: label, imageName: image })}
                  isSelected={selectedImages.some(
                    (img) =>
                      img.projectId === projectId &&
                      img.labelName === label &&
                      img.imageName === image
                  )}
                  onMove={() => {
                    handleSelectImage({ projectId, labelName: label, imageName: image });
                    openMoveModal();
                  }}
                  onOpenLightbox={() => {
                    openLightbox(
                      labelImages[label].map(
                        (img) =>
                          `http://localhost:3001/uploads/${user?.username}/image-classing/${projectId}/training-data/${label}/${img}`
                      ),
                      labelImages[label].indexOf(image)
                    );
                  }}
                />
              ))
            ) : (
              <p>画像がありません。</p>
            )}
          </div>
          {/* 各ラベルごとのアップロードボタンを追加 */}
          <ImageUpload
            projectId={projectId}
            labelName={label}
            user={user}
            onUploadSuccess={() => {
              // 画像アップロード後の更新処理（例: 画像一覧を再取得）
              handleLabelAdded();
            }}
            dataType="training" // データタイプを指定
          />
        </div>
      ))}
      {isMoveModalOpen && (
        <MoveModal
          labels={labels}
          targetLabel={moveModalTargetLabel}
          setTargetLabel={setMoveModalTargetLabel}
          selectedImages={selectedImages}
          handleMoveImages={handleMoveImages}
          closeMoveModal={closeMoveModal}
          dataType="training" // 追加: データタイプを指定
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

export default Label;