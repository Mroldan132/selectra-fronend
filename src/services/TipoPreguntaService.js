import apiClient  from "./axiosInstance";

class TipoPreguntaService {
    async obtenerTiposPregunta() {
        try {
            const response = await apiClient.get('/TipoPreguntas');
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al obtener los tipos de pregunta.";
            console.error('Error al obtener tipos de pregunta:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    
    }

    async obtenerTipoPreguntaPorId(id) {
        try {
            const response = await apiClient.get(`/TipoPreguntas/${id}`);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al obtener el tipo de pregunta por ID.";
            console.error('Error al obtener tipo de pregunta por ID:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }

    async crearTipoPregunta(tipoPreguntaData) {
        try {
            const response = await apiClient.post('/TipoPreguntas', tipoPreguntaData);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al crear el tipo de pregunta.";
            console.error('Error al crear tipo de pregunta:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }   

    async actualizarTipoPregunta( tipoPreguntaData) {
        try {
            const response = await apiClient.put(`/TipoPreguntas`, tipoPreguntaData);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al actualizar el tipo de pregunta.";
            console.error('Error al actualizar tipo de pregunta:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }   

}

export default new TipoPreguntaService();