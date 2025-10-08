import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useLogout } from '../hooks/useAuth';
import { 
  Play, 
  LogOut, 
  User, 
  Trophy, 
  Users, 
  Calendar, 
  MapPin, 
  Settings, 
  Menu, 
  X,
  Edit3,
  Video,
  Bell
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { getUnreadCount } = useNotifications();
  const { logout } = useLogout();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const unreadCount = getUnreadCount();

  const handleLogout = () => {
    logout();
    // Navigation will be handled by the AuthContext
  };

  const handleMenuClick = (route) => {
    navigate(route);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const menuItems = [
    { icon: Users, label: 'Find Players', color: 'text-blue-500', route: '/find-players' },
    { icon: Calendar, label: 'Matches', color: 'text-green-500', route: '/matches' },
    { icon: MapPin, label: 'Book Venues', color: 'text-purple-500', route: '/venues' },
    { icon: Trophy, label: 'Join Tournament', color: 'text-yellow-500', route: '/tournaments' },
    { icon: Settings, label: 'Settings', color: 'text-gray-500', route: '/settings' },
  ];

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
        
        @keyframes notification-glow {
          0%, 100% { 
            box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.9), 0 0 30px rgba(239, 68, 68, 0.4);
            transform: scale(1.1);
          }
        }
        
        .notification-badge {
          animation: notification-glow 2.5s infinite ease-in-out;
        }
        
        @keyframes notification-bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0) scale(1);
          }
          40%, 43% {
            transform: translate3d(0,-8px,0) scale(1.1);
          }
          70% {
            transform: translate3d(0,-4px,0) scale(1.05);
          }
          90% {
            transform: translate3d(0,-1px,0) scale(1.02);
          }
        }
        
        .group:hover .notification-badge {
          animation: notification-bounce 0.8s ease-in-out, notification-glow 2.5s infinite ease-in-out;
        }
        
        @keyframes bell-shadow {
          0%, 100% {
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
          }
          50% {
            filter: drop-shadow(0 8px 16px rgba(59, 130, 246, 0.3));
          }
        }
        
        .group:hover .bell-icon {
          animation: bell-shadow 0.6s ease-in-out;
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white/95 via-blue-50/90 to-purple-50/95 backdrop-blur-md shadow-2xl border-r border-white/30 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out lg:static lg:inset-0 flex flex-col`}>
        {/* Profile Section */}
        <div className="p-6 border-b border-white/40 bg-gradient-to-r from-white/20 to-blue-50/30">
          <div className="flex items-center justify-between mb-4">
            {/* <div className="flex items-center">
              <Play className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-lg font-bold text-gray-900">PlayConnect</span>
            </div> */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Profile Image and Info */}
          <div className="text-center">
            <div className="relative inline-block mb-3">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-white/50 shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center border-4 border-white/50 shadow-lg">
                  <User className="h-8 w-8 text-white drop-shadow-sm" />
                </div>
              )}
              <button className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-1.5 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg">
                <Edit3 className="h-3 w-3" />
              </button>
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">{user?.name || 'User'}</h3>
            <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
            {user?.location && (
              <p className="text-xs text-gray-400 flex items-center justify-center mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {user.location}
              </p>
            )}
            
            {/* View Profile Button */}
            <button 
              onClick={() => handleMenuClick('/profile')}
              className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              View Profile
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 flex-1 overflow-y-auto bg-gradient-to-b from-transparent to-white/10">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <button 
                  onClick={() => handleMenuClick(item.route)}
                  className={`w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-white/40 hover:backdrop-blur-sm rounded-lg transition-all duration-200 group ${
                    location.pathname === item.route ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 border-r-2 border-blue-600 shadow-lg' : ''
                  }`}
                >
                  <item.icon className={`h-5 w-5 mr-3 ${item.color} group-hover:scale-110 transition-transform ${
                    location.pathname === item.route ? 'text-blue-600' : ''
                  }`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/40 bg-gradient-to-r from-white/20 to-red-50/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-100/60 hover:backdrop-blur-sm rounded-lg transition-all duration-200 shadow-sm"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white/80 backdrop-blur-md shadow-lg px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <Play className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-lg font-bold text-gray-900">PlayConnect</span>
            </div>
            <button
              onClick={() => navigate('/notifications')}
              className="relative text-gray-600 hover:text-blue-600 group transition-all duration-300"
              title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
            >
              <Bell className="h-6 w-6 group-hover:animate-bell-ring bell-icon transition-all duration-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center notification-badge font-semibold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:block bg-white/80 backdrop-blur-md shadow-lg border-b border-white/30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Play className="h-8 w-8 text-blue-600" />
                <span className="ml-3 text-xl font-bold text-gray-900">PlayConnect</span>
              </div>
              <div className="flex items-center space-x-4">
                
                <button
                  onClick={() => navigate('/notifications')}
                  className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 group"
                  title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
                >
                  <Bell className="h-6 w-6 group-hover:animate-bell-ring bell-icon transition-all duration-300" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center notification-badge font-semibold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6 lg:p-8">
          {/* Welcome Message */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-8 shadow-xl border border-white/20">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0] || 'Player'}! 🎮
            </h1>
            <p className="text-blue-100 text-lg">
              Ready to connect, play, and win? Let's get started with your gaming journey.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/30 hover:shadow-xl hover:border-white/50 hover:bg-white/80 transition-all duration-200 text-left group">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg group-hover:from-yellow-500 group-hover:to-orange-600 transition-all duration-200 shadow-lg">
                  <Trophy className="h-6 w-6 text-white drop-shadow-sm" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Games Won</p>
                  <p className="text-2xl font-bold text-gray-800">0</p>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => handleMenuClick('/teams')}
              className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/30 hover:shadow-xl hover:border-white/50 hover:bg-white/80 transition-all duration-200 text-left group"
            >
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg group-hover:from-blue-600 group-hover:to-indigo-700 transition-all duration-200 shadow-lg">
                  <Users className="h-6 w-6 text-white drop-shadow-sm" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Teams</p>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/browse-matches')}
              className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/30 hover:shadow-xl hover:border-white/50 hover:bg-white/80 transition-all duration-200 text-left group"
            >
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg group-hover:from-green-600 group-hover:to-emerald-700 transition-all duration-200 shadow-lg">
                  <Calendar className="h-6 w-6 text-white drop-shadow-sm" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Browse Matches</p>
                 
                </div>
              </div>
            </button>
          </div>

          {/* Talent Showcase Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/30 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Video className="h-8 w-8 text-white drop-shadow-sm" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Showcase Your Talents</h3>
              <p className="text-gray-500 mb-4">
                Upload videos and images to show off your skills and connect with other players.
              </p>
              <button 
                onClick={() => navigate('/talent-showcase')}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:via-pink-700 hover:to-red-700 transition-all duration-200 font-medium shadow-lg"
              >
                Upload Your Talent
              </button>
            </div>
          </div>

          {/* Additional Content for Testing Scroll */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/30">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => handleMenuClick('/matches')}
                  className="w-full flex items-center p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New player joined</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </button>
                <button 
                  onClick={() => handleMenuClick('/scheduled-matches')}
                  className="w-full flex items-center p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Match scheduled</p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </button>
                <button 
                  onClick={() => handleMenuClick('/venues')}
                  className="w-full flex items-center p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <MapPin className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Venue booked</p>
                    <p className="text-xs text-gray-500">6 hours ago</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/30">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Tips</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-medium text-blue-900 mb-1">Find Players</h4>
                  <p className="text-sm text-blue-700">Connect with players in your area and build your gaming network.</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-medium text-green-900 mb-1">Book Venues</h4>
                  <p className="text-sm text-green-700">Reserve courts and facilities for your matches and practice sessions.</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-medium text-purple-900 mb-1">Join Tournaments</h4>
                  <p className="text-sm text-purple-700">Participate in local and online tournaments to test your skills.</p>
                </div>
              </div>
            </div>
          </div>

          {/* More Content Sections for Testing */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/30 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center justify-between p-4 border border-white/40 bg-white/30 rounded-lg hover:bg-white/50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Tournament {item}</h4>
                      <p className="text-sm text-gray-500">Local gaming tournament</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Jan {item + 15}</p>
                    <p className="text-xs text-gray-500">2025</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Spacing */}
          <div className="h-20"></div>
        </main>
      </div>


    </div>
    </>
  );
};

export default Dashboard;
