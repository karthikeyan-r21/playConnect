import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Trophy, Filter, Search, Clock, CheckCircle, XCircle } from 'lucide-react';
import { getAllMatches, joinMatch } from '../services/matchAPI';
import { useAuth } from '../context/AuthContext';

const BrowseMatches = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [joiningMatchId, setJoiningMatchId] = useState(null);
  const [success, setSuccess] = useState('');

  const sports = ['Cricket', 'Football', 'Tennis', 'Basketball', 'Badminton', 'Volleyball', 'Table Tennis', 'Hockey'];

  // Extract unique locations from matches for filter dropdown
  const getUniqueLocations = () => {
    const locations = matches.map(match => match.location).filter(Boolean);
    return [...new Set(locations)].sort();
  };

  useEffect(() => {
    fetchAllMatches();
  }, []);

  useEffect(() => {
    filterMatches();
  }, [matches, searchTerm, selectedSport, selectedDate, selectedLocation]);

  const fetchAllMatches = async () => {
    try {
      setLoading(true);
      const response = await getAllMatches();
      // Handle backend response format
      const allMatches = response.matches || response || [];
      // Filter only upcoming matches (date not passed)
      const upcomingMatches = allMatches.filter(match => {
        const matchDate = new Date(match.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return matchDate >= today;
      });
      setMatches(upcomingMatches);
    } catch (err) {
      setError('Failed to fetch matches');
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterMatches = () => {
    let filtered = matches;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(match => 
        match.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.gameType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.createdBy?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sport filter
    if (selectedSport) {
      filtered = filtered.filter(match => match.gameType === selectedSport);
    }

    // Location filter
    if (selectedLocation) {
      filtered = filtered.filter(match => match.location === selectedLocation);
    }

    // Date filter
    if (selectedDate) {
      filtered = filtered.filter(match => {
        const matchDate = new Date(match.date).toISOString().split('T')[0];
        return matchDate === selectedDate;
      });
    }

    setFilteredMatches(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSport('');
    setSelectedDate('');
    setSelectedLocation('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleJoinMatch = async (matchId) => {
    try {
      setJoiningMatchId(matchId);
      await joinMatch(matchId);
      setSuccess('Successfully joined the match!');
      // Refresh matches to update participant count
      await fetchAllMatches();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error joining match:', err);
      setError(err.response?.data?.msg || 'Failed to join match');
      setTimeout(() => setError(''), 3000);
    } finally {
      setJoiningMatchId(null);
    }
  };

  const MatchCard = ({ match }) => {
    const isMatchFull = match.participants?.length >= match.maxPlayers;
    const availableSpots = match.maxPlayers - (match.participants?.length || 0);
    const isUserCreator = match.createdBy?._id === user?.id || match.createdBy === user?.id;
    const isUserJoined = match.participants?.some(participant => 
      participant._id === user?.id || participant === user?.id
    );
    // If user is creator, they are automatically considered as joined
    const isUserParticipant = isUserCreator || isUserJoined;
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{match.title}</h3>
              <p className="text-sm text-gray-500">
                Organized by {match.createdBy?.name || 'Unknown'}
                {isUserCreator && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">You</span>}
              </p>
            </div>
            <div className="ml-4 text-right">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                match.status === 'upcoming' 
                  ? 'bg-green-100 text-green-800' 
                  : match.status === 'completed'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {match.status || 'upcoming'}
              </span>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Trophy className="h-4 w-4 mr-2 text-blue-500" />
              <span className="font-medium">{match.gameType}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2 text-green-500" />
              <span>{formatDate(match.date)}</span>
              {match.time && (
                <>
                  <Clock className="h-4 w-4 ml-4 mr-2 text-purple-500" />
                  <span>{formatTime(match.time)}</span>
                </>
              )}
            </div>

            {match.location && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 text-red-500" />
                <span>{match.location}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-2 text-indigo-500" />
                <span>
                  <span className="font-medium">{match.participants?.length || 0}</span>
                  <span className="text-gray-400"> / </span>
                  <span className="font-medium">{match.maxPlayers}</span>
                  <span className="text-gray-400"> players</span>
                </span>
              </div>
              <div className="flex items-center">
                {isMatchFull ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800">
                    <XCircle className="h-3 w-3 mr-1" />
                    Full
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {availableSpots} spot{availableSpots !== 1 ? 's' : ''} left
                  </span>
                )}
              </div>
            </div>

            {match.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{match.description}</p>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100">
            {isUserCreator ? (
              <button 
                disabled
                className="w-full bg-blue-100 text-blue-700 border border-blue-200 py-2 px-4 rounded-lg cursor-default font-medium flex items-center justify-center"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Your Match
              </button>
            ) : isUserParticipant ? (
              <button 
                disabled
                className="w-full bg-red-100 text-red-700 border border-red-200 py-2 px-4 rounded-lg cursor-default font-medium flex items-center justify-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Joined
              </button>
            ) : isMatchFull ? (
              <button 
                disabled
                className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed font-medium flex items-center justify-center"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Match Full
              </button>
            ) : (
              <button 
                onClick={() => handleJoinMatch(match._id)}
                disabled={joiningMatchId === match._id}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50"
              >
                {joiningMatchId === match._id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Joining...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Join Match
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading matches...</p>
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
                <span className="font-medium">Back to Dashboard</span>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Browse Matches</h1>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search matches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Sport Filter */}
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Sports</option>
                {sports.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>

              {/* Location Filter */}
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Locations</option>
                {getUniqueLocations().map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>

              {/* Date Filter */}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              {filteredMatches.length} matches found
            </h2>
            <p className="text-sm text-gray-500">
              Showing upcoming matches from all users
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Success State */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        {/* Matches Grid */}
        {filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match) => (
              <MatchCard key={match._id} match={match} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {matches.length === 0 ? 'No upcoming matches' : 'No matches match your filters'}
            </h3>
            <p className="text-gray-500 mb-4">
              {matches.length === 0 
                ? 'Be the first to create a match!' 
                : 'Try adjusting your search criteria or clearing filters.'
              }
            </p>
            {matches.length === 0 && (
              <button
                onClick={() => navigate('/matches')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create First Match
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseMatches;
