import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Trophy,
  X,
  User,
  ArrowLeft,
  Home,
  Eye,
  UserPlus,
  UserMinus,
  Search,
  Filter,
  GamepadIcon
} from 'lucide-react';
import { matchAPI } from '../services/matchAPI';
import { useAuth } from '../context/AuthContext';

const Matches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myCreatedMatches, setMyCreatedMatches] = useState([]);
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [joinLoading, setJoinLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGameFilter, setSelectedGameFilter] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    gameType: '',
    date: '',
    location: '',
    maxPlayers: 10,
    description: ''
  });

  // Game type options
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

  // Sport color mapping - matching Teams page colors
  const getSportColors = (sport) => {
    const sportColors = {
      'Cricket': {
        gradient: 'from-blue-400 to-blue-600',
        badge: 'bg-blue-100 text-blue-800',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      'Football': {
        gradient: 'from-green-400 to-green-600',
        badge: 'bg-green-100 text-green-800',
        button: 'bg-green-600 hover:bg-green-700'
      },
      'Basketball': {
        gradient: 'from-orange-400 to-orange-600',
        badge: 'bg-orange-100 text-orange-800',
        button: 'bg-orange-600 hover:bg-orange-700'
      },
      'Tennis': {
        gradient: 'from-yellow-400 to-yellow-600',
        badge: 'bg-yellow-100 text-yellow-800',
        button: 'bg-yellow-600 hover:bg-yellow-700'
      },
      'Badminton': {
        gradient: 'from-purple-400 to-purple-600',
        badge: 'bg-purple-100 text-purple-800',
        button: 'bg-purple-600 hover:bg-purple-700'
      },
      'Volleyball': {
        gradient: 'from-red-400 to-red-600',
        badge: 'bg-red-100 text-red-800',
        button: 'bg-red-600 hover:bg-red-700'
      },
      'Table Tennis': {
        gradient: 'from-pink-400 to-pink-600',
        badge: 'bg-pink-100 text-pink-800',
        button: 'bg-pink-600 hover:bg-pink-700'
      },
      'Hockey': {
        gradient: 'from-indigo-400 to-indigo-600',
        badge: 'bg-indigo-100 text-indigo-800',
        button: 'bg-indigo-600 hover:bg-indigo-700'
      },
      'Baseball': {
        gradient: 'from-gray-400 to-gray-600',
        badge: 'bg-gray-100 text-gray-800',
        button: 'bg-gray-600 hover:bg-gray-700'
      },
      'Other': {
        gradient: 'from-teal-400 to-teal-600',
        badge: 'bg-teal-100 text-teal-800',
        button: 'bg-teal-600 hover:bg-teal-700'
      }
    };

    return sportColors[sport] || {
      gradient: 'from-gray-400 to-gray-600',
      badge: 'bg-gray-100 text-gray-800',
      button: 'bg-gray-600 hover:bg-gray-700'
    };
  };

  useEffect(() => {
    fetchMyCreatedMatches();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMyCreatedMatches();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedGameFilter]);

  // Clear messages after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);



  // Fetch matches created by current user
  const fetchMyCreatedMatches = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (searchQuery.trim()) {
        params.title = searchQuery;
      }
      if (selectedGameFilter) {
        params.gameType = selectedGameFilter;
      }
      const response = await matchAPI.getMyMatches(params);
      setMyCreatedMatches(response.matches || response.data || []);
    } catch (error) {
      console.error('Error fetching my created matches:', error);
      setError('Failed to load created matches');
    } finally {
      setIsLoading(false);
    }
  };





  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (editingMatch) {
        // Update existing match
        await matchAPI.updateMatch(editingMatch._id, formData);
        setSuccessMessage('Match updated successfully!');
      } else {
        // Create new match
        await matchAPI.createMatch(formData);
        setSuccessMessage('Match created successfully!');
      }
      
      setShowMatchForm(false);
      setEditingMatch(null);
      setFormData({
        title: '',
        gameType: '',
        date: '',
        time: '',
        location: '',
        maxParticipants: 10,
        description: '',
        requirements: ''
      });
      
      // Refresh matches
      await fetchMyCreatedMatches();
      
    } catch (error) {
      console.error('Error submitting match:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to save match');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (match) => {
    setEditingMatch(match);
    setFormData({
      title: match.title,
      gameType: match.gameType,
      date: new Date(match.date).toISOString().slice(0, 16),
      location: match.location,
      maxPlayers: match.maxPlayers,
      description: match.description || ''
    });
    setShowEditForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await matchAPI.updateMatch(editingMatch._id, formData);
      setSuccess('Match updated successfully!');
      setShowEditForm(false);
      setEditingMatch(null);
      setFormData({
        title: '',
        gameType: '',
        date: '',
        location: '',
        maxPlayers: 10,
        description: ''
      });
      
      // Refresh matches
      fetchMyCreatedMatches();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to update match');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (matchId) => {
    if (!window.confirm('Are you sure you want to cancel this match?')) {
      return;
    }

    try {
      await matchAPI.deleteMatch(matchId);
      setSuccess('Match cancelled successfully!');
      
      // Refresh matches
      fetchMyCreatedMatches();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to cancel match');
    }
  };



  const handleViewParticipants = async (match) => {
    try {
      setSelectedMatch(match);
      setIsLoading(true);
      setError(null); // Clear any previous errors
      
      console.log('Fetching participants for match:', match._id);
      const response = await matchAPI.getMatch(match._id);
      console.log('API Response:', response);
      
      // The backend returns { match } so we need to access response.match.participants
      const matchData = response.match || response;
      console.log('Match data:', matchData);
      console.log('Participants:', matchData.participants);
      
      setParticipants(matchData.participants || []);
      setShowParticipants(true);
    } catch (error) {
      const errorMessage = error.response?.data?.msg || error.response?.data?.message || 'Failed to fetch participants';
      setError(errorMessage);
      console.error('Error fetching participants:', error);
      console.error('Error response:', error.response);
    } finally {
      setIsLoading(false);
    }
  };

  const closeParticipantsModal = () => {
    setShowParticipants(false);
    setSelectedMatch(null);
    setParticipants([]);
  };

  // Helper functions
  const isMatchCreator = (match) => {
    return match.createdBy?._id === user?.id;
  };

  const isUserParticipant = (match) => {
    return match.participants?.some(p => p._id === user?.id);
  };

  const canJoinMatch = (match) => {
    const now = new Date();
    const matchDate = new Date(match.date);
    return (
      matchDate > now && // Future match
      match.status !== 'cancelled' &&
      !isUserParticipant(match) &&
      !isMatchCreator(match) &&
      match.participants.length < match.maxPlayers
    );
  };

  const canLeaveMatch = (match) => {
    const now = new Date();
    const matchDate = new Date(match.date);
    return (
      matchDate > now && // Future match
      match.status !== 'cancelled' &&
      isUserParticipant(match) &&
      !isMatchCreator(match)
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to determine match status based on date
  const getMatchStatus = (matchDate, currentStatus) => {
    const now = new Date();
    const match = new Date(matchDate);
    
    // If match date has passed, mark as finished
    if (match < now) {
      return 'finished';
    }
    
    // If current status is cancelled, keep it cancelled
    if (currentStatus === 'cancelled') {
      return 'cancelled';
    }
    
    // Otherwise, it's upcoming
    return 'upcoming';
  };

  const MatchCard = ({ match, showActions = true }) => {
    const dynamicStatus = getMatchStatus(match.date, match.status);
    const isCreator = isMatchCreator(match);
    const isParticipant = isUserParticipant(match);
    const canJoin = canJoinMatch(match);
    const canLeave = canLeaveMatch(match);
    const colors = getSportColors(match.gameType);
    
    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-200">
        {/* Sport gradient header */}
        <div className={`h-2 bg-gradient-to-r ${colors.gradient}`}></div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{match.title}</h3>
              <div className="flex items-center space-x-2">
                <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${colors.badge}`}>
                  {match.gameType}
                </span>
              <button 
                onClick={() => handleViewParticipants(match)}
                className="text-gray-400 hover:text-gray-600 transition-colors relative ml-1"
                title="View team members"
              >
                <Eye className="h-4 w-4" />
                {match.participants?.length > 0 && (
                  <span className="absolute -top-1 -right-6 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                    {match.participants.length}
                  </span>
                )}
              </button>
            </div>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            dynamicStatus === 'upcoming' ? 'bg-green-100 text-green-800' :
            dynamicStatus === 'finished' ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            {dynamicStatus}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-green-500" />
            {formatDate(match.date)}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-red-500" />
            {match.location}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2 text-indigo-500" />
            {match.participants?.length || 0} / {match.maxPlayers} players
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-2 text-purple-500" />
            Created by {isCreator ? 'you' : match.createdBy?.name || 'Unknown'}
          </div>
        </div>

        {match.description && (
          <p className="text-sm text-gray-600 mb-4">{match.description}</p>
        )}

        {showActions && (
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {isCreator && <span className="text-blue-600 font-medium">Your match</span>}
              {isParticipant && !isCreator && <span className="text-green-600 font-medium">Joined</span>}
            </div>
            <div className="flex space-x-2">
              {/* Creator actions */}
              {isCreator && dynamicStatus === 'upcoming' && (
                <>
                  <button 
                    onClick={() => handleEdit(match)}
                    className={`text-white px-3 py-1.5 rounded-lg transition-colors text-xs font-medium ${colors.button}`}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(match._id)}
                    className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
                  >
                    Cancel
                  </button>
                </>
              )}
              
              {/* Join/Leave actions for non-creators */}
              {!isCreator && canJoin && (
                <button 
                  onClick={() => handleJoinMatch(match._id)}
                  disabled={joinLoading === match._id}
                  className={`text-white px-3 py-1.5 rounded-lg transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${colors.button}`}
                >
                  {joinLoading === match._id ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <>
                      <UserPlus className="h-3 w-3 mr-1" />
                      Join
                    </>
                  )}
                </button>
              )}
              
              {!isCreator && canLeave && (
                <button 
                  onClick={() => handleLeaveMatch(match._id)}
                  disabled={joinLoading === match._id}
                  className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {joinLoading === match._id ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <>
                      <UserMinus className="h-3 w-3 mr-1" />
                      Leave
                    </>
                  )}
                </button>
              )}
              
              {/* Status messages */}
              {dynamicStatus === 'cancelled' && (
                <span className="text-xs text-gray-500 italic">Match cancelled</span>
              )}
              {dynamicStatus === 'finished' && (
                <span className="text-xs text-gray-500 italic">Match finished</span>
              )}
              {!canJoin && !canLeave && !isCreator && dynamicStatus === 'upcoming' && (
                <span className="text-xs text-gray-500 italic">
                  {match.participants?.length >= match.maxPlayers ? 'Match full' : 
                   isParticipant ? 'Already joined' : 'Cannot join'}
                </span>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    );
  };

  // Filter matches based on search and game type
  const getFilteredMatches = (matches) => {
    return matches.filter(match => {
      const matchesSearch = !searchQuery || 
        match.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.gameType.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesGameFilter = !selectedGameFilter || match.gameType === selectedGameFilter;
      
      return matchesSearch && matchesGameFilter;
    });
  };

  // Get matches to display - only user's created matches
  const getMatchesToDisplay = () => {
    return getFilteredMatches(myCreatedMatches);
  };

  // Handle edit match
  const handleEditMatch = (match) => {
    setFormData({
      title: match.title,
      gameType: match.gameType,
      location: match.location,
      date: match.date.split('T')[0],
      time: match.time,
      maxParticipants: match.maxParticipants,
      description: match.description || '',
      requirements: match.requirements || ''
    });
    setEditingMatch(match);
    setShowMatchForm(true);
  };

  // Handle delete match
  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm('Are you sure you want to delete this match?')) return;
    
    try {
      setIsLoading(true);
      await matchAPI.deleteMatch(matchId);
      setSuccessMessage('Match deleted successfully!');
      await fetchMyCreatedMatches(); // Refresh the matches list
    } catch (error) {
      console.error('Error deleting match:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to delete match');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle closing the form modal
  const handleCloseForm = () => {
    setShowMatchForm(false);
    setEditingMatch(null);
    setFormData({
      title: '',
      gameType: '',
      date: '',
      time: '',
      location: '',
      maxParticipants: 10,
      description: '',
      requirements: ''
    });
  };

  // Handle join match
  const handleJoinMatch = async (matchId) => {
    try {
      setJoinLoading(matchId);
      await matchAPI.joinMatch(matchId);
      setSuccessMessage('Successfully joined match!');
      await fetchMyCreatedMatches();
    } catch (error) {
      console.error('Error joining match:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to join match');
    } finally {
      setJoinLoading(null);
    }
  };

  // Handle leave match
  const handleLeaveMatch = async (matchId) => {
    try {
      setJoinLoading(matchId);
      await matchAPI.leaveMatch(matchId);
      setSuccessMessage('Successfully left match!');
      await fetchMyCreatedMatches();
    } catch (error) {
      console.error('Error leaving match:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to leave match');
    } finally {
      setJoinLoading(null);
    }
  };

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
              <h1 className="text-xl font-semibold text-gray-900">My Matches</h1>
            </div>
            <button
              onClick={() => setShowMatchForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Match
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search your matches by title, location, or game..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <select
                value={selectedGameFilter}
                onChange={(e) => setSelectedGameFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-8"
              >
                <option value="">All Games</option>
                {gameTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Matches Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading matches...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getMatchesToDisplay().length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No matches created yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Create your first match to get started!
                </p>
                <button
                  onClick={() => setShowMatchForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Create Your First Match
                </button>
              </div>
            ) : (
              getMatchesToDisplay().map((match) => (
                <MatchCard 
                  key={match._id} 
                  match={match}
                  canEdit={true}
                  canDelete={true}
                  onEdit={() => handleEditMatch(match)}
                  onDelete={() => handleDeleteMatch(match._id)}
                  showParticipants={true}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Create Match Modal */}
      {showMatchForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingMatch ? 'Edit Match' : 'Create New Match'}
                </h3>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Match Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Friday Night Football"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Game Type *
                  </label>
                  <select
                    name="gameType"
                    value={formData.gameType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select game type</option>
                    {gameTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Central Park Football Ground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Players
                  </label>
                  <input
                    type="number"
                    name="maxPlayers"
                    value={formData.maxPlayers}
                    onChange={handleInputChange}
                    min="2"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    placeholder="Any additional details about the match..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (editingMatch ? 'Updating...' : 'Creating...') : (editingMatch ? 'Update Match' : 'Create Match')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Match Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Edit Match</h3>
                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingMatch(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Match Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Friday Night Football"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Game Type *
                  </label>
                  <select
                    name="gameType"
                    value={formData.gameType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select game type</option>
                    {gameTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Central Park Football Ground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Players
                  </label>
                  <input
                    type="number"
                    name="maxPlayers"
                    value={formData.maxPlayers}
                    onChange={handleInputChange}
                    min="2"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    placeholder="Any additional details about the match..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingMatch(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Updating...' : 'Update Match'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Participants Modal */}
      {showParticipants && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Team Members</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedMatch?.title} - {participants.length} participants
                  </p>
                </div>
                <button
                  onClick={closeParticipantsModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-gray-500">Loading participants...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 font-medium">Error loading participants</p>
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                    <button 
                      onClick={() => handleViewParticipants(selectedMatch)}
                      className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : participants.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No participants yet</p>
                  <p className="text-gray-400 text-sm">Only you have joined this match</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {participants.map((participant, index) => (
                    <div key={participant._id || participant.id || index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <User className="h-5 w-5 text-gray-400 mr-2" />
                            <h4 className="font-medium text-gray-900">{participant.name || 'Unknown User'}</h4>
                            {participant._id === selectedMatch?.createdBy?._id && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Creator
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                              </svg>
                              <span>{participant.email}</span>
                            </div>
                            
                            {participant.mobile && participant.mobile !== 'Not provided' && (
                              <div className="flex items-center text-sm text-gray-600">
                                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>{participant.mobile}</span>
                              </div>
                            )}
                            
                            {participant.location && participant.location !== 'Not provided' && (
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>{participant.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeParticipantsModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Matches;
