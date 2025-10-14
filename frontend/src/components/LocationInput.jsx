import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Target, Search, AlertCircle, X, Map } from 'lucide-react';

// Simple coordinate input for manual location selection (fallback until Leaflet is installed)
const CoordinateSelector = ({ onLocationSelect, selectedLocation, onClose, onConfirm }) => {
  const [lat, setLat] = useState(selectedLocation?.lat || '');
  const [lng, setLng] = useState(selectedLocation?.lng || '');
  const [manualAddress, setManualAddress] = useState(selectedLocation?.address || '');

  const handleConfirm = async () => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    
    if (isNaN(latNum) || isNaN(lngNum)) {
      alert('Please enter valid coordinates');
      return;
    }
    
    if (latNum < -90 || latNum > 90) {
      alert('Latitude must be between -90 and 90');
      return;
    }
    
    if (lngNum < -180 || lngNum > 180) {
      alert('Longitude must be between -180 and 180');
      return;
    }

    // First update the selected location
    await onLocationSelect(latNum, lngNum, manualAddress || `${latNum.toFixed(6)}, ${lngNum.toFixed(6)}`);
    
    // Then create and confirm the location data
    const locationData = {
      id: `map-selected-${Date.now()}`,
      name: manualAddress || 'Selected Location',
      address: manualAddress || `${latNum.toFixed(6)}, ${lngNum.toFixed(6)}`,
      coordinates: [lngNum, latNum], // GeoJSON format [lng, lat]
      lat: latNum,
      lng: lngNum,
      city: '',
      state: '',
      country: '',
      pincode: '',
      placeId: null,
      types: ['user_selected'],
      rating: null,
      phone: null,
      website: null
    };

    onConfirm(locationData);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="text-center mb-4">
        <h4 className="text-lg font-semibold text-gray-900">Manual Location Selection</h4>
        <p className="text-sm text-gray-600 mt-1">
          Enter coordinates manually or get them from Google Maps
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="e.g., 28.6139"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="e.g., 77.2090"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
        <input
          type="text"
          value={manualAddress}
          onChange={(e) => setManualAddress(e.target.value)}
          placeholder="Enter location name or address"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-medium text-blue-900 mb-2">How to get coordinates:</h5>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Open <a href="https://maps.google.com" target="_blank" className="underline hover:text-blue-900">Google Maps</a></li>
          <li>2. Right-click on your desired location</li>
          <li>3. Click on the coordinates that appear</li>
          <li>4. Copy and paste them here</li>
        </ol>
      </div>
      
      <div className="flex justify-between pt-4">
        <button
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Use This Location
        </button>
      </div>
    </div>
  );
};

