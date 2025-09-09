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
  UserPlus,
  UserMinus,
  Search,
  Filter,
  GamepadIcon,
  Eye
} from 'lucide-react';
import { 
  getCreatedMatches, 
  createMatch, 
  updateMatch, 
  deleteMatch, 
  getMatchParticipants,
  getAllMatches,
  joinMatch,
  leaveMatch,
  getMyMatches
} from '../services/matchAPI';
import { useAuth } from '../context/AuthContext';

const Matches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [allMatches, setAllMatches] = useState([]);
  const [myCreatedMatches, setMyCreatedMatches] = useState([]);
  const [myJoinedMatches, setMyJoinedMatches] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
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

  // Fetch functions
  const fetchAllMatches = async () => {
    try {
      const response = await getAllMatches();
      setAllMatches(response.data || []);
    } catch (error) {
      console.error('Error fetching all matches:', error);
      setError('Failed to fetch matches');
    }
  };

  const fetchMyCreatedMatches = async () => {
    try {
      const response = await getCreatedMatches();
      setMyCreatedMatches(response.data || []);
    } catch (error) {
      console.error('Error fetching created matches:', error);
    }
  };

  const fetchMyJoinedMatches = async () => {
    try {
      const response = await getMyMatches();
      setMyJoinedMatches(response.data || []);
    } catch (error) {
      console.error('Error fetching joined matches:', error);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchAllMatches();
    fetchMyCreatedMatches();
    fetchMyJoinedMatches();
  }, []);

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

  // Event handlers
  const handleJoinMatch = async (matchId) => {
    setJoinLoading(matchId);
    try {
      await joinMatch(matchId);
      setSuccess('Successfully joined the match!');
      fetchAllMatches();
      fetchMyJoinedMatches();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to join match');
    } finally {
      setJoinLoading(null);
    }
  };

  const handleLeaveMatch = async (matchId) => {
    setJoinLoading(matchId);
    try {
      await leaveMatch(matchId);
      setSuccess('Successfully left the match!');
      fetchAllMatches();
      fetchMyJoinedMatches();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to leave match');
    } finally {
      setJoinLoading(null);
    }
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await createMatch(formData);
      setSuccess('Match created successfully!');
      setShowMatchForm(false);
      setFormData({
        title: '',
        gameType: '',
        date: '',
        location: '',
        maxPlayers: 10,
        description: ''
      });
      
      // Refresh all match data
      fetchAllMatches();
      fetchMyCreatedMatches();
      fetchMyJoinedMatches();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to create match');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewParticipants = async (match) => {
    try {
      setSelectedMatch(match);
      const response = await getMatchParticipants(match._id);
      setParticipants(response.data || []);
      setShowParticipants(true);
    } catch (error) {
      setError('Failed to fetch participants');
    }
  };

  // Utility functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMatchStatus = (match) => {
    const now = new Date();
    const matchDate = new Date(match.date);
    
    if (match.status === 'cancelled') return { text: 'Cancelled', color: 'text-red-600' };
    if (matchDate < now) return { text: 'Completed', color: 'text-gray-600' };
    if (matchDate.toDateString() === now.toDateString()) return { text: 'Today', color: 'text-orange-600' };
    return { text: 'Upcoming', color: 'text-green-600' };
  };

  // Filter matches based on active tab and search/filter criteria
  const getFilteredMatches = () => {
    let matches = [];
    
    switch (activeTab) {
      case 'all':
        matches = allMatches;
        break;
      case 'created':
        matches = myCreatedMatches;
        break;
      case 'joined':
        matches = myJoinedMatches;
        break;
      default:
        matches = allMatches;
    }

    // Apply search filter
    if (searchQuery) {
      matches = matches.filter(match =>
        match.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.gameType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply game type filter
    if (selectedGameFilter) {
      matches = matches.filter(match => match.gameType === selectedGameFilter);
    }

    return matches;
  };

  // Render match card
  const renderMatchCard = (match) => {
    const status = getMatchStatus(match);
    const creator = isMatchCreator(match);
    const participant = isUserParticipant(match);
    const canJoin = canJoinMatch(match);
    const canLeave = canLeaveMatch(match);

    return (
      <div key={match._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{match.title}</h3>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <GamepadIcon className="h-4 w-4 mr-1" />
              <span className="mr-4">{match.gameType}</span>
              <span className={`font-medium ${status.color}`}>{status.text}</span>
            </div>
          </div>
          {creator && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              Creator
            </span>
          )}
          {participant && !creator && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              Joined
            </span>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span>{formatDate(match.date)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            <span>{match.location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2 text-gray-400" />
            <span>{match.participants.length}/{match.maxPlayers} players</span>
          </div>
        </div>

        {match.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{match.description}</p>
        )}

        <div className="flex justify-between items-center">
          <button
            onClick={() => handleViewParticipants(match)}
            className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Players
          </button>

          <div className="flex gap-2">
            {canJoin && (
              <button
                onClick={() => handleJoinMatch(match._id)}
                disabled={joinLoading === match._id}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                {joinLoading === match._id ? 'Joining...' : 'Join'}
              </button>
            )}
            {canLeave && (
              <button
                onClick={() => handleLeaveMatch(match._id)}
                disabled={joinLoading === match._id}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserMinus className="h-4 w-4 mr-1" />
                {joinLoading === match._id ? 'Leaving...' : 'Leave'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Matches</h1>
            <p className="text-gray-600">Browse matches, create new games, and manage your participation</p>
          </div>
          <button
            onClick={() => setShowMatchForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Match
          </button>
        </div>

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

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            {[
              { id: 'all', label: 'Browse Matches', count: allMatches.length },
              { id: 'created', label: 'My Created', count: myCreatedMatches.length },
              { id: 'joined', label: 'My Joined', count: myJoinedMatches.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Search and Filter Bar */}
          <div className="p-4 bg-gray-50 flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search matches by title, location, or game..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <select
              value={selectedGameFilter}
              onChange={(e) => setSelectedGameFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Games</option>
              <option value="Football">Football</option>
              <option value="Cricket">Cricket</option>
              <option value="Basketball">Basketball</option>
              <option value="Tennis">Tennis</option>
              <option value="Badminton">Badminton</option>
              <option value="Volleyball">Volleyball</option>
            </select>
          </div>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredMatches().map(renderMatchCard)}
        </div>

        {/* Empty State */}
        {getFilteredMatches().length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'all' ? 'No matches available' : 
               activeTab === 'created' ? 'No matches created yet' : 'No matches joined yet'}
            </h3>
            <p className="text-gray-500">
              {activeTab === 'all' ? 'Be the first to create a match!' : 
               activeTab === 'created' ? 'Create your first match to get started.' : 'Join a match to see it here.'}
            </p>
          </div>
        )}
      </div>

      {/* Create Match Modal */}
      {showMatchForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New Match</h2>
              <button
                onClick={() => setShowMatchForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateMatch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter match title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Game Type</label>
                <select
                  required
                  value={formData.gameType}
                  onChange={(e) => setFormData({ ...formData, gameType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a game</option>
                  <option value="Football">Football</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Basketball">Basketball</option>
                  <option value="Tennis">Tennis</option>
                  <option value="Badminton">Badminton</option>
                  <option value="Volleyball">Volleyball</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Players</label>
                <input
                  type="number"
                  min="2"
                  max="50"
                  required
                  value={formData.maxPlayers}
                  onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter match description"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMatchForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Match'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Participants Modal */}
      {showParticipants && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Match Participants</h2>
              <button
                onClick={() => setShowParticipants(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {selectedMatch && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-900">{selectedMatch.title}</h3>
                <p className="text-sm text-gray-600">
                  {participants.length}/{selectedMatch.maxPlayers} players
                </p>
              </div>
            )}

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {participants.map((participant) => (
                <div key={participant._id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                  <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{participant.name}</p>
                    <p className="text-sm text-gray-600">{participant.email}</p>
                  </div>
                </div>
              ))}
            </div>

            {participants.length === 0 && (
              <p className="text-gray-500 text-center py-4">No participants yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Matches;
