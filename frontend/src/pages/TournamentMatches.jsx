import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Trophy, ArrowLeft } from 'lucide-react';

const TournamentMatches = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState({ upcoming: [], live: [], completed: [], all: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTournamentData();
    fetchMatches();
  }, [tournamentId]);

  const fetchTournamentData = async () => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}`);
      if (response.ok) {
        const data = await response.json();
        setTournament(data.tournament);
      }
    } catch (error) {
      console.error('Error fetching tournament:', error);
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/matches`);
      if (response.ok) {
        const data = await response.json();
        setMatches(data.matches);
      } else {
        setError('Failed to load matches');
      }
    } catch (error) {
      setError('Error loading matches');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getMatchStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const MatchCard = ({ match }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchStatusColor(match.status)}`}>
            {match.status.toUpperCase()}
          </span>
          {match.round && (
            <span className="text-sm text-gray-500">Round {match.round}</span>
          )}
        </div>
        {match.scheduledDate && (
          <div className="text-right text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(match.scheduledDate)}
            </div>
            <div className="flex items-center mt-1">
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(match.scheduledDate)}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h4 className="font-semibold text-gray-900">
                {match.team1?.name || 'TBD'}
              </h4>
              <p className="text-sm text-gray-600">{match.team1?.location}</p>
            </div>
            
            <div className="mx-4 text-center">
              {match.status === 'completed' ? (
                <div className="text-2xl font-bold">
                  {match.team1Score} - {match.team2Score}
                </div>
              ) : (
                <div className="text-lg font-semibold text-gray-400">VS</div>
              )}
            </div>
            
            <div className="text-center flex-1">
              <h4 className="font-semibold text-gray-900">
                {match.team2?.name || 'TBD'}
              </h4>
              <p className="text-sm text-gray-600">{match.team2?.location}</p>
            </div>
          </div>
        </div>
      </div>
      
      {match.winner && (
        <div className="mt-3 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
          <div className="flex items-center">
            <Trophy className="w-4 h-4 text-yellow-600 mr-2" />
            <span className="text-sm font-medium text-yellow-800">
              Winner: {match.winner.name}
            </span>
          </div>
        </div>
      )}
      
      {match.notes && (
        <div className="mt-2 text-sm text-gray-600">
          <p>{match.notes}</p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tournament matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/tournaments')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Tournaments
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'upcoming', label: 'Upcoming', count: matches.upcoming?.length || 0 },
    { key: 'live', label: 'Live', count: matches.live?.length || 0 },
    { key: 'completed', label: 'Completed', count: matches.completed?.length || 0 },
    { key: 'all', label: 'All Matches', count: matches.all?.length || 0 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/tournaments')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tournaments
          </button>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {tournament?.name} - Match Schedule
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {tournament?.gameType}
              </div>
              {tournament?.logistics?.venue && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {tournament.logistics.venue}
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(tournament?.startDate)} - {formatDate(tournament?.endDate)}
              </div>
            </div>
          </div>
        </div>

        {/* Match Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Matches Content */}
        <div className="space-y-4">
          {matches[activeTab]?.length > 0 ? (
            matches[activeTab].map((match) => (
              <MatchCard key={match._id} match={match} />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border">
              <div className="text-gray-400 mb-4">
                <Calendar className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {activeTab} matches
              </h3>
              <p className="text-gray-600">
                {activeTab === 'upcoming' 
                  ? 'Matches will appear here once the tournament reaches minimum teams and fixtures are generated.'
                  : `No ${activeTab} matches found for this tournament.`
                }
              </p>
            </div>
          )}
        </div>

        {/* Generate Fixtures Button for Host */}
        {tournament?.status === 'upcoming' && matches.all?.length === 0 && (
          <div className="mt-6 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Ready to Generate Fixtures?
              </h3>
              <p className="text-blue-700 mb-4">
                Once you have enough teams registered, fixtures will be automatically generated.
              </p>
              <p className="text-sm text-blue-600">
                Minimum teams required: {tournament?.minTeams || 2}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentMatches;
