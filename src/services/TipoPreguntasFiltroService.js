import apiClient from "./axiosInstance";

class TipoPreguntasFiltroService {
    async obtenerTiposPregunta() {
        try {
            const response = await apiClient.get('/TipoPreguntasFiltro');
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al obtener los tipos de preguntas filtro.";
            console.error('Error al obtener tipos de preguntas filtro:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }

    async obtenerTipoPreguntaPorId(id) {
        try {
            const response = await apiClient.get(`/TipoPreguntasFiltro/${id}`);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al obtener el tipo de pregunta filtro por ID.";
            console.error('Error al obtener tipo de pregunta filtro por ID:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }

    async crearTipoPregunta(tipoPreguntaData) {
        try {
            const response = await apiClient.post('/TipoPreguntasFiltro', tipoPreguntaData);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al crear el tipo de pregunta filtro.";
            console.error('Error al crear tipo de pregunta filtro:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }

    async actualizarTipoPregunta(tipoPreguntaData) {
        try {
            const response = await apiClient.put(`/TipoPreguntasFiltro/${tipoPreguntaData.tipoPreguntaId}`, tipoPreguntaData);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al actualizar el tipo de pregunta filtro.";
            console.error('Error al actualizar tipo de pregunta filtro:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }

    async eliminarTipoPregunta(id) {
        try {
            const response = await apiClient.delete(`/TipoPreguntasFiltro/${id}`);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al eliminar el tipo de pregunta filtro.";
            console.error('Error al eliminar tipo de pregunta filtro:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }
}

export default new TipoPreguntasFiltroService();
