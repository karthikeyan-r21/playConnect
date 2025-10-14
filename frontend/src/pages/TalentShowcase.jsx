import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Video, 
  Image, 
  X, 
  Play, 
  ArrowLeft,
  Home,
  Camera,
  FileVideo,
  Loader
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TalentShowcase = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState('video'); // 'video' or 'image'
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi'];
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    
    if (uploadType === 'video' && !validVideoTypes.includes(file.type)) {
      setError('Please select a valid video file (MP4, WebM, OGG, AVI)');
      return;
    }
    
    if (uploadType === 'image' && !validImageTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF)');
      return;
    }

    // Check file size (max 25MB for video, 5MB for image)
    const maxSize = uploadType === 'video' ? 25 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File size too large. Maximum ${uploadType === 'video' ? '25MB' : '5MB'} allowed.`);
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      setUploadSuccess(true);
      setSelectedFile(null);
      setPreview(null);
      setUploadProgress(100);
      
      // Show success message
      setTimeout(() => {
        setUploadSuccess(false);
        setUploadProgress(0);
        alert('Talent showcase upload feature is in development. Your media will be uploaded once the feature is complete!');
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload feature is in development. Please try again later.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    setUploadSuccess(false);
    setUploadProgress(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Talent Showcase</h1>
                <p className="text-sm text-gray-600">Upload videos and images to showcase your skills</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Home className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Success Message */}
        {uploadSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Media uploaded successfully! Your talent is now showcased.
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Upload Type Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">What would you like to upload?</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setUploadType('video');
                resetUpload();
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                uploadType === 'video' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <Video className="h-8 w-8 mx-auto mb-2" />
              <div className="font-medium">Video</div>
              <div className="text-sm opacity-75">Showcase your moves</div>
            </button>
            
            <button
              onClick={() => {
                setUploadType('image');
                resetUpload();
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                uploadType === 'image' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <Image className="h-8 w-8 mx-auto mb-2" />
              <div className="font-medium">Image</div>
              <div className="text-sm opacity-75">Share your moments</div>
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Upload {uploadType === 'video' ? 'Video' : 'Image'}
          </h3>
          
          {!selectedFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                {uploadType === 'video' ? (
                  <FileVideo className="h-8 w-8 text-gray-400" />
                ) : (
                  <Camera className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Drop your {uploadType} here or click to browse
              </h4>
              <p className="text-gray-500 mb-4">
                {uploadType === 'video' 
                  ? 'MP4, WebM, OGG, AVI files up to 25MB' 
                  : 'JPEG, PNG, GIF files up to 5MB'
                }
              </p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept={uploadType === 'video' ? 'video/*' : 'image/*'}
                  onChange={handleFileSelect}
                />
                <span className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Choose File
                </span>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Preview</h4>
                  <button
                    onClick={resetUpload}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {uploadType === 'video' ? (
                  <video
                    src={preview}
                    controls
                    className="w-full max-w-md mx-auto rounded-lg max-h-64 object-cover"
                  />
                ) : (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full max-w-md mx-auto rounded-lg"
                  />
                )}
                
                <div className="mt-3 text-sm text-gray-600">
                  <p><strong>File:</strong> {selectedFile.name}</p>
                  <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <p><strong>Type:</strong> {selectedFile.type}</p>
                </div>
              </div>
              
              {/* Upload Button */}
              <div className="flex flex-col items-center space-y-4">
                {/* Progress Bar */}
                {isUploading && (
                  <div className="w-full max-w-md">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Uploading...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      This may take a few minutes for larger files...
                    </p>
                  </div>
                )}
                
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isUploading ? (
                    <>
                      <Loader className="h-5 w-5 mr-2 animate-spin" />
                      {uploadType === 'video' ? 'Uploading Video...' : 'Uploading Image...'}
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 mr-2" />
                      Upload {uploadType === 'video' ? 'Video' : 'Image'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for Great Content</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">📹 Video Tips</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Record in good lighting</li>
                <li>• Keep videos under 2 minutes</li>
                <li>• Show your best skills and techniques</li>
                <li>• Use horizontal orientation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">📸 Photo Tips</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use high resolution images</li>
                <li>• Capture action shots</li>
                <li>• Show team moments</li>
                <li>• Include equipment and gear</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentShowcase;
