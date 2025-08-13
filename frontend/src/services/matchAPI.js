import api from './api';

// Match API calls
export const matchAPI = {
  // Create a new match
  createMatch: async (matchData) => {
    const response = await api.post('/matches', matchData);
    return response.data;
  },

  // Get all matches
  getMatches: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/matches?${params.toString()}`);
    return response.data;
  },

  // Get matches created by current user
  getMyMatches: async () => {
    const response = await api.get('/matches/my-matches');
    return response.data;
  },

  // Get specific match
  getMatch: async (matchId) => {
    const response = await api.get(`/matches/${matchId}`);
    return response.data;
  },

  // Update match
  updateMatch: async (matchId, matchData) => {
    const response = await api.put(`/matches/${matchId}`, matchData);
    return response.data;
  },

  // Delete match
  deleteMatch: async (matchId) => {
    const response = await api.delete(`/matches/${matchId}`);
    return response.data;
  },

  // Join match
  joinMatch: async (matchId) => {
    const response = await api.post(`/matches/${matchId}/join`);
    return response.data;
  },

  // Leave match
  leaveMatch: async (matchId) => {
    const response = await api.post(`/matches/${matchId}/leave`);
    return response.data;
  },

  // Get joined matches (not created by user)
  getJoinedMatches: async () => {
    const response = await api.get('/matches/joined-matches');
    return response.data;
  },
};

// Additional helper functions for direct export
export const getAllMatches = async (filters = {}) => {
  return await matchAPI.getMatches(filters);
};

export const getMyMatches = async () => {
  return await matchAPI.getMyMatches();
};

export const createMatch = async (matchData) => {
  return await matchAPI.createMatch(matchData);
};

export const updateMatch = async (matchId, matchData) => {
  return await matchAPI.updateMatch(matchId, matchData);
};

export const deleteMatch = async (matchId) => {
  return await matchAPI.deleteMatch(matchId);
};

export const joinMatch = async (matchId) => {
  return await matchAPI.joinMatch(matchId);
};

export const leaveMatch = async (matchId) => {
  return await matchAPI.leaveMatch(matchId);
};

export const getJoinedMatches = async () => {
  const response = await matchAPI.getJoinedMatches();
  return response.matches || response || [];
};

export default matchAPI;
