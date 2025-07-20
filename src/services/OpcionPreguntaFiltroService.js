import apiClient from "./axiosInstance";

class OpcionPreguntaFiltroService {
    async obtenerOpcionesPreguntaFiltro() {
        try {
            const response = await apiClient.get('/OpcionPreguntaFiltro');
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al obtener las opciones de pregunta filtro.";
            console.error('Error al obtener opciones de pregunta filtro:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }

    async crearOpcionPreguntaFiltro(opcionData) {
        try {
            const response = await apiClient.post('/OpcionPreguntaFiltro/generarOpcionPreguntaFiltro', opcionData);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al crear la opción de pregunta filtro.";
            console.error('Error al crear opción de pregunta filtro:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }

    async actualizarOpcionPreguntaFiltro(opcionData) {
        try {
            const response = await apiClient.put(`/OpcionPreguntaFiltro/actualizar/${opcionData.opcionPreguntaId}`, opcionData);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al actualizar la opción de pregunta filtro.";
            console.error('Error al actualizar opción de pregunta filtro:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }

    async eliminarOpcionPreguntaFiltro(id) {
        try {
            const response = await apiClient.delete(`/OpcionPreguntaFiltro/eliminar/${id}`);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al eliminar la opción de pregunta filtro.";
            console.error('Error al eliminar opción de pregunta filtro:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }
}

export default new OpcionPreguntaFiltroService();
