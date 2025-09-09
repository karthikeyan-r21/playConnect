import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Trophy, Filter, Search, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
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
      }
    };

    return sportColors[sport] || {
      gradient: 'from-gray-400 to-gray-600',
      badge: 'bg-gray-100 text-gray-800',
      button: 'bg-gray-600 hover:bg-gray-700'
    };
  };

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
    const colors = getSportColors(match.gameType);
    
    return (
      <div className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden bg-white border border-gray-200">
        {/* Sport gradient header */}
        <div className={`h-2 bg-gradient-to-r ${colors.gradient}`}></div>
        
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
              <span className={`font-medium px-2.5 py-0.5 rounded-full text-xs ${colors.badge}`}>
                {match.gameType}
              </span>
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
              <div className={`flex items-center ${colors.text}`}>
                <Users className={`h-4 w-4 mr-2 ${colors.icon}`} />
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
              <p className={`text-sm line-clamp-2 ${colors.text} opacity-80`}>{match.description}</p>
            )}
          </div>

          <div className={`pt-4 border-t ${colors.border}`}>
            {isUserCreator ? (
              <button 
                disabled
                className={`w-full ${colors.badge} border ${colors.border} py-2 px-4 rounded-lg cursor-default font-medium flex items-center justify-center`}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Your Match
              </button>
            ) : isUserParticipant ? (
              <button 
                disabled
                className="w-full bg-emerald-100 text-emerald-700 border border-emerald-200 py-2 px-4 rounded-lg cursor-default font-medium flex items-center justify-center"
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
                className={`w-full text-white py-2 px-4 rounded-lg transition-colors font-medium flex items-center justify-center disabled:opacity-50 ${colors.button}`}
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm mx-auto">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Matches</h3>
            <p className="text-gray-600">Discovering exciting games for you...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
        }
        
        .pulse-glow {
          animation: pulse-glow 2s infinite;
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 hover:text-blue-600 mr-4 transition-colors group"
              >
                <ArrowLeft className="h-5 w-5 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" />
               
              </button>
              <div className="h-6 w-px bg-gray-300 mr-4"></div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center">
                Browse Matches
                <Trophy className="h-6 w-6 text-blue-600 mr-4" />

              </h1>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                showFilters 
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                  : 'bg-blue-600 text-white border-2 border-blue-600 hover:bg-blue-700 hover:border-blue-700'
              }`}
            >
              <Filter className={`h-4 w-4 mr-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Filters */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8 animate-fade-in">
            <div className="flex items-center mb-4">
              <Filter className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Filter Matches</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Enhanced Search */}
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search matches, sports, locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                />
              </div>

              {/* Enhanced Sport Filter */}
              <div className="relative">
                <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 appearance-none bg-white"
                >
                  <option value="">All Sports</option>
                  {sports.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>

              {/* Enhanced Location Filter */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 appearance-none bg-white"
                >
                  <option value="">All Locations</option>
                  {getUniqueLocations().map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {/* Enhanced Date Filter */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                />
              </div>

              {/* Enhanced Clear Filters */}
              <button
                onClick={clearFilters}
                className="px-6 py-3 text-gray-600 hover:text-white border border-gray-300 rounded-xl hover:bg-red-500 hover:border-red-500 transition-all duration-200 font-medium flex items-center justify-center group"
              >
                <XCircle className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
                Clear All
              </button>
            </div>
            
            {/* Active Filters Indicator */}
            {(searchTerm || selectedSport || selectedLocation || selectedDate) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Active filters:</span>
                  {searchTerm && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Search: "{searchTerm}"
                    </span>
                  )}
                  {selectedSport && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Sport: {selectedSport}
                    </span>
                  )}
                  {selectedLocation && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Location: {selectedLocation}
                    </span>
                  )}
                  {selectedDate && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Date: {selectedDate}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Results Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {filteredMatches.length} {filteredMatches.length === 1 ? 'Match' : 'Matches'} Found
                </h2>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  Showing upcoming matches from all users
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Available
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                Full
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                Joined
              </div>
            </div>
          </div>
          
          {filteredMatches.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="font-semibold text-blue-600">
                    {filteredMatches.filter(m => !m.participants || m.participants.length < m.maxPlayers).length}
                  </div>
                  <div className="text-blue-600">Available</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="font-semibold text-red-600">
                    {filteredMatches.filter(m => m.participants && m.participants.length >= m.maxPlayers).length}
                  </div>
                  <div className="text-red-600">Full</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="font-semibold text-green-600">
                    {filteredMatches.filter(m => m.participants && m.participants.some(p => 
                      (p._id === user?.id || p === user?.id) || (m.createdBy?._id === user?.id || m.createdBy === user?.id)
                    )).length}
                  </div>
                  <div className="text-green-600">Joined</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="font-semibold text-purple-600">
                    {new Set(filteredMatches.map(m => m.gameType)).size}
                  </div>
                  <div className="text-purple-600">Sports</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 mb-6 shadow-sm animate-fade-in">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-3" />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Success State */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4 mb-6 shadow-sm animate-fade-in">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <p className="text-green-800 font-medium">Success</p>
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Matches Grid */}
        {filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMatches.map((match, index) => (
              <div
                key={match._id}
                className="animate-fade-in"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <MatchCard match={match} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 py-16 px-8">
            <div className="text-center">
              <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                {matches.length === 0 ? (
                  <Calendar className="h-12 w-12 text-gray-400" />
                ) : (
                  <Search className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {matches.length === 0 ? 'No Upcoming Matches' : 'No Matches Found'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                {matches.length === 0 
                  ? 'Looks like there are no matches scheduled yet. Be the first to create an exciting match and get the games started!' 
                  : 'We couldn\'t find any matches matching your search criteria. Try adjusting your filters or search terms to discover more matches.'
                }
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {matches.length === 0 ? (
                  <button
                    onClick={() => navigate('/matches')}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create First Match
                  </button>
                ) : (
                  <>
                    <button
                      onClick={clearFilters}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-medium flex items-center"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Clear Filters
                    </button>
                    <button
                      onClick={() => navigate('/matches')}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Match
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default BrowseMatches;
