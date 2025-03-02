// src/services/UserService.ts
import axios from 'axios';
import AuthService from './AuthService';

// Types
export interface UserProfile {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    role?: string;
    phoneNumber?: string;
    preferences?: {
        notifications?: boolean;
        theme?: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface UpdateProfileRequest {
    name?: string;
    avatar?: string;
    phoneNumber?: string;
    preferences?: {
        notifications?: boolean;
        theme?: string;
    };
}

// Create axios instance with auth header
const apiClient = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Add interceptor to include auth token in requests
apiClient.interceptors.request.use(
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

class UserService {
    // Get user profile
    async getProfile(): Promise<UserProfile> {
        try {
            const response = await apiClient.get('/get');
            return response.data.user;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    // Update user profile
    async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
        try {
            const response = await apiClient.put('/update-profile', data);
            return response.data.user;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    // Update user email (typically requires verification)
    async updateEmail(newEmail: string, password: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.put('/update-email', {
                newEmail,
                password
            });
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    // Delete user account
    async deleteAccount(password: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.delete('/delete-account', {
                data: { password }
            });
            if (response.data.success) {
                AuthService.logout();
            }
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    // Handle errors
    private handleError(error: any): void {
        if (error.response && error.response.status === 401) {
            // Unauthorized - redirect to login
            AuthService.logout();
            // You might want to use router to redirect
            // router.push('/login');
        }
        console.error('User service error:', error);
    }
}

export default new UserService();
