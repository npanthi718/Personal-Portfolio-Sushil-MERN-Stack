import { API_URL } from './config';

/**
 * Enhanced fetch with Authorization header and credentials: 'include'
 */
export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('adminToken');
    const headers = {
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
    });

    return res;
};
