/**
 * Public Profile Page
 * Pinterest-style grid layout with video thumbnails
 */

import { useState, useEffect, CSSProperties } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/services/firebase/config';
import { logout } from '@/services/firebase/auth';
import type { User } from '@/types/user';
import type { Video } from '@/types/video';
import BottomNav from '@/components/navigation/BottomNav';
import EditProfileModal from '@/components/profile/EditProfileModal';
import { Icons } from '@/theme';
import { formatDistance } from '@/utils/geohash';

const ProfilePage = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // Use current user if no userId provided
  const profileUserId = userId || currentUser?.id;

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch user profile
  const fetchProfile = async () => {
    if (!profileUserId) return;

    try {
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, profileUserId));
      if (userDoc.exists()) {
        setProfileUser(userDoc.data() as User);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [profileUserId]);

  // Fetch user's videos
  useEffect(() => {
    const fetchVideos = async () => {
      if (!profileUserId) return;

      setLoading(true);
      try {
        const videosRef = collection(db, COLLECTIONS.VIDEOS);
        const q = query(videosRef, where('userId', '==', profileUserId));
        const querySnapshot = await getDocs(q);

        const userVideos: Video[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Video));

        // Sort by newest first
        userVideos.sort((a, b) => b.createdAt - a.createdAt);

        console.log(`✅ Fetched ${userVideos.length} videos for user ${profileUserId}`);
        setVideos(userVideos);
      } catch (error) {
        console.error('Error fetching user videos:', error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [profileUserId]);

  // Styles
  const containerStyle: CSSProperties = {
    minHeight: '100vh',
    backgroundColor: 'var(--dark-bg)',
    paddingBottom: '60px', // Space for smaller bottom nav
  };

  const headerStyle: CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: 'var(--dark-bg)',
    borderBottom: '1px solid var(--dark-border)',
    padding: '16px 20px',
  };

  const backButtonStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
  };

  const profileHeaderStyle: CSSProperties = {
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    backgroundColor: 'var(--dark-surface)',
    borderBottom: '1px solid var(--dark-border)',
  };

  const avatarStyle: CSSProperties = {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    border: '3px solid var(--coral-400)',
    objectFit: 'cover',
    backgroundColor: 'var(--dark-card)',
  };

  const nameStyle: CSSProperties = {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    textAlign: 'center',
  };

  const usernameStyle: CSSProperties = {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
  };

  const bioStyle: CSSProperties = {
    fontSize: '14px',
    color: 'var(--text-primary)',
    textAlign: 'center',
    maxWidth: '400px',
    lineHeight: '1.5',
  };

  const statsStyle: CSSProperties = {
    display: 'flex',
    gap: '32px',
    marginTop: '8px',
  };

  const statItemStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  };

  const statValueStyle: CSSProperties = {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  };

  const statLabelStyle: CSSProperties = {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  };

  const gridContainerStyle: CSSProperties = {
    padding: '20px',
  };

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '12px',
  };

  const videoCardStyle: CSSProperties = {
    position: 'relative',
    aspectRatio: '9 / 16',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    cursor: 'pointer',
    backgroundColor: 'var(--dark-card)',
    transition: 'var(--transition-normal)',
  };

  const thumbnailStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const videoOverlayStyle: CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '12px',
    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const videoStatsStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: 'var(--text-primary)',
  };

  const videoCategoryStyle: CSSProperties = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    padding: '4px 8px',
    backgroundColor: 'var(--coral-400)',
    borderRadius: 'var(--radius-full)',
    fontSize: '10px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  };

  const emptyStateStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
  };

  const modalOverlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  };

  const modalContentStyle: CSSProperties = {
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    backgroundColor: 'var(--dark-card)',
    borderRadius: 'var(--radius-xl)',
    padding: '20px',
  };

  const closeButtonStyle: CSSProperties = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'rgba(0, 0, 0, 0.6)',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-primary)',
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to logout?')) return;

    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout');
    }
  };

  const totalLikes = videos.reduce((sum, video) => sum + (video.likes || 0), 0);
  const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0);

  if (!profileUser) {
    return (
      <div style={containerStyle}>
        <div style={emptyStateStyle}>
          <div>Loading profile...</div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <button style={backButtonStyle} onClick={() => navigate(-1)}>
          <Icons.ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
          <span>Back</span>
        </button>
      </div>

      {/* Profile Header */}
      <div style={profileHeaderStyle}>
        <img
          src={profileUser.avatarUrl || '/default-avatar.png'}
          alt={profileUser.name}
          style={avatarStyle}
        />
        <div>
          <div style={nameStyle}>{profileUser.name}</div>
          <div style={usernameStyle}>{profileUser.username}</div>
        </div>
        {profileUser.bio && <div style={bioStyle}>{profileUser.bio}</div>}

        {/* Stats */}
        <div style={statsStyle}>
          <div style={statItemStyle}>
            <div style={statValueStyle}>{videos.length}</div>
            <div style={statLabelStyle}>Videos</div>
          </div>
          <div style={statItemStyle}>
            <div style={statValueStyle}>{formatCount(totalLikes)}</div>
            <div style={statLabelStyle}>Likes</div>
          </div>
          <div style={statItemStyle}>
            <div style={statValueStyle}>{formatCount(totalViews)}</div>
            <div style={statLabelStyle}>Views</div>
          </div>
        </div>

        {/* Role Badge */}
        {profileUser.userRole === 'VENDOR' && (
          <div
            style={{
              padding: '6px 16px',
              backgroundColor: 'var(--coral-400)',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: '600',
            }}
          >
            Vendor
          </div>
        )}

        {/* Edit Profile & Logout Buttons - Only show for own profile */}
        {profileUserId === currentUser?.id && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                border: '1px solid var(--dark-border)',
                borderRadius: 'var(--radius-full)',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'var(--transition-normal)',
              }}
              onClick={() => setShowEditModal(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icons.User size={20} />
              <span>Edit Profile</span>
            </button>

            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#ef4444',
                border: '1px solid #ef4444',
                borderRadius: 'var(--radius-full)',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'var(--transition-normal)',
              }}
              onClick={handleLogout}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icons.ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
              <span>Logout</span>
            </button>
          </div>
        )}

        {/* Message Button - Only show if viewing someone else's profile */}
        {profileUserId !== currentUser?.id && (
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 32px',
              backgroundColor: 'var(--coral-400)',
              color: 'var(--text-primary)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'var(--transition-normal)',
              marginTop: '8px',
            }}
            onClick={() => navigate(`/chat/${profileUserId}`)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#d94946';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--coral-400)';
            }}
          >
            <Icons.Messages size={20} />
            <span>Message</span>
          </button>
        )}
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div style={emptyStateStyle}>
          <div>Loading videos...</div>
        </div>
      ) : videos.length === 0 ? (
        <div style={emptyStateStyle}>
          <Icons.Camera size={48} color="var(--text-secondary)" />
          <div style={{ marginTop: '16px', fontSize: '18px', fontWeight: '600' }}>
            No videos yet
          </div>
          <div style={{ marginTop: '8px' }}>
            {profileUserId === currentUser?.id
              ? 'Start posting videos to share with the community'
              : 'This user hasn\'t posted any videos yet'}
          </div>
        </div>
      ) : (
        <div style={gridContainerStyle}>
          <div style={gridStyle}>
            {videos.map((video) => (
              <div
                key={video.id}
                style={videoCardStyle}
                onClick={() => setSelectedVideo(video)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {/* Thumbnail */}
                <img
                  src={video.thumbnailUrl}
                  alt={video.description}
                  style={thumbnailStyle}
                  loading="lazy"
                />

                {/* Category Badge */}
                <div style={videoCategoryStyle}>{video.category}</div>

                {/* Overlay with stats */}
                <div style={videoOverlayStyle}>
                  <div style={videoStatsStyle}>
                    <Icons.Heart size={14} />
                    <span>{formatCount(video.likes)}</span>
                    <Icons.Messages size={14} style={{ marginLeft: '8px' }} />
                    <span>{formatCount(video.comments)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Detail Modal */}
      {selectedVideo && (
        <div style={modalOverlayStyle} onClick={() => setSelectedVideo(null)}>
          <button style={closeButtonStyle} onClick={() => setSelectedVideo(null)}>
            <Icons.Close size={24} />
          </button>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            {/* Video */}
            <video
              src={selectedVideo.url}
              poster={selectedVideo.thumbnailUrl}
              controls
              autoPlay
              style={{
                width: '100%',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '16px',
              }}
            />

            {/* Details */}
            <div style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '12px' }}>
              {selectedVideo.description}
            </div>

            {/* Location */}
            {selectedVideo.locationName && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  marginBottom: '12px',
                }}
              >
                <Icons.Location size={16} />
                <span>{selectedVideo.locationName}</span>
              </div>
            )}

            {/* Price */}
            {selectedVideo.price && (
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'var(--coral-400)',
                  marginBottom: '12px',
                }}
              >
                R {selectedVideo.price.toLocaleString()}
              </div>
            )}

            {/* Property Details */}
            {(selectedVideo.bedrooms || selectedVideo.bathrooms) && (
              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                {selectedVideo.bedrooms && (
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {selectedVideo.bedrooms} Bed
                  </div>
                )}
                {selectedVideo.bathrooms && (
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {selectedVideo.bathrooms} Bath
                  </div>
                )}
                {selectedVideo.propertyType && (
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {selectedVideo.propertyType}
                  </div>
                )}
              </div>
            )}

            {/* Stats */}
            <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <span>❤️ {formatCount(selectedVideo.likes)} likes</span>
              <span>💬 {formatCount(selectedVideo.comments)} comments</span>
              <span>👁️ {formatCount(selectedVideo.views)} views</span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && profileUser && currentUser && (
        <EditProfileModal
          userId={currentUser.id}
          currentName={profileUser.name}
          currentUsername={profileUser.username}
          currentBio={profileUser.bio || ''}
          currentAvatarUrl={profileUser.avatarUrl || ''}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            fetchProfile(); // Refresh profile data
          }}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default ProfilePage;
