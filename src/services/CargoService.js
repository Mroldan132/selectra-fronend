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

    async crearCargo(cargo) {
        try {
            const response = await apiClient.post('/Cargos/generarCargo', cargo);
            return response.data;
        } catch (error) {
            console.error("Error al crear cargo:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al crear cargo");
        }
    }

    async actualizarCargo(cargoId, cargo) {
        try {
            const response = await apiClient.put(`/Cargos/actualizar/${cargoId}`, cargo);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar cargo:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al actualizar cargo");
        }
    }

}

export default new CargoService();