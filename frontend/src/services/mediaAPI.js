import axios from 'axios';

// Create a separate axios instance for media uploads with longer timeout
const mediaAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 300000, // 5 minutes for file uploads
  headers: {
    'Content-Type': 'multipart/form-data',
  },
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

// Upload media (video or image)
export const uploadMedia = async (file, type) => {
  const formData = new FormData();
  formData.append('media', file);
  formData.append('type', type);

  const response = await mediaAPI.post('/media/upload', formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      console.log(`Upload Progress: ${percentCompleted}%`);
    }
  });
  
  return response.data;
};

// Get user's media
export const getUserMedia = async () => {
  const response = await mediaAPI.get('/media/user');
  return response.data;
};

// Delete media
export const deleteMedia = async (mediaId) => {
  const response = await mediaAPI.delete(`/media/${mediaId}`);
  return response.data;
};
