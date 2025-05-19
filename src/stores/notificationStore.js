import { defineStore } from 'pinia';
import NotificacionService from '@/services/NotificacionService'; 
import { useAuthStore } from './authStore'; 

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
  }),

  getters: {
    sortedNotifications: (state) => {
      return [...state.notifications].sort((a, b) => {
        const dateA = new Date(a.timestamp || a.fechaCreacion);
        const dateB = new Date(b.timestamp || b.fechaCreacion);
        return dateB - dateA; 
      });
    }
  },

  actions: {
    async fetchNotifications() {
      const authStore = useAuthStore();
      if (!authStore.isLoggedIn || !authStore.currentUser?.usuarioId) {
        console.warn('Usuario no logueado o sin ID, no se pueden cargar notificaciones.');
        this.clearNotifications();
        return;
      }
      const usuarioId = authStore.currentUser.usuarioId;

      this.loading = true;
      this.error = null;
      try {
        const responseData = await NotificacionService.getNotificaciones(usuarioId);
        
        if (responseData && Array.isArray(responseData.items)) {
          this.notifications = responseData.items.map(n => ({
            id: n.notificacionId,
            title: n.titulo,
            message: n.mensaje,
            type: n.tipo,
            timestamp: n.fechaCreacion,
            isRead: n.leida,
            link: n.link
          }));
          this.unreadCount = responseData.unreadCount;
        } else {
          this.notifications = [];
          this.unreadCount = 0;
          console.warn('La respuesta de getNotificaciones no tiene el formato esperado:', responseData);
        }

      } catch (error) {
        this.error = error.message || 'Error al cargar notificaciones.';
        console.error("Error en fetchNotifications (store):", error);
        this.notifications = [];
        this.unreadCount = 0;
      } finally {
        this.loading = false;
      }
    },

    async markAsRead(notificationId) {
      const authStore = useAuthStore();
      if (!authStore.isLoggedIn || !authStore.currentUser?.usuarioId) return;
      const usuarioId = authStore.currentUser.usuarioId;

      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);

        try {
          await NotificacionService.leidoNotificacion(notificationId, usuarioId);
        } catch (error) {
          console.error("Error al marcar notificación como leída en el backend (store):", error);
          notification.isRead = false; // Revertir
          this.unreadCount++;
          this.error = error.message || 'Error al actualizar estado de notificación.';
        }
      }
    },

    async markAllAsRead() {
      const authStore = useAuthStore();
      if (!authStore.isLoggedIn || !authStore.currentUser?.usuarioId) return;
      const usuarioId = authStore.currentUser.usuarioId;

      const originalNotifications = JSON.parse(JSON.stringify(this.notifications));
      const originalUnreadCount = this.unreadCount;

      this.notifications.forEach(n => {
        if (!n.isRead) n.isRead = true;
      });
      this.unreadCount = 0;

      try {
        await NotificacionService.marcarTodasLeidas(usuarioId);
      } catch (error) {
        console.error("Error al marcar todas las notificaciones como leídas en el backend (store):", error);
        this.notifications = originalNotifications;
        this.unreadCount = originalUnreadCount;
        this.error = error.message || 'Error al actualizar todas las notificaciones.';
      }
    },

    addNotification(newNotificationBackend) {
      const newNotificationFrontend = {
        id: newNotificationBackend.notificacionId,
        title: newNotificationBackend.titulo,
        message: newNotificationBackend.mensaje,
        type: newNotificationBackend.tipo,
        timestamp: newNotificationBackend.fechaCreacion,
        isRead: newNotificationBackend.leida,
        link: newNotificationBackend.link
      };

      if (!this.notifications.some(n => n.id === newNotificationFrontend.id)) {
        this.notifications.unshift(newNotificationFrontend);
        if (!newNotificationFrontend.isRead) {
          this.unreadCount++;
        }
      } else {
        const existingNotification = this.notifications.find(n => n.id === newNotificationFrontend.id);
        if(existingNotification) {
            const previouslyRead = existingNotification.isRead;
            Object.assign(existingNotification, newNotificationFrontend); 
            if (previouslyRead && !existingNotification.isRead) {
                this.unreadCount++;
            } else if (!previouslyRead && existingNotification.isRead) {
                this.unreadCount = Math.max(0, this.unreadCount - 1);
            }
        }
      }
    },
    
    clearNotifications() {
        this.notifications = [];
        this.unreadCount = 0;
        this.error = null;
        this.loading = false;
    }
  },
});