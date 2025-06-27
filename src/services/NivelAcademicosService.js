import apiClient  from "./axiosInstance";

class NivelAcademicosService {
    async obtenerNivelAcademicos() {
        try {
            const response = await apiClient.get('/NivelAcademicos');
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al obtener los niveles académicos.";
            console.error('Error al obtener niveles académicos:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }

    

    async crearNivelAcademico(nivelAcademico) {
        try {
            const response = await apiClient.post('/NivelAcademicos', nivelAcademico);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al crear el nivel académico.";
            console.error('Error al crear nivel académico:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }
    async actualizarNivelAcademico(nivelAcademico) {
        try {
            const response = await apiClient.put(`/NivelAcademicos`, nivelAcademico);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al actualizar el nivel académico.";
            console.error('Error al actualizar nivel académico:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }
}

export default new NivelAcademicosService();