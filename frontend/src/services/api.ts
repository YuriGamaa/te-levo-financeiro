import axios from 'axios';

const api = axios.create({
  // Ajustado para o IP da VPS - Caminho para o Deploy
  baseURL: 'http://31.97.91.123/api', 
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;