import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bell, 
  Check, 
  X, 
  Users, 
  Calendar, 
  Trophy, 
  MessageSquare, 
  Clock,
  Trash2,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    handleTeamInviteAction 
  } = useNotifications();
  const [filter, setFilter] = useState('all'); // all, unread, read

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'team_invite':
      case 'team_rejected':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'match_joined':
      case 'match_reminder':
        return <Calendar className="h-5 w-5 text-green-500" />;
      case 'tournament_update':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notificationDate = new Date(timestamp);
    const diff = now - notificationDate;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const getNotificationTypeFromMessage = (message) => {
    if (message.toLowerCase().includes('team')) return 'team_invite';
    if (message.toLowerCase().includes('match')) return 'match_joined';
    if (message.toLowerCase().includes('tournament')) return 'tournament_update';
    return 'general';
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return true;
  });

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  return (
    <>
      <style jsx>{`
        @keyframes bell-ring {
          0%, 100% { 
            transform: rotate(0deg) scale(1); 
          }
          5% { 
            transform: rotate(15deg) scale(1.05); 
          }
          15% { 
            transform: rotate(-12deg) scale(1.05); 
          }
          25% { 
            transform: rotate(15deg) scale(1.05); 
          }
          35% { 
            transform: rotate(-8deg) scale(1.03); 
          }
          45% { 
            transform: rotate(10deg) scale(1.03); 
          }
          55% { 
            transform: rotate(-5deg) scale(1.02); 
          }
          65% { 
            transform: rotate(6deg) scale(1.02); 
          }
          75% { 
            transform: rotate(-2deg) scale(1.01); 
          }
          85% { 
            transform: rotate(3deg) scale(1.01); 
          }
          95% { 
            transform: rotate(-1deg) scale(1); 
          }
        }
        
        .animate-bell-ring {
          animation: bell-ring 1.2s ease-in-out;
          transform-origin: 50% 4px;
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        @keyframes notification-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
        }
        
        .notification-item {
          transition: all 0.3s ease;
        }
        
        .notification-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 hover:text-blue-600 mr-6 transition-colors group"
              >
                <ArrowLeft className="h-5 w-5 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center group">
                <div className="relative mr-4">
                  <Bell className="h-8 w-8 text-blue-600 group-hover:animate-bell-ring transition-all duration-300 cursor-pointer" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">Notifications</h1>
                  <p className="text-sm text-gray-600 flex items-center">
                    {unreadCount > 0 ? (
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                        {unreadCount} unread notifications
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        All caught up!
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center px-6 py-3 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <CheckCheck className="h-5 w-5 mr-2" />
                Mark All as Read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Filter Tabs */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex space-x-2 bg-white rounded-2xl p-2 shadow-sm border border-gray-200">
          {[
            { key: 'all', label: 'All', count: notifications.length, color: 'blue' },
            { key: 'unread', label: 'Unread', count: unreadCount, color: 'red' },
            { key: 'read', label: 'Read', count: notifications.length - unreadCount, color: 'green' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                filter === tab.key
                  ? `bg-gradient-to-r ${
                      tab.color === 'blue' ? 'from-blue-500 to-blue-600' :
                      tab.color === 'red' ? 'from-red-500 to-red-600' :
                      'from-green-500 to-green-600'
                    } text-white shadow-lg transform scale-105`
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center">
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  filter === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 py-16 px-8">
            <div className="text-center">
              <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Bell className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {filter === 'unread' ? "All Caught Up!" : "No Notifications"}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                {filter === 'unread' 
                  ? "Great job! You've read all your notifications. Check back later for new updates." 
                  : "No notifications to show in this category. Stay tuned for updates!"
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification, index) => (
              <div
                key={notification._id}
                className={`bg-white rounded-2xl border-2 p-6 notification-item animate-fade-in-up ${
                  !notification.isRead 
                    ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-white shadow-lg' 
                    : 'border-gray-200 shadow-sm hover:shadow-md'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(getNotificationTypeFromMessage(notification.message))}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                          {notification.reason || 'Notification'}
                          {!notification.isRead && (
                            <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
                              NEW
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {formatTimestamp(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg"></div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-base text-gray-700 mb-4 leading-relaxed">
                        {notification.message}
                      </p>

                      {/* Enhanced Action Buttons for Team Invitations */}
                      {notification.reason === 'team_invite' && !notification.isRead && (
                        <div className="flex space-x-3 pt-2">
                          <button
                            onClick={() => handleTeamInviteAction(notification._id, 'accept', notification.teamId)}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Accept Invite
                          </button>
                          <button
                            onClick={() => handleTeamInviteAction(notification._id, 'decline', notification.teamId)}
                            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Notification Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                        title="Mark as read"
                      >
                        <Check className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                      title="Delete notification"
                    >
                      <Trash2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Notifications;
