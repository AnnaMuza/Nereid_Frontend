// src/services/AuthService.ts
import axios from 'axios';

// Create axios instance with common config
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
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

// Types
export interface LoginResponse {
    token: string;
    user: User;
}

export interface User {
    id: string;
    email: string;
    name?: string;
    role?: string;
    createdAt?: string;
}

export interface OtpResponse {
    success: boolean;
    message: string;
}

export interface OtpVerifyResponse {
    verified: boolean;
    token?: string;
    message?: string;
}

export interface PasswordChangeResponse {
    success: boolean;
    message: string;
}

class AuthService {
    // Login user
    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const response = await apiClient.post('/log-in', { email, password });
            if (response.data?.token) {
                localStorage.setItem('token', response.data.token);
                return response.data;
            }
            throw new Error('Invalid login response');
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    // Register user (send OTP)
    async register(email: string): Promise<OtpResponse> {
        try {
            const response = await apiClient.post('/sign-up', { email });
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    // Send OTP for password reset
    async sendOtp(email: string): Promise<OtpResponse> {
        try {
            const response = await apiClient.post('/send-otp', { email });
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    // Verify OTP
    async verifyOtp(email: string, otp: string): Promise<OtpVerifyResponse> {
        try {
            const response = await apiClient.post('/check-otp', { email, otp });
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    // Get current user
    async getCurrentUser(): Promise<User> {
        try {
            const response = await apiClient.get('/get');
            return response.data.user;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    // Change password
    async changePassword(oldPassword: string, newPassword: string): Promise<PasswordChangeResponse> {
        try {
            const response = await apiClient.put('/change-password', {
                oldPassword,
                newPassword
            });
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    // Reset password (after OTP verification)
    async resetPassword(email: string, token: string, newPassword: string): Promise<PasswordChangeResponse> {
        try {
            const response = await apiClient.put('/reset-password', {
                email,
                token,
                newPassword
            });
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    // Logout user
    logout(): void {
        localStorage.removeItem('token');
        // Add any additional cleanup here
    }

    // Check if user is authenticated
    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    }

    // Handle errors
    private handleError(error: any): void {
        if (error.response && error.response.status === 401) {
            // Unauthorized - clear token
            this.logout();
        }
        console.error('Auth service error:', error);
    }
}

export default new AuthService();
