/**
 * Video Player Component
 * HTML5 video player with controls
 */

import { useRef, useEffect, CSSProperties } from 'react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  onEnded?: () => void;
  className?: string;
  style?: CSSProperties;
}

const VideoPlayer = ({
  src,
  poster,
  autoPlay = true,
  muted = true,
  loop = true,
  onEnded,
  className = '',
  style = {},
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Attempt to play when ready
    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.log('Auto-play prevented:', error);
      }
    };

    if (autoPlay) {
      playVideo();
    }

    return () => {
      video.pause();
    };
  }, [src, autoPlay]);

  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: 'var(--dark-bg)',
    ...style,
  };

  const videoStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  return (
    <div style={containerStyle} className={className}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={muted}
        loop={loop}
        playsInline
        controls
        style={videoStyle}
        onEnded={onEnded}
      />
    </div>
  );
};

export default VideoPlayer;
