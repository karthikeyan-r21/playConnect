import axios from 'axios';

// Create a separate axios instance for media uploads with longer timeout
const mediaAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 300000, // 5 minutes for file uploads
});

// Request interceptor to add auth token
mediaAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
mediaAPI.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Upload media with sport selection
export const uploadMedia = async (formData, onProgress) => {
  try {
    const response = await mediaAPI.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) onProgress(percentCompleted);
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Upload failed' };
  }
};

// Get all media with filters
export const getAllMedia = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.sportType) params.append('sportType', filters.sportType);
    if (filters.fileType) params.append('fileType', filters.fileType);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await mediaAPI.get(`/media?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch media' };
  }
};

// Get media by ID
export const getMediaById = async (mediaId) => {
  try {
    const response = await mediaAPI.get(`/media/${mediaId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch media' };
  }
};

// Get user's media
export const getUserMedia = async (userId, page = 1, limit = 12) => {
  try {
    const response = await mediaAPI.get(`/media/user/${userId}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch user media' };
  }
};

// Like/Unlike media
export const toggleLike = async (mediaId) => {
  try {
    const response = await mediaAPI.post(`/media/${mediaId}/like`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to toggle like' };
  }
};

// Add comment to media
export const addComment = async (mediaId, text) => {
  try {
    const response = await mediaAPI.post(`/media/${mediaId}/comment`, { text });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add comment' };
  }
};

// Update media details
export const updateMedia = async (mediaId, data) => {
  try {
    const response = await mediaAPI.put(`/media/${mediaId}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update media' };
  }
};

// Delete media
export const deleteMedia = async (mediaId) => {
  try {
    const response = await mediaAPI.delete(`/media/${mediaId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete media' };
  }
};
