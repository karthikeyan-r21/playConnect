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
  Home
} from 'lucide-react';
import { matchAPI } from '../services/matchAPI';
import { useAuth } from '../context/AuthContext';

const Matches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myMatches, setMyMatches] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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

  useEffect(() => {
    fetchMyMatches();
  }, []);

  // Filter upcoming matches (matches that haven't passed yet)
  const getUpcomingMatches = () => {
    const now = new Date();
    return myMatches.filter(match => new Date(match.date) > now);
  };

  const upcomingMatches = getUpcomingMatches();

  const fetchMyMatches = async () => {
    try {
      const response = await matchAPI.getMyMatches();
      setMyMatches(response.matches || []);
    } catch (error) {
      console.error('Error fetching my matches:', error);
      setError('Failed to load matches');
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
    setError(null);

    try {
      await matchAPI.createMatch(formData);
      setSuccess(true);
      setShowCreateForm(false);
      setFormData({
        title: '',
        gameType: '',
        date: '',
        location: '',
        maxPlayers: 10,
        description: ''
      });
      
      // Refresh matches
      fetchMyMatches();
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to create match');
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
      setSuccess(true);
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
      fetchMyMatches();
      
      setTimeout(() => setSuccess(false), 3000);
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
      setSuccess(true);
      
      // Refresh matches
      fetchMyMatches();
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to cancel match');
    }
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

  const MatchCard = ({ match }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{match.title}</h3>
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {match.gameType}
          </span>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          match.status === 'upcoming' ? 'bg-green-100 text-green-800' :
          match.status === 'completed' ? 'bg-gray-100 text-gray-800' :
          'bg-red-100 text-red-800'
        }`}>
          {match.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          {formatDate(match.date)}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2" />
          {match.location}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-2" />
          {match.participants?.length || 0} / {match.maxPlayers} players
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <User className="h-4 w-4 mr-2" />
          Created by you
        </div>
      </div>

      {match.description && (
        <p className="text-sm text-gray-600 mb-4">{match.description}</p>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          by {match.createdBy?.name || user?.name || 'You'}
        </div>
        <div className="flex space-x-2">
          {match.status !== 'cancelled' && (
            <>
              <button 
                onClick={() => handleEdit(match)}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
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
          {match.status === 'cancelled' && (
            <span className="text-xs text-gray-500 italic">Match cancelled</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg flex flex-col rounded-l-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">My Matches</h2>
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Dashboard"
            >
              <Home className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Match
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="m-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm">
            {showEditForm ? 'Match updated successfully!' : 'Match created successfully!'}
          </div>
        )}

        {/* My Matches List - Only Upcoming */}
        <div className="flex-1 p-4 overflow-y-auto">
          {upcomingMatches.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No upcoming matches</p>
              <p className="text-gray-400 text-xs">Create your first match to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingMatches.map((match) => (
                <div key={match._id} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{match.title}</h4>
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(match.date)}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      {match.location}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Users className="h-3 w-3 mr-1" />
                      {match.participants?.length || 0}/{match.maxPlayers}
                    </div>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <button 
                      onClick={() => handleEdit(match)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    {match.status !== 'cancelled' && (
                      <button 
                        onClick={() => handleDelete(match._id)}
                        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Matches</h1>
              <p className="text-gray-600">Manage all your created matches</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myMatches.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matches created yet</h3>
              <p className="text-gray-500">Create your first match to get started!</p>
            </div>
          ) : (
            myMatches.map((match) => (
              <MatchCard key={match._id} match={match} />
            ))
          )}
        </div>
      </div>

      {/* Create Match Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Create New Match</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
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
                    {isLoading ? 'Creating...' : 'Create Match'}
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
    </div>
  );
};

export default Matches;
