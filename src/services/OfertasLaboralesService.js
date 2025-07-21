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
    
    async actualizarOfertaLaboral(ofertaLaboral) {
        try {
            const response = await apiClient.put('/OfertasLaborales/actualizarOfertaLaboral', ofertaLaboral);
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

    async pasarOfertaSiguienteEstado(ofertaId) {
        try {
            const response = await apiClient.put(`/OfertasLaborales/pasarSiguienteEstadoOferta/${ofertaId}`);
            return response.data;
        } catch (error) {
            console.error("Error al pasar oferta laboral a siguiente etapa:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al pasar oferta laboral a siguiente etapa");
        }
    }
    async listaOfertasPublicadas() {
        try {
            const response = await apiClient.get('/OfertasLaborales/listaOfertasPublicadas');
            return response.data;
        } catch (error) {
            console.error("Error al obtener lista de ofertas laborales públicas:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar lista de ofertas laborales públicas");
        }
    }
    async getListaPreguntasOfertaLaboral(ofertaId) {
        try {
            const response = await apiClient.get(`/OfertasLaborales/preguntasOfertaLaboral/${ofertaId}`);
            return response.data;
        } catch (error) {
            console.error("Error al obtener lista de preguntas de la oferta laboral:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar lista de preguntas de la oferta laboral");
        }
    }

    async registrarRespuestaPreguntaAspirante(ofertaId,respuestas) {
        try {
            const response = await apiClient.post(`/OfertasLaborales/registrarRespuestasPostulantes/${ofertaId}`, respuestas);
            return response.data;
        } catch (error) {
            console.error("Error al registrar respuesta de pregunta del aspirante:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al registrar respuesta de pregunta del aspirante");
        }

    }

    async getAspirantesSeleccionados(ofertaId) {
        try {
            const response = await apiClient.get(`/OfertasLaborales/aspirantesSeleccionados/${ofertaId}`);
            return response.data;
        } catch (error) {
            console.error("Error al obtener aspirantes seleccionados:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar lista de aspirantes seleccionados");
        }
    }
    async contratarAspirante(ofertaId,aspiranteId) {
        try {
            const response = await apiClient.put(`/Postulantes/contratarPostualante/${ofertaId}/${aspiranteId}`);
            return response.data;
        } catch (error) {
            console.error("Error al contratar aspirante:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al contratar aspirante");
        }
    }
    
}
export default new OfertasLaboralesService();