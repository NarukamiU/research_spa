// client/src/hooks/useProjectPage.ts

import { useState } from 'react';

interface UseProjectPageProps {
  labels: string[];
}

const useProjectPageUI = (labels: string[]) => {
  const [selectedMenu, setSelectedMenu] = useState<'Label' | 'Check'>('Label');
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [currentLightboxIndex, setCurrentLightboxIndex] = useState<number>(0);
  const [targetLabel, setTargetLabel] = useState<string>('');

  const openMoveModal = () => {
    if (labels.length < 2) {
      alert('移動先のラベルが十分にありません。');
      return;
    }
    setIsMoveModalOpen(true);
  };

  const closeMoveModal = () => {
    setIsMoveModalOpen(false);
    setTargetLabel('');
  };

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setCurrentLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setLightboxImages([]);
    setCurrentLightboxIndex(0);
  };

  const handleMoveImages = () => {
    // 画像移動後の処理を実装
    closeMoveModal();
  };

  return {
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
  };
};

export default useProjectPageUI;