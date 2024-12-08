// client/src/components/Lightbox/Lightbox.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import './Lightbox.css';

interface LightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ images, currentIndex, onClose, onPrev, onNext }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // handleKeyDown を useCallback でメモ化
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    } else if (event.key === 'ArrowRight') {
      if (currentIndex < images.length - 1) {
        onNext();
      }
    } else if (event.key === 'ArrowLeft') {
      if (currentIndex > 0) {
        onPrev();
      }
    }
  }, [onClose, onNext, onPrev, currentIndex, images.length]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    // Prevent background scrolling when lightbox is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [handleKeyDown]);

  // images は必須プロパティとして定義されているため、length を直接使用
  if (images.length === 0) return null;

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div
        className="lightbox-content"
        onClick={(e) => e.stopPropagation()}
        ref={contentRef}
      >
        <button className="lightbox-close" onClick={onClose}>
          &times;
        </button>
        {currentIndex > 0 && (
          <button className="lightbox-prev" onClick={onPrev}>
            &#8592;
          </button>
        )}
        <img
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          className="lightbox-image"
        />
        {currentIndex < images.length - 1 && (
          <button className="lightbox-next" onClick={onNext}>
            &#8594;
          </button>
        )}
      </div>
    </div>
  );
};

export default Lightbox;