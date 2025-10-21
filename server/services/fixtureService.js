// Fixture Service - Tournament fixture generation
const Match = require('../models/Match');
const Tournament = require('../models/Tournament');

class FixtureService {
  static async generateRoundRobin(tournamentId, teamIds, options = {}) {
    try {
      const { scheduleStart = new Date(), intervalMinutes = 60 } = options;
      
      if (teamIds.length < 2) {
        throw new Error('Need at least 2 teams to generate fixtures');
      }
      
      const matches = [];
      let currentDate = new Date(scheduleStart);
      
      // Generate round-robin fixtures (each team plays every other team once)
      for (let i = 0; i < teamIds.length; i++) {
        for (let j = i + 1; j < teamIds.length; j++) {
          const match = {
            tournament: tournamentId,
            team1: teamIds[i],
            team2: teamIds[j],
            scheduledDate: new Date(currentDate),
            status: 'scheduled',
            createdAt: new Date()
          };
          
          matches.push(match);
          
          // Add interval between matches
          currentDate.setMinutes(currentDate.getMinutes() + intervalMinutes);
        }
      }
      
      // Save all matches to database
      const savedMatches = await Match.insertMany(matches);
      
      console.log(`✅ Generated ${savedMatches.length} fixtures for tournament ${tournamentId}`);
      
      return savedMatches;
    } catch (error) {
      console.error('Fixture generation error:', error);
      throw error;
    }
  }
  
  static async generateSingleElimination(tournamentId, teamIds, options = {}) {
    try {
      const { scheduleStart = new Date(), intervalMinutes = 90 } = options;
      
      if (teamIds.length < 2) {
        throw new Error('Need at least 2 teams for single elimination');
      }
      
      // For single elimination, we need a power of 2 teams
      // If not, some teams get byes to the next round
      const matches = [];
      let currentDate = new Date(scheduleStart);
      
      // First round matches
      const shuffledTeams = [...teamIds].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < shuffledTeams.length; i += 2) {
        if (i + 1 < shuffledTeams.length) {
          const match = {
            tournament: tournamentId,
            team1: shuffledTeams[i],
            team2: shuffledTeams[i + 1],
            scheduledDate: new Date(currentDate),
            status: 'scheduled',
            round: 1,
            createdAt: new Date()
          };
          
          matches.push(match);
          currentDate.setMinutes(currentDate.getMinutes() + intervalMinutes);
        }
      }
      
      const savedMatches = await Match.insertMany(matches);
      console.log(`✅ Generated ${savedMatches.length} first round matches for single elimination tournament ${tournamentId}`);
      
      return savedMatches;
    } catch (error) {
      console.error('Single elimination generation error:', error);
      throw error;
    }
  }
}

module.exports = FixtureService;
