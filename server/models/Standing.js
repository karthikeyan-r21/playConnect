const mongoose = require('mongoose');

const standingSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  played: {
    type: Number,
    default: 0
  },
  won: {
    type: Number,
    default: 0
  },
  draw: {
    type: Number,
    default: 0
  },
  lost: {
    type: Number,
    default: 0
  },
  goalsFor: {
    type: Number,
    default: 0
  },
  goalsAgainst: {
    type: Number,
    default: 0
  },
  goalDiff: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  },
  // Additional stats
  position: {
    type: Number,
    default: 0
  },
  form: [{
    type: String,
    enum: ['W', 'D', 'L'] // Win, Draw, Loss
  }],
  // Sport-specific stats can be added here
  extraStats: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate team entries in same tournament
standingSchema.index({ tournament: 1, team: 1 }, { unique: true });

// Index for efficient tournament queries
standingSchema.index({ tournament: 1, points: -1, goalDiff: -1 });

// Calculate goal difference before saving
standingSchema.pre('save', function(next) {
  this.goalDiff = this.goalsFor - this.goalsAgainst;
  next();
});

// Virtual for win percentage
standingSchema.virtual('winPercentage').get(function() {
  if (this.played === 0) return 0;
  return ((this.won / this.played) * 100).toFixed(1);
});

// Virtual for points per game
standingSchema.virtual('pointsPerGame').get(function() {
  if (this.played === 0) return 0;
  return (this.points / this.played).toFixed(2);
});

// Static method to update standings after a match
standingSchema.statics.updateAfterMatch = async function(tournamentId, matchResult) {
  const { team1Id, team2Id, team1Score, team2Score } = matchResult;
  
  // Determine match outcome
  let team1Result, team2Result;
  if (team1Score > team2Score) {
    team1Result = { won: 1, points: 3 };
    team2Result = { lost: 1, points: 0 };
  } else if (team1Score < team2Score) {
    team1Result = { lost: 1, points: 0 };
    team2Result = { won: 1, points: 3 };
  } else {
    team1Result = { draw: 1, points: 1 };
    team2Result = { draw: 1, points: 1 };
  }
  
  // Update team 1 standing
  await this.findOneAndUpdate(
    { tournament: tournamentId, team: team1Id },
    {
      $inc: {
        played: 1,
        won: team1Result.won || 0,
        draw: team1Result.draw || 0,
        lost: team1Result.lost || 0,
        goalsFor: team1Score,
        goalsAgainst: team2Score,
        points: team1Result.points
      },
      $push: {
        form: {
          $each: [team1Result.won ? 'W' : team1Result.draw ? 'D' : 'L'],
          $slice: -5 // Keep only last 5 results
        }
      }
    },
    { upsert: true }
  );
  
  // Update team 2 standing
  await this.findOneAndUpdate(
    { tournament: tournamentId, team: team2Id },
    {
      $inc: {
        played: 1,
        won: team2Result.won || 0,
        draw: team2Result.draw || 0,
        lost: team2Result.lost || 0,
        goalsFor: team2Score,
        goalsAgainst: team1Score,
        points: team2Result.points
      },
      $push: {
        form: {
          $each: [team2Result.won ? 'W' : team2Result.draw ? 'D' : 'L'],
          $slice: -5 // Keep only last 5 results
        }
      }
    },
    { upsert: true }
  );
};

module.exports = mongoose.model('Standing', standingSchema);
