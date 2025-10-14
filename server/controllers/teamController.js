const mongoose = require("mongoose");
const Team = require("../models/Team");
const Notification = require("../models/notification");

exports.createTeam = async (req, res) => {
  try {
    const { name, description, sportType, location, minAge } = req.body;
    const createdBy = req.user.id;

    if (!name) {
      return res.status(400).json({ message: "Team name is required" });
    }

    const teamData = { name, description, sportType, minAge, createdBy, members: [createdBy] };

    // Normalize location: accept GeoJSON object or string address
    if (location && typeof location === 'object' && Array.isArray(location.coordinates)) {
      const [lng, lat] = location.coordinates.map(Number);
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({ message: 'Invalid location coordinates' });
      }
      teamData.location = { type: 'Point', coordinates: [lng, lat] };
    } else if (location && typeof location === 'string') {
      // store human-readable address separately
      teamData.address = location;
    }

    const team = new Team(teamData);

    await team.save();
    res.status(201).json({ message: "Team created successfully", team });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



exports.editTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, description, sportType, location } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Only the creator can edit
    if (team.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Only the team owner can edit the team" });
    }

    if (name) team.name = name;
    if (description) team.description = description;
    if (sportType) team.sportType = sportType;
    // Allow updating location: accept GeoJSON object or string address
    if (location && typeof location === 'object' && Array.isArray(location.coordinates)) {
      const [lng, lat] = location.coordinates.map(Number);
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({ message: 'Invalid location coordinates' });
      }
      team.location = { type: 'Point', coordinates: [lng, lat] };
      team.address = undefined;
    } else if (location && typeof location === 'string') {
      team.address = location;
      team.location = undefined;
    }

    await team.save();
    res.json({ message: "Team updated successfully", team });
  } catch (error) {
    console.error("Error editing team:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.searchTeams = async (req, res) => {
  try {
    const { name, sportType, location, description} = req.query;
    let filter = {};
    if (name) filter.name = { $regex: name, $options: "i" };
    if (sportType) filter.sportType = { $regex: sportType, $options: "i" };
    // Fix location search - search in address field for string addresses
    if (location) {
      filter.$or = [
        { address: { $regex: location, $options: "i" } },
        { "location.coordinates": { $exists: true } } // For GeoJSON locations, we'll need coordinates search
      ];
    }
    if (description) filter.description = { $regex: description, $options: "i" };

    const teams = await Team.find(filter)
      .populate("createdBy", "name email mobile dob location profileImage media createdAt")
      .populate("members", "name email mobile dob location profileImage media createdAt");

    res.json({ teams });
  } catch (error) {
    console.error("Error searching teams:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserTeams = async (req, res) => {
  try {
    const userId = req.params.userId; // Get userId from URL

    // Find teams where the user is a member or creator
    const teams = await Team.find({
      $or: [{ createdBy: userId }, { members: userId }],
    })
      .populate("createdBy", "name email")
      .populate("members", "name email");

    res.json({ teams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.sendJoinRequest = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (
      team.members.includes(req.user.id) ||
      team.joinRequests.includes(req.user.id)
    ) {
      return res
        .status(400)
        .json({
          message: "You are already a member or have a pending request",
        });
    }

    // Age restriction check
    const user = await require('../models/User').findById(req.user.id);
    const minAge = team.minAge || 0;
    let userAge = 0;
    if (user.dob) {
      userAge = Math.floor((Date.now() - new Date(user.dob)) / (365.25 * 24 * 60 * 60 * 1000));
    }
    if (userAge < minAge) {
      await Notification.create({
        user: req.user.id,
        message: `You cannot join ${team.name}. Minimum age is ${minAge}.`,
        reason: "Age restriction"
      });
      return res.status(403).json({ message: `Minimum age to join this team is ${minAge}` });
    }

    team.joinRequests.push(req.user.id);
    await team.save();

    await Notification.create({
      user: team.createdBy,
      message: `${req.user.name} requested to join your team ${team.name}`,
      reason: req.body.reason || "Join request"
    });

    res.json({ message: "Join request sent successfully", team });
  } catch (error) {
    console.error("Error sending join request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.approveJoinRequest = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.createdBy.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the team creator can approve requests" });
    }

    // Check if userId is in joinRequests
    if (!team.joinRequests.map(id => id.toString()).includes(userId.toString())) {
      return res
        .status(400)
        .json({ message: "No pending request from this user" });
    }

    // Add user to members only if not already present
    if (!team.members.map(id => id.toString()).includes(userId.toString())) {
      team.members.push(userId);
    }

    // Remove user from joinRequests
    team.joinRequests = team.joinRequests.filter(
      (id) => id.toString() !== userId.toString()
    );

    await team.save();

    // Notify user who was approved
    await Notification.create({
      user: userId,
      message: `Your join request for team ${team.name} was approved.`,
      reason: req.body.reason || "Join request approved"
    });

    res.json({ message: "Join request approved successfully", team });
  } catch (error) {
    console.error("Error approving join request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.rejectJoinRequest = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.createdBy.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the team creator can reject requests" });
    }

    if (!team.joinRequests.includes(userId)) {
      return res
        .status(400)
        .json({ message: "No pending request from this user" });
    }

    team.joinRequests = team.joinRequests.filter(
      (id) => id.toString() !== userId.toString()
    );
    await team.save();
    // Notify user who was approved
    // Notify user who was rejected
    await Notification.create({
      user: userId,
      message: `Your join request for team ${team.name} was rejected.`,
      reason: req.body.reason || "Join request rejected"
    });
    res.json({ message: "Join request rejected successfully", team });
  } catch (error) {
    console.error("Error rejecting join request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getTeamDetails = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId)
      .populate("members", "name email mobile dob location profileImage media createdAt")
      .populate("createdBy", "name email mobile dob location profileImage media createdAt")
      .populate("joinRequests", "name email mobile dob location profileImage media createdAt");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json(team);
  } catch (error) {
    console.error("Error fetching team details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteTeamMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    // Only the team owner can delete members
    if (team.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Only the team owner can delete members" });
    }

    if (!memberId || !mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: "Invalid member ID" });
    }

    if (!team.members.some((id) => id.toString() === memberId.toString())) {
      return res.status(400).json({ message: "User is not a member of the team" });
    }

    // Remove the member from the team
    team.members = team.members.filter(
      (id) => id.toString() !== memberId.toString()
    );
    await team.save();

    // Notify removed user
    await Notification.create({
      user: memberId,
      message: `You have been removed from team ${team.name} by the owner.`,
      reason: req.body.reason || "Removed from team"
    });
    res.json({ message: "Member removed successfully", team });
  } catch (error) {
    console.error("Error deleting team member:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.leaveTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is a member
    if (!team.members.some((id) => id.toString() === req.user.id.toString())) {
      return res.status(404).json({ message: "You are not a member of this team" });
    }

    // Team owner cannot leave the team
    if (team.createdBy.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: "Team owner cannot leave the team" });
    }

    // Remove the user from the team
    team.members = team.members.filter(
      (id) => id.toString() !== req.user.id.toString()
    );
    await team.save();

    // Notify team owner
    await Notification.create({
      user: team.createdBy,
      message: `${req.user.name} has left your team ${team.name}`,
      reason: req.body.reason || "Left team"
    });

    res.json({ message: "You have left the team successfully", team });
  } catch (error) {
    console.error("Error leaving team:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getJoinedTeams = async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find teams where the user is a member but not the creator
    const teams = await Team.find({
      members: userId,
      createdBy: { $ne: userId }
    })
      .populate("createdBy", "name email mobile dob location profileImage media createdAt")
      .populate("members", "name email mobile dob location profileImage media createdAt");
    res.json({ teams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getCreatedTeams = async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find teams where the user is the creator
    const teams = await Team.find({
      createdBy: userId
    })
      .populate("createdBy", "name email mobile dob location profileImage media createdAt")
      .populate("members", "name email mobile dob location profileImage media createdAt");
    res.json({ teams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.listJoinRequests = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId).populate("joinRequests", "name email mobile dob location profileImage media createdAt");
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    // Only the team owner can view join requests
    if (team.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Only the team owner can view join requests" });
    }
    res.json({ joinRequests: team.joinRequests });
  } catch (error) {
    console.error("Error listing join requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId)
      .populate("members", "name email mobile dob location profileImage media createdAt")
      .populate("joinRequests", "name email mobile dob location profileImage media createdAt");
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.json({
      members: team.members,
      joinRequests: team.joinRequests
    });
  } catch (error) {
    console.error("Error fetching team members and requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




// Search teams near a location
exports.searchNearbyTeams = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 5000, sportType, name, limit = 50 } = req.query; // distances in meters
    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and longitude required" });
    }

    // Build the $geoNear stage with optional query filters
    const geoNearStage = {
      $geoNear: {
        near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
        distanceField: "distanceMeters",
        spherical: true,
        maxDistance: parseInt(maxDistance),
        query: {}
      }
    };

    if (sportType) {
      geoNearStage.$geoNear.query.sportType = { $regex: sportType, $options: 'i' };
    }
    if (name) {
      geoNearStage.$geoNear.query.name = { $regex: name, $options: 'i' };
    }

    const pipeline = [geoNearStage, { $limit: parseInt(limit) }];

    const teams = await Team.aggregate(pipeline);

    res.json({ teams });
  } catch (err) {
    console.error("Error searching nearby teams:", err);
    res.status(500).json({ message: "Error searching nearby teams", error: err.message });
  }
};
// Delete a team and notify all members
exports.deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const reason = (req.body && req.body.reason) || (req.query && req.query.reason) || "Team deleted";
    const team = await Team.findById(teamId).populate('members', '_id name email');
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    // Only the team owner can delete the team
    if (team.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Only the team owner can delete the team" });
    }
    // Notify all members (except owner)
    const memberIds = team.members
      .filter(member => member._id.toString() !== team.createdBy.toString())
      .map(member => member._id);
    await Promise.all(memberIds.map(memberId =>
      Notification.create({
        user: memberId,
        message: `Team ${team.name} has been deleted by the owner.`,
        reason
      })
    ));
    await team.deleteOne();
    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Error deleting team:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};