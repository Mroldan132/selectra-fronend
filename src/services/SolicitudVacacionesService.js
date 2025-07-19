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
    async getMisPentientes() {
        try {
            const response = await apiClient.get(`/SolicitudVacaciones/pendientes-aprobacion`);
            return response.data;
        } catch (error) {
            console.error("Error al obtener solicitudes pendientes:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar solicitudes pendientes");
        }
    }

    async aprobarSolicitud({ solicitudId,motivo }) {
        try {
            const url = `/SolicitudVacaciones/${solicitudId}/aprobar`;
            const payload = {
                Motivo: motivo
            };
            const response = await apiClient.post(url,payload);
            return response.data;
        } catch (error) {
            console.error("Error al aprobar la solicitud:", error.response || error);
            throw new Error(error.response?.data?.message || "Ocurrió un error al aprobar la solicitud");
        }
    }

    async rechazarSolicitud({ solicitudId, motivo }) {
        try {
            const url = `/SolicitudVacaciones/${solicitudId}/rechazar`;
            const payload = {
                Motivo: motivo
            };
            const response = await apiClient.post(url, payload);
            return response.data;
        } catch (error) {
            console.error("Error al rechazar la solicitud:", error.response || error);
            throw new Error(error.response?.data?.message || "Ocurrió un error al rechazar la solicitud");
        }
    }
}

export default new SolicitudVacacionesService();