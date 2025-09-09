import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationAPI } from '../services/notificationAPI';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get unread notifications count
  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.isRead).length;
  };

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await notificationAPI.getNotifications();
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Set empty array on error to prevent UI issues
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    if (unreadCount === 0) return;

    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Add a new notification (for real-time updates)
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  // Remove notification from backend and local state
  const deleteNotification = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      setNotifications(prev => 
        prev.filter(notification => notification._id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Legacy function for team invite actions (kept for compatibility)
  const handleTeamInviteAction = async (notificationId, action, teamId) => {
    // Mark the notification as read when action is taken
    await markAsRead(notificationId);
    
    // Update the notification message to reflect the action
    setNotifications(prev =>
      prev.map(notif =>
        notif._id === notificationId 
          ? { 
              ...notif, 
              isRead: true,
              message: `You have ${action}ed the team invitation`
            }
          : notif
      )
    );
  };

  // Fetch notifications when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated]);

  const value = {
    notifications,
    loading,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    deleteNotification,
    handleTeamInviteAction,
    fetchNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
