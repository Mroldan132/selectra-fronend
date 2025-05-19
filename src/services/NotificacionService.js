import apiClient from './axiosInstance'; 

class NotificacionService{
    async getNotificaciones(idUsuario) {
        try {
            const response = await apiClient.get(`/Notificaciones/GetListNotificaciones/${idUsuario}`);
            return response.data;
        } catch (error) {
            console.error("Error al obtener notificaciones:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar notificaciones");
        }
    }

    async leidoNotificacion(idNotificacion,idUsuario) {
        try {
            const response = await apiClient.put(`/Notificaciones/LeerNotificiacion/${idNotificacion}/${idUsuario}`);
            return response.data;
        } catch (error) {
            console.error("Error al marcar notificación como leída:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al marcar notificación como leída");
        }
    }

    async marcarTodasLeidas(idUsuario) {
        try {
            const response = await apiClient.put(`/Notificaciones/MarcarTodasLeidas/${idUsuario}`);
            return response.data;
        } catch (error) {
            console.error("Error al marcar todas las notificaciones como leídas:", error.response || error);
            throw new Error(error.response?.data?.message || error.message || "Error al marcar todas como leídas");
        }
    }    
}
export default new NotificacionService();