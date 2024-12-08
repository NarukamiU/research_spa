// client/src/components/MoveModal/MoveModal.tsx

import React, { useState } from 'react';
import axios from 'axios';
import './MoveModal.css';

interface MoveModalProps {
  labels: string[];
  targetLabel: string;
  setTargetLabel: (label: string) => void;
  selectedImages: SelectedImage[];
  handleMoveImages: () => void;
  closeMoveModal: () => void;
  dataType: 'training' | 'verify'; // 追加: データタイプを識別
}

interface SelectedImage {
  projectId: string;
  labelName: string;
  imageName: string;
}

const MoveModal: React.FC<MoveModalProps> = ({
  labels = [],
  targetLabel,
  setTargetLabel,
  selectedImages,
  handleMoveImages,
  closeMoveModal,
  dataType,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmMove = async () => {
    if (!targetLabel) {
      alert('移動先のラベルを選択してください。');
      return;
    }

    setIsLoading(true);
    setError(null);

    const basePath = `http://localhost:3001/api/image-classing/projects/${selectedImages[0].projectId}/${dataType}-data/labels/${selectedImages[0].labelName}/move-images`;

    try {
      const response = await axios.post(
        basePath,
        {
          targetLabel: targetLabel,
          images: selectedImages.map((img) => img.imageName),
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        handleMoveImages();
        closeMoveModal();
      } else {
        setError(response.data.message || '画像の移動に失敗しました。');
      }
    } catch (err: any) {
      console.error('画像移動エラー:', err);
      setError(err.response?.data?.message || '画像移動中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="move-modal-overlay">
      <div className="move-modal">
        <h2>画像を移動</h2>
        <select
          value={targetLabel}
          onChange={(e) => setTargetLabel(e.target.value)}
        >
          <option value="">移動先のラベルを選択</option>
          {labels && labels.length > 0 ? (
            labels.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))
          ) : (
            <option value="" disabled>
              ラベルがありません
            </option>
          )}
        </select>
        {error && <p className="error-message">{error}</p>}
        <div className="move-modal-actions">
          <button
            onClick={confirmMove}
            className="confirm-button"
            disabled={!targetLabel || isLoading}
          >
            {isLoading ? '移動中...' : '確認'}
          </button>
          <button onClick={closeMoveModal} className="cancel-button" disabled={isLoading}>
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveModal;