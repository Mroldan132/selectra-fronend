import apiClient from './apiClient';

class UsuarioService {

  async registrarUsuario(usuarioData) {
    try {
        
      const response = await apiClient.post('/Usuarios/registrar', usuarioData);
      return response.data;
    } catch (error) {
      console.error("Error al registrar usuario (servicio):", error.response || error);
      // Lanza el error para que el componente lo maneje y muestre un mensaje al usuario.
      // El backend ya debería enviar un mensaje de error formateado en error.response.data.message
      throw new Error(error.response?.data?.message || error.message || "Error desconocido al registrar el usuario.");
    }
  }

  async getRoles() {
    try {
      // Ejemplo: Asume que tienes un endpoint para obtener roles
      const response = await apiClient.get('/Roles/listar'); // Ajusta este endpoint
      return response.data;
    } catch (error) {
      console.error("Error al obtener roles:", error.response || error);
      throw new Error(error.response?.data?.message || "Error al cargar roles.");
    }
  }

  async getTiposDocumento() {
    try {
      // Ejemplo: Asume que tienes un endpoint para obtener tipos de documento
      const response = await apiClient.get('/TiposDocumento/listar'); // Ajusta este endpoint
      return response.data;
    } catch (error) {
      console.error("Error al obtener tipos de documento:", error.response || error);
      throw new Error(error.response?.data?.message || "Error al cargar tipos de documento.");
    }
  }
}

export default new UsuarioService();