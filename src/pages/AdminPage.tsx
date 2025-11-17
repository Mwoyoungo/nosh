/**
 * Admin Dashboard
 * User management and video approval
 */

import { useState, useEffect, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/services/firebase/config';
import type { User } from '@/types/user';
import type { Video } from '@/types/video';
import { Icons } from '@/theme';

const AdminPage = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'users' | 'videos'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (currentUser && !currentUser.isAdmin) {
      alert('Access denied. Admin only.');
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersSnapshot = await getDocs(
        query(collection(db, COLLECTIONS.USERS), orderBy('createdAt', 'desc'))
      );
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch videos
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const videosSnapshot = await getDocs(
        query(collection(db, COLLECTIONS.VIDEOS), orderBy('createdAt', 'desc'))
      );
      const videosData = videosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Video[];
      setVideos(videosData);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchVideos();
    }
  }, [activeTab]);

  // Approve video
  const approveVideo = async (videoId: string) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.VIDEOS, videoId), {
        approved: true,
        updatedAt: Date.now(),
      });
      alert('Video approved!');
      fetchVideos();
    } catch (error) {
      console.error('Error approving video:', error);
      alert('Failed to approve video');
    }
  };

  // Reject/unapprove video
  const rejectVideo = async (videoId: string) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.VIDEOS, videoId), {
        approved: false,
        updatedAt: Date.now(),
      });
      alert('Video rejected!');
      fetchVideos();
    } catch (error) {
      console.error('Error rejecting video:', error);
      alert('Failed to reject video');
    }
  };

  // Delete video
  const deleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      await deleteDoc(doc(db, COLLECTIONS.VIDEOS, videoId));
      alert('Video deleted!');
      fetchVideos();
      setSelectedVideo(null);
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
      alert('User deleted!');
      fetchUsers();
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  // Toggle admin status
  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'remove' : 'grant'} admin access?`)) return;

    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
        isAdmin: !currentStatus,
      });
      alert(`Admin status ${!currentStatus ? 'granted' : 'removed'}!`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating admin status:', error);
      alert('Failed to update admin status');
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phoneNumber.includes(searchQuery)
  );

  // Filter videos based on search
  const filteredVideos = videos.filter(
    (video) =>
      video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Styles
  const containerStyle: CSSProperties = {
    minHeight: '100vh',
    backgroundColor: 'var(--dark-bg)',
    padding: '20px',
  };

  const headerStyle: CSSProperties = {
    marginBottom: '24px',
  };

  const titleStyle: CSSProperties = {
    fontSize: '32px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '8px',
  };

  const subtitleStyle: CSSProperties = {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  };

  const tabsStyle: CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
  };

  const tabStyle = (isActive: boolean): CSSProperties => ({
    padding: '12px 24px',
    backgroundColor: isActive ? 'var(--coral-400)' : 'var(--dark-card)',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    color: 'var(--text-primary)',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'var(--transition-normal)',
  });

  const searchBoxStyle: CSSProperties = {
    width: '100%',
    maxWidth: '500px',
    padding: '12px 16px',
    backgroundColor: 'var(--dark-card)',
    border: '1px solid var(--dark-border)',
    borderRadius: 'var(--radius-lg)',
    color: 'var(--text-primary)',
    fontSize: '16px',
    marginBottom: '24px',
  };

  const statsStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  };

  const statCardStyle: CSSProperties = {
    backgroundColor: 'var(--dark-card)',
    padding: '20px',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--dark-border)',
  };

  const statValueStyle: CSSProperties = {
    fontSize: '32px',
    fontWeight: '700',
    color: 'var(--coral-400)',
    marginBottom: '8px',
  };

  const statLabelStyle: CSSProperties = {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  };

  const cardStyle: CSSProperties = {
    backgroundColor: 'var(--dark-card)',
    padding: '20px',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--dark-border)',
    marginBottom: '16px',
  };

  const buttonStyle = (variant: 'primary' | 'danger' | 'secondary'): CSSProperties => ({
    padding: '8px 16px',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'var(--transition-normal)',
    backgroundColor:
      variant === 'primary'
        ? 'var(--coral-400)'
        : variant === 'danger'
        ? '#ef4444'
        : 'var(--dark-bg)',
    color: 'var(--text-primary)',
  });

  const totalVideos = videos.length;
  const approvedVideos = videos.filter((v) => v.approved).length;
  const pendingVideos = videos.filter((v) => !v.approved).length;
  const totalUsers = users.length;
  const vendors = users.filter((u) => u.userRole === 'VENDOR').length;
  const admins = users.filter((u) => u.isAdmin).length;

  if (!currentUser?.isAdmin) {
    return null;
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Admin Dashboard</h1>
        <p style={subtitleStyle}>Manage users and video approvals</p>
      </div>

      {/* Tabs */}
      <div style={tabsStyle}>
        <button style={tabStyle(activeTab === 'users')} onClick={() => setActiveTab('users')}>
          Users ({totalUsers})
        </button>
        <button style={tabStyle(activeTab === 'videos')} onClick={() => setActiveTab('videos')}>
          Videos ({totalVideos})
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder={`Search ${activeTab}...`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={searchBoxStyle}
      />

      {/* Stats */}
      {activeTab === 'users' ? (
        <div style={statsStyle}>
          <div style={statCardStyle}>
            <div style={statValueStyle}>{totalUsers}</div>
            <div style={statLabelStyle}>Total Users</div>
          </div>
          <div style={statCardStyle}>
            <div style={statValueStyle}>{vendors}</div>
            <div style={statLabelStyle}>Vendors</div>
          </div>
          <div style={statCardStyle}>
            <div style={statValueStyle}>{admins}</div>
            <div style={statLabelStyle}>Admins</div>
          </div>
        </div>
      ) : (
        <div style={statsStyle}>
          <div style={statCardStyle}>
            <div style={statValueStyle}>{totalVideos}</div>
            <div style={statLabelStyle}>Total Videos</div>
          </div>
          <div style={statCardStyle}>
            <div style={statValueStyle}>{approvedVideos}</div>
            <div style={statLabelStyle}>Approved</div>
          </div>
          <div style={statCardStyle}>
            <div style={statValueStyle}>{pendingVideos}</div>
            <div style={statLabelStyle}>Pending</div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading...
        </div>
      ) : activeTab === 'users' ? (
        /* Users List */
        <div>
          {filteredUsers.map((user) => (
            <div key={user.id} style={cardStyle}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
                {/* Avatar */}
                <img
                  src={user.avatarUrl || '/default-avatar.png'}
                  alt={user.name}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--dark-border)',
                  }}
                />

                {/* User Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {user.name}
                    </span>
                    {user.isAdmin && (
                      <span
                        style={{
                          padding: '2px 8px',
                          backgroundColor: 'var(--coral-400)',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}
                      >
                        ADMIN
                      </span>
                    )}
                    {user.userRole === 'VENDOR' && (
                      <span
                        style={{
                          padding: '2px 8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}
                      >
                        VENDOR
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {user.username}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    📧 {user.email}
                  </div>
                  {user.phoneNumber && (
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      📱 {user.phoneNumber}
                    </div>
                  )}
                  {user.bio && (
                    <div
                      style={{
                        fontSize: '14px',
                        color: 'var(--text-primary)',
                        marginTop: '8px',
                        padding: '8px',
                        backgroundColor: 'var(--dark-bg)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      {user.bio}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      style={buttonStyle('secondary')}
                      onClick={() => toggleAdmin(user.id, user.isAdmin)}
                    >
                      {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                    <button style={buttonStyle('primary')} onClick={() => navigate(`/profile/${user.id}`)}>
                      View Profile
                    </button>
                    {user.id !== currentUser?.id && (
                      <button style={buttonStyle('danger')} onClick={() => deleteUser(user.id)}>
                        Delete User
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              No users found
            </div>
          )}
        </div>
      ) : (
        /* Videos List */
        <div>
          {filteredVideos.map((video) => (
            <div key={video.id} style={cardStyle}>
              <div style={{ display: 'flex', gap: '16px' }}>
                {/* Thumbnail */}
                <div
                  style={{
                    width: '120px',
                    height: '160px',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    backgroundColor: 'var(--dark-bg)',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedVideo(video)}
                >
                  <img
                    src={video.thumbnailUrl}
                    alt="Video thumbnail"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Video Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span
                          style={{
                            padding: '4px 12px',
                            backgroundColor: 'var(--coral-400)',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}
                        >
                          {video.category}
                        </span>
                        {video.approved ? (
                          <span
                            style={{
                              padding: '4px 12px',
                              backgroundColor: '#22c55e',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '12px',
                              fontWeight: '600',
                            }}
                          >
                            ✓ APPROVED
                          </span>
                        ) : (
                          <span
                            style={{
                              padding: '4px 12px',
                              backgroundColor: '#eab308',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#000',
                            }}
                          >
                            ⏳ PENDING
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {video.description}
                      </div>

                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        👤 {video.userName}
                      </div>

                      {video.locationName && (
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          📍 {video.locationName}
                        </div>
                      )}

                      {video.price && (
                        <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--coral-400)', marginTop: '8px' }}>
                          R {video.price.toLocaleString()}
                        </div>
                      )}

                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                        ❤️ {video.likes} • 💬 {video.comments} • 👁️ {video.views}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    {video.approved ? (
                      <button style={buttonStyle('secondary')} onClick={() => rejectVideo(video.id)}>
                        Unapprove
                      </button>
                    ) : (
                      <button style={buttonStyle('primary')} onClick={() => approveVideo(video.id)}>
                        Approve
                      </button>
                    )}
                    <button style={buttonStyle('primary')} onClick={() => setSelectedVideo(video)}>
                      View Details
                    </button>
                    <button style={buttonStyle('danger')} onClick={() => deleteVideo(video.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredVideos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              No videos found
            </div>
          )}
        </div>
      )}

      {/* Video Detail Modal */}
      {selectedVideo && (
        <div
          style={{
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
          }}
          onClick={() => setSelectedVideo(null)}
        >
          <div
            style={{
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: 'var(--dark-card)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={{
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
              }}
              onClick={() => setSelectedVideo(null)}
            >
              <Icons.Close size={24} />
            </button>

            <video
              src={selectedVideo.url}
              poster={selectedVideo.thumbnailUrl}
              controls
              style={{ width: '100%', borderRadius: 'var(--radius-lg)', marginBottom: '16px' }}
            />

            <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
              {selectedVideo.description}
            </h3>

            {selectedVideo.imageUrls && selectedVideo.imageUrls.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '16px' }}>
                {selectedVideo.imageUrls.map((imgUrl, index) => (
                  <img
                    key={index}
                    src={imgUrl}
                    alt={`Property ${index + 1}`}
                    style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
