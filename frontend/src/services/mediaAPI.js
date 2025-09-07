import api from './api';

// Upload media (video or image)
export const uploadMedia = async (file, type) => {
  const formData = new FormData();
  formData.append('media', file);
  formData.append('type', type);

  const response = await api.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Get user's media
export const getUserMedia = async () => {
  const response = await api.get('/media/user');
  return response.data;
};

// Delete media
export const deleteMedia = async (mediaId) => {
  const response = await api.delete(`/media/${mediaId}`);
  return response.data;
};
