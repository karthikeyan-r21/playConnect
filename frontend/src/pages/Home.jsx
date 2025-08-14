import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageCircle, Calendar, Trophy, Star, ArrowRight, Play, Mail, Lock, User, Phone } from 'lucide-react';

const Home = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  // Load Tenor script for animated GIF
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://tenor.com/embed.js';
    document.head.appendChild(script);

    return () => {
      // Cleanup script on component unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-[url('/images/stadium-bg.jpg')] bg-cover bg-center bg-no-repeat relative">
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      {/* Animated Soccer Ball - Left Side Center */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-20 w-24 h-24">
        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-full p-2 shadow-2xl border border-white border-opacity-20 overflow-hidden">
          <div 
            className="tenor-gif-embed w-full h-full rounded-full overflow-hidden" 
            data-postid="8988700625525532726" 
            data-share-method="host" 
            data-aspect-ratio="1.16901" 
            data-width="100%"
            style={{ 
              width: '100%', 
              height: '100%', 
              borderRadius: '50%',
              overflow: 'hidden'
            }}
          >
            <a href="https://tenor.com/view/soccer-ball-football-soccer-ball-gif-8988700625525532726">
              Soccer Ball Football Sticker
            </a>
          </div>
        </div>
      </div>
      
      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="bg-white bg-opacity-95 backdrop-blur-sm shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Play className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-2xl font-bold text-gray-900">PlayConnect</span>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleLoginClick}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Login
                </button>
                <button
                  onClick={handleRegisterClick}
                  className="border border-blue-600 text-blue-600 bg-white px-4 py-2 rounded-lg hover:bg-blue-50 transition duration-200"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Connect. Play. <span className="text-blue-400">Win.</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto drop-shadow-md">
              Join the ultimate gaming community where players connect, compete, and celebrate together. 
              Find teammates, schedule matches, and track your gaming journey all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRegisterClick}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-200 flex items-center justify-center shadow-lg"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button
                onClick={handleLoginClick}
                className="border border-white text-white bg-white bg-opacity-20 backdrop-blur-sm px-8 py-3 rounded-lg text-lg font-semibold hover:bg-opacity-30 transition duration-200 shadow-lg"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Why Choose PlayConnect?</h2>
            <p className="text-lg text-gray-200 drop-shadow-md">Everything you need to enhance your gaming experience</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-xl shadow-xl text-center border border-white border-opacity-30 hover:bg-opacity-95 hover:scale-105 transition-all duration-300 transform cursor-pointer">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Players</h3>
              <p className="text-gray-700">Connect with gamers who share your passion and skill level</p>
            </div>
            
            <div className="bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-xl shadow-xl text-center border border-white border-opacity-30 hover:bg-opacity-95 hover:scale-105 transition-all duration-300 transform cursor-pointer">
              <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Chat</h3>
              <p className="text-gray-700">Communicate with your team during matches and events</p>
            </div>
            
            <div className="bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-xl shadow-xl text-center border border-white border-opacity-30 hover:bg-opacity-95 hover:scale-105 transition-all duration-300 transform cursor-pointer">
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Schedule Matches</h3>
              <p className="text-gray-700">Organize tournaments and matches with ease</p>
            </div>
            
            <div className="bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-xl shadow-xl text-center border border-white border-opacity-30 hover:bg-opacity-95 hover:scale-105 transition-all duration-300 transform cursor-pointer">
              <Trophy className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Venue Bookings</h3>
              <p className="text-gray-700">Book and manage gaming venues for your events</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-blue-500 bg-opacity-90 backdrop-blur-sm py-16 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="text-white">
                <div className="text-4xl font-bold mb-2 drop-shadow-lg">100+</div>
                <div className="text-blue-200 drop-shadow-md">Active Players</div>
              </div>
              <div className="text-white">
                <div className="text-4xl font-bold mb-2 drop-shadow-lg">500+</div>
                <div className="text-blue-200 drop-shadow-md">Daily Matches</div>
              </div>
              <div className="text-white">
                <div className="text-4xl font-bold mb-2 drop-shadow-lg">10+</div>
                <div className="text-blue-200 drop-shadow-md">Game Categories</div>
              </div>
              <div className="text-white">
                <div className="text-4xl font-bold mb-2 drop-shadow-lg">99%</div>
                <div className="text-blue-200 drop-shadow-md">User Satisfaction</div>
              </div>
            </div>
          </div>
        </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              <button
                onClick={() => setShowLogin(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Forgot Password?
                </button>
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Sign In
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <span className="text-gray-600">Don't have an account? </span>
              <button
                onClick={() => {
                  setShowLogin(false);
                  setShowRegister(true);
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Join PlayConnect</h2>
              <button
                onClick={() => setShowRegister(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="First name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Last name"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Create a password"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="ml-2 text-sm text-gray-600">
                  I agree to the <a href="#" className="text-blue-600 hover:text-blue-800">Terms of Service</a> and <a href="#" className="text-blue-600 hover:text-blue-800">Privacy Policy</a>
                </span>
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Create Account
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <span className="text-gray-600">Already have an account? </span>
              <button
                onClick={() => {
                  setShowRegister(false);
                  setShowLogin(true);
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Home;
