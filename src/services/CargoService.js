import apiClient from './axiosInstance'; 

class CargoService {
    async getCargos() {
        try {
            const response = await apiClient.get('/Cargos');
            return response.data;
        } catch (error) {
            console.error("Error al obtener cargos:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar cargos");
        }
    }

}

export default new CargoService();