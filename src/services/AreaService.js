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


}
export default new AreaService();