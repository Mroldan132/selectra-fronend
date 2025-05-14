import axios from 'axios';
import {useAuthStore} from '@/stores/authStore';

const API_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_URL) {
    console.log('La variable de entorno VITE_API_URL no está definida');
}

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) =>{
        const authStore = useAuthStore();
        const token = authStore.getToken;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    }

)

apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response.status === 401) {
            const authStore = useAuthStore();
            authStore.logout();

            console.log('Token expirado, redirigiendo a la página de inicio de sesión');
        }
        return Promise.reject(error);
    }
)

export default apiClient; 