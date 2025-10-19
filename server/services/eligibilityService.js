const Team = require('../models/Team');
const TournamentEntry = require('../models/TournamentEntry');

async function computeAge(dob) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000*60*60*24*365.25));
}

async function checkTeamEligibility(tournament, teamId) {
  const failures = [];
  const TeamModel = Team;
  const team = await TeamModel.findById(teamId).populate('members');
  if (!team) return { ok:false, failures:['team-not-found'] };

  // sport type validation - teams must match tournament sport
  if (tournament.gameType && team.sportType) {
    const tournamentSport = tournament.gameType.toLowerCase().trim();
    const teamSport = team.sportType.toLowerCase().trim();
    if (tournamentSport !== teamSport) {
      failures.push('sport-type-mismatch');
    }
  }

  // team size - use both new entryCriteria format and legacy fields for backward compatibility
  const size = team.members?.length || 0;
  const sizeLimit = tournament.entryCriteria?.teamSizeLimit || {};
  if (sizeLimit.min && size < sizeLimit.min) failures.push('team-too-small');
  if (sizeLimit.max && size > sizeLimit.max) failures.push('team-too-large');

  // ages - check both new entryCriteria format and legacy ageLimit field
  const ageLimit = tournament.ageLimit || 0;
  const ageLimitMin = tournament.entryCriteria?.ageLimitMin;
  const ageLimitMax = tournament.entryCriteria?.ageLimitMax;
  
  if (ageLimit > 0 || ageLimitMin || ageLimitMax) {
    const ages = (team.members||[]).map(m => m.dob ? computeAge(m.dob) : null).filter(a=>a!==null);
    
    // Check legacy ageLimit field (minimum age requirement)
    if (ageLimit > 0 && ages.some(a => a < ageLimit)) {
      failures.push('age-below-min');
    }
    
    // Check new entryCriteria format
    if (ageLimitMin && ages.some(a => a < ageLimitMin)) failures.push('age-below-min');
    if (ageLimitMax && ages.some(a => a > ageLimitMax)) failures.push('age-above-max');
  }

  // gender
  if (tournament.entryCriteria?.genderCategory && tournament.entryCriteria.genderCategory !== 'Any') {
    const required = tournament.entryCriteria.genderCategory;
    if (!(team.members||[]).every(m => m.gender === required)) failures.push('gender-mismatch');
  }

  // capacity - prefer tournament.maxTeams (newer field), fall back to entryCriteria.maxTeams for backward compatibility
  const acceptedCount = await TournamentEntry.countDocuments({ tournament: tournament._id, status:'accepted' });
  const capacity = tournament.maxTeams || tournament.entryCriteria?.maxTeams;
  if (capacity && acceptedCount >= Number(capacity)) failures.push('tournament-full');

  // locationRestriction - optional: implement your own rule parser

  return { ok: failures.length === 0, failures };
}

module.exports = { checkTeamEligibility };
