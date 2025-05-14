import apiClient from './axiosInstance';


class AuthService {
    async login(user) {
        try {
            const response = await apiClient.post(`/Auth/login`, {
                codUsuario: user.codUsuario,
                clave: user.clave
            });

            if (response.data && response.data.token) {
                // Almacena el token y la información del usuario en localStorage
                // El authStore de Pinia también leerá de aquí para su estado inicial.
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            return response.data; // Devuelve todos los datos de la respuesta (token, expiration, usuario, rol)
        } catch (error) {
            const errorMessage = 
                error.response?.data?.message ||  // Mensaje de error específico de tu API (ej. desde BadRequest)
                (typeof error.response?.data === 'string' ? error.response.data : null) || // Si el error es solo un string
                error.message ||                    // Mensaje de error genérico de JavaScript
                "Error desconocido durante el inicio de sesión.";
            
            console.error('Error during login:', errorMessage, error.response || error);
            throw new Error(errorMessage); // Re-lanza el error para que el componente lo maneje
        }
    }

    logout() {
        localStorage.removeItem('user');
        // Aquí podrías añadir una llamada a un endpoint de logout en el backend si lo tienes
        // para invalidar el token en el servidor (aunque con JWT esto es menos común,
        // usualmente se maneja con listas negras de tokens o simplemente borrando del cliente).
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                console.error("Error parsing user from localStorage", e);
                localStorage.removeItem('user'); // Limpiar si está corrupto
                return null;
            }
        }
        return null;
    }

    getToken() {
        const user = this.getCurrentUser();
        return user?.token;
    }

    // Podrías añadir más métodos aquí si los necesitas, por ejemplo:
    // async register(userData) { ... }
    // async forgotPassword(email) { ... }
    // async resetPassword(token, newPassword) { ... }
}

export default new AuthService();