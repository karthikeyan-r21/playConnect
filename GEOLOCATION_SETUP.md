# Geolocation Feature Setup Guide

## Overview
The PlayConnect app now includes comprehensive geolocation functionality for match creation. Users can search for locations by city name, ground name, or address, and the system will automatically map and store the coordinates.

## Features
- 🌍 **Location Search**: Type city names, ground names, or addresses
- 📍 **Auto-mapping**: Automatically finds coordinates for locations
- 🎯 **Current Location**: Get user's current location with GPS
- 🗺️ **Visual Feedback**: Shows suggestions dropdown with location details
- 🏟️ **Small Towns Support**: Works with small towns and local grounds
- 📊 **Geospatial Queries**: Backend ready for proximity-based match finding

## Google Maps API Setup

### 1. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Geocoding API**
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key

### 2. Configure Environment Variables
Update your `.env` file in the `frontend` folder:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here
```

### 3. Restrict API Key (Recommended)
For security, restrict your API key in Google Cloud Console:
- **Application restrictions**: HTTP referrers (web sites)
- **Website restrictions**: Add your domain (e.g., `localhost:5173/*` for development)
- **API restrictions**: Limit to "Geocoding API"

## Mock Data Fallback
If no API key is provided, the system uses mock location data for development:
- Mumbai, Delhi, Bangalore, Chennai, Kolkata
- Local grounds and stadiums
- Realistic coordinates for testing

## Backend Integration
The system stores location data as GeoJSON Points:
```json
{
  "geoLocation": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  }
}
```

## Component Usage
The `LocationInput` component is automatically integrated into:
- ✅ Match Creation Form
- ✅ Match Edit Form
- 🔄 User Profile (can be added later)

## Testing
1. Start your development servers
2. Go to "Matches" → "Create Match"
3. Type a city name in the location field
4. Select from the dropdown suggestions
5. The coordinates are automatically saved with the match

## Troubleshooting
- **No suggestions**: Check API key configuration
- **"Current Location" not working**: Ensure HTTPS or localhost
- **API errors**: Check Google Cloud Console quotas and billing
- **Coordinates not saving**: Check browser console for errors

## Future Enhancements
- 🗺️ Interactive map display
- 📏 Distance-based match filtering
- 🏃‍♂️ Nearby players suggestions
- 🌟 Popular venues recommendations
