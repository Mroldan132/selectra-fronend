import apiClient  from "./axiosInstance";

class DatosPersonalesService {
    async getTiposDocumento() {
    try {
      const response = await apiClient.get('/DatosPersonales/ListaTiposDocumento'); 
      return response.data;
    } catch (error) {
      console.error("Error al obtener tipos de documento:", error.response || error);
      throw new Error(error.response?.data?.message || "Error al cargar tipos de documento.");
    }
  }

  async getDepartamentos() {
    try {
      const response = await apiClient.get('/DatosPersonales/ListaDepartamentos'); 
      return response.data;
    } catch (error) {
      console.error("Error al obtener departamentos:", error.response || error);
      throw new Error(error.response?.data?.message || "Error al cargar departamentos.");
    }
  }

  async getProvincias(departamentoId) {
    try {
      const response = await apiClient.get(`/DatosPersonales/ListaProvincias/${departamentoId}`); 
      return response.data;
    } catch (error) {
      console.error("Error al obtener provincias:", error.response || error);
      throw new Error(error.response?.data?.message || "Error al cargar provincias.");
    }
  }
  
  async getDistritos(provinciaId) {
    try {
      const response = await apiClient.get(`/DatosPersonales/ListaDistritos/${provinciaId}`); 
      return response.data;
    } catch (error) {
      console.error("Error al obtener distritos:", error.response || error);
      throw new Error(error.response?.data?.message || "Error al cargar distritos.");
    }
  }


}

export default new DatosPersonalesService();

 