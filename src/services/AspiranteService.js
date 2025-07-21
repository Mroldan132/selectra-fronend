import apiClient  from "./axiosInstance";

class AspiranteService {
    async registrarAspirante(aspiranteData) {
        try {
            const response = await apiClient.post('/Usuarios/registrarAspirante', aspiranteData);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                "Error desconocido al registrar el aspirante.";
            console.error('Error al registrar aspirante:', errorMessage, error.response || error);
            throw new Error(errorMessage);
        }
    }

    async updateAspirante(id, data) {
        try {
            const response = await apiClient.put(`/Usuarios/actualizarAspirante/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar aspirante:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al actualizar datos del aspirante.");
        }
    }

    async getAspiranteById(id) {
        try {
            const response = await apiClient.get(`/Aspirantes/detalleAspirante/${id}`);

            return response.data;
        } catch (error) {
            console.error("Error al obtener aspirante por ID:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar datos del aspirante");
        }
    }

    async getAspirantes(){
        try {
            const response = await apiClient.get('/Aspirantes/listaAspirantes');

            return response.data;
        } catch (error) {
            console.error("Error al obtener aspirantes:", error.response || error);
            throw new Error(error.response?.data?.message || "Error al cargar lista de aspirantes");
        }
    }
    
   async descargarCV(aspiranteId) {
        try {
            const response = await apiClient.get(
                `/Aspirantes/${aspiranteId}/cv`,
                {
                    // 1. ¡Importante! Indicar que la respuesta es un archivo binario (blob).
                    responseType: 'blob',
                }
            );

            // 2. Crear una URL temporal en el navegador para el archivo recibido.
            const url = window.URL.createObjectURL(new Blob([response.data]));

            // 3. Crear un enlace <a> invisible para iniciar la descarga.
            const link = document.createElement('a');
            link.href = url;

            // 4. Extraer el nombre del archivo desde los encabezados de la respuesta.
            // Si el header no está, usa un nombre por defecto.
            const contentDisposition = response.headers['content-disposition'];
            let fileName = `CV_Aspirante_${aspiranteId}.pdf`; // Nombre por defecto
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (fileNameMatch.length === 2) {
                    fileName = fileNameMatch[1];
                }
            }
            link.setAttribute('download', fileName);

            // 5. Añadir el enlace al DOM, simular un clic y removerlo.
            document.body.appendChild(link);
            link.click();
            link.remove();

            // 6. Limpiar la URL temporal para liberar memoria.
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Error al descargar el CV:", error.response || error);
            // Lanza un error para que el componente que llama pueda manejarlo (ej. mostrar una notificación)
            throw new Error(error.response?.data?.message || "No se pudo descargar el archivo.");
        }
    }
}
export default new AspiranteService();