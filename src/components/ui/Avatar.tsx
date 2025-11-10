import { useState, CSSProperties } from 'react';
import { Icons } from '@/theme/icons';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  fallback?: string;
  onClick?: () => void;
}

const sizeMap: Record<AvatarSize, { size: number; fontSize: string; iconSize: number }> = {
  xs: { size: 24, fontSize: '12px', iconSize: 14 },
  sm: { size: 32, fontSize: '14px', iconSize: 18 },
  md: { size: 40, fontSize: '16px', iconSize: 22 },
  lg: { size: 48, fontSize: '18px', iconSize: 26 },
  xl: { size: 64, fontSize: '20px', iconSize: 36 },
  '2xl': { size: 96, fontSize: '24px', iconSize: 52 },
};

const Avatar = ({
  src,
  alt = 'Avatar',
  size = 'md',
  fallback,
  onClick,
}: AvatarProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const showFallback = !src || imageError || !imageLoaded;
  const config = sizeMap[size];

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: config.size,
    height: config.size,
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: 'var(--dark-card)',
    border: '1px solid var(--dark-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all var(--transition-base)',
  };

  return (
    <div style={containerStyle} onClick={onClick}>
      {src && !imageError && (
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity var(--transition-base)',
          }}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}

      {showFallback && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, var(--coral-400) 0%, var(--coral-600) 100%)',
          color: 'white',
          fontWeight: 600,
          fontSize: config.fontSize,
        }}>
          {fallback ? (
            <span>{fallback.charAt(0).toUpperCase()}</span>
          ) : (
            <Icons.Profile size={config.iconSize} />
          )}
        </div>
      )}
    </div>
  );
};

export default Avatar;
