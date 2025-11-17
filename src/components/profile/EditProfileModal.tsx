/**
 * Edit Profile Modal
 * Allows users to edit their profile information
 */

import { useState, useRef, CSSProperties } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, COLLECTIONS } from '@/services/firebase/config';
import { updateCometChatUserProfile } from '@/services/cometchat/config';
import { Icons } from '@/theme';

interface EditProfileModalProps {
  userId: string;
  currentName: string;
  currentUsername: string;
  currentBio: string;
  currentAvatarUrl: string;
  onClose: () => void;
  onSuccess: () => void;
}

const EditProfileModal = ({
  userId,
  currentName,
  currentUsername,
  currentBio,
  currentAvatarUrl,
  onClose,
  onSuccess,
}: EditProfileModalProps) => {
  const [name, setName] = useState(currentName);
  const [username, setUsername] = useState(currentUsername);
  const [bio, setBio] = useState(currentBio);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(currentAvatarUrl);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }

      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      alert('Name is required');
      return;
    }

    if (!username.trim()) {
      alert('Username is required');
      return;
    }

    // Username validation (alphanumeric and underscores only)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      alert('Username can only contain letters, numbers, and underscores');
      return;
    }

    setSaving(true);
    setUploadProgress(0);

    try {
      let newAvatarUrl = currentAvatarUrl;

      // Upload new avatar if selected
      if (avatarFile) {
        setUploadProgress(10);
        const avatarRef = ref(storage, `avatars/${userId}_${Date.now()}.jpg`);

        // Compress image before upload (using canvas)
        const compressedFile = await compressImage(avatarFile);
        setUploadProgress(30);

        await uploadBytes(avatarRef, compressedFile);
        setUploadProgress(60);

        newAvatarUrl = await getDownloadURL(avatarRef);
        setUploadProgress(80);
      }

      // Update Firestore
      await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        bio: bio.trim(),
        avatarUrl: newAvatarUrl,
        updatedAt: Date.now(),
      });

      // Update CometChat profile
      await updateCometChatUserProfile(userId, name.trim(), newAvatarUrl);

      setUploadProgress(100);
      onSuccess();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  // Compress image using canvas
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Max dimensions
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Canvas to Blob failed'));
              }
            },
            'image/jpeg',
            0.85
          );
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Styles
  const overlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  };

  const modalStyle: CSSProperties = {
    backgroundColor: 'var(--dark-card)',
    borderRadius: 'var(--radius-xl)',
    padding: '24px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  };

  const titleStyle: CSSProperties = {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  };

  const avatarContainerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '24px',
  };

  const avatarStyle: CSSProperties = {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid var(--coral-400)',
    marginBottom: '12px',
  };

  const changeAvatarButtonStyle: CSSProperties = {
    padding: '8px 16px',
    backgroundColor: 'var(--coral-400)',
    color: 'var(--text-primary)',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'var(--transition-normal)',
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'var(--dark-bg)',
    border: '1px solid var(--dark-border)',
    borderRadius: 'var(--radius-lg)',
    color: 'var(--text-primary)',
    fontSize: '16px',
    marginBottom: '16px',
    outline: 'none',
  };

  const textareaStyle: CSSProperties = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical',
    fontFamily: 'inherit',
  };

  const labelStyle: CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '8px',
  };

  const buttonsContainerStyle: CSSProperties = {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  };

  const cancelButtonStyle: CSSProperties = {
    flex: 1,
    padding: '12px',
    backgroundColor: 'transparent',
    border: '1px solid var(--dark-border)',
    borderRadius: 'var(--radius-lg)',
    color: 'var(--text-primary)',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'var(--transition-normal)',
  };

  const saveButtonStyle: CSSProperties = {
    flex: 1,
    padding: '12px',
    backgroundColor: 'var(--coral-400)',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    color: 'var(--text-primary)',
    fontSize: '16px',
    fontWeight: '600',
    cursor: saving ? 'not-allowed' : 'pointer',
    opacity: saving ? 0.6 : 1,
    transition: 'var(--transition-normal)',
  };

  const progressBarStyle: CSSProperties = {
    width: '100%',
    height: '4px',
    backgroundColor: 'var(--dark-border)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: '16px',
  };

  const progressFillStyle: CSSProperties = {
    height: '100%',
    backgroundColor: 'var(--coral-400)',
    transition: 'width 0.3s ease',
    width: `${uploadProgress}%`,
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={titleStyle}>Edit Profile</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <Icons.Close size={24} />
          </button>
        </div>

        {/* Avatar */}
        <div style={avatarContainerStyle}>
          <img src={avatarPreview} alt="Avatar" style={avatarStyle} />
          <button
            style={changeAvatarButtonStyle}
            onClick={() => fileInputRef.current?.click()}
            disabled={saving}
          >
            Change Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
        </div>

        {/* Name */}
        <div>
          <label style={labelStyle}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={inputStyle}
            disabled={saving}
            maxLength={50}
          />
        </div>

        {/* Username */}
        <div>
          <label style={labelStyle}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder="username"
            style={inputStyle}
            disabled={saving}
            maxLength={30}
          />
        </div>

        {/* Bio */}
        <div>
          <label style={labelStyle}>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            style={textareaStyle}
            disabled={saving}
            maxLength={150}
          />
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'right' }}>
            {bio.length}/150
          </div>
        </div>

        {/* Progress Bar */}
        {saving && uploadProgress > 0 && (
          <div style={progressBarStyle}>
            <div style={progressFillStyle} />
          </div>
        )}

        {/* Buttons */}
        <div style={buttonsContainerStyle}>
          <button style={cancelButtonStyle} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button style={saveButtonStyle} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
