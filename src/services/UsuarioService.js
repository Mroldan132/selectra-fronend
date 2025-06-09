import apiClient  from "./axiosInstance";

class UsuarioService {

  async registrarUsuario(usuarioData) {
    try {
        
      const response = await apiClient.post('/Usuarios/registrarPersonal', usuarioData);
      return response.data;
    } catch (error) {
      console.error("Error al registrar usuario (servicio):", error.response || error);
      throw new Error(error.response?.data?.message || error.message || "Error desconocido al registrar el usuario.");
    }
  }

  async getRoles() {
    try {
      const response = await apiClient.get('/Usuarios/listaRoles'); 
      return response.data;
    } catch (error) {
      console.error("Error al obtener roles:", error.response || error);
      throw new Error(error.response?.data?.message || "Error al cargar roles.");
    }
  }

}

export default new UsuarioService();