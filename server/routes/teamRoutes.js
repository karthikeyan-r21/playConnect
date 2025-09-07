const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const teamController = require("../controllers/teamController");
// Delete a team (owner only)
router.delete('/:teamId', auth, teamController.deleteTeam);

// Create a new team
router.post("/create", auth, teamController.createTeam);

// Update team info (name, description, sportType)
router.put('/update/:teamId', auth, teamController.editTeam);

// Send a join request to a team
router.post("/:teamId/join", auth, teamController.sendJoinRequest);

// Approve a user's join request (owner only)
router.post("/:teamId/approve", auth, teamController.approveJoinRequest);

// Reject a user's join request (owner only)
router.post("/:teamId/reject", auth, teamController.rejectJoinRequest);

// Search for teams by name, sportType, location
router.get("/search",auth, teamController.searchTeams);

// Get all teams created or joined by a user
router.get("/user/:userId", teamController.getUserTeams);

// Get details of a specific team
router.get("/:teamId", auth, teamController.getTeamDetails);

// Leave a team (member only)
router.post("/:teamId/leave", auth, teamController.leaveTeam);

// Remove a member from a team (owner only)
router.delete('/:teamId/members/:memberId', auth, teamController.deleteTeamMember);

// Get only teams joined by a user (not created)
router.get("/user/:userId/joined", auth, teamController.getJoinedTeams);

// Get only teams created by a user
router.get("/user/:userId/created", auth, teamController.getCreatedTeams);

// List pending join requests for a team (owner only)
router.get("/:teamId/join-requests", auth, teamController.listJoinRequests);

// Get only members of a team
router.get('/:teamId/members', auth, teamController.getTeamMembers);

module.exports = router;