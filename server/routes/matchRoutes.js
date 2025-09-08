const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createMatch,
  getMatches,
  getMatch,
  updateMatch,
  deleteMatch,
  joinMatch,
  leaveMatch,
  getMyMatches,
  getJoinedMatches,
  getCreatedMatches,
  updateMatchReschedule
} = require("../controllers/matchController");

// Protected routes (require authentication)
router.use(auth);

// Match CRUD operations
router.post("/", createMatch);
router.get("/", getMatches);
router.get("/my-matches", getMyMatches);
router.get("/created-matches", getCreatedMatches);
router.get("/joined-matches", getJoinedMatches);
router.get("/:id", getMatch);
router.put("/:id/update", updateMatch);
router.delete("/:id", deleteMatch);




// Match reschedule
router.put("/:id/reschedule", updateMatchReschedule);

// Match join request system
router.post("/:id/request-join", require("../controllers/matchController").requestJoinMatch);
router.get("/:id/requests", require("../controllers/matchController").viewJoinRequests);
router.post("/:id/approve/:userId", require("../controllers/matchController").approveJoinRequest);
router.post("/:id/reject/:userId", require("../controllers/matchController").rejectJoinRequest);

// Match participation (legacy)
router.post("/:id/join", joinMatch);
router.post("/:id/leave", leaveMatch);

module.exports = router;