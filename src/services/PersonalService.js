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
}

export default new PersonalService();