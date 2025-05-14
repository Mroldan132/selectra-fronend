import apiClient from './axiosInstance'; 

class RequerimientoService {
    async crearRequerimiento(requerimientoData) {
        try {
            const response = await apiClient.post('/RequerimientosPersonales/crear', requerimientoData);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al crear el requerimiento.";
            console.error('Error al crear requerimiento:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }

    // --- Métodos para cargar datos para los dropdowns del formulario ---
    async getTiposRequerimiento() {
        try {
            const response = await apiClient.get('/RequerimientosPersonales/ListaTiposRequerimiento');
            return response.data;
        } catch (error) {
            console.error("Error al obtener tipos de requerimiento:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar tipos de requerimiento");
        }
    }

    async getAreas() {
        try {
            const response = await apiClient.get('/Areas');
            return response.data;
        } catch (error) {
            console.error("Error al obtener áreas:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar áreas");
        }
    }

    async getCargos() {
        try {
            const response = await apiClient.get('/Cargos');
            return response.data;
        } catch (error) {
            console.error("Error al obtener cargos:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar cargos");
        }
    }

    async getPersonalParaJefeDestino() {
        try {
            const response = await apiClient.get('/Personales/elegiblesComoJefe');
            return response.data;
        } catch (error) {
            console.error("Error al obtener personal para jefe:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar lista de jefes");
        }
    }
    
    async getMisRequerimientos() {  
        try {
        const response = await apiClient.get('/RequerimientosPersonales/misSolicitudes');
        return response.data;
        
        } catch (error) {
            console.error("Error al obtener mis requerimientos:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar lista de jefes");
     }
    }

    // Aquí añadirás más adelante:
    // async getRequerimientoPorId(id) { ... }
    // async aprobarRequerimiento(id, datos) { ... }
    // async rechazarRequerimiento(id, datos) { ... }
}

export default new RequerimientoService();