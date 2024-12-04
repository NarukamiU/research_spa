// client/src/components/ImageCard/ImageCard.tsx

import React from 'react';
import LazyLoad from 'react-lazyload';
import './ImageCard.css';

interface ImageCardProps {
  projectId: string;
  dataType: 'training-data' | 'verify-data';
  labelName: string;
  imageName: string;
  username: string;
  altText: string;
  onDelete: () => void;
  onMove: () => void;
  onSelect: () => void;
  isSelected: boolean;
  onOpenLightbox: () => void;
  verificationData?: { [label: string]: number };
  dataUrl: string;
  isLargestContentfulPaintImage?: boolean;
}

const ImageCard: React.FC<ImageCardProps> = React.memo(({
  dataUrl,
  projectId,
  dataType,
  labelName,
  imageName,
  username,
  altText,
  onDelete,
  onMove,
  onSelect,
  isSelected,
  onOpenLightbox,
  verificationData, 
  isLargestContentfulPaintImage = false,
}) => {
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    onOpenLightbox();
  };

  return (
    <div className={`image-card ${isSelected ? 'selected' : ''}`} onClick={onSelect}>
      {/* 移動ボタンを左上に配置 */}
      {isSelected && (
        <button
          className="move-image-button"
          onClick={(e) => { e.stopPropagation(); onMove(); }}
        >
          移動
        </button>
      )}
     
     <LazyLoad
        height={200}
        offset={100}
        once
        placeholder={<div className="image-placeholder">読み込み中...</div>}
        disable={isLargestContentfulPaintImage} // LCP画像の場合は遅延読み込みを無効化
      > <img
          src={dataUrl}
          alt={altText}
          className="image"
          onContextMenu={handleContextMenu}
        />
      </LazyLoad>
      <div className="image-name">{altText}</div>
      <div className="image-actions">
        <button
          className="delete-image-button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        >
          削除
        </button>
      </div>
      {verificationData && (
        <div className="verification-results">
          <h4>検証結果:</h4>
          <ul>
            {Object.entries(verificationData).map(([label, confidence]) => (
              <li key={label}>
                 {label}: {(confidence * 100).toFixed(2)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

export default ImageCard;