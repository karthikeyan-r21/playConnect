const express = require("express");
const auth = require("../middleware/auth");  
const router = express.Router();

const participantsController = require("../controllers/participantsController");

router.get('/match/:matchId/',auth, participantsController.getMatchParticipants);
router.delete('/match/:matchId/:participantId',auth, participantsController.deleteParticipantFromMatch);
module.exports = router;



 