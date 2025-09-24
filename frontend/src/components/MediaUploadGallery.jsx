import React, { useState, useRef } from 'react';
import { Upload, Video, Image, X, FileText, AlertCircle } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

const MediaUploadGallery = ({ userId, onMediaUpdate }) => {
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Fetch user media
  const fetchUserMedia = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/media/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMedia(data.media || []);
        if (onMediaUpdate) onMediaUpdate(data.media);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
      setError('Failed to load media');
    }
  };

  // Upload media
  const handleMediaUpload = async (file, type) => {
    setUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('media', file);
      formData.append('type', type);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh media list
        await fetchUserMedia();
        setError('');
      } else {
        setError(data.msg || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Determine file type
    const type = file.type.startsWith('video/') ? 'video' : 'image';
    
    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 50MB.');
      return;
    }

    handleMediaUpload(file, type);
  };

  // Delete media
  const handleDeleteMedia = async (mediaId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/media/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchUserMedia();
        setSelectedMedia(null);
      } else {
        const data = await response.json();
        setError(data.msg || 'Failed to delete media');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete media');
    }
  };

  // Load media on component mount
  React.useEffect(() => {
    if (userId) {
      fetchUserMedia();
    }
  }, [userId]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full">
      {/* Upload Section */}
      <div className="mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {uploading ? (
            <div className="space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Uploading...</p>
              {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Click to upload
                </button>
                <p className="text-gray-500 text-sm mt-1">
                  or drag and drop videos or images
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  MP4, WebM, MOV up to 50MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={() => setError('')}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Media Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {media.map((item, index) => (
          <div key={item._id || index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative aspect-video bg-gray-100">
              {item.type === 'video' ? (
                <VideoPlayer
                  mediaId={item._id}
                  videoUrl={item.playbackUrl || item.url}
                  title={`Video ${index + 1}`}
                  onError={(error) => console.error('Video error:', error)}
                />
              ) : (
                <img
                  src={item.url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedMedia(item)}
                />
              )}
              
              {/* Media Type Badge */}
              <div className="absolute top-2 left-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  item.type === 'video' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {item.type === 'video' ? (
                    <Video className="h-3 w-3 mr-1" />
                  ) : (
                    <Image className="h-3 w-3 mr-1" />
                  )}
                  {item.type}
                </span>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDeleteMedia(item._id)}
                className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-75 hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Media Info */}
            <div className="p-3">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{item.size ? formatFileSize(item.size) : 'Unknown size'}</span>
                {item.uploadedAt && (
                  <span>{formatDate(item.uploadedAt)}</span>
                )}
              </div>
              
              {item.type === 'video' && item.duration && (
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <FileText className="h-3 w-3 mr-1" />
                  Duration: {Math.floor(item.duration / 60)}:{String(Math.floor(item.duration % 60)).padStart(2, '0')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {media.length === 0 && !uploading && (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Image className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No media yet</h3>
          <p className="text-gray-600 mb-4">Upload your first video or image to get started</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Media
          </button>
        </div>
      )}

      {/* Media Modal */}
      {selectedMedia && selectedMedia.type === 'image' && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedMedia.url}
              alt="Full size media"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploadGallery;
