import React, { useState } from 'react';
import LocationInput from './LocationInput';
import { MapPin, Calendar, Users } from 'lucide-react';

const LocationDemo = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationChange = (locationData) => {
    setSelectedLocation(locationData);
    console.log('Selected Location:', locationData);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Location Selection Demo
        </h2>
        <p className="text-gray-600">
          Test the enhanced location input with Google Maps integration
        </p>
      </div>

      <div className="space-y-6">
        {/* Location Input */}
        <LocationInput
          value={selectedLocation?.address || ''}
          onChange={handleLocationChange}
          placeholder="Search for a stadium, ground, or city..."
          required={true}
        />

        {/* Selected Location Display */}
        {selectedLocation && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Selected Location Details
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start">
                <span className="font-medium text-gray-600 w-20">Name:</span>
                <span className="text-gray-800">{selectedLocation.name || 'N/A'}</span>
              </div>
              
              <div className="flex items-start">
                <span className="font-medium text-gray-600 w-20">Address:</span>
                <span className="text-gray-800">{selectedLocation.address}</span>
              </div>
              
              <div className="flex items-start">
                <span className="font-medium text-gray-600 w-20">Coordinates:</span>
                <span className="text-gray-800 font-mono">
                  {selectedLocation.lat?.toFixed(6)}, {selectedLocation.lng?.toFixed(6)}
                </span>
              </div>
              
              {selectedLocation.types && selectedLocation.types.length > 0 && (
                <div className="flex items-start">
                  <span className="font-medium text-gray-600 w-20">Types:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedLocation.types.slice(0, 3).map((type, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {type.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mock Match Preview */}
        {selectedLocation && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-green-400 to-green-600 p-4 text-white">
              <h3 className="text-lg font-semibold">Cricket Match Preview</h3>
              <span className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                Cricket
              </span>
            </div>
            
            <div className="p-4 space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2 text-green-500" />
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 text-red-500" />
                {selectedLocation.name || selectedLocation.address}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2 text-indigo-500" />
                1 / 11 players
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">How to test:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Type a city name (e.g., "Mumbai", "Delhi", "Bangalore")</li>
            <li>• Search for sports venues (e.g., "Cricket Stadium", "Football Ground")</li>
            <li>• Use the location button to get your current position</li>
            <li>• Notice how readable names are displayed instead of coordinates</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LocationDemo;
