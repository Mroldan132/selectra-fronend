import apiClient from "./axiosInstance";

class PreguntasFiltrosService {
    async obtenerPreguntasFiltros() {
        try {
            const response = await apiClient.get('/PreguntasFiltros');
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al obtener las preguntas filtros.";
            console.error('Error al obtener preguntas filtros:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }

    async obtenerPreguntaFiltroPorId(id) {
        try {
            const response = await apiClient.get(`/PreguntasFiltros/${id}`);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al obtener la pregunta filtro por ID.";
            console.error('Error al obtener pregunta filtro por ID:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }

    async crearPreguntaFiltro(preguntaFiltroData) {
        try {
            const response = await apiClient.post('/PreguntasFiltros/generarPreguntaFiltro', preguntaFiltroData);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al crear la pregunta filtro.";
            console.error('Error al crear pregunta filtro:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }

    async actualizarPreguntaFiltro(preguntaFiltroData) {
        try {
            const response = await apiClient.put(`/PreguntasFiltros/actualizar/${preguntaFiltroData.preguntaFiltroId}`, preguntaFiltroData);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al actualizar la pregunta filtro.";
            console.error('Error al actualizar pregunta filtro:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }

    async eliminarPreguntaFiltro(id) {
        try {
            const response = await apiClient.delete(`/PreguntasFiltros/eliminar/${id}`);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al eliminar la pregunta filtro.";
            console.error('Error al eliminar pregunta filtro:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }
}

export default new PreguntasFiltrosService();
