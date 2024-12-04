// client/src/components/Lightbox/Lightbox.tsx
import React, { useEffect } from 'react';
import './Lightbox.css';

interface LightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ images, currentIndex, onClose, onPrev, onNext }) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    } else if (event.key === 'ArrowRight') {
      onNext();
    } else if (event.key === 'ArrowLeft') {
      onPrev();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    // Prevent background scrolling when lightbox is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, []); // handleKeyDownを依存配列から外す

  if (!images || images.length === 0) return null;

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose}>
          &times;
        </button>
        <button className="lightbox-prev" onClick={onPrev}>
          &#8592;
        </button>
        <img src={images[currentIndex]} alt={`Image ${currentIndex + 1}`} className="lightbox-image" />
        <button className="lightbox-next" onClick={onNext}>
          &#8594;
        </button>
      </div>
    </div>
  );
};

export default Lightbox;