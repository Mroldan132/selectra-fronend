import apiClient from './axiosInstance'; 

class AreaService {
    async getAreas() {
        try {
            const response = await apiClient.get('/Areas');
            return response.data;
        } catch (error) {
            console.error("Error al obtener áreas:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar áreas");
        }
    }

    async crearArea(area) {
        try {
            const response = await apiClient.post('/Areas/generarArea', area);
            return response.data;
        } catch (error) {
            console.error("Error al crear área:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al crear área");
        }
    }

    async actualizarArea(areaId, area) {
        try {
            const response = await apiClient.put(`/Areas/actualizar/${areaId}`, area);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar área:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al actualizar área");
        }
    }

}
export default new AreaService();