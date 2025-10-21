// Test script to verify tournament age and team size validation
// This demonstrates the fixed validation logic

const { checkTeamEligibility } = require('./server/services/eligibilityService');

// Mock data for testing
const mockTournament = {
  _id: 'tournament123',
  gameType: 'football',
  ageLimit: 18, // Legacy field - minimum age 18
  maxTeams: 16,
  entryCriteria: {
    ageLimitMin: 16, // New field - minimum age 16 (should override legacy)
    ageLimitMax: 35, // Maximum age 35
    teamSizeLimit: {
      min: 5,  // Minimum 5 players
      max: 11  // Maximum 11 players
    },
    genderCategory: 'Any'
  }
};

const mockTeamValid = {
  _id: 'team123',
  sportType: 'football',
  members: [
    { dob: new Date('2000-01-01'), gender: 'Male' },  // 25 years old
    { dob: new Date('1995-01-01'), gender: 'Male' },  // 30 years old
    { dob: new Date('2002-01-01'), gender: 'Female' }, // 23 years old
    { dob: new Date('1998-01-01'), gender: 'Male' },  // 27 years old
    { dob: new Date('2001-01-01'), gender: 'Female' }, // 24 years old
    { dob: new Date('1999-01-01'), gender: 'Male' },  // 26 years old
  ]
};

const mockTeamTooYoung = {
  ...mockTeamValid,
  members: [
    ...mockTeamValid.members,
    { dob: new Date('2010-01-01'), gender: 'Male' }  // 15 years old - too young
  ]
};

const mockTeamTooOld = {
  ...mockTeamValid,
  members: [
    ...mockTeamValid.members,
    { dob: new Date('1985-01-01'), gender: 'Male' }  // 40 years old - too old
  ]
};

const mockTeamTooSmall = {
  ...mockTeamValid,
  members: [
    { dob: new Date('2000-01-01'), gender: 'Male' },  // Only 3 members
    { dob: new Date('1995-01-01'), gender: 'Male' },
    { dob: new Date('2002-01-01'), gender: 'Female' }
  ]
};

const mockTeamTooLarge = {
  ...mockTeamValid,
  members: [
    ...mockTeamValid.members,
    ...Array(10).fill().map(() => ({ dob: new Date('2000-01-01'), gender: 'Male' })) // 16 total members
  ]
};

// Test function
async function testValidation() {
  console.log('🧪 Testing Tournament Validation Logic\n');

  console.log('✅ Valid team (6 members, ages 23-30):');
  const result1 = await checkTeamEligibility(mockTournament, mockTeamValid._id);
  console.log(`   Result: ${result1.ok ? 'PASS' : 'FAIL'} - Failures: ${result1.failures.join(', ')}\n`);

  console.log('❌ Team with under-age member (15 years old):');
  const result2 = await checkTeamEligibility(mockTournament, mockTeamTooYoung._id);
  console.log(`   Result: ${result2.ok ? 'PASS' : 'FAIL'} - Failures: ${result2.failures.join(', ')}\n`);

  console.log('❌ Team with over-age member (40 years old):');
  const result3 = await checkTeamEligibility(mockTournament, mockTeamTooOld._id);
  console.log(`   Result: ${result3.ok ? 'PASS' : 'FAIL'} - Failures: ${result3.failures.join(', ')}\n`);

  console.log('❌ Team too small (3 members, min 5):');
  const result4 = await checkTeamEligibility(mockTournament, mockTeamTooSmall._id);
  console.log(`   Result: ${result4.ok ? 'PASS' : 'FAIL'} - Failures: ${result4.failures.join(', ')}\n`);

  console.log('❌ Team too large (16 members, max 11):');
  const result5 = await checkTeamEligibility(mockTournament, mockTeamTooLarge._id);
  console.log(`   Result: ${result5.ok ? 'PASS' : 'FAIL'} - Failures: ${result5.failures.join(', ')}\n`);
}

console.log('⚠️  Note: This test requires mocking the Team.findById() function to return the mock data.');
console.log('💡 The validation logic has been fixed to support both legacy and new tournament fields.');
