import api from './api';

// Create a new team
export const createTeam = async (teamData) => {
  const response = await api.post('/teams/create', teamData);
  return response.data;
};

// Update team information (owner only)
export const updateTeam = async (teamId, teamData) => {
  const response = await api.put(`/teams/update/${teamId}`, teamData);
  return response.data;
};

// Delete a team (owner only)
export const deleteTeam = async (teamId, reason = '') => {
  const response = await api.delete(`/teams/${teamId}`, {
    data: { reason }
  });
  return response.data;
};

// Search teams
export const searchTeams = async (searchParams) => {
  const response = await api.get('/teams/search', { params: searchParams });
  return response.data;
};

// Get all teams for a user (created + joined)
export const getUserTeams = async (userId) => {
  const response = await api.get(`/teams/user/${userId}`);
  return response.data;
};

// Get only teams created by a user
export const getCreatedTeams = async (userId) => {
  const response = await api.get(`/teams/user/${userId}/created`);
  return response.data;
};

// Get only teams joined by a user (not created)
export const getJoinedTeams = async (userId) => {
  const response = await api.get(`/teams/user/${userId}/joined`);
  return response.data;
};

// Get team details
export const getTeamDetails = async (teamId) => {
  const response = await api.get(`/teams/${teamId}`);
  return response.data;
};

// Get team members and join requests
export const getTeamMembers = async (teamId) => {
  const response = await api.get(`/teams/${teamId}/members`);
  return response.data;
};

// Send join request to a team
export const sendJoinRequest = async (teamId, reason = '') => {
  const response = await api.post(`/teams/${teamId}/join`, { reason });
  return response.data;
};

// Approve join request (owner only)
export const approveJoinRequest = async (teamId, userId, reason = '') => {
  const response = await api.post(`/teams/${teamId}/approve`, { userId, reason });
  return response.data;
};

// Reject join request (owner only)
export const rejectJoinRequest = async (teamId, userId, reason = '') => {
  const response = await api.post(`/teams/${teamId}/reject`, { userId, reason });
  return response.data;
};

// Leave a team (member only)
export const leaveTeam = async (teamId, reason = '') => {
  const response = await api.post(`/teams/${teamId}/leave`, { reason });
  return response.data;
};

// Remove member from team (owner only)
export const removeMember = async (teamId, memberId, reason = '') => {
  const response = await api.delete(`/teams/${teamId}/members/${memberId}`, {
    data: { reason }
  });
  return response.data;
};

// Get pending join requests for a team (owner only)
export const getJoinRequests = async (teamId) => {
  const response = await api.get(`/teams/${teamId}/join-requests`);
  return response.data;
};

export default {
  createTeam,
  updateTeam,
  deleteTeam,
  searchTeams,
  getUserTeams,
  getCreatedTeams,
  getJoinedTeams,
  getTeamDetails,
  getTeamMembers,
  sendJoinRequest,
  approveJoinRequest,
  rejectJoinRequest,
  leaveTeam,
  removeMember,
  getJoinRequests
};
