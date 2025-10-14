const express = require('express');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const router = express.Router();

// Simple HTTP/HTTPS request function
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const requestModule = parsedUrl.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'PlayConnect-App/1.0',
        ...options.headers
      },
      timeout: options.timeout || 10000
    };

    const req = requestModule.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ 
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            data: jsonData 
          });
        } catch (parseError) {
          resolve({ 
            ok: false,
            status: res.statusCode,
            data: { error: 'Invalid JSON response' }
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// SerpAPI location search endpoint with enhanced error handling
router.get('/search', async (req, res) => {
  try {
    const { q, engine = 'google_maps' } = req.query;
    const SERPAPI_KEY = process.env.SERPAPI_KEY;

    if (!q) {
      return res.status(400).json({ 
        error: 'Missing query parameter',
        message: 'Please provide a location query in the "q" parameter'
      });
    }

    // If no SerpAPI key, return error
    if (!SERPAPI_KEY) {
      return res.status(500).json({ 
        error: 'Location service unavailable',
        message: 'SerpAPI configuration required for location search',
        success: false
      });
    }

    try {
      // Make request to SerpAPI with timeout and better error handling
      const serpApiUrl = `https://serpapi.com/search.json?engine=${engine}&q=${encodeURIComponent(q)}&api_key=${SERPAPI_KEY}`;
      
      console.log('Making SerpAPI request for:', q);
      
      const response = await makeRequest(serpApiUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'PlayConnect-App/1.0'
        }
      });
      
      const data = response.data;

      if (!response.ok) {
        throw new Error(`SerpAPI HTTP ${response.status}: ${data.error || 'Unknown error'}`);
      }

      if (data.error) {
        throw new Error(`SerpAPI Error: ${data.error}`);
      }

      // Transform the data for frontend consumption with comprehensive location details
      let results = [];
      
      if (engine === 'google_maps' && data.local_results && data.local_results.length > 0) {
        results = data.local_results.slice(0, 5).map((result, index) => {
          // Parse address components for detailed location info
          const addressParts = result.address ? result.address.split(',').map(part => part.trim()) : [];
          let city = '', state = '', country = 'India', pincode = '';
          
          // Try to extract location components from address
          if (addressParts.length >= 2) {
            country = addressParts[addressParts.length - 1] || 'India';
            if (addressParts.length >= 3) {
              state = addressParts[addressParts.length - 2];
              city = addressParts[addressParts.length - 3];
            } else {
              city = addressParts[addressParts.length - 2];
            }
          }
          
          // Extract pincode using regex
          const pincodeMatch = result.address ? result.address.match(/\b\d{6}\b/) : null;
          if (pincodeMatch) {
            pincode = pincodeMatch[0];
          }

          return {
            id: result.place_id || `serp-${index}`,
            name: result.title || 'Location',
            formatted_address: result.address || 'Address not available',
            lat: result.gps_coordinates?.latitude || null,
            lng: result.gps_coordinates?.longitude || null,
            coordinates: result.gps_coordinates?.latitude && result.gps_coordinates?.longitude ? 
              [result.gps_coordinates.longitude, result.gps_coordinates.latitude] : [0, 0],
            city: city,
            state: state,
            country: country,
            pincode: pincode,
            types: result.type ? [result.type] : ['establishment'],
            rating: result.rating || null,
            phone: result.phone || null,
            website: result.website || null,
            place_id: result.place_id || null,
            // Additional SerpAPI specific data
            hours: result.hours || null,
            service_options: result.service_options || null
          };
        });

        console.log(`SerpAPI returned ${results.length} enhanced results for: ${q}`);
        
        res.json({
          success: true,
          query: q,
          results,
          total_results: results.length,
          source: 'serpapi'
        });
      } else {
        // No results from SerpAPI
        console.log('No SerpAPI results found for:', q);
        res.json({
          success: false,
          query: q,
          results: [],
          total_results: 0,
          source: 'serpapi',
          message: 'No locations found for the given query'
        });
      }

    } catch (serpError) {
      // SerpAPI failed, return error
      console.error('SerpAPI request failed:', serpError.message);
      res.status(500).json({
        success: false,
        query: q,
        results: [],
        total_results: 0,
        source: 'serpapi_error',
        error: 'Location search service unavailable',
        message: serpError.message
      });
    }

  } catch (error) {
    console.error('Location search endpoint error:', error);
    res.status(500).json({
      error: 'Location search failed',
      message: error.message,
      success: false
    });
  }
});

// Enhanced reverse geocoding with detailed location parsing
async function parseLocationDetails(geoData, lat, lng) {
  const details = {
    name: 'Current Location',
    address: `${lat}, ${lng}`,
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    coordinates: [parseFloat(lng), parseFloat(lat)]
  };

  if (geoData) {
    // Extract city information
    if (geoData.city) {
      details.name = geoData.city;
      details.city = geoData.city;
    } else if (geoData.locality) {
      details.name = geoData.locality;
      details.city = geoData.locality;
    }

    // Extract state/province
    if (geoData.principalSubdivision) {
      details.state = geoData.principalSubdivision;
    }

    // Extract country
    if (geoData.countryName) {
      details.country = geoData.countryName;
    }

    // Extract postal code
    if (geoData.postcode) {
      details.pincode = geoData.postcode;
    }

    // Build formatted address
    const addressParts = [
      details.city,
      details.state,
      details.country,
      details.pincode
    ].filter(Boolean);
    
    details.address = addressParts.join(', ');
  }

  return details;
}

// Reverse geocoding endpoint
router.get('/reverse', async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ 
        error: 'Missing coordinates',
        message: 'Please provide lat and lng parameters'
      });
    }

    // Use free reverse geocoding service
    const reverseGeoResponse = await makeRequest(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { timeout: 8000 }
    );
    
    const geoData = reverseGeoResponse.data;
    const locationDetails = await parseLocationDetails(geoData, lat, lng);

    res.json({
      success: true,
      ...locationDetails,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      types: ['current_location'],
      raw_data: geoData
    });

  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({
      error: 'Reverse geocoding failed',
      message: error.message,
      success: false
    });
  }
});

module.exports = router;
