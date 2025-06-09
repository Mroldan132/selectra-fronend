import apiClient from './axiosInstance'; 

class PersonalService{
    async getPersonalParaJefeDestino() {
        try {
            const response = await apiClient.get('/Personales/elegiblesComoJefe');
            return response.data;
        } catch (error) {
            console.error("Error al obtener personal para jefe:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar lista de jefes");
        }
    }
    async getPersonal(){
        try {
            const response = await apiClient.get('/Personales/listaPersonal');
            return response.data;
        } catch (error) {
            console.error("Error al obtener personal:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar lista de personal");
        }
    }

    async getPersonalById(id) {
        try {
            const response = await apiClient.get(`/Personales/detallePersonal/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error al obtener personal por ID:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar datos del personal");
        }
    }
    async updatePersonal(id, data) {
        try {
            const response = await apiClient.put(`/Usuarios/actualizarPersonal/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar personal:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al actualizar datos del personal");
        }
    }
}

export default new PersonalService();