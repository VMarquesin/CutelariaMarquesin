import axios from 'axios';

const baseURL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

const api = axios.create({
    baseURL: baseURL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;