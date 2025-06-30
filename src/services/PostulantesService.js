import apiClient from './axiosInstance'; 

class PostulantesService {
    async postularOfertaLaboral(ofertaId) {
        try {
            const response = await apiClient.put(`/Postulantes/postularOfertaLaboral/${ofertaId}`);
            return response.data;
        } catch (error) {
            console.error("Error al postular a la oferta laboral:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al postular a la oferta laboral");
        }
    }

}

export default new PostulantesService();