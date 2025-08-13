import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Trophy, Clock, ExternalLink } from 'lucide-react';
import { getJoinedMatches, leaveMatch } from '../services/matchAPI';

const ScheduledMatches = () => {
  const navigate = useNavigate();
  const [joinedMatches, setJoinedMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJoinedMatches();
  }, []);

  const fetchJoinedMatches = async () => {
    try {
      setLoading(true);
      console.log('Fetching joined matches...');
      const response = await getJoinedMatches();
      console.log('Response from getJoinedMatches:', response);
      // Handle both response formats
      const allMatches = Array.isArray(response) ? response : (response.matches || []);
      console.log('All matches:', allMatches);
      // Filter only upcoming matches
      const upcomingMatches = allMatches.filter(match => {
        const matchDate = new Date(match.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return matchDate >= today;
      });
      console.log('Upcoming matches:', upcomingMatches);
      setJoinedMatches(upcomingMatches);
    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error response:', err.response);
      setError('Failed to fetch scheduled matches');
      console.error('Error fetching joined matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveMatch = async (matchId) => {
    if (!window.confirm('Are you sure you want to leave this match?')) {
      return;
    }

    try {
      await leaveMatch(matchId);
      setJoinedMatches(prev => prev.filter(match => match._id !== matchId));
    } catch (err) {
      console.error('Error leaving match:', err);
      setError('Failed to leave match');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Time TBD';
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const MatchCard = ({ match }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{match.title}</h3>
            <p className="text-sm text-gray-600">
              Organized by <span className="font-medium">{match.createdBy?.name || 'Unknown'}</span>
            </p>
          </div>
          <div className="ml-4 text-right">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <Trophy className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
              <span className="font-medium">{match.gameType}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
              <span>{formatDate(match.date)}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-5 w-5 mr-3 text-purple-500 flex-shrink-0" />
              <span>{formatTime(match.time)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-5 w-5 mr-3 text-red-500 flex-shrink-0" />
              <span>{match.location}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-5 w-5 mr-3 text-indigo-500 flex-shrink-0" />
              <span>
                <span className="font-medium">{match.participants?.length || 0}</span>
                <span className="text-gray-400"> / </span>
                <span className="font-medium">{match.maxPlayers}</span>
                <span className="text-gray-400"> players</span>
              </span>
            </div>

            <div className="text-sm">
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                match.participants?.length >= match.maxPlayers
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {match.participants?.length >= match.maxPlayers ? 'Full' : 'Available Spots'}
              </span>
            </div>
          </div>
        </div>

        {match.description && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-sm text-gray-600">{match.description}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Joined on {new Date(match.joinedAt || match.createdAt).toLocaleDateString()}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/browse-matches')}
              className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Browse More
            </button>
            <button
              onClick={() => handleLeaveMatch(match._id)}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              Leave Match
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scheduled matches...</p>
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
              <h1 className="text-xl font-semibold text-gray-900">My Scheduled Matches</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                {joinedMatches.length} Upcoming Matches
              </h2>
              <p className="text-sm text-gray-500">
                Matches you've joined and are scheduled to play
              </p>
            </div>
            <button
              onClick={() => navigate('/browse-matches')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Users className="h-4 w-4 mr-2" />
              Find More Matches
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Matches Grid */}
        {joinedMatches.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {joinedMatches.map((match) => (
              <MatchCard key={match._id} match={match} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled matches</h3>
            <p className="text-gray-500 mb-6">
              You haven't joined any matches yet. Browse available matches to get started!
            </p>
            <button
              onClick={() => navigate('/browse-matches')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Browse Available Matches
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduledMatches;
