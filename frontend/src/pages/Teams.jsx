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
  Trophy
} from 'lucide-react';
import { 
  getAllTeams, 
  createTeam, 
  getMyTeams, 
  sendJoinRequest, 
  approveJoinRequest, 
  rejectJoinRequest,
  getTeamDetails,
  leaveTeam,
  deleteTeamMember 
} from '../services/teamAPI';
import { useAuth } from '../context/AuthContext';

const Teams = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allTeams, setAllTeams] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTeamDetails, setShowTeamDetails] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: ''
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

  useEffect(() => {
    fetchAllTeams();
    fetchMyTeams();
  }, []);

  const fetchAllTeams = async () => {
    try {
      setIsLoading(true);
      const response = await getAllTeams();
      setAllTeams(response.teams || []);
    } catch (err) {
      setError('Failed to fetch teams');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyTeams = async () => {
    try {
      const response = await getMyTeams();
      setMyTeams(response.teams || []);
    } catch (err) {
      setError('Failed to fetch my teams');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await createTeam(formData);
      setSuccess('Team created successfully!');
      setShowCreateForm(false);
      setFormData({
        name: '',
        description: ''
      });
      fetchAllTeams();
      fetchMyTeams();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRequest = async (teamId) => {
    try {
      await sendJoinRequest(teamId);
      setSuccess('Join request sent successfully!');
      fetchAllTeams();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send join request');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleApproveRequest = async (teamId, userId) => {
    try {
      await approveJoinRequest(teamId, userId);
      setSuccess('Request approved successfully!');
      fetchTeamDetails(selectedTeam._id);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve request');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRejectRequest = async (teamId, userId) => {
    try {
      await rejectJoinRequest(teamId, userId);
      setSuccess('Request rejected successfully!');
      fetchTeamDetails(selectedTeam._id);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request');
      setTimeout(() => setError(''), 3000);
    }
  };

  const fetchTeamDetails = async (teamId) => {
    try {
      const response = await getTeamDetails(teamId);
      setSelectedTeam(response.team);
      setShowTeamDetails(true);
    } catch (err) {
      setError('Failed to fetch team details');
    }
  };

  const handleLeaveTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to leave this team?')) {
      return;
    }

    try {
      await leaveTeam(teamId);
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

  const hasUserRequestedToJoin = (team) => {
    return team.joinRequests?.some(request => request.user?._id === user?.id && request.status === 'pending');
  };

  const TeamCard = ({ team, showJoinButton = true }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{team.name}</h3>
            <div className="flex items-center space-x-2 mb-2">
              {team.creator?._id === user?.id && (
                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Owner
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Created by <span className="font-medium">{team.creator?.name || 'Unknown'}</span>
            </p>
          </div>
          <button
            onClick={() => fetchTeamDetails(team._id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="View team details"
          >
            <Users className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>{team.members?.length || 0} members</span>
          </div>
        </div>

        {team.description && (
          <p className="text-sm text-gray-600 mb-4">{team.description}</p>
        )}

        {showJoinButton && (
          <div className="flex justify-end">
            {!isUserInTeam(team) && !hasUserRequestedToJoin(team) && (
              <button
                onClick={() => handleJoinRequest(team._id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Request to Join
              </button>
            )}
            {hasUserRequestedToJoin(team) && (
              <span className="text-sm text-yellow-600 font-medium">Request Pending</span>
            )}
            {isUserInTeam(team) && team.creator?._id !== user?.id && (
              <button
                onClick={() => handleLeaveTeam(team._id)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center"
              >
                <UserMinus className="h-4 w-4 mr-1" />
                Leave Team
              </button>
            )}
            {isUserInTeam(team) && team.creator?._id === user?.id && (
              <span className="text-sm text-green-600 font-medium flex items-center">
                <Crown className="h-4 w-4 mr-1" />
                Your Team
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allTeams.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No teams available</h3>
                    <p className="text-gray-500">Be the first to create a team!</p>
                  </div>
                ) : (
                  allTeams.map((team) => (
                    <TeamCard key={team._id} team={team} />
                  ))
                )}
              </div>
            )}

            {activeTab === 'my' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myTeams.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
                    <p className="text-gray-500">Create or join a team to get started!</p>
                  </div>
                ) : (
                  myTeams.map((team) => (
                    <TeamCard key={team._id} team={team} showJoinButton={false} />
                  ))
                )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Creator</h4>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Crown className="h-4 w-4 mr-2 text-yellow-500" />
                      {selectedTeam.creator?.name || 'Unknown'}
                    </p>
                  </div>
                </div>
                {selectedTeam.description && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{selectedTeam.description}</p>
                  </div>
                )}
              </div>

              {/* Members */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Members</h4>
                {selectedTeam.members?.length === 0 ? (
                  <p className="text-sm text-gray-500">No members yet</p>
                ) : (
                  <div className="space-y-3">
                    {selectedTeam.members?.map((member) => (
                      <div key={member._id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                          </div>
                        </div>
                        {selectedTeam.creator?._id === user?.id && member._id !== user?.id && (
                          <button
                            onClick={() => handleDeleteMember(selectedTeam._id, member._id)}
                            className="text-red-600 hover:text-red-700 transition-colors"
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

              {/* Join Requests (only for team creator) */}
              {selectedTeam.creator?._id === user?.id && selectedTeam.joinRequests?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Join Requests</h4>
                  <div className="space-y-3">
                    {selectedTeam.joinRequests
                      .filter(request => request.status === 'pending')
                      .map((request) => (
                        <div key={request._id} className="flex items-center justify-between bg-yellow-50 rounded-lg p-3">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                              <Mail className="h-4 w-4 text-yellow-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{request.user?.name}</p>
                              <p className="text-xs text-gray-500">{request.user?.email}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApproveRequest(request._id)}
                              className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                              title="Approve request"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request._id)}
                              className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                              title="Reject request"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                {isUserInTeam(selectedTeam) && selectedTeam.creator?._id !== user?.id && (
                  <button
                    onClick={() => handleLeaveTeam(selectedTeam._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    Leave Team
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
    </div>
  );
};

export default Teams;
