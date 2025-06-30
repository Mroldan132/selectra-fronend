import apiClient from './axiosInstance'; 

class SolicitudVacacionesService {
    async crearSolicitud(solicitudData) {
        try {
            const response = await apiClient.post(`/SolicitudVacaciones/${solicitudData.personalId}`, solicitudData);
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

    async getMisSolicitudes(usuario) {
        try {
            const response = await apiClient.get(`/SolicitudVacaciones/
            mis-solicitudes/${usuario}`);

            // mocks
            /* const response = {
                data: [
                    { id: 1, estado: 'aprobado', fechaInicio: '2023-10-02', fechaFin: '2023-11-02', diasSolicitados: 2, fechaCreacion: '2023-10-01', personalId: usuario, comentariosEmpleado: 'por favor', comentariosAprobador: 'todo bien' },
                    { id: 2, estado: 'aprobado', fechaCreacion: '2023-10-02', personalId: usuario }
                ]
            }; */
            return response.data;
        } catch (error) {
            console.error("Error al obtener solicitudes:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar solicitudes");
        }
    }
}

export default new SolicitudVacacionesService();