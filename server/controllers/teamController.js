const mongoose = require("mongoose");
const Team = require("../models/team");

exports.createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    const createdBy = req.user.id;

    if (!name) {
      return res.status(400).json({ message: "Team name is required" });
    }

    const team = new Team({
      name,
      description,
      createdBy,
      members: [createdBy], // Add creator as the first member
    });

    await team.save();
    res.status(201).json({ message: "Team created successfully", team });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.sendJoinRequest = async (req, res) => {
  try {
    const { teamId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.members.includes(req.user.id) || team.joinRequests.includes(req.user.id)) {
      return res.status(400).json({ message: "You are already a member or have a pending request" });
    }

    team.joinRequests.push(req.user.id);
    await team.save();

    res.json({ message: "Join request sent successfully", team });
  } catch (error) {
    console.error("Error sending join request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.approveJoinRequest = async (req, res) => {
  try {
    const { teamId, userId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Only the team creator can approve requests" });
    }

    if (!team.joinRequests.includes(userId)) {
      return res.status(400).json({ message: "No pending request from this user" });
    }

    team.members.push(userId);
    team.joinRequests = team.joinRequests.filter((id) => id.toString() !== userId.toString());
    await team.save();

    res.json({ message: "Join request approved successfully", team });
  } catch (error) {
    console.error("Error approving join request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.rejectJoinRequest = async (req, res) => {
  try {
    const { teamId, userId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Only the team creator can reject requests" });
    }

    if (!team.joinRequests.includes(userId)) {
      return res.status(400).json({ message: "No pending request from this user" });
    }

    team.joinRequests = team.joinRequests.filter((id) => id.toString() !== userId.toString());
    await team.save();

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
      .populate("members", "name email")
      .populate("createdBy", "name email")
      .populate("joinRequests", "name email");

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
    console.log("Request body:", req.body); // Debug log

    const { teamId, userId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    console.log("Team found:", team);
    // Only the team owner can delete members
    if (team.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Only the team owner can delete members" });
    }

    console.log("Received userId:", userId);
    console.log("Raw request:", req); // Debug log

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!team.members.some((id) => id.toString() === userId.toString())) {
      return res.status(400).json({ message: "User is not a member of the team" });
    }

    // Remove the member from the team
    team.members = team.members.filter((id) => id.toString() !== userId.toString());
    await team.save();

    res.json({ message: "Member removed successfully", team });
  } catch (error) {
    console.error("Error deleting team member:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.leaveTeam = async (req, res) => {
  try {
    const team = await Team.findOne({ members: req.user.id });
    if (!team) {
      return res.status(404).json({ message: "You are not a member of any team" });
    }

    if (team.createdBy.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: "Team owner cannot leave the team" });
    }

    // Remove the user from the team
    team.members = team.members.filter((id) => id.toString() !== req.user.id.toString());
    await team.save();

    res.json({ message: "You have left the team successfully", team });
  } catch (error) {
    console.error("Error leaving team:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};