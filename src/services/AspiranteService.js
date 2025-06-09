import apiClient  from "./axiosInstance";

class AspiranteService {
    async registrarAspirante(aspiranteData) {
        try {
            const response = await apiClient.post('/Usuarios/registrarAspirante', aspiranteData);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al registrar el aspirante.";
            console.error('Error al registrar aspirante:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }
}
export default new AspiranteService();