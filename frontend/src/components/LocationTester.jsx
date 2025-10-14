import React, { useState, useEffect } from 'react';
import LocationInput from './LocationInput';
import { CheckCircle, XCircle, AlertCircle, MapPin } from 'lucide-react';

const LocationTester = () => {
  const [apiStatus, setApiStatus] = useState('checking');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [testResults, setTestResults] = useState([]);

  // Using backend proxy - no need for frontend API key

  // Test backend location API connectivity
  useEffect(() => {
    const testLocationAPI = async () => {
      try {
        // Test backend location search endpoint
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/location/search?q=Mumbai&engine=google_maps`
        );
        
        const data = await response.json();
        
        if (data.success) {
          setApiStatus('working');
          setTestResults([
            { test: 'Backend Connection', status: 'success', message: 'Backend location API is working' },
            { test: 'Location Search', status: 'success', message: `Found ${data.results?.length || 0} location results` },
            { test: 'SerpAPI Integration', status: 'success', message: 'SerpAPI proxy is functioning' }
          ]);
        } else {
          setApiStatus('error');
          setTestResults([
            { test: 'Backend API', status: 'error', message: `Backend Error: ${data.error || 'Unknown error'}` },
            { test: 'Error Details', status: 'error', message: data.message || 'No additional details' }
          ]);
        }
      } catch (error) {
        setApiStatus('error');
        setTestResults([
          { test: 'Network', status: 'error', message: 'Failed to connect to backend location API' },
          { test: 'Error', status: 'error', message: error.message },
          { test: 'Suggestion', status: 'warning', message: 'Make sure backend server is running on port 5000' }
        ]);
      }
    };

    testLocationAPI();
  }, []);

  const handleLocationChange = (locationData) => {
    setSelectedLocation(locationData);
    console.log('Real-time location selected:', locationData);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (apiStatus) => {
    switch (apiStatus) {
      case 'working': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'no-key': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Backend Location API Tester
        </h1>
        <p className="text-gray-600">
          Test real-time location search via backend SerpAPI proxy
        </p>
      </div>

      {/* API Status */}
      <div className={`border rounded-lg p-4 ${getStatusColor(apiStatus)}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 flex items-center">
            {getStatusIcon(apiStatus === 'working' ? 'success' : 'error')}
            <span className="ml-2">API Status</span>
          </h3>
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            apiStatus === 'working' ? 'bg-green-100 text-green-800' :
            apiStatus === 'error' ? 'bg-red-100 text-red-800' :
            apiStatus === 'no-key' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {apiStatus === 'working' ? 'Connected' :
             apiStatus === 'error' ? 'Error' :
             apiStatus === 'no-key' ? 'No API Key' :
             'Checking...'}
          </span>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center text-sm">
                {getStatusIcon(result.status)}
                <span className="ml-2 font-medium">{result.test}:</span>
                <span className="ml-2 text-gray-600">{result.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Location Input Test */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Test Location Search
        </h3>
        
        <LocationInput
          value={selectedLocation?.address || ''}
          onChange={handleLocationChange}
          placeholder="Try searching: Mumbai Stadium, Delhi Ground, or any location..."
          required={false}
        />

        {/* Search Tips */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-medium text-blue-800 mb-2">Search Tips:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Try "Mumbai Cricket Stadium" or "Delhi Football Ground"</li>
            <li>• Search for cities: "Mumbai", "Delhi", "Bangalore"</li>
            <li>• Use the location button for current position</li>
            <li>• Real-time suggestions will appear as you type</li>
          </ul>
        </div>
      </div>

      {/* Selected Location Details */}
      {selectedLocation && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-green-600" />
            Selected Location (Real-time Data)
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Location Name:</span>
              <p className="text-gray-800 mt-1">{selectedLocation.name || 'N/A'}</p>
            </div>
            
            <div>
              <span className="font-medium text-gray-600">Full Address:</span>
              <p className="text-gray-800 mt-1">{selectedLocation.address}</p>
            </div>
            
            <div>
              <span className="font-medium text-gray-600">Coordinates:</span>
              <p className="text-gray-800 mt-1 font-mono">
                {selectedLocation.lat?.toFixed(6)}, {selectedLocation.lng?.toFixed(6)}
              </p>
            </div>
            
            <div>
              <span className="font-medium text-gray-600">GeoJSON:</span>
              <p className="text-gray-800 mt-1 font-mono">
                [{selectedLocation.coordinates?.[0]?.toFixed(6)}, {selectedLocation.coordinates?.[1]?.toFixed(6)}]
              </p>
            </div>

            {selectedLocation.types && selectedLocation.types.length > 0 && (
              <div className="md:col-span-2">
                <span className="font-medium text-gray-600">Location Types:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedLocation.types.slice(0, 5).map((type, index) => (
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

            {selectedLocation.rating && (
              <div>
                <span className="font-medium text-gray-600">Rating:</span>
                <p className="text-gray-800 mt-1">⭐ {selectedLocation.rating}/5</p>
              </div>
            )}
          </div>

          {/* JSON Data Preview */}
          <details className="mt-4">
            <summary className="cursor-pointer font-medium text-gray-600 hover:text-gray-800">
              View Raw JSON Data
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 border border-gray-300 rounded text-xs overflow-x-auto">
              {JSON.stringify(selectedLocation, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* API Key Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-2">API Key Configuration</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Backend API:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/location</p>
          <p><strong>SerpAPI Integration:</strong> Via backend proxy (avoids CORS issues)</p>
          <p><strong>API Service:</strong> SerpAPI Google Maps Search</p>
          <p><strong>Features:</strong> Location search, coordinates, ratings, reverse geocoding</p>
        </div>
      </div>
    </div>
  );
};

export default LocationTester;
