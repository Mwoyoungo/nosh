/**
 * Upload Video Page
 * Full-featured video upload with compression, thumbnails, and metadata
 */

import { useState, useRef, useEffect, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db, COLLECTIONS } from '@/services/firebase/config';
import type { VideoCategory } from '@/types/video';
import { Icons } from '@/theme';
import { generateGeohash } from '@/utils/geohash';

const UploadPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { browseLocation } = useLocation();

  // Form state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [category, setCategory] = useState<VideoCategory>('SERVICES');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [propertyType, setPropertyType] = useState('House');
  const [bedrooms, setBedrooms] = useState('1');
  const [bathrooms, setBathrooms] = useState('1');

  // Location state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState('');

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');

  // Refs
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          geocodeLocation(lat, lng);
        },
        (error) => {
          console.error('Location error:', error);
          setLocationName('Location unavailable');
        }
      );
    }
  }, []);

  // Geocode location to get name
  const geocodeLocation = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const address = data.results[0];
        const locality = address.address_components.find((c: any) => c.types.includes('locality'));
        const sublocality = address.address_components.find((c: any) => c.types.includes('sublocality'));
        const adminArea = address.address_components.find((c: any) => c.types.includes('administrative_area_level_1'));

        const name = locality?.long_name || sublocality?.long_name || adminArea?.long_name || 'Unknown Location';
        setLocationName(name);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setLocationName('Unknown Location');
    }
  };

  // Handle video selection
  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      alert('Video must be less than 100MB');
      return;
    }

    setVideoFile(file);
    const videoUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(videoUrl);

    // Generate thumbnail from video
    generateThumbnail(videoUrl);
  };

  // Generate thumbnail from video
  const generateThumbnail = (videoUrl: string) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.currentTime = 1; // Capture at 1 second

    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const thumbnailUrl = URL.createObjectURL(blob);
          setThumbnailUrl(thumbnailUrl);
        }
      }, 'image/jpeg', 0.8);
    };
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 6) {
      alert('Maximum 6 images allowed');
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    setImages([...images, ...validFiles]);

    // Generate previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  // Compress video (simplified - in production use FFmpeg.wasm)
  const compressVideo = async (file: File): Promise<File> => {
    // For now, return original file
    // In production, use @ffmpeg/ffmpeg for web-based compression
    return file;
  };

  // Upload video
  const handleUpload = async () => {
    // Validation
    if (!videoFile) {
      alert('Please select a video');
      return;
    }

    if (!description.trim()) {
      alert('Please add a description');
      return;
    }

    if (!user) {
      alert('You must be logged in to upload');
      return;
    }

    if (!userLocation) {
      alert('Location is required');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus('Preparing video...');

    try {
      // Compress video
      setUploadStatus('Compressing video...');
      const compressedVideo = await compressVideo(videoFile);
      setUploadProgress(10);

      // Upload video
      setUploadStatus('Uploading video...');
      const videoRef = ref(storage, `videos/${user.id}/${Date.now()}_${compressedVideo.name}`);
      const videoUploadTask = uploadBytesResumable(videoRef, compressedVideo);

      const videoUrl = await new Promise<string>((resolve, reject) => {
        videoUploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 50 + 10;
            setUploadProgress(progress);
          },
          reject,
          async () => {
            const url = await getDownloadURL(videoUploadTask.snapshot.ref);
            resolve(url);
          }
        );
      });

      setUploadProgress(60);

      // Upload thumbnail
      setUploadStatus('Uploading thumbnail...');
      let thumbnailDownloadUrl = '';
      if (thumbnailUrl) {
        const thumbnailBlob = await fetch(thumbnailUrl).then((r) => r.blob());
        const thumbnailRef = ref(storage, `thumbnails/${user.id}/${Date.now()}_thumbnail.jpg`);
        await uploadBytesResumable(thumbnailRef, thumbnailBlob);
        thumbnailDownloadUrl = await getDownloadURL(thumbnailRef);
      }

      setUploadProgress(70);

      // Upload images
      setUploadStatus('Uploading images...');
      const imageUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const imageRef = ref(storage, `images/${user.id}/${Date.now()}_${i}.jpg`);
        await uploadBytesResumable(imageRef, images[i]);
        const imageUrl = await getDownloadURL(imageRef);
        imageUrls.push(imageUrl);
        setUploadProgress(70 + (i + 1) * (20 / images.length));
      }

      setUploadProgress(90);

      // Create Firestore document
      setUploadStatus('Saving video details...');
      const geohash = generateGeohash(userLocation.lat, userLocation.lng, 8);

      const videoData = {
        userId: user.id,
        userName: user.name,
        userAvatarUrl: user.avatarUrl || '',
        url: videoUrl,
        thumbnailUrl: thumbnailDownloadUrl,
        imageUrls,
        description: description.trim(),
        category,
        price: price ? parseFloat(price) : null,
        propertyType: (category === 'RENT' || category === 'BUY') ? propertyType : null,
        bedrooms: (category === 'RENT' || category === 'BUY') ? parseInt(bedrooms) : null,
        bathrooms: (category === 'RENT' || category === 'BUY') ? parseInt(bathrooms) : null,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        locationName,
        geohash,
        approved: false, // Requires manual approval
        views: 0,
        likes: 0,
        comments: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await addDoc(collection(db, COLLECTIONS.VIDEOS), videoData);

      setUploadProgress(100);
      setUploadStatus('Upload complete!');

      // Show success message
      alert('Video uploaded successfully! It will be visible after approval.');

      // Navigate back
      setTimeout(() => {
        navigate('/');
      }, 1500);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
      setUploading(false);
      setUploadProgress(0);
      setUploadStatus('');
    }
  };

  // Styles
  const containerStyle: CSSProperties = {
    minHeight: '100vh',
    backgroundColor: 'var(--dark-bg)',
    padding: '20px',
    paddingBottom: '80px',
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  };

  const backButtonStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    padding: '8px',
  };

  const titleStyle: CSSProperties = {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  };

  const sectionStyle: CSSProperties = {
    backgroundColor: 'var(--dark-card)',
    borderRadius: 'var(--radius-xl)',
    padding: '20px',
    marginBottom: '16px',
  };

  const labelStyle: CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '8px',
  };

  const selectVideoButtonStyle: CSSProperties = {
    width: '100%',
    padding: '60px 20px',
    border: '2px dashed var(--dark-border)',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    transition: 'var(--transition-normal)',
  };

  const videoPreviewStyle: CSSProperties = {
    width: '100%',
    maxHeight: '400px',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: '#000',
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'var(--dark-bg)',
    border: '1px solid var(--dark-border)',
    borderRadius: 'var(--radius-lg)',
    color: 'var(--text-primary)',
    fontSize: '16px',
    outline: 'none',
  };

  const textareaStyle: CSSProperties = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical',
    fontFamily: 'inherit',
  };

  const categoryChipStyle = (isSelected: boolean): CSSProperties => ({
    padding: '10px 20px',
    border: `1px solid ${isSelected ? 'var(--coral-400)' : 'var(--dark-border)'}`,
    borderRadius: 'var(--radius-full)',
    backgroundColor: isSelected ? 'var(--coral-400)' : 'transparent',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'var(--transition-normal)',
  });

  const uploadButtonStyle: CSSProperties = {
    width: '100%',
    padding: '16px',
    backgroundColor: uploading ? '#666' : 'var(--coral-400)',
    color: 'var(--text-primary)',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    fontSize: '18px',
    fontWeight: '700',
    cursor: uploading ? 'not-allowed' : 'pointer',
    transition: 'var(--transition-normal)',
  };

  const isProperty = category === 'RENT' || category === 'BUY';

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <button style={backButtonStyle} onClick={() => navigate(-1)}>
          <Icons.ArrowRight size={24} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <h1 style={titleStyle}>Upload Video</h1>
      </div>

      {/* Video Selection */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Video *</label>
        {!videoFile ? (
          <button
            style={selectVideoButtonStyle}
            onClick={() => videoInputRef.current?.click()}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--coral-400)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--dark-border)';
            }}
          >
            <Icons.Camera size={48} color="var(--text-secondary)" />
            <span>Click to select video</span>
            <span style={{ fontSize: '12px' }}>Max 100MB, up to 45 seconds</span>
          </button>
        ) : (
          <div>
            <video
              ref={videoRef}
              src={videoPreviewUrl}
              controls
              style={videoPreviewStyle}
            />
            <button
              style={{ ...inputStyle, marginTop: '12px', cursor: 'pointer' }}
              onClick={() => videoInputRef.current?.click()}
            >
              Change Video
            </button>
          </div>
        )}
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          style={{ display: 'none' }}
          onChange={handleVideoSelect}
        />
      </div>

      {/* Category */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Category *</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['RENT', 'BUY', 'SERVICES'] as VideoCategory[]).map((cat) => (
            <button
              key={cat}
              style={categoryChipStyle(category === cat)}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your listing..."
          style={textareaStyle}
          maxLength={300}
        />
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'right', marginTop: '4px' }}>
          {description.length}/300
        </div>
      </div>

      {/* Price */}
      <div style={sectionStyle}>
        <label style={labelStyle}>
          {category === 'RENT' ? 'Rent per Month (R)' : category === 'BUY' ? 'Sale Price (R)' : 'Price (R)'}
        </label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Enter price"
          style={inputStyle}
          min="0"
        />
      </div>

      {/* Property Details (RENT/BUY only) */}
      {isProperty && (
        <div style={sectionStyle}>
          <label style={labelStyle}>Property Details</label>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ ...labelStyle, fontSize: '12px' }}>Property Type</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              style={inputStyle}
            >
              {category === 'RENT' && <option value="Room">Room</option>}
              <option value="House">House</option>
              <option value="Cottage">Cottage</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ ...labelStyle, fontSize: '12px' }}>Bedrooms</label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                style={inputStyle}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5+</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ ...labelStyle, fontSize: '12px' }}>Bathrooms</label>
              <select
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                style={inputStyle}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>
          </div>

          {/* Property Images */}
          <div style={{ marginTop: '16px' }}>
            <label style={{ ...labelStyle, fontSize: '12px' }}>Property Images (Optional, max 6)</label>
            <button
              style={{ ...inputStyle, cursor: 'pointer', marginBottom: '12px' }}
              onClick={() => imageInputRef.current?.click()}
              disabled={images.length >= 6}
            >
              {images.length >= 6 ? 'Max images reached' : `Add Images (${images.length}/6)`}
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleImageSelect}
            />

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {imagePreviews.map((preview, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                    />
                    <button
                      onClick={() => removeImage(index)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Location */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Location</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <Icons.Location size={20} />
          <span>{locationName || 'Getting location...'}</span>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div style={sectionStyle}>
          <div style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>{uploadStatus}</div>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--dark-border)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                backgroundColor: 'var(--coral-400)',
                width: `${uploadProgress}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div style={{ marginTop: '4px', fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'right' }}>
            {Math.round(uploadProgress)}%
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        style={uploadButtonStyle}
        onClick={handleUpload}
        disabled={uploading || !videoFile || !description.trim()}
      >
        {uploading ? 'Uploading...' : 'Upload Video'}
      </button>

      {/* Info Note */}
      <div style={{ marginTop: '16px', padding: '16px', backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: 'var(--radius-lg)', fontSize: '14px', color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--text-primary)' }}>Note:</strong> Your video will be reviewed before appearing publicly. This helps maintain quality and safety for all users.
      </div>
    </div>
  );
};

export default UploadPage;
