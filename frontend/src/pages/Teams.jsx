import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Users, 
  Crown, 
  ArrowLeft, 
  Home,
  X,
  Check,
  UserPlus,
  UserMinus,
  Mail,
  Trophy,
  Search,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  User,
  Play,
  Star,
  Phone,
  Eye,
  Volume2,
  VolumeX,
  Pause,
  RotateCcw
} from 'lucide-react';
import LocationInput from '../components/LocationInput';
import { 
  searchTeams, 
  createTeam, 
  getUserTeams,
  getCreatedTeams,
  getJoinedTeams,
  sendJoinRequest, 
  approveJoinRequest, 
  rejectJoinRequest,
  getTeamDetails,
  getTeamMembers,
  getJoinRequests,
  leaveTeam,
  removeMember,
  updateTeam,
  deleteTeam
} from '../services/teamAPI';
import { useAuth } from '../context/AuthContext';

// Video Player Component for media viewing
const VideoPlayer = ({ videoUrl, onError }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = React.useRef(null);

  // Optimize Cloudinary video URL for browser compatibility
  const optimizeVideoUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) {
      return url;
    }
    
    try {
      const baseUrl = url.split('/upload/')[0];
      const fileName = url.split('/upload/')[1];
      
      // Add transformation parameters for browser compatibility
      return `${baseUrl}/upload/f_mp4,vc_h264,ac_aac,q_auto:good,fl_progressive/${fileName}`;
    } catch (error) {
      console.error('Error optimizing video URL:', error);
      return url;
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoError = (e) => {
    console.error('Video playback error:', e);
    setHasError(true);
    setIsLoading(false);
    if (onError) {
      onError('Unable to play video. The video format may not be supported or the file may be corrupted.');
    }
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const optimizedUrl = optimizeVideoUrl(videoUrl);

  return (
    <div className="relative bg-black">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">Loading video...</p>
          </div>
        </div>
      )}
      
      {hasError ? (
        <div className="aspect-video bg-gray-100 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 font-medium">Unable to play video</p>
              <p className="text-red-500 text-sm mt-1">The video format may not be supported</p>
              <a 
                href={videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                View Original Video
              </a>
            </div>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            controls
            preload="metadata"
            onLoadStart={handleLoadStart}
            onCanPlay={handleCanPlay}
            onError={handleVideoError}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full max-h-[80vh] object-contain"
            style={{ maxHeight: '80vh' }}
          >
            <source src={optimizedUrl} type="video/mp4" />
            <source src={videoUrl} type="video/webm" />
            <source src={videoUrl} type="video/ogg" />
            Your browser does not support the video tag.
          </video>

          {/* Custom Controls Overlay */}
          <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePlayPause}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </button>
              
              <button
                onClick={handleMuteToggle}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
            </div>

            <div className="text-white text-sm">
              Click and drag to seek • Use browser controls for full features
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Teams = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allTeams, setAllTeams] = useState([]);
  const [myCreatedTeams, setMyCreatedTeams] = useState([]);
  const [myJoinedTeams, setMyJoinedTeams] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showTeamDetails, setShowTeamDetails] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSportFilter, setSelectedSportFilter] = useState('');
  const [myTeamsSearchQuery, setMyTeamsSearchQuery] = useState('');
  const [myTeamsSportFilter, setMyTeamsSportFilter] = useState('');
  
  // Profile modal states
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sportType: '',
    location: '',
    geoLocation: null,
    minAge: 0
  });

  const gameTypes = [
    'Football',
    'Basketball',
    'Cricket',
    'Tennis',
    'Badminton',
    'Volleyball',
    'Table Tennis',
    'Hockey',
    'Baseball',
    'Other'
  ];

  const getSportColor = (sportType) => {
    const colors = {
      'Football': 'from-green-400 to-green-600',
      'Basketball': 'from-orange-400 to-orange-600',
      'Cricket': 'from-blue-400 to-blue-600',
      'Tennis': 'from-yellow-400 to-yellow-600',
      'Badminton': 'from-purple-400 to-purple-600',
      'Volleyball': 'from-red-400 to-red-600',
      'Table Tennis': 'from-pink-400 to-pink-600',
      'Hockey': 'from-indigo-400 to-indigo-600',
      'Baseball': 'from-gray-400 to-gray-600',
      'Other': 'from-teal-400 to-teal-600'
    };
    return colors[sportType] || 'from-gray-100 to-gray-200';
  };

  const getSportBadgeColor = (sportType) => {
    const colors = {
      'Football': 'bg-green-100 text-green-800',
      'Basketball': 'bg-orange-100 text-orange-800',
      'Cricket': 'bg-blue-100 text-blue-800',
      'Tennis': 'bg-yellow-100 text-yellow-800',
      'Badminton': 'bg-purple-100 text-purple-800',
      'Volleyball': 'bg-red-100 text-red-800',
      'Table Tennis': 'bg-pink-100 text-pink-800',
      'Hockey': 'bg-indigo-100 text-indigo-800',
      'Baseball': 'bg-gray-100 text-gray-800',
      'Other': 'bg-teal-100 text-teal-800'
    };
    return colors[sportType] || 'bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    console.log('Teams component mounted, user:', user);
    console.log('API Base URL:', import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
    
    if (user?.id) {
      fetchAllTeams();
      fetchMyTeams();
    } else {
      console.log('User not available yet, waiting...');
    }
  }, [user]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (activeTab === 'all') {
        fetchAllTeams();
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedSportFilter, activeTab]);

  const fetchAllTeams = async () => {
    try {
      console.log('Fetching all teams with filters:', { searchQuery, selectedSportFilter });
      setIsLoading(true);
      setError(''); // Clear previous errors
      
      const params = {};
      if (searchQuery.trim()) {
        params.name = searchQuery;
      }
      if (selectedSportFilter) {
        params.sportType = selectedSportFilter;
      }
      
      console.log('Calling searchTeams API with params:', params);
      const response = await searchTeams(params);
      console.log('All teams response:', response);
      setAllTeams(response.teams || []);
    } catch (err) {
      console.error('Error fetching all teams:', err);
      console.error('Error details:', err.response?.data || err.message);
      
      // More specific error message
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch teams';
      setError(`Failed to fetch teams: ${errorMessage}`);
      
      // Show network/server specific errors
      if (err.code === 'NETWORK_ERROR' || !err.response) {
        setError('Cannot connect to server. Please check if backend is running.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please check backend logs.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyTeams = async () => {
    try {
      console.log('Fetching my teams for user:', user?.id);
      if (user?.id) {
        const [createdResponse, joinedResponse] = await Promise.all([
          getCreatedTeams(user.id),
          getJoinedTeams(user.id)
        ]);
        console.log('My teams response:', { createdResponse, joinedResponse });
        setMyCreatedTeams(createdResponse.teams || []);
        setMyJoinedTeams(joinedResponse.teams || []);
      }
    } catch (err) {
      console.error('Error fetching my teams:', err);
      setError('Failed to fetch my teams');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'minAge' ? parseInt(value) || 0 : value
    }));
  };

  const handleLocationSelect = (locationData) => {
    if (locationData) {
      setFormData(prev => ({
        ...prev,
        location: locationData.name || locationData.address?.split(',')[0] || locationData.address,
        geoLocation: {
          type: 'Point',
          coordinates: locationData.coordinates,
          name: locationData.name,
          address: locationData.address,
          city: locationData.city,
          state: locationData.state,
          country: locationData.country,
          pincode: locationData.pincode,
          placeId: locationData.placeId,
          types: locationData.types,
          rating: locationData.rating,
          phone: locationData.phone,
          website: locationData.website
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        location: '',
        geoLocation: null
      }));
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await createTeam(formData);
      setSuccess('Team created successfully!');
      setShowCreateForm(false);
      resetForm();
      fetchAllTeams();
      fetchMyTeams();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('Updating team:', selectedTeam._id, 'with data:', formData);

    try {
      const response = await updateTeam(selectedTeam._id, formData);
      console.log('Update response:', response);
      
      setSuccess('Team updated successfully!');
      setShowEditForm(false);
      resetForm();
      
      // Refresh all team data first
      await Promise.all([
        fetchAllTeams(),
        fetchMyTeams()
      ]);
      
      // Then refresh the team details modal if it's open
      if (showTeamDetails && selectedTeam) {
        await refreshTeamDetails(selectedTeam._id);
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Failed to update team');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sportType: '',
      location: '',
      geoLocation: null,
      minAge: 0
    });
  };

  const handleEditTeam = (team) => {
    setSelectedTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
      sportType: team.sportType || '',
      location: formatLocation(team) || '',
      geoLocation: team.geoLocation || null,
      minAge: team.minAge || 0
    });
    setShowEditForm(true);
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) {
      return;
    }

    try {
      await deleteTeam(teamId, 'Team deleted by owner');
      setSuccess('Team deleted successfully!');
      fetchAllTeams();
      fetchMyTeams();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete team');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleViewTeam = async (team) => {
    try {
      console.log('Viewing team:', team);
      console.log('Current user:', user);
      console.log('Is team owner?', isTeamOwner(team));
      
      setSelectedTeam(team);
      // Use getTeamMembers which returns both members and joinRequests
      const response = await getTeamMembers(team._id);
      console.log('Team data response:', response);
      
      setTeamMembers(response.members || []);
      setJoinRequests(response.joinRequests || []);
      setShowTeamDetails(true);
    } catch (err) {
      console.error('Error fetching team details:', err);
      setError('Failed to fetch team details');
    }
  };

  const refreshTeamDetails = async (teamId) => {
    try {
      console.log('Refreshing team details for:', teamId);
      // Find the updated team from our current teams list
      const updatedTeam = [...allTeams, ...myCreatedTeams, ...myJoinedTeams]
        .find(team => team._id === teamId);
      
      console.log('Found updated team:', updatedTeam);
      
      if (updatedTeam) {
        setSelectedTeam(updatedTeam);
        // Use getTeamMembers which returns both members and joinRequests
        const response = await getTeamMembers(teamId);
        console.log('Refreshed team data:', response);
        
        setTeamMembers(response.members || []);
        setJoinRequests(response.joinRequests || []);
      }
    } catch (err) {
      console.error('Error refreshing team details:', err);
      setError('Failed to refresh team details');
    }
  };

  const isTeamOwner = (team) => {
    if (!user?.id || !team) return false;
    
    // Check multiple possible fields for team creator/owner
    const creatorId = team.createdBy?._id || team.createdBy || team.creator?._id || team.creator;
    const ownerId = team.owner?._id || team.owner;
    
    console.log('Checking team ownership:', {
      userId: user.id,
      creatorId,
      ownerId,
      team: team
    });
    
    return creatorId === user.id || ownerId === user.id;
  };

  const isTeamMember = (team) => {
    return team.members?.some(member => 
      (member._id === user?.id) || (member === user?.id)
    );
  };

  const hasPendingRequest = (team) => {
    return team.joinRequests?.some(request => 
      (request._id === user?.id) || (request === user?.id)
    );
  };

  const handleJoinRequest = async (teamId) => {
    try {
      console.log('Sending join request for team:', teamId);
      await sendJoinRequest(teamId, 'Requesting to join the team');
      setSuccess('Join request sent successfully!');
      
      // Refresh teams data
      fetchAllTeams();
      
      // If the team details modal is open for this team, refresh it
      if (showTeamDetails && selectedTeam?._id === teamId) {
        await refreshTeamDetails(teamId);
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error sending join request:', err);
      setError(err.response?.data?.message || 'Failed to send join request');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleApproveRequest = async (userId) => {
    try {
      console.log('Approving request for user:', userId, 'team:', selectedTeam._id);
      await approveJoinRequest(selectedTeam._id, userId, 'Welcome to the team!');
      setSuccess('Request approved successfully!');
      
      // Refresh team details
      await refreshTeamDetails(selectedTeam._id);
      
      // Also refresh all teams data
      await Promise.all([
        fetchAllTeams(),
        fetchMyTeams()
      ]);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error approving request:', err);
      setError(err.response?.data?.message || 'Failed to approve request');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      console.log('Rejecting request for user:', userId, 'team:', selectedTeam._id);
      await rejectJoinRequest(selectedTeam._id, userId, 'Join request rejected');
      setSuccess('Request rejected successfully!');
      
      // Refresh team details
      await refreshTeamDetails(selectedTeam._id);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError(err.response?.data?.message || 'Failed to reject request');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleLeaveTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to leave this team?')) {
      return;
    }

    try {
      await leaveTeam(teamId, 'Left the team');
      setSuccess('Left team successfully!');
      setShowTeamDetails(false);
      fetchAllTeams();
      fetchMyTeams();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave team');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      await removeMember(selectedTeam._id, memberId, 'Removed from team');
      setSuccess('Member removed successfully!');
      handleViewTeam(selectedTeam);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
      setTimeout(() => setError(''), 3000);
    }
  };

  const closeTeamDetails = () => {
    setShowTeamDetails(false);
    setSelectedTeam(null);
    setTeamMembers([]);
    setJoinRequests([]);
  };

  const handleDeleteMember = async (teamId, userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      await deleteTeamMember(teamId, userId);
      setSuccess('Member removed successfully!');
      fetchTeamDetails(teamId);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
      setTimeout(() => setError(''), 3000);
    }
  };

  const isUserInTeam = (team) => {
    return team.members?.some(member => member._id === user?.id) || team.creator?._id === user?.id;
  };

  // Handle viewing user profile
  const handleViewUserProfile = (userToView) => {
    console.log('Selected user data:', userToView);
    console.log('User dob:', userToView.dob);
    console.log('User createdAt:', userToView.createdAt);
    console.log('User mobile:', userToView.mobile);
    console.log('User location:', userToView.location);
    setSelectedUser(userToView);
    setShowUserProfile(true);
  };

  const closeUserProfile = () => {
    setShowUserProfile(false);
    setSelectedUser(null);
    setShowMediaModal(false);
    setSelectedMedia(null);
    setMediaError('');
  };

  // Handle media viewing
  const handleViewMedia = (mediaItem) => {
    setSelectedMedia(mediaItem);
    setShowMediaModal(true);
    setMediaError('');
  };

  const closeMediaModal = () => {
    setShowMediaModal(false);
    setSelectedMedia(null);
    setMediaError('');
  };

  // Helper function for video thumbnail optimization
  const optimizeVideoUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) {
      return url;
    }
    
    try {
      const baseUrl = url.split('/upload/')[0];
      const fileName = url.split('/upload/')[1];
      return `${baseUrl}/upload/f_mp4,vc_h264,ac_aac,q_auto:good,fl_progressive/${fileName}`;
    } catch (error) {
      console.error('Error optimizing video URL:', error);
      return url;
    }
  };

  const hasUserRequestedToJoin = (team) => {
    return team.joinRequests?.some(request => request.user?._id === user?.id && request.status === 'pending');
  };

  // Function to open location in Google Maps
  const openGoogleMaps = (team) => {
    if (team.geoLocation?.coordinates && team.geoLocation.coordinates[0] && team.geoLocation.coordinates[1]) {
      const [lng, lat] = team.geoLocation.coordinates;
      const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=16`;
      window.open(googleMapsUrl, '_blank');
    } else if (team.location || formatLocation(team)) {
      const location = team.location || formatLocation(team);
      const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(location)}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  // Helper function to format location for display
  const formatLocation = (team) => {
    // Priority: address (string) > location coordinates
    if (team.address) {
      return team.address;
    } else if (team.location && team.location.coordinates) {
      const [lng, lat] = team.location.coordinates;
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
    return null;
  };

  const filterMyTeams = (teams) => {
    return teams.filter(team => {
      const matchesSearch = !myTeamsSearchQuery || 
        team.name.toLowerCase().includes(myTeamsSearchQuery.toLowerCase()) ||
        team.description?.toLowerCase().includes(myTeamsSearchQuery.toLowerCase());
      
      const matchesSport = !myTeamsSportFilter || team.sportType === myTeamsSportFilter;
      
      return matchesSearch && matchesSport;
    });
  };

  const TeamCard = ({ team, showOwnerActions = false, showMemberActions = false }) => (
    <div className={`bg-gradient-to-br ${getSportColor(team.sportType)} rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden`}>
      <div className="bg-white bg-opacity-90 backdrop-blur-sm p-6 h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{team.name}</h3>
              <div className="flex items-center space-x-2">
                {showOwnerActions && (
                  <>
                    <button
                      onClick={() => handleEditTeam(team)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit team"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team._id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete team"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleViewTeam(team)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="View team details"
                >
                  <Users className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mb-2">
              {isTeamOwner(team) && (
                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Owner
                </span>
              )}
              {team.sportType && (
                <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${getSportBadgeColor(team.sportType)}`}>
                  {team.sportType}
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
              Created by <span className="font-medium">{team.createdBy?.name || 'Unknown'}</span>
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>{team.members?.length || 0} members</span>
          </div>
          {formatLocation(team) && (
            <button
              onClick={() => openGoogleMaps(team)}
              className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors group cursor-pointer"
              title="Click to open in Google Maps"
            >
              <MapPin className="h-4 w-4 mr-2 text-red-500 group-hover:text-blue-500" />
              <div className="text-left">
                <div className="font-medium group-hover:text-blue-600">
                  {team.geoLocation?.name || formatLocation(team)}
                </div>
                {team.geoLocation?.address && (
                  <div className="text-xs text-gray-500 group-hover:text-blue-500 truncate">
                    {team.geoLocation.address}
                  </div>
                )}
              </div>
            </button>
          )}
          {team.minAge > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Min age: {team.minAge}</span>
            </div>
          )}
        </div>

        {team.description && (
          <p className="text-sm text-gray-600 mb-4">{team.description}</p>
        )}

        <div className="flex justify-end">
          {!showOwnerActions && !showMemberActions && !isTeamMember(team) && !hasPendingRequest(team) && (
            <button
              onClick={() => handleJoinRequest(team._id)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Request to Join
            </button>
          )}
          {hasPendingRequest(team) && (
            <span className="text-sm text-yellow-600 font-medium">Request Pending</span>
          )}
          {showMemberActions && (
            <button
              onClick={() => handleLeaveTeam(team._id)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center"
            >
              <UserMinus className="h-4 w-4 mr-1" />
              Leave Team
            </button>
          )}
          {showOwnerActions && (
            <span className="text-sm text-green-600 font-medium flex items-center">
              <Crown className="h-4 w-4 mr-1" />
              Your Team
            </span>
          )}
        </div>
      </div>
    </div>
  );

  // Add loading state while user is being authenticated
  if (!user || !user.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
          <p className="text-xs text-gray-400 mt-2">
            User: {user ? 'Available' : 'Not available'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
     

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Teams</h1>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Teams
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'my'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Teams
          </button>
        </div>

        {/* Teams Grid */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading teams...</p>
          </div>
        ) : (
          <>
            {activeTab === 'all' && (
              <>
                {/* Search and Filter Bar */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search teams by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="w-full sm:w-48">
                      <select
                        value={selectedSportFilter}
                        onChange={(e) => setSelectedSportFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Sports</option>
                        {gameTypes.map((sport) => (
                          <option key={sport} value={sport}>{sport}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Active Filters Display */}
                  {(searchQuery || selectedSportFilter) && (
                    <div className="flex flex-wrap gap-2">
                      {searchQuery && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Search: "{searchQuery}"
                          <button
                            onClick={() => setSearchQuery('')}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )}
                      {selectedSportFilter && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Sport: {selectedSportFilter}
                          <button
                            onClick={() => setSelectedSportFilter('')}
                            className="ml-2 text-green-600 hover:text-green-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allTeams.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
                      <p className="text-gray-500">
                        {searchQuery || selectedSportFilter 
                          ? 'Try adjusting your search or filter criteria' 
                          : 'Be the first to create a team!'
                        }
                      </p>
                    </div>
                  ) : (
                    allTeams.map((team) => (
                      <TeamCard key={team._id} team={team} />
                    ))
                  )}
                </div>
              </>
            )}

            {activeTab === 'my' && (
              <div className="space-y-8">
                {/* Search and Filter Bar for My Teams */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search my teams..."
                        value={myTeamsSearchQuery}
                        onChange={(e) => setMyTeamsSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="w-full sm:w-48">
                      <select
                        value={myTeamsSportFilter}
                        onChange={(e) => setMyTeamsSportFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Sports</option>
                        {gameTypes.map((sport) => (
                          <option key={sport} value={sport}>{sport}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Active Filters Display for My Teams */}
                  {(myTeamsSearchQuery || myTeamsSportFilter) && (
                    <div className="flex flex-wrap gap-2">
                      {myTeamsSearchQuery && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Search: "{myTeamsSearchQuery}"
                          <button
                            onClick={() => setMyTeamsSearchQuery('')}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )}
                      {myTeamsSportFilter && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Sport: {myTeamsSportFilter}
                          <button
                            onClick={() => setMyTeamsSportFilter('')}
                            className="ml-2 text-green-600 hover:text-green-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Created Teams */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Crown className="h-5 w-5 mr-2 text-yellow-500" />
                    Teams I Created ({filterMyTeams(myCreatedTeams).length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filterMyTeams(myCreatedTeams).length === 0 ? (
                      <div className="col-span-full text-center py-8">
                        <Crown className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">
                          {myTeamsSearchQuery || myTeamsSportFilter 
                            ? 'No created teams match your criteria' 
                            : 'No teams created yet'
                          }
                        </p>
                      </div>
                    ) : (
                      filterMyTeams(myCreatedTeams).map((team) => (
                        <TeamCard key={team._id} team={team} showOwnerActions={true} />
                      ))
                    )}
                  </div>
                </div>

                {/* Joined Teams */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-500" />
                    Teams I Joined ({filterMyTeams(myJoinedTeams).length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filterMyTeams(myJoinedTeams).length === 0 ? (
                      <div className="col-span-full text-center py-8">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">
                          {myTeamsSearchQuery || myTeamsSportFilter 
                            ? 'No joined teams match your criteria' 
                            : 'Haven\'t joined any teams yet'
                          }
                        </p>
                      </div>
                    ) : (
                      filterMyTeams(myJoinedTeams).map((team) => (
                        <TeamCard key={team._id} team={team} showMemberActions={true} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Create New Team</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Thunder Bolts"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sport Type *
                  </label>
                  <select
                    name="sportType"
                    value={formData.sportType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select sport type</option>
                    {gameTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Location *
                  </label>
                  <LocationInput
                    value={formData.geoLocation ? {
                      name: formData.geoLocation.name,
                      address: formData.geoLocation.address || formData.location,
                      coordinates: formData.geoLocation.coordinates,
                      lat: formData.geoLocation.coordinates?.[1],
                      lng: formData.geoLocation.coordinates?.[0]
                    } : null}
                    onChange={handleLocationSelect}
                    placeholder="Enter team location, home ground, city..."
                    required={false}
                  />
                  {formData.location && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center text-sm text-green-800">
                        <MapPin size={14} className="mr-2" />
                        <span className="font-medium">Team location: </span>
                        <span className="ml-1">{formData.location}</span>
                      </div>
                      {formData.geoLocation?.address && (
                        <div className="text-xs text-green-600 mt-1 ml-5">
                          {formData.geoLocation.address}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Age
                  </label>
                  <input
                    type="number"
                    name="minAge"
                    value={formData.minAge}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0 for no age restriction"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Tell others about your team..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creating...' : 'Create Team'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {showEditForm && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Edit Team</h3>
                <button
                  onClick={() => setShowEditForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpdateTeam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Thunder Bolts"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sport Type *
                  </label>
                  <select
                    name="sportType"
                    value={formData.sportType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select sport type</option>
                    {gameTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Location *
                  </label>
                  <LocationInput
                    value={formData.geoLocation ? {
                      name: formData.geoLocation.name,
                      address: formData.geoLocation.address || formData.location,
                      coordinates: formData.geoLocation.coordinates,
                      lat: formData.geoLocation.coordinates?.[1],
                      lng: formData.geoLocation.coordinates?.[0]
                    } : null}
                    onChange={handleLocationSelect}
                    placeholder="Enter team location, home ground, city..."
                    required={false}
                  />
                  {formData.location && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center text-sm text-green-800">
                        <MapPin size={14} className="mr-2" />
                        <span className="font-medium">Team location: </span>
                        <span className="ml-1">{formData.location}</span>
                      </div>
                      {formData.geoLocation?.address && (
                        <div className="text-xs text-green-600 mt-1 ml-5">
                          {formData.geoLocation.address}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Age
                  </label>
                  <input
                    type="number"
                    name="minAge"
                    value={formData.minAge}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0 for no age restriction"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Tell others about your team..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Updating...' : 'Update Team'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Team Details Modal */}
      {showTeamDetails && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedTeam.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedTeam.members?.length || 0} members
                  </p>
                </div>
                <button
                  onClick={() => setShowTeamDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Team Info */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Creator</h4>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Crown className="h-4 w-4 mr-2 text-yellow-500" />
                      {selectedTeam.createdBy?.name || selectedTeam.creator?.name || 'Unknown'}
                    </p>
                  </div>
                  {selectedTeam.sportType && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Sport Type</h4>
                      <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${getSportBadgeColor(selectedTeam.sportType)}`}>
                        {selectedTeam.sportType}
                      </span>
                    </div>
                  )}
                  {formatLocation(selectedTeam) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Location</h4>
                      <p className="text-sm text-gray-600 flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {formatLocation(selectedTeam)}
                      </p>
                    </div>
                  )}
                  {selectedTeam.minAge > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Minimum Age</h4>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {selectedTeam.minAge} years
                      </p>
                    </div>
                  )}
                </div>
                {selectedTeam.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{selectedTeam.description}</p>
                  </div>
                )}
              </div>

              {/* Members Section */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">
                  Team Members ({teamMembers?.length || 0})
                </h4>
                {teamMembers?.length === 0 ? (
                  <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">No members yet</p>
                ) : (
                  <div className="space-y-3">
                    {teamMembers?.map((member) => (
                      <div key={member._id} className="flex items-center justify-between bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <Users className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 flex items-center">
                              <button
                                onClick={() => handleViewUserProfile(member)}
                                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
                              >
                                {member.name}
                              </button>
                              {(member._id === selectedTeam.createdBy?._id || member._id === selectedTeam.creator?._id) && (
                                <Crown className="h-3 w-3 ml-2 text-yellow-500" title="Team Owner" />
                              )}
                            </p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                          </div>
                        </div>
                        {/* Only show remove button for team owner and not for the owner themselves */}
                        {isTeamOwner(selectedTeam) && member._id !== user?.id && member._id !== selectedTeam.createdBy?._id && (
                          <button
                            onClick={() => handleRemoveMember(member._id)}
                            className="text-red-600 hover:text-red-700 transition-colors p-1 rounded"
                            title="Remove member"
                          >
                            <UserMinus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Join Requests Section */}
              {console.log('Rendering join requests:', joinRequests)}
              {console.log('Is team owner?', isTeamOwner(selectedTeam))}
              {joinRequests && joinRequests.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">
                    Join Requests ({joinRequests.length})
                  </h4>
                  <div className="space-y-3">
                    {joinRequests.map((request) => {
                        console.log('Rendering request:', request);
                        return (
                          <div key={request._id || request.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start flex-1">
                                {/* Profile Image or Placeholder */}
                                <div className="relative mr-4 flex-shrink-0">
                                  {request.profileImage ? (
                                    <img 
                                      src={request.profileImage} 
                                      alt={request.name} 
                                      className="h-12 w-12 rounded-full object-cover border-2 border-yellow-300"
                                    />
                                  ) : (
                                    <div className="h-12 w-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center border-2 border-yellow-300">
                                      <User className="h-6 w-6 text-white" />
                                    </div>
                                  )}
                                  {/* Media count indicator */}
                                  {request.media && request.media.length > 0 && (
                                    <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                      {request.media.length}
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <div>
                                      <p className="text-sm font-semibold text-gray-900">
                                        {request.name || request.user?.name || request.requester?.name || 'Unknown User'}
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        {request.email || request.user?.email || request.requester?.email || 'No email'}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {/* User stats in a compact row */}
                                  <div className="flex items-center space-x-4 mb-2 text-xs text-gray-500">
                                    <div className="flex items-center">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      <span>
                                        {request.dob 
                                          ? `${Math.floor((new Date() - new Date(request.dob)) / (365.25 * 24 * 60 * 60 * 1000))} years`
                                          : 'Age N/A'}
                                      </span>
                                    </div>
                                    {request.location && (
                                      <div className="flex items-center">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        <span className="truncate max-w-20">{request.location}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center">
                                      <Play className="h-3 w-3 mr-1 text-blue-500" />
                                      <span>{request.media?.length || 0} media</span>
                                    </div>
                                  </div>

                                  <p className="text-xs text-yellow-700 mb-2">
                                    📅 Requested: {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Recently'}
                                  </p>
                                  
                                  {request.reason && (
                                    <p className="text-xs text-gray-700 italic bg-white bg-opacity-50 rounded px-2 py-1">
                                      💬 "{request.reason}"
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Action buttons */}
                              {isTeamOwner(selectedTeam) && (
                                <div className="flex flex-col space-y-2 ml-4">
                                  {/* View Profile Button */}
                                  <button
                                    onClick={() => handleViewUserProfile(request)}
                                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                                    title="View full profile"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => handleApproveRequest(request._id || request.id)}
                                      className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                                      title="Approve request"
                                    >
                                      <Check className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleRejectRequest(request._id || request.id)}
                                      className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                                      title="Reject request"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              )}
                              
                              {/* For non-owners, just show pending status */}
                              {!isTeamOwner(selectedTeam) && (
                                <span className="text-xs text-yellow-600 font-medium px-3 py-1 bg-yellow-100 rounded-full">
                                  ⏳ Pending
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Show message if team owner but no join requests */}
              {isTeamOwner(selectedTeam) && (!joinRequests || joinRequests.length === 0) && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Join Requests</h4>
                  <p className="text-sm text-gray-500 italic">No pending join requests</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                {/* Show join button if user is not in team and hasn't requested */}
                {!isTeamMember(selectedTeam) && !isTeamOwner(selectedTeam) && !hasPendingRequest(selectedTeam) && (
                  <button
                    onClick={() => handleJoinRequest(selectedTeam._id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Request to Join
                  </button>
                )}
                
                {/* Show leave button if user is a member but not the owner */}
                {isTeamMember(selectedTeam) && !isTeamOwner(selectedTeam) && (
                  <button
                    onClick={() => handleLeaveTeam(selectedTeam._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    Leave Team
                  </button>
                )}
                
                {/* Show edit button if user is the owner */}
                {isTeamOwner(selectedTeam) && (
                  <button
                    onClick={() => {
                      handleEditTeam(selectedTeam);
                      setShowTeamDetails(false);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Team
                  </button>
                )}

                <button
                  onClick={() => setShowTeamDetails(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showUserProfile && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                    <p className="text-sm text-gray-500">Player Profile</p>
                  </div>
                </div>
                <button
                  onClick={closeUserProfile}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Profile Image */}
              {selectedUser.profileImage ? (
                <div className="mb-6 text-center">
                  <img
                    src={selectedUser.profileImage}
                    alt={selectedUser.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-blue-100"
                  />
                </div>
              ) : (
                <div className="mb-6 text-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center border-4 border-blue-100">
                    <Users className="h-16 w-16 text-white" />
                  </div>
                </div>
              )}

              {/* Profile Stats */}
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedUser.media?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Media</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {(() => {
                        if (selectedUser.age) return selectedUser.age;
                        if (selectedUser.dob) {
                          const birthDate = new Date(selectedUser.dob);
                          const today = new Date();
                          const age = today.getFullYear() - birthDate.getFullYear();
                          const monthDiff = today.getMonth() - birthDate.getMonth();
                          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                            return age - 1;
                          }
                          return age;
                        }
                        return 'N/A';
                      })()}
                    </div>
                    <div className="text-sm text-gray-600">Age</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-600">Joined</div>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="text-center mb-4">
                      <span className="font-bold text-gray-900 text-xl">{selectedUser.name}</span>
                      <span className="ml-3 bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">Player</span>
                    </div>
                    
                    {/* Contact Information */}
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-700">
                        <Mail className="h-4 w-4 mr-3 text-blue-500 flex-shrink-0" />
                        <span className="font-medium break-all">{selectedUser.email}</span>
                      </div>
                      
                      {selectedUser.mobile && (
                        <div className="flex items-center text-sm text-gray-700">
                          <Phone className="h-4 w-4 mr-3 text-green-500 flex-shrink-0" />
                          <span className="font-medium">{selectedUser.mobile}</span>
                        </div>
                      )}
                      
                      {selectedUser.location && (
                        <div className="flex items-center text-sm text-gray-700">
                          <MapPin className="h-4 w-4 mr-3 text-red-500 flex-shrink-0" />
                          <span className="font-medium">{selectedUser.location}</span>
                        </div>
                      )}
                      
                      {selectedUser.dob && (
                        <div className="flex items-center text-sm text-gray-700">
                          <Calendar className="h-4 w-4 mr-3 text-purple-500 flex-shrink-0" />
                          <span className="font-medium">Born {new Date(selectedUser.dob).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                      )}

                      {/* Show when user joined */}
                      {selectedUser.createdAt && (
                        <div className="flex items-center text-sm text-gray-700">
                          <User className="h-4 w-4 mr-3 text-blue-600 flex-shrink-0" />
                          <span className="font-medium">Member since {new Date(selectedUser.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long'
                          })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Media/Portfolio Section */}
              {selectedUser.media && selectedUser.media.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Play className="h-4 w-4 mr-2 text-blue-600" />
                    Media Portfolio ({selectedUser.media.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedUser.media.slice(0, 6).map((mediaItem, index) => (
                      <div 
                        key={index} 
                        className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-200"
                        onClick={() => handleViewMedia(mediaItem)}
                      >
                        {mediaItem.type === 'image' ? (
                          <>
                            <img
                              src={mediaItem.url}
                              alt={`Media ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="bg-white rounded-full p-2">
                                  <Eye className="h-4 w-4 text-gray-700" />
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Video thumbnail */}
                            <video
                              src={optimizeVideoUrl(mediaItem.url)}
                              className="w-full h-full object-cover"
                              muted
                              preload="metadata"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                              <div className="bg-white bg-opacity-90 rounded-full p-3 group-hover:bg-opacity-100 group-hover:scale-110 transition-all duration-200">
                                <Play className="h-6 w-6 text-gray-700 fill-current" />
                              </div>
                            </div>
                            <div className="absolute bottom-2 left-2">
                              <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                VIDEO
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  {selectedUser.media.length > 6 && (
                    <button
                      onClick={() => {/* TODO: Show all media */}}
                      className="text-sm text-blue-600 hover:text-blue-800 mt-3 block mx-auto underline"
                    >
                      View all {selectedUser.media.length} items
                    </button>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeUserProfile}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Viewing Modal */}
      {showMediaModal && selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-lg overflow-hidden">
            {/* Modal Header */}
            <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 z-10 p-4 flex items-center justify-between">
              <div className="text-white">
                <h3 className="font-semibold">{selectedUser?.name}'s {selectedMedia.type}</h3>
                <p className="text-sm text-gray-300">Portfolio Media</p>
              </div>
              <button
                onClick={closeMediaModal}
                className="text-white hover:text-gray-300 transition-colors bg-black bg-opacity-30 rounded-full p-2"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Media Content */}
            <div className="relative">
              {selectedMedia.type === 'image' ? (
                <img
                  src={selectedMedia.url}
                  alt="Portfolio Image"
                  className="w-full max-h-[80vh] object-contain"
                  onError={() => setMediaError('Failed to load image')}
                />
              ) : (
                <VideoPlayer 
                  videoUrl={selectedMedia.url}
                  onError={(error) => setMediaError(error)}
                />
              )}

              {/* Error State */}
              {mediaError && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600 font-medium">Failed to load media</p>
                      <p className="text-red-500 text-sm mt-1">{mediaError}</p>
                      <div className="mt-3 space-x-2">
                        <button 
                          onClick={() => setMediaError('')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Retry
                        </button>
                        <a 
                          href={selectedMedia.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Open Original
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
