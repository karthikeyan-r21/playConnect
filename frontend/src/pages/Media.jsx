import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { FaUpload, FaHeart, FaRegHeart, FaComment, FaTrash, FaEye, FaPlay, FaFilter } from 'react-icons/fa';

const Media = () => {
  const { user } = useAuth();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    sportType: '',
    tags: '',
    isPublic: true
  });
  const [filters, setFilters] = useState({
    sportType: '',
    fileType: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [pagination, setPagination] = useState({});

  const sports = [
    'Football', 'Basketball', 'Tennis', 'Cricket', 'Soccer', 'Baseball',
    'Swimming', 'Volleyball', 'Rugby', 'Hockey', 'Golf', 'Boxing',
    'Cycling', 'Running', 'Badminton', 'Table Tennis', 'Wrestling'
  ];

  const sportColors = {
    'Football': 'from-orange-400 to-red-500',
    'Basketball': 'from-orange-500 to-yellow-500',
    'Tennis': 'from-green-400 to-blue-500',
    'Cricket': 'from-green-500 to-green-700',
    'Soccer': 'from-green-400 to-green-600',
    'Baseball': 'from-blue-400 to-blue-600',
    'Swimming': 'from-blue-300 to-cyan-500',
    'Volleyball': 'from-yellow-400 to-orange-500',
    'Rugby': 'from-red-500 to-red-700',
    'Hockey': 'from-blue-500 to-blue-700',
    'Golf': 'from-green-300 to-green-500',
    'Boxing': 'from-red-400 to-red-600',
    'Cycling': 'from-yellow-300 to-yellow-500',
    'Running': 'from-purple-400 to-purple-600',
    'Badminton': 'from-pink-400 to-pink-600',
    'Table Tennis': 'from-orange-300 to-orange-500',
    'Wrestling': 'from-gray-500 to-gray-700'
  };

  useEffect(() => {
    fetchMedia();
  }, [filters]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      // For now, use mock data since media API is not fully implemented
      const mockMedia = [
        {
          _id: 'mock-1',
          title: 'Football Training Session',
          fileType: 'video',
          fileUrl: 'https://via.placeholder.com/400x300/4f46e5/ffffff?text=Football+Video',
          thumbnail: 'https://via.placeholder.com/400x300/4f46e5/ffffff?text=Football',
          uploadedBy: {
            _id: 'user-1',
            name: 'John Doe'
          },
          sportType: 'Football',
          description: 'Great training session highlights from our weekend practice',
          tags: ['training', 'football', 'highlights'],
          likes: ['user-2', 'user-3'],
          comments: [
            { _id: 'comment-1', text: 'Great video!', user: { name: 'Jane' } }
          ],
          views: 25,
          duration: 120,
          fileSize: 15728640,
          createdAt: new Date('2024-12-01').toISOString()
        },
        {
          _id: 'mock-2',
          title: 'Basketball Highlights',
          fileType: 'video',
          fileUrl: 'https://via.placeholder.com/400x300/f97316/ffffff?text=Basketball+Video',
          thumbnail: 'https://via.placeholder.com/400x300/f97316/ffffff?text=Basketball',
          uploadedBy: {
            _id: 'user-2',
            name: 'Jane Smith'
          },
          sportType: 'Basketball',
          description: 'Best plays from last game against rival team',
          tags: ['highlights', 'basketball', 'game'],
          likes: ['user-1'],
          comments: [],
          views: 42,
          duration: 90,
          fileSize: 12582912,
          createdAt: new Date('2024-11-28').toISOString()
        },
        {
          _id: 'mock-3',
          title: 'Tennis Practice',
          fileType: 'image',
          fileUrl: 'https://via.placeholder.com/400x300/10b981/ffffff?text=Tennis+Image',
          uploadedBy: {
            _id: 'user-3',
            name: 'Mike Johnson'
          },
          sportType: 'Tennis',
          description: 'Perfect serve technique demonstration',
          tags: ['tennis', 'technique', 'serve'],
          likes: [],
          comments: [],
          views: 18,
          fileSize: 2048000,
          createdAt: new Date('2024-11-25').toISOString()
        }
      ];

      // Filter mock data based on current filters
      let filteredMedia = mockMedia;
      
      if (filters.sportType) {
        filteredMedia = filteredMedia.filter(item => item.sportType === filters.sportType);
      }
      
      if (filters.fileType) {
        filteredMedia = filteredMedia.filter(item => item.fileType === filters.fileType);
      }

      setMedia(filteredMedia);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: filteredMedia.length
      });
    } catch (error) {
      console.error('Error fetching media:', error);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !uploadForm.title || !uploadForm.sportType) {
      alert('Please fill in all required fields and select a file');
      return;
    }

    try {
      setUploading(true);
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setUploadForm({
        title: '',
        description: '',
        sportType: '',
        tags: '',
        isPublic: true
      });
      setShowUploadModal(false);
      setUploadProgress(0);
      
      // Refresh media list
      fetchMedia();
      alert('Media upload feature is in development. Your media will be uploaded once the feature is complete!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (mediaId) => {
    try {
      // Simulate like toggle
      setMedia(prevMedia => 
        prevMedia.map(item => {
          if (item._id === mediaId) {
            const userLiked = item.likes?.includes(user?.id);
            const newLikes = userLiked 
              ? item.likes.filter(id => id !== user?.id)
              : [...(item.likes || []), user?.id];
            return { ...item, likes: newLikes };
          }
          return item;
        })
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (mediaId) => {
    if (!commentText.trim()) return;
    
    try {
      // Simulate adding comment
      const newComment = {
        _id: Date.now().toString(),
        text: commentText,
        user: { name: user?.name || 'Anonymous' },
        createdAt: new Date().toISOString()
      };
      
      setMedia(prevMedia => 
        prevMedia.map(item => {
          if (item._id === mediaId) {
            return { 
              ...item, 
              comments: [...(item.comments || []), newComment] 
            };
          }
          return item;
        })
      );
      
      setCommentText('');
      alert('Comment feature is in development. Your comment will be saved once the feature is complete!');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDelete = async (mediaId) => {
    if (window.confirm('Are you sure you want to delete this media?')) {
      try {
        // Simulate delete
        setMedia(prevMedia => prevMedia.filter(item => item._id !== mediaId));
        alert('Delete feature is in development. Media will be deleted once the feature is complete!');
      } catch (error) {
        console.error('Error deleting media:', error);
        alert(error.message || 'Delete failed');
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sports Media</h1>
              <p className="text-gray-600 mt-2">Share and discover sports videos and images</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FaUpload />
              <span>Upload Media</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap items-center space-x-4 space-y-2">
            <FaFilter className="text-gray-500" />
            
            <select
              value={filters.sportType}
              onChange={(e) => setFilters({...filters, sportType: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Sports</option>
              {sports.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>

            <select
              value={filters.fileType}
              onChange={(e) => setFilters({...filters, fileType: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="video">Videos</option>
              <option value="image">Images</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt">Date</option>
              <option value="likes">Likes</option>
              <option value="views">Views</option>
              <option value="title">Title</option>
            </select>

            <select
              value={filters.sortOrder}
              onChange={(e) => setFilters({...filters, sortOrder: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading media...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {media.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Media Preview */}
                <div className="relative aspect-video bg-gray-100">
                  {item.fileType === 'video' ? (
                    <div className="relative w-full h-full">
                      <video
                        src={item.fileUrl}
                        className="w-full h-full object-cover"
                        poster={item.thumbnail}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FaPlay className="text-white text-4xl opacity-80" />
                      </div>
                      {item.duration && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                          {formatDuration(item.duration)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <img
                      src={item.fileUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {/* Sport Badge */}
                  <div className={`absolute top-2 left-2 bg-gradient-to-r ${sportColors[item.sportType] || 'from-gray-400 to-gray-600'} text-white text-xs px-2 py-1 rounded-full font-medium`}>
                    {item.sportType}
                  </div>
                </div>

                {/* Media Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                  {item.description && (
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{item.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <FaEye />
                      <span>{item.views}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatFileSize(item.fileSize)}
                    </div>
                  </div>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLike(item._id)}
                        className="flex items-center space-x-1 text-red-500 hover:text-red-600 transition-colors"
                      >
                        {item.likes?.includes(user?.id) ? <FaHeart /> : <FaRegHeart />}
                        <span className="text-sm">{item.likes?.length || 0}</span>
                      </button>
                      
                      <button
                        onClick={() => setSelectedMedia(item)}
                        className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        <FaComment />
                        <span className="text-sm">{item.comments?.length || 0}</span>
                      </button>
                    </div>

                    {user && item.uploadedBy._id === user.id && (
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>

                  {/* Uploader Info */}
                  <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {item.uploadedBy.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-2">
                      <p className="text-sm font-medium text-gray-900">{item.uploadedBy.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Media</h2>
                
                <form onSubmit={handleUpload} className="space-y-6">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select File *
                    </label>
                    <input
                      type="file"
                      accept="video/*,image/*"
                      onChange={handleFileSelect}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    {preview && (
                      <div className="mt-4">
                        {selectedFile?.type.startsWith('video/') ? (
                          <video src={preview} controls className="w-full h-48 object-cover rounded-lg" />
                        ) : (
                          <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Sport Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sport Type *
                    </label>
                    <select
                      value={uploadForm.sportType}
                      onChange={(e) => setUploadForm({...uploadForm, sportType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a sport</option>
                      {sports.map(sport => (
                        <option key={sport} value={sport}>{sport}</option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={uploadForm.tags}
                      onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                      placeholder="e.g. training, highlights, tutorial"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Privacy */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={uploadForm.isPublic}
                      onChange={(e) => setUploadForm({...uploadForm, isPublic: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                      Make this media public
                    </label>
                  </div>

                  {/* Upload Progress */}
                  {uploading && (
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading || !selectedFile}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Media;
