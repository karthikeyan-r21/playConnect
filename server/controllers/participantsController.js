const Match = require("../models/Match");

// Get all participants for a match (only creator can see full details)
exports.getMatchParticipants = async (req, res) => {
    try {
        const matchId = req.params.matchId;
        const match = await Match.findById(matchId).populate("participants", "name email mobile location");
        if (!match) {
            return res.status(404).json({ message: "Match not found" });
        }

        // Only match creator can see participant contact details
        if (match.createdBy.toString() !== req.user.id.toString()) {
            return res.status(403).json({ 
                message: "Only match creator can view participant contact details" 
            });
        }

        // Return participant details with contact information
        const participantDetails = match.participants.map(participant => ({
            id: participant._id,
            name: participant.name,
            email: participant.email,
            phone: participant.mobile || 'Not provided',
            location: participant.location || 'Not provided'
        }));

        res.json({
            matchTitle: match.title,
            totalParticipants: participantDetails.length,
            maxPlayers: match.maxPlayers,
            participants: participantDetails
        });
    } catch (error) {
        console.error("Error fetching match participants:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
        
// ...existing code...

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
        // Get reason from request body
        const reason = req.body.reason || "No reason provided";
        // Remove participant
        const beforeCount = match.participants.length;
        match.participants = match.participants.filter(
            (id) => id.toString() !== participantId
        );
        if (match.participants.length === beforeCount) {
            return res.status(404).json({ message: "Participant not found in match" });
        }
        await match.save();
        // Notify participant
        const Notification = require("../models/notification");
        await Notification.create({
            user: participantId,
            message: `You have been removed from match "${match.title}". Reason: ${reason}`,
            reason: "Removed from match"
        });
        res.json({ message: "Participant removed successfully" });
    } catch (error) {
        console.error("Error deleting participant:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
 