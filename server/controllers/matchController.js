const Match = require("../models/Match");
const User = require("../models/User");

// Create a new match
exports.createMatch = async (req, res) => {
  try {
    const { title, gameType, date, location, geoLocation, maxPlayers, description } = req.body;
    const createdBy = req.user.id;

    // Validation
    if (!title || !gameType || !date || (!location && !geoLocation)) {
      return res.status(400).json({ msg: "Title, game type, date, and location (address or geoLocation) are required" });
    }

    // If geoLocation provided, basic validation
    let geo = null;
    if (geoLocation && typeof geoLocation === 'object' && Array.isArray(geoLocation.coordinates)) {
      const [lng, lat] = geoLocation.coordinates.map(Number);
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({ msg: 'Invalid geoLocation coordinates' });
      }
      geo = { type: 'Point', coordinates: [lng, lat] };
    }

    // Check if date is in the future
    const matchDate = new Date(date);
    let status = "upcoming";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (matchDate.toDateString() === today.toDateString()) {
      status = "ongoing";
    } else if (matchDate < today) {
      status = "past";
    }

    const matchData = {
      title,
      gameType,
      date: matchDate,
      location: location || '',
      geoLocation: geo,
      maxPlayers: maxPlayers || 10,
      description: description || "",
      createdBy,
      participants: [createdBy], // Creator automatically joins
      status
    };

    const match = await Match.create(matchData);

    // Create notification for the user who created the match
    const { createNotification } = require('./notificationController');
    await createNotification(
      createdBy,
      `Your match "${title}" has been created successfully at ${location}`,
      'match_created'
    );

    const populatedMatch = await Match.findById(match._id)
      .populate("createdBy", "name email mobile dob location profileImage media createdAt geoLocation")
      .populate("participants", "name email mobile dob location profileImage media createdAt geoLocation");

    res.status(201).json({ msg: "Match created successfully", match: populatedMatch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get all matches with filters
exports.getMatches = async (req, res) => {
  try {
    const { gameType, location, date, status } = req.query;
    let filter = {};

    // Apply filters
    if (gameType) filter.gameType = gameType;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (status) filter.status = status;
    if (date) {
      const filterDate = new Date(date);
      filter.date = { $gte: filterDate };
    }

    const matches = await Match.find(filter)
      .populate("createdBy", "name email mobile dob location profileImage media createdAt")
      .populate("participants", "name email mobile dob location profileImage media createdAt")
      .sort({ date: 1 });

    res.json({ matches });
    console.log(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get specific match
exports.getMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("createdBy", "name email mobile dob location profileImage media createdAt")
      .populate("participants", "name email mobile dob location profileImage media createdAt");

    if (!match) {
      return res.status(404).json({ msg: "Match not found" });
    }

    res.json({ match });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Update match
exports.updateMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    console.log(match)
    if (!match) {
      return res.status(404).json({ msg: "Match not found" });
    }
    console.log(req.user.id);
    console.log(match.createdBy.toString());
    console.log(match.createdBy.toString() === req.user.id);
    
    
    // Only creator can update
    if (match.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ msg: "Not authorized to update this match" });
    }

  const { title, gameType, date, location, geoLocation, maxPlayers, description } = req.body;
    const updateData = {};

    if (title) updateData.title = title;
    if (gameType) updateData.gameType = gameType;
    if (date) {
      const matchDate = new Date(date);
      if (matchDate <= new Date()) {
        return res.status(400).json({ msg: "Match date must be in the future" });
      }
      updateData.date = matchDate;
    }
    if (location) updateData.location = location;
    // If geoLocation present, validate and set
    if (geoLocation && typeof geoLocation === 'object' && Array.isArray(geoLocation.coordinates)) {
      const [lng, lat] = geoLocation.coordinates.map(Number);
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({ msg: 'Invalid geoLocation coordinates' });
      }
      updateData.geoLocation = { type: 'Point', coordinates: [lng, lat] };
    }
    if (maxPlayers) updateData.maxPlayers = maxPlayers;
    if (description !== undefined) updateData.description = description;

    const updatedMatch = await Match.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("createdBy", "name email mobile dob location profileImage media createdAt")
     .populate("participants", "name email mobile dob location profileImage media createdAt");

    res.json({ msg: "Match updated successfully", match: updatedMatch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete/Cancel match
exports.deleteMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ msg: "Match not found" });
    }

    // Only creator can delete
    if (match.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ msg: "Not authorized to delete this match" });
    }

    await Match.findByIdAndDelete(req.params.id);
    res.json({ msg: "Match deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Join match
exports.joinMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id).populate("createdBy", "name");
    if (!match) {
      return res.status(404).json({ msg: "Match not found" });
    }

    if (match.status !== "upcoming") {
      return res.status(400).json({ msg: "Cannot join completed or cancelled matches" });
    }

    if (match.participants.includes(req.user.id)) {
      return res.status(400).json({ msg: "Already joined this match" });
    }

    if (match.participants.length >= match.maxPlayers) {
      return res.status(400).json({ msg: "Match is full" });
    }

    match.participants.push(req.user.id);
    await match.save();

    // Create notification for the user who joined
    const { createNotification } = require('./notificationController');
    await createNotification(
      req.user.id,
      `You have successfully joined the match "${match.title}" at ${match.location}`,
      'match_joined'
    );

    // Create notification for the match creator
    if (match.createdBy._id.toString() !== req.user.id) {
      await createNotification(
        match.createdBy._id,
        `${req.user.name} has joined your match "${match.title}"`,
        'match_participant_joined'
      );
    }

    const updatedMatch = await Match.findById(req.params.id)
      .populate("createdBy", "name email mobile dob location profileImage media createdAt")
      .populate("participants", "name email mobile dob location profileImage media createdAt");

    res.json({ msg: "Successfully joined match", match: updatedMatch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Leave match
exports.leaveMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ msg: "Match not found" });
    }

    if (match.createdBy.toString() === req.user.id) {
      return res.status(400).json({ msg: "Creator cannot leave their own match" });
    }

    if (!match.participants.includes(req.user.id)) {
      return res.status(400).json({ msg: "Not joined this match" });
    }

    match.participants = match.participants.filter(
      participant => participant.toString() !== req.user.id
    );
    await match.save();

    const updatedMatch = await Match.findById(req.params.id)
      .populate("createdBy", "name email mobile dob location profileImage media createdAt")
      .populate("participants", "name email mobile dob location profileImage media createdAt");

    res.json({ msg: "Successfully left match", match: updatedMatch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get user's matches
exports.getMyMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const matches = await Match.find({
      $or: [
        { createdBy: userId },
        { participants: userId }
      ]
    })
    .populate("createdBy", "name email mobile dob location profileImage media createdAt")
    .populate("participants", "name email mobile dob location profileImage media createdAt")
    .sort({ date: 1 });

    res.json({ matches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get matches created by user only
exports.getCreatedMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const matches = await Match.find({
      createdBy: userId
    })
    .populate("createdBy", "name email mobile dob location profileImage media createdAt")
    .populate("participants", "name email mobile dob location profileImage media createdAt")
    .sort({ date: 1 });

    res.json({ matches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get matches user has joined (not created)
exports.getJoinedMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const matches = await Match.find({
      participants: userId,
      createdBy: { $ne: userId } // Exclude matches created by user
    })
    .populate("createdBy", "name email mobile dob location profileImage media createdAt")
    .populate("participants", "name email mobile dob location profileImage media createdAt")
    .sort({ date: 1 });

    res.json({ matches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Search matches near a location
exports.searchNearbyMatches = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 5000, gameType, title, limit = 50 } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    const geoNearStage = {
      $geoNear: {
        near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        distanceField: 'distanceMeters',
        spherical: true,
        maxDistance: parseInt(maxDistance),
        query: {}
      }
    };

    if (gameType) geoNearStage.$geoNear.query.gameType = { $regex: gameType, $options: 'i' };
    if (title) geoNearStage.$geoNear.query.title = { $regex: title, $options: 'i' };

    const pipeline = [geoNearStage, { $limit: parseInt(limit) }];
    const matches = await Match.aggregate(pipeline);
    res.json({ matches });
  } catch (err) {
    console.error('Error searching nearby matches:', err);
    res.status(500).json({ message: 'Error searching nearby matches', error: err.message });
  }
};