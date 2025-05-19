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

    async actualizarRequerimiento(requerimientoId, requerimientoData) {
        try {
            const response = await apiClient.put(`/RequerimientosPersonales/actualizar/${requerimientoId}`, requerimientoData);
            return response.data;
        } catch (error) {
            const errorMessage = "Error al actualizar el requerimiento.";
            console.error('Error al actualizar requerimiento:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }

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
    async getEstadosRequerimientos() {
        try {
            const response = await apiClient.get('/RequerimientosPersonales/ListaEstadosRequerimientos');
            return response.data;
        } catch (error) {
            console.error("Error al obtener estados de requerimiento:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar estados de requerimiento");
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

    async getMisRequerimientosRecientes(){
        try {
            const response = await apiClient.get('/RequerimientosPersonales/misSolicitudesRecientes');
            return response.data;
        } catch (error) {
            console.error("Error al obtener mis requerimientos recientes:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar lista de jefes");
        }
    }

    async getRequerimientoPorId(id) { 
        try {
            const response = await apiClient.get(`/RequerimientosPersonales/getRequerimientoPorId/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error al obtener requerimiento por ID:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar requerimiento");
        }
     }
     async aprobarRechazarRequerimiento(datos) { 
        try {
            const response = await apiClient.put(`/RequerimientosPersonales/aprobarRechazar`, datos);
            return response.data;
        } catch (error) {
            console.error("Error al aprobar/rechazar requerimiento:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar requerimiento");
        }
      }
}

export default new RequerimientoService();