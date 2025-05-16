// src/stores/authStore.js
import { defineStore } from 'pinia';
import AuthService from '@/services/authService'; 

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')),
        status: { loggedIn: !!localStorage.getItem('user') },
        loginError: null,
    }),
    actions: {
        async login(userCredentials) {
            this.loginError = null; // Limpiar error previo
            try {
                // AuthService.login ya guarda en localStorage si es exitoso
                const userDataFromApi = await AuthService.login(userCredentials);
                this.status.loggedIn = true;
                this.user = userDataFromApi; // Actualiza el estado del store
                return Promise.resolve(userDataFromApi);
            } catch (error) {
                this.status.loggedIn = false;
                this.user = null;
                // El error.message ya debería venir formateado desde AuthService
                this.loginError = error.message || 'Fallo el inicio de sesión.';
                // Es importante que el servicio AuthService lance el error para que este catch lo reciba
                return Promise.reject(error);
            }
        },
        logout() {
            AuthService.logout(); // Limpia localStorage
            this.status.loggedIn = false;
            this.user = null;
            this.loginError = null;
        },
    },
    getters: {
        isLoggedIn: (state) => state.status.loggedIn,
        currentUser: (state) => state.user, // Contendrá el objeto { token, expiration, usuario, rol }
        getToken: (state) => state.user?.token,
        getUserName: (state) => state.user?.usuario, // Nombre de usuario
        getUserRole: (state) => state.user?.rol, // Rol del usuario
    },
});