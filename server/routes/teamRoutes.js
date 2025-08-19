const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const teamController = require("../controllers/teamController");

router.post("/create", auth, teamController.createTeam);
router.post("/join-request", auth, teamController.sendJoinRequest);
router.post("/approve-request", auth, teamController.approveJoinRequest);
router.post("/reject-request", auth, teamController.rejectJoinRequest);
router.get("/:teamId", auth, teamController.getTeamDetails);
router.post("/leave-team", auth, teamController.leaveTeam);
router.post("/delete-member", auth, teamController.deleteTeamMember);

module.exports = router;