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
  getJoinedMatches
} = require("../controllers/matchController");

// Protected routes (require authentication)
router.use(auth);

// Match CRUD operations
router.post("/", createMatch);
router.get("/", getMatches);
router.get("/my-matches", getMyMatches);
router.get("/joined-matches", getJoinedMatches);
router.get("/:id", getMatch);
router.put("/:id", updateMatch);
router.delete("/:id", deleteMatch);

// Match participation
router.post("/:id/join", joinMatch);
router.post("/:id/leave", leaveMatch);

module.exports = router;