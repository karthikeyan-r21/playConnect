const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const teamController = require("../controllers/teamController");

// Search routes (must come before parameterized routes)
router.get("/search", auth, teamController.searchTeams);
router.get("/search-nearby", auth, teamController.searchNearbyTeams);

// User-specific routes (must come before /:teamId)
router.get("/user/:userId", auth, teamController.getUserTeams);
router.get("/user/:userId/joined", auth, teamController.getJoinedTeams);
router.get("/user/:userId/created", auth, teamController.getCreatedTeams);

// Create a new team
router.post("/create", auth, teamController.createTeam);

// Team-specific routes (parameterized routes should come last)
router.get("/:teamId", auth, teamController.getTeamDetails);
router.put("/update/:teamId", auth, teamController.editTeam);
router.delete("/:teamId", auth, teamController.deleteTeam);

// Team membership routes
router.post("/:teamId/join", auth, teamController.sendJoinRequest);
router.post("/:teamId/approve", auth, teamController.approveJoinRequest);
router.post("/:teamId/reject", auth, teamController.rejectJoinRequest);
router.post("/:teamId/leave", auth, teamController.leaveTeam);

// Team member management
router.get("/:teamId/members", auth, teamController.getTeamMembers);
router.get("/:teamId/join-requests", auth, teamController.listJoinRequests);
router.delete("/:teamId/members/:memberId", auth, teamController.deleteTeamMember);

module.exports = router;