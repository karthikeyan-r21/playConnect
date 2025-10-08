import React, { useState, useEffect } from 'react';
import { Upload, X, Play, Eye, Trash2, Camera, Video } from 'lucide-react';

const MediaUploadGallery = ({ onClose }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedMedia, setUploadedMedia] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load existing media on component mount
  useEffect(() => {
    loadUserMedia();
  }, []);

  const loadUserMedia = async () => {
    try {
      console.log('Loading user media...');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view your media');
        return;
      }

      const response = await fetch('http://localhost:5000/api/users/media', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Media fetch response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Loaded media data:', data);
        setUploadedMedia(data.media || []);
      } else {
        const errorData = await response.json();
        console.error('Failed to load media:', errorData);
        setError(errorData.message || 'Failed to load media');
      }
    } catch (error) {
      console.error('Error loading media:', error);
      setError('Failed to load media');
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    console.log('Selected files:', files);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit
      
      if (!isValidType) {
        setError(`${file.name} is not a valid image or video file.`);
        return false;
      }
      
      if (!isValidSize) {
        setError(`${file.name} is too large. Maximum size is 50MB.`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      setError('');
    }
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select files to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to upload media');
        setIsUploading(false);
        return;
      }

      console.log('Starting upload process...');
      console.log('Number of files to upload:', selectedFiles.length);

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        console.log(`Uploading file ${i + 1}/${selectedFiles.length}:`, file.name, file.type, file.size);

        const formData = new FormData();
        formData.append('media', file);

        console.log('FormData created, sending request...');

        const response = await fetch('http://localhost:5000/api/users/upload-media', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        console.log('Upload response status:', response.status);
        console.log('Upload response headers:', response.headers);

        if (response.ok) {
          const result = await response.json();
          console.log('Upload successful:', result);
          
          // Update progress
          setUploadProgress(((i + 1) / selectedFiles.length) * 100);
        } else {
          const errorData = await response.json();
          console.error('Upload failed for file:', file.name, errorData);
          throw new Error(errorData.message || `Failed to upload ${file.name}`);
        }
      }

      // Success - reload media and clear selected files
      setSuccess(`Successfully uploaded ${selectedFiles.length} file(s)!`);
      setSelectedFiles([]);
      await loadUserMedia();
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteMedia = async (mediaId) => {
    try {
      console.log('Deleting media:', mediaId);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to delete media');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/users/media/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccess('Media deleted successfully!');
        await loadUserMedia();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete media');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete media');
    }
  };

  const openPreview = (media) => {
    setPreviewMedia(media);
  };

  const closePreview = () => {
    setPreviewMedia(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Media Gallery</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex space-x-2">
              <Camera className="w-8 h-8 text-gray-400" />
              <Video className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Your Talent</h3>
          <p className="text-gray-500 mb-4">
            Share your skills, performances, or creative work
          </p>
          
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          
          <label
            htmlFor="file-upload"
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white ${
              isUploading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
            } transition-colors`}
          >
            <Upload className="w-5 h-5 mr-2" />
            {isUploading ? 'Uploading...' : 'Choose Files'}
          </label>
          
          <p className="text-sm text-gray-500 mt-2">
            Supports images and videos up to 50MB
          </p>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Selected Files</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md border">
                <div className="flex items-center">
                  {file.type.startsWith('image/') ? (
                    <Camera className="w-5 h-5 text-gray-400 mr-2" />
                  ) : (
                    <Video className="w-5 h-5 text-gray-400 mr-2" />
                  )}
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                  </span>
                </div>
                <button
                  onClick={() => removeSelectedFile(index)}
                  className="p-1 hover:bg-gray-100 rounded"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
          
          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Uploading... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}
          
          <div className="mt-4 flex gap-2">
            <button
              onClick={uploadFiles}
              disabled={isUploading}
              className={`px-4 py-2 rounded-md font-medium ${
                isUploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isUploading ? 'Uploading...' : 'Upload Files'}
            </button>
            <button
              onClick={() => setSelectedFiles([])}
              disabled={isUploading}
              className="px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Media Gallery */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Your Media ({uploadedMedia.length})</h4>
        
        {uploadedMedia.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="flex justify-center mb-4">
              <Camera className="w-12 h-12 text-gray-300" />
            </div>
            <p className="text-gray-500">No media uploaded yet</p>
            <p className="text-sm text-gray-400 mt-1">Upload some photos or videos to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedMedia.map((media) => (
              <div key={media._id} className="relative group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100">
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt="Uploaded content"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                        <Play className="w-12 h-12 text-white opacity-80" />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openPreview(media)}
                      className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full transition-colors"
                    >
                      <Eye className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => deleteMedia(media._id)}
                      className="p-2 bg-red-500 bg-opacity-90 hover:bg-opacity-100 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                
                {/* Media info */}
                <div className="p-3">
                  <p className="text-sm text-gray-600 truncate">{media.filename}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(media.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closePreview}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            
            {previewMedia.type === 'image' ? (
              <img
                src={previewMedia.url}
                alt="Preview"
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            ) : (
              <video
                src={previewMedia.url}
                controls
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                autoPlay
              />
            )}
            
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 rounded-b-lg">
              <p className="font-medium">{previewMedia.filename}</p>
              <p className="text-sm opacity-75">
                Uploaded on {new Date(previewMedia.uploadDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploadGallery;
