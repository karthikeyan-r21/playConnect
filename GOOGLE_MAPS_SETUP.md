# Google Maps Integration Setup

## Overview
The location input component now supports manual location selection using Google Maps when the automatic search doesn't find the desired location.

## Features Added
- **Select on Map**: Click the map icon in the location input or select "Location not found? Click to select on map" from the dropdown
- **Interactive Map**: Click anywhere on the map or drag the marker to select your location
- **Real-time Reverse Geocoding**: Automatically gets address information for selected coordinates
- **Fallback Option**: Always available when search results are insufficient

## Setup Instructions

### 1. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Go to "Credentials" and create an API key
5. Restrict the API key to your domain for security

### 2. Configure the API Key
1. Open `frontend/.env` file
2. Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```
3. **Important**: Restart your development server after adding the API key
4. The SerpAPI key is already configured in the backend for location search

### 3. API Key Restrictions (Recommended)
For production, restrict your API key:
- **Application restrictions**: HTTP referrers
- **Website restrictions**: Add your domain (e.g., `yourdomain.com/*`)
- **API restrictions**: Enable only required APIs (Maps JavaScript API, Places API, Geocoding API)

## How It Works

### User Flow
1. User types in the location search box
2. If no results found or desired location not listed, user can:
   - Click the map icon (🗺️) in the input field
   - Or select "Location not found? Click to select on map" from dropdown
3. Interactive map modal opens
4. User clicks on map or drags marker to select location
5. System automatically reverse geocodes the coordinates to get address
6. User confirms selection and location data is saved

### Technical Implementation
- **Google Maps Integration**: Uses Google Maps JavaScript API
- **Reverse Geocoding**: Backend API converts coordinates to address
- **Comprehensive Data**: Stores coordinates, address, city, state, country, pincode
- **Fallback Support**: Works even if reverse geocoding fails (uses coordinates)

### Data Stored
When user selects location on map, the following data is captured:
- **Coordinates**: Latitude and longitude (GeoJSON format)
- **Address**: Full formatted address
- **Location Details**: Name, city, state, country, pincode
- **Source**: Marked as 'user_selected' for tracking

## Troubleshooting

### Common Issues
1. **"Sorry! Something went wrong" in map modal**: 
   - Google Maps API key is missing or invalid
   - Check `frontend/.env` file for `VITE_GOOGLE_MAPS_API_KEY`
   - Restart the development server after adding the key
2. **Map not loading**: Check API key configuration and browser console
3. **"Location not found" option not showing**: Ensure search has been performed
4. **Reverse geocoding failing**: Backend API might be down, coordinates will still be saved
5. **Location search not working**: Check SerpAPI key in `server/.env` file

### Error Messages
- **"Google Maps API not loaded"**: API key missing or incorrect
- **"Location access denied"**: User denied location permissions
- **"Location information unavailable"**: GPS/location services unavailable

## Cost Considerations
Google Maps API usage may incur charges based on usage:
- Maps JavaScript API: $7 per 1,000 loads
- Geocoding API: $5 per 1,000 requests
- Places API: $17 per 1,000 requests

Monitor usage in Google Cloud Console and set billing alerts.
