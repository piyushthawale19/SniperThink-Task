import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const submitInterest = async (data) => {
  try {
    const response = await apiClient.post('/interest', data);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Server error occurred.');
    } else if (error.request) {
      throw new Error('Network error. Please try again later.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};