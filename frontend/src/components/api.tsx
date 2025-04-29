import axios from 'axios';
import { AxiosError } from 'axios';

export interface Note {
    _id: string;
    title: string;
    content: string;
    created_at: string;
}

export const authedApi = axios.create({
    baseURL: 'http://127.0.0.1:5000/api',
    withCredentials: true,
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }
});

export const searchApi = axios.create({
    baseURL: 'http://127.0.0.1:5000/searches',
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }
    
});

export const mediaApi = axios.create({
    baseURL: 'http://127.0.0.1:5000/media',
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }
});


export const fetchNotes = async (token: string | null) => {
    try {
        const response = await authedApi.get('/notes', {
      headers: { Authorization: `Bearer ${token}` }}); // Using the configured instance
        return response.data; // Return fetched notes
    } catch (error: unknown) {
        if (error instanceof AxiosError && error.response) {
            if (error.response.status === 401) {
                console.log('Session expired. Please log in again.');
                localStorage.removeItem('token');
                // Consider redirecting to login here
            } else if (error.response.status === 422) {
                console.log('Invalid data provided');
            } else {
                console.log(`Failed to fetch notes. Status Code: ${error.response.status}`);
            }
        } else {
            console.log('An unknown error occurred');
        }
        return []; // Return an empty array in case of error
    }
};
export const authApi = axios.create({
    baseURL: 'http://127.0.0.1:5000/auth',
    withCredentials: true,
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  