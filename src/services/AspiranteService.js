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

    async updateAspirante(id, data) {
        try {
            const response = await apiClient.put(`/Usuarios/actualizarAspirante/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar aspirante:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al actualizar datos del aspirante.");
        }
    }

    async getAspiranteById(id) {
        try {
            const response = await apiClient.get(`/Aspirantes/detalleAspirante/${id}`);

            return response.data;
        } catch (error) {
            console.error("Error al obtener aspirante por ID:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar datos del aspirante");
        }
    }

    async getAspirantes(){
        try {
            const response = await apiClient.get('/Aspirantes/listaAspirantes');

            return response.data;
        } catch (error) {
            console.error("Error al obtener aspirantes:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar lista de aspirantes");
        }
    }
}
export default new AspiranteService();