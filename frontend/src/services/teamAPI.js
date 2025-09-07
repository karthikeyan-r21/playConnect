import api from './api';

// Team API calls
export const teamAPI = {
  // Create a new team
  createTeam: async (teamData) => {
    const response = await api.post('/teams/create', teamData);
    return response.data;
  },

  // Get all teams
  getAllTeams: async () => {
    const response = await api.get('/teams/');
    return response.data;
  },

  // Get user's teams
  getMyTeams: async () => {
    const response = await api.get('/teams/my-teams');
    return response.data;
  },

  // Send join request
  sendJoinRequest: async (teamId) => {
    const response = await api.post('/teams/join-request', { teamId });
    return response.data;
  },

  // Approve join request
  approveJoinRequest: async (teamId, userId) => {
    const response = await api.post('/teams/approve-request', { teamId, userId });
    return response.data;
  },

  // Reject join request
  rejectJoinRequest: async (teamId, userId) => {
    const response = await api.post('/teams/reject-request', { teamId, userId });
    return response.data;
  },

  // Get team details
  getTeamDetails: async (teamId) => {
    const response = await api.get(`/teams/${teamId}`);
    return response.data;
  },

  // Leave team
  leaveTeam: async (teamId) => {
    const response = await api.post('/teams/leave-team', { teamId });
    return response.data;
  },

  // Delete team member
  deleteTeamMember: async (teamId, userId) => {
    const response = await api.post('/teams/delete-member', { teamId, userId });
    return response.data;
  },
};

// Export individual functions for direct import
export const createTeam = teamAPI.createTeam;
export const getAllTeams = teamAPI.getAllTeams;
export const getMyTeams = teamAPI.getMyTeams;
export const sendJoinRequest = teamAPI.sendJoinRequest;
export const approveJoinRequest = (teamId, userId) => teamAPI.approveJoinRequest(teamId, userId);
export const rejectJoinRequest = (teamId, userId) => teamAPI.rejectJoinRequest(teamId, userId);
export const getTeamDetails = teamAPI.getTeamDetails;
export const leaveTeam = teamAPI.leaveTeam;
export const deleteTeamMember = (teamId, userId) => teamAPI.deleteTeamMember(teamId, userId);

export default teamAPI;
