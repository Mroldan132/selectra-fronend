import apiClient  from "./axiosInstance";

class OfertasLaboralesService {

    async getRequerimientosAprobados() {
        try {
            const response = await apiClient.get('/OfertasLaborales/requerimientosAprobados');
            return response.data;
        } catch (error) {
            console.error("Error al obtener requerimientos aprobados:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar lista de requerimientos aprobados");
        }
    }
}
export default new OfertasLaboralesService();