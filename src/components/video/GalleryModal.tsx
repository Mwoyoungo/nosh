/**
 * Gallery Modal Component
 * Displays property images in a modal viewer
 */

import { CSSProperties, useState } from 'react';
import { Icons } from '@/theme';

interface GalleryModalProps {
  images: string[];
  onClose: () => void;
}

const GalleryModal = ({ images, onClose }: GalleryModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    zIndex: 2000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const headerStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
  };

  const closeButtonStyle: CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-primary)',
  };

  const counterStyle: CSSProperties = {
    color: 'var(--text-primary)',
    fontSize: '16px',
    fontWeight: '600',
  };

  const imageContainerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
  };

  const imageStyle: CSSProperties = {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  };

  const navButtonStyle: CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    backdropFilter: 'blur(10px)',
  };

  const thumbnailsStyle: CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '20px',
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
  };

  const thumbnailStyle = (isActive: boolean): CSSProperties => ({
    width: '60px',
    height: '60px',
    borderRadius: 'var(--radius-md)',
    objectFit: 'cover',
    cursor: 'pointer',
    border: isActive ? '2px solid var(--coral-400)' : '2px solid transparent',
    opacity: isActive ? 1 : 0.6,
    transition: 'var(--transition-normal)',
  });

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={counterStyle}>
          {currentIndex + 1} / {images.length}
        </div>
        <button style={closeButtonStyle} onClick={onClose}>
          <Icons.Close size={24} />
        </button>
      </div>

      {/* Main Image */}
      <div style={imageContainerStyle} onClick={(e) => e.stopPropagation()}>
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          style={imageStyle}
        />
      </div>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            style={{ ...navButtonStyle, left: '20px' }}
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
          >
            <Icons.ArrowRight size={24} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <button
            style={{ ...navButtonStyle, right: '20px' }}
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
          >
            <Icons.ArrowRight size={24} />
          </button>
        </>
      )}

      {/* Thumbnails */}
      {images.length > 1 && (
        <div style={thumbnailsStyle} onClick={(e) => e.stopPropagation()}>
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Thumbnail ${index + 1}`}
              style={thumbnailStyle(index === currentIndex)}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryModal;
