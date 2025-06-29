import apiClient from './axiosInstance'; 
const SolicitudVacacionesService = {
    /**
     * Obtener solicitudes pendientes de aprobación por un jefe aprobador
     * @param {number} aprobadorId
     * @returns {Promise<Array>}
     */
    async getSolicitudesPendientes(aprobadorId) {
        const response = await api.get(`/solicitudvacaciones/pendientes-aprobacion/${aprobadorId}`);
        return response.data;
    },

    /**
     * Aprobar una solicitud de vacaciones
     * @param {number} solicitudId
     * @param {number} aprobadorId
     * @returns {Promise<Object>}
     */
    async aprobarSolicitud(solicitudId, aprobadorId) {
        const response = await api.post(`/solicitudvacaciones/${solicitudId}/aprobar/${aprobadorId}`);
        return response.data;
    },

    /**
     * Rechazar una solicitud de vacaciones con motivo
     * @param {number} solicitudId
     * @param {number} aprobadorId
     * @param {string} motivo
     * @returns {Promise<Object>}
     */
    async rechazarSolicitud(solicitudId, aprobadorId, motivo) {
        const response = await api.post(`/solicitudvacaciones/${solicitudId}/rechazar`, {
            aprobadorId,
            motivo
        });
        return response.data;
    }
};
    export default SolicitudVacacionesService;