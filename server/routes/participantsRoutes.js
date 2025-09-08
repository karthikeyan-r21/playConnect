const express = require("express");
const auth = require("../middleware/auth");  
const router = express.Router();

const participantsController = require("../controllers/participantsController");

router.get('/participants/:matchId', auth, participantsController.getMatchParticipants);
router.delete('/:matchId/:participantId',auth, participantsController.deleteParticipantFromMatch);
module.exports = router;



 