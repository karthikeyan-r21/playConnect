import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Edit3, 
  Camera, 
  Video, 
  Plus, 
  Grid3X3, 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal,
  ArrowLeft,
  Trash2,
  Eye,
  Play,
  MapPin,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [userMedia, setUserMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Load user media
  useEffect(() => {
    loadUserMedia();
  }, []);

  const loadUserMedia = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token found, skipping media load');
        return;
      }

      console.log('Loading user media...');
      const response = await fetch('http://localhost:5000/api/users/media', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Media load response:', data);

      if (response.ok) {
        setUserMedia(data.media || []);
        console.log('Media loaded successfully:', data.media?.length || 0, 'items');
      } else {
        console.error('Failed to load media:', data.msg || 'Unknown error');
      }
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMedia = async (mediaId) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('Deleting media:', mediaId);
      const response = await fetch(`http://localhost:5000/api/users/media/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Delete response:', data);

      if (response.ok) {
        setUserMedia(prev => prev.filter(item => item._id !== mediaId));
        setSelectedMedia(null);
        console.log('Media deleted successfully');
      } else {
        console.error('Failed to delete media:', data.msg || 'Unknown error');
        alert(`Delete failed: ${data.msg || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      alert(`Delete error: ${error.message}`);
    }
  };

  const MediaGrid = () => {
    const filteredMedia = activeTab === 'videos' 
      ? userMedia.filter(media => media.type === 'video')
      : userMedia;

    console.log('MediaGrid render:', { 
      activeTab, 
      totalMedia: userMedia.length, 
      filteredMedia: filteredMedia.length,
      userMedia: userMedia 
    });

    return (
      <div className="grid grid-cols-3 gap-1 md:gap-2">
        {filteredMedia.map((media, index) => (
        <div
          key={media._id}
          className="relative aspect-square bg-gray-100 cursor-pointer group overflow-hidden rounded-lg"
          onClick={() => setSelectedMedia(media)}
        >
          {media.type === 'image' ? (
            <img
              src={media.url}
              alt="Post"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="relative w-full h-full">
              <video
                src={media.url}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                muted
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="w-8 h-8 text-white drop-shadow-lg" fill="white" />
              </div>
            </div>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-4 text-white">
              <div className="flex items-center">
                <Heart className="w-5 h-5 mr-1" />
                <span className="text-sm font-medium">0</span>
              </div>
              <div className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-1" />
                <span className="text-sm font-medium">0</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Add new media button */}
      <div
        className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition-colors"
        onClick={() => setShowUploadModal(true)}
      >
        <div className="text-center">
          <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Add Media</p>
        </div>
      </div>
    </div>
    );
  };

  const MediaModal = ({ media, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-4xl max-h-[90vh] w-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 z-10"
        >
          <ArrowLeft className="w-8 h-8" />
        </button>

        <div className="bg-white rounded-lg overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
          {/* Media content */}
          <div className="flex-1 bg-black flex items-center justify-center">
            {media.type === 'image' ? (
              <img
                src={media.url}
                alt="Post"
                className="max-w-full max-h-[70vh] object-contain"
              />
            ) : (
              <video
                src={media.url}
                controls
                className="max-w-full max-h-[70vh] object-contain"
                autoPlay
              />
            )}
          </div>

          {/* Sidebar with details */}
          <div className="w-full md:w-80 bg-white flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
                <span className="ml-3 font-semibold text-sm">{user?.name}</span>
              </div>
              <button
                onClick={() => deleteMedia(media._id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Media info */}
            <div className="p-4 flex-1">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{media.filename}</p>
                  <p className="text-xs text-gray-500">
                    Uploaded on {new Date(media.uploadDate).toLocaleDateString()}
                  </p>
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex space-x-6">
                    <button className="flex items-center text-gray-600 hover:text-red-500 transition-colors">
                      <Heart className="w-5 h-5 mr-1" />
                      <span className="text-sm">0</span>
                    </button>
                    <button className="flex items-center text-gray-600 hover:text-blue-500 transition-colors">
                      <MessageCircle className="w-5 h-5 mr-1" />
                      <span className="text-sm">0</span>
                    </button>
                    <button className="flex items-center text-gray-600 hover:text-blue-500 transition-colors">
                      <Share className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const UploadModal = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState(null);

    const handleFileSelect = (e) => {
      const file = e.target.files[0];
      if (file) {
        setSelectedFile(file);
        
        // Create preview
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => setPreview({ type: 'image', url: e.target.result });
          reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
          setPreview({ type: 'video', url: URL.createObjectURL(file) });
        }
      }
    };

    const handleUpload = async () => {
      if (!selectedFile) return;

      setIsUploading(true);
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('media', selectedFile);

        console.log('Uploading media:', selectedFile.name, selectedFile.type);

        const response = await fetch('http://localhost:5000/api/users/upload-media', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();
        console.log('Upload response:', data);

        if (response.ok) {
          console.log('Upload successful, reloading media...');
          await loadUserMedia();
          setShowUploadModal(false);
          setSelectedFile(null);
          setPreview(null);
        } else {
          console.error('Upload failed:', data.msg || 'Unknown error');
          alert(`Upload failed: ${data.msg || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert(`Upload error: ${error.message}`);
      } finally {
        setIsUploading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h3 className="text-lg font-semibold mb-4">Upload Media</h3>
          
          {!preview ? (
            <div>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="block w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to select image or video</p>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {preview.type === 'image' ? (
                  <img src={preview.url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <video src={preview.url} className="w-full h-full object-cover" muted />
                )}
              </div>
              
              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Change
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setShowUploadModal(false)}
            className="w-full mt-4 py-2 px-4 text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
            {/* Profile Image */}
            <div className="relative">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-gray-100">
                  <User className="h-16 w-16 text-white" />
                </div>
              )}
              
              {/* Camera button */}
              <button
                onClick={() => navigate('/edit-profile')}
                className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{user?.name || 'User'}</h1>
                <button 
                  onClick={() => navigate('/edit-profile')}
                  className="mt-2 md:mt-0 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                >
                  <Edit3 className="w-4 h-4 inline mr-2" />
                  Edit Profile
                </button>
              </div>

              {/* Stats */}
              <div className="flex justify-center md:justify-start space-x-8 mb-4">
                <div className="text-center cursor-pointer hover:opacity-70 transition-opacity">
                  <div className="text-xl font-semibold text-gray-900">{userMedia.length}</div>
                  <div className="text-sm text-gray-500">posts</div>
                </div>
                {/* <div className="text-center cursor-pointer hover:opacity-70 transition-opacity">
                  <div className="text-xl font-semibold text-gray-900">0</div>
                  <div className="text-sm text-gray-500">followers</div>
                </div>
                <div className="text-center cursor-pointer hover:opacity-70 transition-opacity">
                  <div className="text-xl font-semibold text-gray-900">0</div>
                  <div className="text-sm text-gray-500">following</div>
                </div> */}
              </div>

              {/* Bio/Details */}
              <div className="space-y-2 text-sm text-gray-600">
                {user?.email && (
                  <div className="flex items-center justify-center md:justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    {user.email}
                  </div>
                )}
                {user?.mobile && (
                  <div className="flex items-center justify-center md:justify-start">
                    <Phone className="w-4 h-4 mr-2" />
                    {user.mobile}
                  </div>
                )}
                {user?.dob && (
                  <div className="flex items-center justify-center md:justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(user.dob).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                )}
                {user?.location && (
                  <div className="flex items-center justify-center md:justify-start">
                    <MapPin className="w-4 h-4 mr-2" />
                    {user.location}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stories/Highlights Section */}
        {userMedia.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="flex items-center space-x-4 overflow-x-auto pb-2">
              <div className="flex-shrink-0 text-center">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">New</p>
              </div>
              {/* Sample highlights */}
              {userMedia.slice(0, 6).map((media, index) => (
                <div key={index} className="flex-shrink-0 text-center cursor-pointer">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors">
                    {media.type === 'image' ? (
                      <img src={media.url} alt="Highlight" className="w-full h-full object-cover" />
                    ) : (
                      <video src={media.url} className="w-full h-full object-cover" muted />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate w-16">Story {index + 1}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex justify-center">
              <button
                onClick={() => setActiveTab('posts')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'posts'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid3X3 className="w-4 h-4 inline mr-2" />
                POSTS
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'videos'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Video className="w-4 h-4 inline mr-2" />
                VIDEOS
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : userMedia.length === 0 ? (
              <div className="text-center py-12">
                <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-500 mb-6">Share your talents and moments with the community</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Upload Your First Post
                </button>
              </div>
            ) : (
              <MediaGrid />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedMedia && (
        <MediaModal media={selectedMedia} onClose={() => setSelectedMedia(null)} />
      )}

      {showUploadModal && <UploadModal />}
    </div>
  );
};

export default Profile;
