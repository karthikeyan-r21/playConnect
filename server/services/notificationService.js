// Notification Service - Simple implementation for tournament notifications
const User = require('../models/User');

class NotificationService {
  static async createNotification(userId, message, type = 'general', metadata = {}) {
    try {
      // For now, just console log the notification
      // In a full implementation, you'd save to a Notification model or send emails/push notifications
      console.log(`📢 Notification for user ${userId}: ${message} (type: ${type})`);
      
      // You could expand this to:
      // - Save to database notifications table
      // - Send email notifications
      // - Send push notifications
      // - Send SMS notifications
      
      return {
        success: true,
        userId,
        message,
        type,
        timestamp: new Date(),
        metadata
      };
    } catch (error) {
      console.error('Notification service error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async createNotificationForTournament(tournamentId, message, type = 'tournament') {
    try {
      // Get all tournament participants and send notifications
      const TournamentEntry = require('../models/TournamentEntry');
      const entries = await TournamentEntry.find({ 
        tournament: tournamentId, 
        status: 'accepted' 
      }).populate('requestedBy');
      
      const notifications = [];
      for (const entry of entries) {
        if (entry.requestedBy) {
          const notification = await this.createNotification(
            entry.requestedBy._id, 
            message, 
            type,
            { tournamentId }
          );
          notifications.push(notification);
        }
      }
      
      return notifications;
    } catch (error) {
      console.error('Tournament notification error:', error);
      return [];
    }
  }
}

module.exports = NotificationService;