const LocationInput = ({ 
  value, 
  onChange, 
  placeholder = "Enter city, ground name, or address...",
  required = false,
  error = null 
}) => {
  const [query, setQuery] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [geoLocationError, setGeoLocationError] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Default to India center
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);
  const debounceRef = useRef(null);

  // SerpAPI configuration for location search
  const SERPAPI_KEY = import.meta.env.VITE_SERPAPI_KEY;
  
  // Initialize component
  useEffect(() => {
    if (SERPAPI_KEY) {
      console.log('SerpAPI key configured for location search');
    } else {
      console.warn('SerpAPI key not found. Location search may be limited.');
    }
    console.log('Leaflet map integration ready - no API keys required!');
  }, [SERPAPI_KEY]);

  // Enhanced geocoding with real-time SerpAPI via backend proxy
  const geocodeLocation = async (address) => {
    try {
      console.log('Searching for:', address, 'via backend proxy...');
      
      // Use backend proxy to avoid CORS issues
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/location/search?q=${encodeURIComponent(address)}&engine=google_maps`
      );
      
      const data = await response.json();
      
      if (data.success && data.results && data.results.length > 0) {
        console.log('SerpAPI results found:', data.results.length);
        return data.results;
      } else {
        console.warn('No results found from location service');
        return [];
      }
    } catch (error) {
      console.error('Backend location search error:', error);
      return [];
    }
  };

  // Backend geocoding fallback
  const backendGeocode = async (address) => {
    try {
      // Use backend proxy for general Google search
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/location/search?q=${encodeURIComponent(address + ' location')}&engine=google`
      );
      
      const data = await response.json();
      
      if (data.success && data.results && data.results.length > 0) {
        return data.results;
      }
      return [];
    } catch (error) {
      console.error('Backend geocoding error:', error);
      return [];
    }
  };



  // Get detailed place information via backend
  const getPlaceDetails = async (placeId, placeName) => {
    if (!placeId) return null;

    try {
      // If we have coordinates already, return as is
      if (placeId.startsWith('serp-') && placeName) {
        // Use backend proxy to get more details with a specific search
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/location/search?q=${encodeURIComponent(placeName)}&engine=google_maps`
        );
        
        const data = await response.json();
        
        if (data.success && data.results && data.results.length > 0) {
          const place = data.results[0];
          return {
            id: place.id || placeId,
            name: place.name || placeName,
            formatted_address: place.formatted_address || placeName,
            lat: place.lat || null,
            lng: place.lng || null,
            types: place.types || ['establishment'],
            rating: place.rating || null,
            phone: place.phone || null
          };
        }
      }
    } catch (error) {
      console.error('Backend place details error:', error);
    }
    
    return null;
  };

  // Handle location search with debouncing
  const handleSearch = async (searchQuery) => {
    setQuery(searchQuery);
    
    if (searchQuery.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the search
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await geocodeLocation(searchQuery);
        setSuggestions(results);
        setShowSuggestions(true); // Always show dropdown to display "Select on Map" option
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce
  };

  // Get current location
  const getCurrentLocation = () => {
    setGettingLocation(true);
    setGeoLocationError(null);

    if (!navigator.geolocation) {
      setGeoLocationError('Geolocation is not supported by this browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          let address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          let name = 'Current Location';
          let geoData = null;
          
          // Try to reverse geocode using backend proxy
          try {
            const reverseGeoResponse = await fetch(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/location/reverse?lat=${lat}&lng=${lng}`
            );
            geoData = await reverseGeoResponse.json();
            
            if (geoData.success && geoData.name) {
              name = geoData.name;
              address = geoData.address;
            }
          } catch (reverseError) {
            console.warn('Backend reverse geocoding failed:', reverseError);
            // Keep coordinates-based fallback
            name = 'Current Location';
            address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          }

          const locationData = {
            id: `current-${Date.now()}`,
            name: name,
            address: address,
            coordinates: [lng, lat], // GeoJSON format [lng, lat]
            lat: lat,
            lng: lng,
            city: geoData?.city || name,
            state: geoData?.state || '',
            country: geoData?.country || 'India',
            pincode: geoData?.pincode || '',
            placeId: null,
            types: ['current_location'],
            rating: null,
            phone: null,
            website: null
          };

          setQuery(address);
          setShowSuggestions(false);
          onChange(locationData);
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          const fallbackAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          const fallbackName = 'Current Location';
          const locationData = {
            id: `fallback-${Date.now()}`,
            name: fallbackName,
            address: fallbackAddress,
            coordinates: [lng, lat],
            lat: lat,
            lng: lng,
            city: '',
            state: '',
            country: 'India',
            pincode: '',
            placeId: null,
            types: ['current_location'],
            rating: null,
            phone: null,
            website: null
          };
          setQuery(fallbackAddress);
          onChange(locationData);
        }
        setGettingLocation(false);
      },
      (error) => {
        let errorMessage;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred';
            break;
        }
        setGeoLocationError(errorMessage);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Handle suggestion selection with real-time place details
  const handleSuggestionSelect = async (suggestion) => {
    setLoading(true);
    
    try {
      // If coordinates are not available, get place details
      if (!suggestion.lat || !suggestion.lng) {
        const placeDetails = await getPlaceDetails(suggestion.id, suggestion.name);
        if (placeDetails) {
          suggestion = { ...suggestion, ...placeDetails };
        }
      }

      const locationData = {
        id: suggestion.id,
        name: suggestion.name || suggestion.formatted_address.split(',')[0],
        address: suggestion.formatted_address,
        coordinates: [suggestion.lng, suggestion.lat], // GeoJSON format [lng, lat]
        lat: suggestion.lat,
        lng: suggestion.lng,
        city: suggestion.city || '',
        state: suggestion.state || '',
        country: suggestion.country || 'India',
        pincode: suggestion.pincode || '',
        placeId: suggestion.place_id || suggestion.id,
        types: suggestion.types || [],
        rating: suggestion.rating || null,
        phone: suggestion.phone || null,
        website: suggestion.website || null
      };

      setQuery(suggestion.formatted_address);
      setShowSuggestions(false);
      setSuggestions([]);
      onChange(locationData);
    } catch (error) {
      console.error('Error selecting location:', error);
      // Fallback to basic data
      const locationData = {
        id: suggestion.id,
        name: suggestion.name || suggestion.formatted_address.split(',')[0],
        address: suggestion.formatted_address,
        coordinates: [suggestion.lng || 0, suggestion.lat || 0],
        lat: suggestion.lat || 0,
        lng: suggestion.lng || 0,
        city: suggestion.city || '',
        state: suggestion.state || '',
        country: suggestion.country || 'India',
        pincode: suggestion.pincode || '',
        placeId: suggestion.place_id || suggestion.id,
        types: suggestion.types || [],
        rating: suggestion.rating || null,
        phone: suggestion.phone || null,
        website: suggestion.website || null
      };
      
      setQuery(suggestion.formatted_address);
      setShowSuggestions(false);
      setSuggestions([]);
      onChange(locationData);
    } finally {
      setLoading(false);
    }
  };

  // Handle manual location selection with reverse geocoding
  const handleMapLocationSelect = async (lat, lng, customAddress = null) => {
    try {
      let locationData = {
        lat,
        lng,
        name: customAddress || 'Selected Location',
        address: customAddress || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        city: '',
        state: '',
        country: '',
        pincode: ''
      };

      // Try reverse geocoding if no custom address provided
      if (!customAddress) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/location/reverse?lat=${lat}&lng=${lng}`
          );
          const data = await response.json();
          
          if (data.success) {
            locationData = {
              lat,
              lng,
              name: data.name || 'Selected Location',
              address: data.address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
              city: data.city || '',
              state: data.state || '',
              country: data.country || '',
              pincode: data.pincode || ''
            };
          }
        } catch (reverseError) {
          console.warn('Reverse geocoding failed, using coordinates:', reverseError);
        }
      }
      
      setSelectedMapLocation(locationData);
    } catch (error) {
      console.error('Location selection error:', error);
      setSelectedMapLocation({
        lat,
        lng,
        name: customAddress || 'Selected Location',
        address: customAddress || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        city: '',
        state: '',
        country: '',
        pincode: ''
      });
    }
  };

  // This function is now called from within CoordinateSelector component
  const handleCoordinateConfirm = (locationData) => {
    setQuery(locationData.address || locationData.name);
    setShowMapModal(false);
    setSelectedMapLocation(null);
    onChange(locationData);
  };

  // Open map modal
  const openMapModal = () => {
    setShowMapModal(true);
    // Set map center to current location if available, or user's current location
    if (value && value.coordinates) {
      setMapCenter({ lat: value.lat, lng: value.lng });
    } else {
      // Try to get user's current location for map center
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setMapCenter({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          () => {
            // Keep default center (India) if geolocation fails
          }
        );
      }
    }
  };

  // Close map modal
  const closeMapModal = () => {
    setShowMapModal(false);
    setSelectedMapLocation(null);
  };

  // Clear location
  const clearLocation = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setGeoLocationError(null);
    onChange(null);
  };

  // Set initial map location when modal opens
  useEffect(() => {
    if (showMapModal) {
      if (value && value.lat && value.lng) {
        setMapCenter({ lat: value.lat, lng: value.lng });
        setSelectedMapLocation({ lat: value.lat, lng: value.lng });
      }
    }
  }, [showMapModal, value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <MapPin className="w-4 h-4 inline mr-1" />
        Location {required && <span className="text-red-500">*</span>}
      </label>
      
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`w-full px-4 py-3 pl-10 pr-20 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
          onClick={(e) => e.stopPropagation()}
        />
        
        {/* Search Icon */}
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
        
        {/* Action Buttons */}
        <div className="absolute right-2 top-2 flex space-x-1">
          {query && (
            <button
              type="button"
              onClick={clearLocation}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
              title="Clear location"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <button
            type="button"
            onClick={openMapModal}
            className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"
            title="Select on map (OpenStreetMap - Free)"
          >
            <Map className="h-4 w-4" />
          </button>
          
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={gettingLocation}
            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
            title="Use current location"
          >
            {gettingLocation ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
            ) : (
              <Target className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="absolute right-20 top-11 pointer-events-none">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600" />
        </div>
      )}

      {/* Error Display */}
      {(error || geoLocationError) && (
        <div className="mt-2 flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error || geoLocationError}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => handleSuggestionSelect(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start transition-colors border-b border-gray-100"
              >
                <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.name || suggestion.formatted_address.split(',')[0]}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {suggestion.formatted_address}
                  </p>
                  {suggestion.rating && (
                    <p className="text-xs text-yellow-600">
                      ⭐ {suggestion.rating}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    {suggestion.lat.toFixed(4)}, {suggestion.lng.toFixed(4)}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="p-3 text-center text-gray-500">
              <p className="text-sm">No locations found</p>
            </div>
          )}
          
          {/* "Select on Map" option */}
          <button
            type="button"
            onClick={openMapModal}
            className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center transition-colors border-t border-gray-200"
          >
            <Map className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Location not found?</p>
              <p className="text-xs text-blue-600">Enter coordinates manually</p>
            </div>
          </button>
        </div>
      )}

      {/* Selected Location Display */}
      {value && value.coordinates && (
        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <MapPin className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900 mb-1">Selected Location</p>
              <p className="text-xs text-blue-700 break-words">{value.address}</p>
              <p className="text-xs text-blue-600 mt-1">
                Coordinates: {value.lat?.toFixed(4)}, {value.lng?.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Service Info */}
      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
        <AlertCircle className="w-3 h-3 inline mr-1" />
        Location search: SerpAPI | Map selection: OpenStreetMap (Free & Open Source)
      </div>

      {/* Google Maps Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Select Location Manually</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Enter coordinates manually or get them from Google Maps
                </p>
              </div>
              <button
                onClick={closeMapModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Coordinate Selector (Temporary until Leaflet is installed) */}
            <div className="flex-1">
              <CoordinateSelector
                onLocationSelect={handleMapLocationSelect}
                selectedLocation={selectedMapLocation}
                onClose={closeMapModal}
                onConfirm={handleCoordinateConfirm}
              />
            </div>


          </div>
        </div>
      )}
    </div>
  );
};

export default LocationInput;
