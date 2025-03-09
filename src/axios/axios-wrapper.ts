import axios from 'axios'
import { router } from '@/router';
import AuthService from '@/services/auth.service';

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(async (requestConfig) => {
    const { authToken } = AuthService;
    if (authToken && requestConfig.headers) {
        requestConfig.headers.Authorization = `Bearer ${authToken}`;
    }

    return requestConfig
});

axiosInstance.interceptors.response.use((successfulReq) => {
        return successfulReq;
    },
    (error) => {
        if (error.response.status === 401) {
            AuthService.resetAuthToken();
            return router.push({ name: 'login' }).then(() => {
                return Promise.reject(error);
            });
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
