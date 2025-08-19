const Match = require("../models/Match");


exports.getMatchParticipants =
    async (req,res) =>
    {
        try 
        
        {
            const matchId = req.params.matchId;
            const match = await Match.findById(matchId).populate("participants", "name email phone location");
             if (!match) {
            return res.status(404).json({ message: "Match not found" });
        }
        res.json(match.participants);
            
        } catch (error) {
            console.error("Error fetching match participants:", error);
            res.status(500).json({ message: "Internal server error" });
        }           
    };



    

exports.deleteParticipantFromMatch = async (req, res) => {
    try {
        const { matchId, participantId } = req.params;
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({ message: "Match not found" });
        }
        // Only creator can delete participants
        if (match.createdBy.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "Not authorized to remove participants from this match" });
        }
        // Prevent creator from removing themselves
        if (participantId === match.createdBy.toString()) {
            return res.status(400).json({ message: "Creator cannot be removed from their own match" });
        }
        // Remove participant
        const beforeCount = match.participants.length;
        match.participants = match.participants.filter(
            (id) => id.toString() !== participantId
        );
        if (match.participants.length === beforeCount) {
            return res.status(404).json({ message: "Participant not found in match" });
        }
        await match.save();
        res.json({ message: "Participant removed successfully" });
    } catch (error) {
        console.error("Error deleting participant:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
 