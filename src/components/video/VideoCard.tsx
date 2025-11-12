/**
 * Video Card Component
 * Full-screen video with overlay info (user, description, actions)
 */

import { CSSProperties } from 'react';
import type { Video } from '@/types/video';
import VideoPlayer from './VideoPlayer';
import { Icons } from '@/theme';
import { formatDistance } from '@/utils/geohash';

interface VideoCardProps {
  video: Video;
  distanceMeters?: number;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onViewGallery?: () => void;
  onMessage?: () => void;
  onUserClick?: () => void;
}

const VideoCard = ({
  video,
  distanceMeters = 0,
  onLike,
  onComment,
  onShare,
  onViewGallery,
  onMessage,
  onUserClick,
}: VideoCardProps) => {
  const hasGallery = video.imageUrls && video.imageUrls.length > 0;
  const showPrice = video.price !== undefined && video.price > 0;
  const showPropertyDetails = video.propertyType && (video.bedrooms || video.bathrooms);

  // Container
  const containerStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100vh',
    backgroundColor: 'var(--dark-bg)',
    overflow: 'hidden',
  };

  // Bottom gradient overlay - More subtle, adjusted for smaller nav
  const overlayStyle: CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)',
    padding: '80px 20px 70px 20px',
    pointerEvents: 'none',
  };

  // User info section - Smaller
  const userSectionStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
    pointerEvents: 'auto',
    cursor: 'pointer',
  };

  const avatarStyle: CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '2px solid var(--coral-400)',
    objectFit: 'cover',
    backgroundColor: 'var(--dark-surface)',
  };

  const userInfoStyle: CSSProperties = {
    flex: 1,
  };

  const userNameStyle: CSSProperties = {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  };

  const locationStyle: CSSProperties = {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  // Description - Smaller
  const descriptionStyle: CSSProperties = {
    fontSize: '13px',
    color: 'var(--text-primary)',
    marginBottom: '8px',
    lineHeight: '1.4',
    pointerEvents: 'auto',
    maxWidth: '70%', // Don't overlap with side buttons
  };

  // Category badge - Smaller
  const badgeStyle: CSSProperties = {
    display: 'inline-block',
    backgroundColor: 'var(--coral-400)',
    color: 'var(--text-primary)',
    padding: '2px 10px',
    borderRadius: 'var(--radius-full)',
    fontSize: '11px',
    fontWeight: '600',
    marginBottom: '8px',
  };

  // Price and property details - Compact
  const detailsRowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
    flexWrap: 'wrap',
  };

  const priceStyle: CSSProperties = {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--coral-400)',
  };

  const propertyDetailStyle: CSSProperties = {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  // Action button (single message button) - Smaller
  const messageButtonStyle: CSSProperties = {
    padding: '6px 16px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--coral-400)',
    backgroundColor: 'var(--coral-400)',
    color: 'var(--text-primary)',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'var(--transition-normal)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    pointerEvents: 'auto',
  };

  // Side action buttons (right side) - TikTok style
  const sideActionsStyle: CSSProperties = {
    position: 'absolute',
    right: '12px',
    bottom: '120px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'center',
  };

  const sideActionStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    transition: 'var(--transition-normal)',
  };

  const sideActionIconStyle: CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  };

  const sideActionCountStyle: CSSProperties = {
    fontSize: '11px',
    color: 'var(--text-primary)',
    fontWeight: '600',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div style={containerStyle}>
      {/* Video Player */}
      <VideoPlayer
        src={video.url}
        poster={video.thumbnailUrl}
        autoPlay={true}
        muted={false}
        loop={true}
      />

      {/* Bottom Overlay - Simplified */}
      <div style={overlayStyle}>
        {/* User Info */}
        <div style={userSectionStyle} onClick={onUserClick}>
          <img
            src={video.userAvatarUrl || '/default-avatar.png'}
            alt={video.userName}
            style={avatarStyle}
          />
          <div style={userInfoStyle}>
            <div style={userNameStyle}>@{video.userName}</div>
            <div style={locationStyle}>
              <Icons.Location size={12} />
              <span>
                {video.locationName}
                {distanceMeters > 0 && ` • ${formatDistance(distanceMeters)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={descriptionStyle}>{video.description}</div>

        {/* Price & Property Details - Inline */}
        {(showPrice || showPropertyDetails) && (
          <div style={detailsRowStyle}>
            {showPrice && (
              <div style={priceStyle}>R {video.price?.toLocaleString()}</div>
            )}
            {video.bedrooms && video.bedrooms > 0 && (
              <div style={propertyDetailStyle}>
                <span>{video.bedrooms} Bed</span>
              </div>
            )}
            {video.bathrooms && video.bathrooms > 0 && (
              <div style={propertyDetailStyle}>
                <span>{video.bathrooms} Bath</span>
              </div>
            )}
          </div>
        )}

        {/* Category Badge + Message Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'auto' }}>
          <div style={badgeStyle}>{video.category}</div>
          <button style={messageButtonStyle} onClick={onMessage}>
            <Icons.Messages size={14} />
            <span>Message</span>
          </button>
        </div>
      </div>

      {/* Side Actions - Only Gallery */}
      {hasGallery && (
        <div style={sideActionsStyle}>
          <div style={sideActionStyle} onClick={onViewGallery}>
            <div style={sideActionIconStyle}>
              <Icons.Grid size={22} color="var(--text-primary)" />
            </div>
            <div style={sideActionCountStyle}>{video.imageUrls.length}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCard;
