import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Edit3 
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { logout } = useLogout();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out lg:static lg:inset-0 flex flex-col`}>
        {/* Profile Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Play className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-lg font-bold text-gray-900">PlayConnect</span>
            </div>
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
                  className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-blue-100">
                  <User className="h-8 w-8 text-white" />
                </div>
              )}
              <button className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1.5 hover:bg-blue-700 transition-colors">
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
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <button 
                  onClick={() => handleMenuClick(item.route)}
                  className={`w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group ${
                    location.pathname === item.route ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : ''
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
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        <header className="lg:hidden bg-white shadow-sm px-4 py-3 flex-shrink-0">
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
            <div className="w-6"></div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6 lg:p-8">
          {/* Welcome Message */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0] || 'Player'}! 🎮
            </h1>
            <p className="text-blue-100 text-lg">
              Ready to connect, play, and win? Let's get started with your gaming journey.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 text-left group">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Games Won</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </button>
            
            <button className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 text-left group">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Teams</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => handleMenuClick('/browse-matches')}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 text-left group"
            >
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Browse Matches</p>
                 
                </div>
              </div>
            </button>
          </div>

          {/* Recent Activity Placeholder */}
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Start Playing?</h3>
              <p className="text-gray-500 mb-4">
                Explore the menu to find players, book venues, or join tournaments.
              </p>
              <button 
                onClick={() => handleMenuClick('/matches')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Your First Match
              </button>
            </div>
          </div>

          {/* Additional Content for Testing Scroll */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => handleMenuClick('/browse-matches')}
                  className="w-full flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
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
                  className="w-full flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
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
                  className="w-full flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
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

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
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
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
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
  );
};

export default Dashboard;
