import apiClient  from "./axiosInstance";

class NivelAcademicoService {
    async obtenerNivelesAcademicos() {
        try {
            const response = await apiClient.get('/NivelesAcademicos/ListaNivelesAcademicos');
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
}

export default new NivelAcademicoService();