import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, Loader2, CheckCircle2, Link2, ExternalLink } from 'lucide-react';
import api from '../../utils/api';
import { useNotification } from '../../context/NotificationContext';

/**
 * CloudinaryImageUpload component
 * Seamless file picker + drag/drop + direct Cloudinary upload with live preview and URL fallback.
 */
const CloudinaryImageUpload = ({
  value = '',
  onChange,
  folder = 'uploads',
  label = 'Image',
  required = false,
  helpText = 'Supports JPEG, PNG, WebP (Max 8MB)',
  compact = false,
  aspectRatio = 'auto',
  previewHeight = '150px'
}) => {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const { showToast } = useNotification();

  const isCloudinary = typeof value === 'string' && value.includes('res.cloudinary.com');

  const uploadFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPEG, PNG, WebP, GIF)', 'error');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast('Image size exceeds 8MB. Please choose an optimized image.', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await api.post('/upload', formData, {
        timeout: 120000
      });

      const uploadedUrl = res.data?.data?.url || res.data?.url;
      if (uploadedUrl) {
        onChange(uploadedUrl);
        showToast('Image uploaded to Cloudinary successfully!', 'success');
      } else {
        throw new Error('No URL returned from upload');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      const serverMsg = err.response?.data?.message || (err.code === 'ECONNABORTED' ? 'Upload timed out. Please try a smaller image or faster connection.' : err.message);
      showToast(serverMsg || 'Image upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Mini Preview */}
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '6px',
          overflow: 'hidden',
          background: '#F1F5F9',
          border: '1px solid #CBD5E1',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {value ? (
            <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            <ImageIcon size={18} color="#94A3B8" />
          )}
        </div>

        {/* URL Text Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://res.cloudinary.com/..."
          style={{ flex: 1, padding: '7px 10px', fontSize: '12.5px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
        />

        {/* Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: isCloudinary ? '#059669' : '#0F172A',
            color: '#FFFFFF',
            border: 'none',
            padding: '7px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: uploading ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap'
          }}
          title="Upload to Cloudinary"
        >
          {uploading ? (
            <>
              <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <UploadCloud size={14} />
              <span>Upload</span>
            </>
          )}
        </button>

        {value && (
          <button
            type="button"
            onClick={handleClear}
            style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
            title="Clear image"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>{label}</span>
          {required && <span style={{ color: '#EF4444' }}>*</span>}
          {isCloudinary && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '11px',
              background: '#DCFCE7',
              color: '#15803D',
              padding: '2px 7px',
              borderRadius: '999px',
              fontWeight: 600
            }}>
              <CheckCircle2 size={11} /> Cloudinary CDN
            </span>
          )}
        </label>

        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-brand)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Link2 size={12} /> {showUrlInput ? 'Hide URL' : 'Edit URL directly'}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Main Preview & Dropzone Container */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: dragOver ? '2px dashed var(--color-brand)' : '1.5px dashed var(--color-rule)',
          borderRadius: '10px',
          background: dragOver ? 'rgba(255, 120, 0, 0.05)' : 'var(--bg-card)',
          padding: '14px',
          transition: 'all 0.2s ease',
          textAlign: 'center'
        }}
      >
        {value ? (
          <div>
            <div style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#0B0F19',
              border: '1px solid var(--border)',
              maxHeight: previewHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px'
            }}>
              <img
                src={value}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: previewHeight,
                  objectFit: 'contain',
                  borderRadius: '6px'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                display: 'flex',
                gap: '6px'
              }}>
                <a
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: 'rgba(0,0,0,0.65)',
                    color: '#FFFFFF',
                    padding: '5px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Open in new tab"
                >
                  <ExternalLink size={13} />
                </a>
                <button
                  type="button"
                  onClick={handleClear}
                  style={{
                    background: '#EF4444',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '5px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Remove image"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--color-brand)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: uploading ? 'not-allowed' : 'pointer'
                }}
              >
                {uploading ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <UploadCloud size={14} />}
                <span>{uploading ? 'Uploading to Cloudinary...' : 'Replace Image via Cloudinary'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '20px 10px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 120, 0, 0.1)',
              color: 'var(--color-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px auto'
            }}>
              {uploading ? (
                <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <UploadCloud size={24} />
              )}
            </div>

            <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '4px' }}>
              {uploading ? 'Uploading Image to Cloudinary...' : 'Upload Image to Cloudinary'}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--color-muted)', marginBottom: '12px' }}>
              {helpText} • Drag &amp; drop or click to choose
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--color-brand)',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: uploading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(255, 120, 0, 0.3)'
              }}
            >
              <UploadCloud size={15} />
              <span>Browse Image File</span>
            </button>
          </div>
        )}
      </div>

      {/* Direct URL input fallback */}
      {showUrlInput && (
        <div style={{ marginTop: '8px' }}>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or enter direct image URL (https://...)"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--color-rule)',
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CloudinaryImageUpload;
