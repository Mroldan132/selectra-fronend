import apiClient from './axiosInstance'; 

class SolicitudVacacionesService {
    async crearSolicitud(solicitudData) {
        try {
            const response = await apiClient.post(`/SolicitudVacaciones/crearSolicitud`, solicitudData);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al crear la solicitud.";
            console.error('Error al crear solicitud:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }

    async getMisSolicitudes() {
        try {
            const response = await apiClient.get(`/SolicitudVacaciones/mis-solicitudes`);
            return response.data;
        } catch (error) {
            console.error("Error al obtener solicitudes:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar solicitudes");
        }
    }
}

export default new SolicitudVacacionesService();