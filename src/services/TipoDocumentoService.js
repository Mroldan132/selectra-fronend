import apiClient  from "./axiosInstance";

class TipoDocumentoService {
    async obtenerTiposDocumento() {
        try {
            const response = await apiClient.get('/TiposDocumentos');
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al obtener los tipos de documentos.";
            console.error('Error al obtener tipos de documento:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    
    }

    async obtenerTipoDocumentoPorId(id) {
        try {
            const response = await apiClient.get(`/TiposDocumentos/${id}`);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al obtener el tipo de documento por ID.";
            console.error('Error al obtener tipo de documento por ID:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }

    async crearTipoDocumento(tipoDocumentoData) {
        try {
            const response = await apiClient.post('/TiposDocumentos', tipoDocumentoData);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al crear el tipo de documento.";
            console.error('Error al crear tipo de documento:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }   

    async actualizarTipoDocumento( tipoDocumentoData) {
        try {
            const response = await apiClient.put(`/TiposDocumentos`, tipoDocumentoData);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al actualizar el tipo de documento.";
            console.error('Error al actualizar tipo de documento:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }   

}

export default new TipoDocumentoService();