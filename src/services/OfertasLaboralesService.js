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

    async crearOfertaLaboralRequerimiento(requerimientoId){
        try {
            const response = await apiClient.get(`/OfertasLaborales/crearOfertaLaboralRequerimiento/${requerimientoId}`);
            return response.data;
        } catch (error) {
            console.error("Error al crear oferta laboral:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al crear oferta laboral");
        }   
    }

    async generarOfertaLaboral(ofertaLaboral) {
        try {
            const response = await apiClient.post('/OfertasLaborales/generarOfertaLaboral', ofertaLaboral);
            return response.data;
        } catch (error) {
            console.error("Error al generar la oferta laboral:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al crear oferta laboral");
        }

    }

    async getOfertasLaborales() {
        try {
            const response = await apiClient.get('/OfertasLaborales/listaOfertasLaborales');
            return response.data;
        } catch (error) {
            console.error("Error al obtener ofertas laborales:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar lista de ofertas laborales");
        }
    }
        async detalleOfertaLaboral(ofertaId) {
        try {
            const response = await apiClient.get(`/OfertasLaborales/detalleOfertaLaboral/${ofertaId}`);
            return response.data;
        } catch (error) {
            console.error("Error al crear oferta laboral:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al crear oferta laboral");
        }   
    }
}
export default new OfertasLaboralesService();