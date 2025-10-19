import api from './api';

// Get all tournaments with optional filters
export const listTournaments = async (filters = {}) => {
  const response = await api.get('/tournaments', { params: filters });
  return response.data;
};

// Get single tournament by ID
export const getTournament = async (tournamentId) => {
  const response = await api.get(`/tournaments/${tournamentId}`);
  return response.data;
};

// Create a new tournament (host only)
export const createTournament = async (tournamentData) => {
  const response = await api.post('/tournaments', tournamentData);
  return response.data;
};

// Update tournament (host only)
export const updateTournament = async (tournamentId, tournamentData) => {
  const response = await api.put(`/tournaments/${tournamentId}`, tournamentData);
  return response.data;
};

// Join tournament with team
export const joinTournament = async (tournamentId, teamId) => {
  const response = await api.post(`/tournaments/${tournamentId}/join`, { teamId });
  return response.data;
};

// Get tournament entries (host only)
export const getTournamentEntries = async (tournamentId) => {
  const response = await api.get(`/tournaments/${tournamentId}/entries`);
  return response.data;
};

// Approve tournament entry (host only)
export const approveEntry = async (tournamentId, entryId) => {
  const response = await api.put(`/tournaments/${tournamentId}/entries/${entryId}/approve`);
  return response.data;
};

// Reject tournament entry (host only)
export const rejectEntry = async (tournamentId, entryId) => {
  const response = await api.put(`/tournaments/${tournamentId}/entries/${entryId}/reject`);
  return response.data;
};

// Get tournament matches
export const getTournamentMatches = async (tournamentId) => {
  const response = await api.get(`/tournaments/${tournamentId}/matches`);
  return response.data;
};

// Create tournament match (host only)
export const createTournamentMatch = async (tournamentId, matchData) => {
  const response = await api.post(`/tournaments/${tournamentId}/matches`, matchData);
  return response.data;
};

// Generate fixtures (host only)
export const generateFixtures = async (tournamentId, algorithm = 'round-robin', options = {}) => {
  const response = await api.post(`/tournaments/${tournamentId}/generate-fixtures`, {
    algorithm,
    options
  });
  return response.data;
};

// Update match schedule (host only)
export const updateMatchSchedule = async (tournamentId, matchId, scheduleData) => {
  const response = await api.patch(`/tournaments/${tournamentId}/matches/${matchId}/schedule`, scheduleData);
  return response.data;
};

// Get tournament standings
export const getTournamentStandings = async (tournamentId) => {
  const response = await api.get(`/tournaments/${tournamentId}/standings`);
  return response.data;
};

// Get tournament leaderboard
export const getTournamentLeaderboard = async (tournamentId) => {
  const response = await api.get(`/tournaments/${tournamentId}/leaderboard`);
  return response.data;
};

// Record match result (host only)
export const recordMatchResult = async (tournamentId, matchId, resultData) => {
  const response = await api.post(`/tournaments/${tournamentId}/matches/${matchId}/result`, resultData);
  return response.data;
};

// Update match result (host only)
export const updateMatchResult = async (tournamentId, matchId, resultData) => {
  const response = await api.put(`/tournaments/${tournamentId}/matches/${matchId}/result`, resultData);
  return response.data;
};
