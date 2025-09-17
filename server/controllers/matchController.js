
const Match = require("../models/Match");
const User = require("../models/User");
const Notification = require("../models/notification");


// Request to join match
exports.requestJoinMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ msg: "Match not found" });

    // Check if already requested or joined
    if (match.participants.includes(req.user.id)) {
      return res.status(400).json({ msg: "Already joined this match" });
    }
    if (match.joinRequests.some(r => r.user.toString() === req.user.id && r.status === "pending")) {
      return res.status(400).json({ msg: "Already requested to join" });
    }

    match.joinRequests.push({ user: req.user.id, status: "pending" });
    await match.save();

    // Notify owner
    await Notification.create({
      user: match.createdBy,
      message: `${req.user.name} requested to join match "${match.title}"`,
      reason: "Join request"
    });

    res.json({ msg: "Join request sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// View join requests (owner only)
exports.viewJoinRequests = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id).populate("joinRequests.user", "name email profileImage");
    if (!match) return res.status(404).json({ msg: "Match not found" });
    if (match.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ msg: "Not authorized" });
    }
    res.json({ requests: match.joinRequests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Approve join request (owner only)
exports.approveJoinRequest = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ msg: "Match not found" });
    if (match.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ msg: "Not authorized" });
    }
    const request = match.joinRequests.find(r => r.user.toString() === req.params.userId && r.status === "pending");
    if (!request) return res.status(404).json({ msg: "Request not found or already handled" });
    request.status = "approved";
    match.participants.push(request.user);
    await match.save();
    // Notify user
    await Notification.create({
      user: request.user,
      message: `Your request to join match "${match.title}" was approved!`,
      reason: "Join request approved"
    });
    res.json({ msg: "Request approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Reject join request (owner only)
exports.rejectJoinRequest = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ msg: "Match not found" });
    if (match.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ msg: "Not authorized" });
    }
    const request = match.joinRequests.find(r => r.user.toString() === req.params.userId && r.status === "pending");
    if (!request) return res.status(404).json({ msg: "Request not found or already handled" });
    request.status = "rejected";
    request.reason = req.body.reason || "Rejected by owner";
    await match.save();
    // Notify user
    await Notification.create({
      user: request.user,
      message: `Your request to join match "${match.title}" was rejected. Reason: ${request.reason}`,
      reason: "Join request rejected"
    });
    res.json({ msg: "Request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
// Reschedule match
exports.updateMatchReschedule = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ msg: "Match not found" });

    // Only creator can reschedule
    if (match.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    const { newDate, reason } = req.body;
    if (!newDate || new Date(newDate) <= new Date()) {
      return res.status(400).json({ msg: "New date must be in the future" });
    }

    match.date = new Date(newDate);
    match.status = "upcoming";
    match.reason = reason || "Rescheduled";
    await match.save();

    // Notify all participants
    await Promise.all(
      match.participants.map((userId) =>
        Notification.create({
          user: userId,
          message: `Match "${match.title}" has been rescheduled to ${newDate}. Reason: ${reason || "Rescheduled"}`,
          reason: "Match rescheduled",
        })
      )
    );

    // Fetch updated match from DB
    const updatedMatch = await Match.findById(match._id)
      .populate("createdBy", "name email")
      .populate("participants", "name email");

    res.json({ msg: "Match rescheduled successfully", match: updatedMatch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Create a new match
exports.createMatch = async (req, res) => {
  try {
    const { title, gameType, date, location, maxPlayers, description, ageLimit } = req.body;
    const createdBy = req.user.id;

    // Validation
    if (!title || !gameType || !date || !location) {
      return res
        .status(400)
        .json({ msg: "Title, game type, date, and location are required" });
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

    const match = await Match.create({
      title,
      gameType,
      date: matchDate,
      location,
      maxPlayers: maxPlayers || 11,
      description: description || "",
      createdBy,
      participants: [createdBy], // Creator automatically joins
      status,
      ageLimit
    });

    const populatedMatch = await Match.findById(match._id)
      .populate("createdBy", "name email")
      .populate("participants", "name email");
    // Notify creator
    await Notification.create({
      user: createdBy,
      message: `Match "${title}" created successfully!`,
      reason: "Match created",
    });
    res
      .status(201)
      .json({ msg: "Match created successfully", match: populatedMatch });
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
    if (location) filter.location = { $regex: location, $options: "i" };
    if (status) filter.status = status;
    if (date) {
      const filterDate = new Date(date);
      filter.date = { $gte: filterDate };
    }

    let matches = await Match.find(filter)
      .populate("createdBy", "name email")
      .populate("participants", "name email")
      .sort({ date: 1 });

    // Dynamically update status before sending
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    matches = matches.map(match => {
      const matchDate = new Date(match.date);
      let newStatus = "upcoming";
      if (matchDate.toDateString() === today.toDateString()) {
        newStatus = "ongoing";
      } else if (matchDate < today) {
        newStatus = "past";
      }
      if (match.status !== newStatus) {
        match.status = newStatus;
      }
      return match;
    });

    res.json({ matches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get specific match
exports.getMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("participants", "name email");

    if (!match) {
      return res.status(404).json({ msg: "Match not found" });
    }

    // Dynamically update status before sending
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const matchDate = new Date(match.date);
    let newStatus = "upcoming";
    if (matchDate.toDateString() === today.toDateString()) {
      newStatus = "ongoing";
    } else if (matchDate < today) {
      newStatus = "past";
    }
    if (match.status !== newStatus) {
      match.status = newStatus;
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
    if (!match) {
      return res.status(404).json({ msg: "Match not found" });
    }

    // Only creator can update
    if (match.createdBy.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ msg: "Not authorized to update this match" });
    }

    const { title, gameType, date, location, maxPlayers, description } =
      req.body;
    const updateData = {};

    if (title) updateData.title = title;
    if (gameType) updateData.gameType = gameType;
    if (date) {
      const matchDate = new Date(date);
      if (matchDate <= new Date()) {
        return res
          .status(400)
          .json({ msg: "Match date must be in the future" });
      }
      updateData.date = matchDate;
    }
    if (location) updateData.location = location;
    if (maxPlayers) updateData.maxPlayers = maxPlayers;
    if (description !== undefined) updateData.description = description;

    const updatedMatch = await Match.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate("createdBy", "name email")
      .populate("participants", "name email");
    // Notify all participants except updater
    const notifyIds = updatedMatch.participants.filter(
      (id) => id.toString() !== req.user.id.toString()
    );
    await Promise.all(
      notifyIds.map((userId) =>
        Notification.create({
          user: userId,
          message: `Match "${updatedMatch.title}" was updated.`,
          reason: "Match updated",
        })
      )
    );
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
      return res
        .status(403)
        .json({ msg: "Not authorized to delete this match" });
    }

    await Match.findByIdAndDelete(req.params.id);
    // Notify all participants before deleting
    await Promise.all(
      match.participants.map((userId) =>
        Notification.create({
          user: userId,
          message: `Match "${match.title}" has been deleted.`,
          reason: "Match deleted",
        })
      )
    );
    res.json({ msg: "Match deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Join match
exports.joinMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ msg: "Match not found" });
    }

    if (match.status !== "upcoming") {
      return res
        .status(400)
        .json({ msg: "Cannot join completed or cancelled matches" });
    }

    if (match.participants.includes(req.user.id)) {
      return res.status(400).json({ msg: "Already joined this match" });
    }

    if (match.participants.length >= match.maxPlayers) {
      return res.status(400).json({ msg: "Match is full" });
    }

    // Age restriction check
    if (match.ageLimit && match.ageLimit > 0) {
      const user = await User.findById(req.user.id);
      let userAge = 0;
      if (user.dob) {
        userAge = Math.floor((Date.now() - new Date(user.dob)) / (365.25 * 24 * 60 * 60 * 1000));
      }
      if (userAge < match.ageLimit) {
        await Notification.create({
          user: req.user.id,
          message: `You cannot join match \"${match.title}\". Minimum age is ${match.ageLimit}.`,
          reason: "Age restriction"
        });
        return res.status(403).json({ msg: `Minimum age to join this match is ${match.ageLimit}` });
      }
    }

    match.participants.push(req.user.id);
    await match.save();

    const updatedMatch = await Match.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("participants", "name email");
    // Notify user
    await Notification.create({
      user: req.user.id,
      message: `You have joined match \"${match.title}\"`,
      reason: "Joined match",
    });
    // Optionally notify owner
    await Notification.create({
      user: match.createdBy,
      message: `${req.user.name} joined your match "${match.title}"`,
      reason: "Participant joined",
    });

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
      return res
        .status(400)
        .json({ msg: "Creator cannot leave their own match" });
    }

    if (!match.participants.includes(req.user.id)) {
      return res.status(400).json({ msg: "Not joined this match" });
    }

    // Get reason from request body
    const reason = req.body.reason || "No reason provided";

    match.participants = match.participants.filter(
      (participant) => participant.toString() !== req.user.id
    );
    await match.save();

    const updatedMatch = await Match.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("participants", "name email");

    // Notify owner
    await Notification.create({
      user: match.createdBy,
      message: `${req.user.name} left your match "${match.title}". Reason: ${reason}`,
      reason: "Participant left"
    });

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
      $or: [{ createdBy: userId }, { participants: userId }],
    })
      .populate("createdBy", "name email")
      .populate("participants", "name email")
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
      createdBy: userId,
    })
      .populate("createdBy", "name email")
      .populate("participants", "name email")
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
      createdBy: { $ne: userId }, // Exclude matches created by user
    })
      .populate("createdBy", "name email")
      .populate("participants", "name email")
      .sort({ date: 1 });

    res.json({ matches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
