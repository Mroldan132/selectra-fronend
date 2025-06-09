<template>
  <v-app>
    <v-navigation-drawer
      v-if="mostrarNavegacionPrincipal"
      v-model="drawer"
      app
      clipped
      color="grey-lighten-4"
      :width="280"
    >
      <v-list-item class="pa-3">
        <v-list-item-title class="text-h6 font-weight-bold text-grey-darken-2">
          Selectra RH
        </v-list-item-title>
      </v-list-item>
      <v-divider></v-divider>

      <v-list nav dense class="pa-2">
        <template v-for="(section, sectionIndex) in menuSections" :key="sectionIndex">
          <v-list-subheader v-if="section.title" class="text-overline font-weight-bold text-grey-darken-1 mt-2">{{ section.title }}</v-list-subheader>
          <v-list-item
            v-for="item in section.items"
            :key="item.title"
            :to="item.to"
            link
            exact
            color="primary"
            rounded="lg"
            class="mb-1"
          >
            <template v-slot:prepend>
              <v-icon :icon="item.icon" size="small"></v-icon>
            </template>
            <v-list-item-title class="text-body-2">{{ item.title }}</v-list-item-title>
          </v-list-item>
          <v-divider v-if="section.divider && sectionIndex < menuSections.length - 1" class="my-2"></v-divider>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      v-if="mostrarNavegacionPrincipal"
      app
      color="surface"
      flat
      height="68"
      class="border-b"
      clipped-left
    >
      <v-app-bar-nav-icon
        @click="drawer = !drawer"
        color="grey-darken-1"
      ></v-app-bar-nav-icon>
      <v-spacer></v-spacer>

      <v-btn icon class="mr-1" color="grey-darken-1">
        <v-icon>mdi-magnify</v-icon>
      </v-btn>

      <v-menu
        offset-y
        rounded="lg"
        location="bottom end"
        transition="slide-y-transition"
        :close-on-content-click="false"
        max-width="380px"
        min-width="360px"
      >
        <template v-slot:activator="{ props: menuNotificationProps }">
          <v-btn v-bind="menuNotificationProps" icon class="mr-1" color="grey-darken-1">
            <v-badge
              :content="unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount"
              color="error"
              dot
              bordered
              :model-value="unreadNotificationsCount > 0"
            >
              <v-icon>mdi-bell-outline</v-icon>
            </v-badge>
          </v-btn>
        </template>
        <v-card>
          <v-card-title class="d-flex align-center pa-3">
            <span class="text-subtitle-1 font-weight-medium">Notificaciones</span>
            <v-spacer></v-spacer>
            <v-btn
              v-if="notifications.length > 0"
              size="small"
              variant="text"
              color="primary"
              @click="markAllAsRead"
              :disabled="unreadNotificationsCount === 0"
            >
              Marcar todas como leídas
            </v-btn>
          </v-card-title>
          <v-divider></v-divider>
          <v-virtual-scroll
            v-if="notifications.length > 0"
            :items="notifications"
            height="300"
            item-height="70"
          >
            <template v-slot:default="{ item }">
              <v-list-item
                :key="item.id"
                @click="handleNotificationClick(item)"
                class="pa-3"
                :class="{ 'bg-blue-lighten-5': !item.isRead && item.type !== 'RequerimientoAprobado' && item.type !== 'RequerimientoRechazado' }"
              >
                <template v-slot:prepend>
                  <v-avatar :color="getNotificationAvatarColor(item.type, item.isRead)" size="36" class="mr-3">
                    <v-icon :icon="getNotificationIcon(item.type)" :color="getNotificationIconColorInAvatar(item.type, item.isRead)"></v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="text-body-2 font-weight-medium mb-1" style="white-space: normal;">{{ item.title }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption" style="white-space: normal; line-height: 1.3;">{{ item.message }}</v-list-item-subtitle>
                <template v-slot:append>
                  <div class="d-flex flex-column align-end">
                    <span class="text-caption text-grey-darken-1">{{ formatNotificationTime(item.timestamp) }}</span>
                    <v-icon v-if="!item.isRead" :color="getNotificationDotColor(item.type)" size="x-small" class="mt-1">mdi-circle</v-icon>
                  </div>
                </template>
              </v-list-item>
              <v-divider></v-divider>
            </template>
          </v-virtual-scroll>
          <v-card-text v-else class="text-center text-grey pa-6">
            <v-icon size="48" class="mb-2">mdi-email-open-outline</v-icon>
            <p>No tienes notificaciones.</p>
          </v-card-text>
          <v-divider v-if="notifications.length > 0"></v-divider>
          <v-card-actions v-if="notifications.length > 0" class="pa-2 justify-center">
            <v-btn block variant="text" color="primary" @click="navigateToNotificationsPage">
              Ver todas las notificaciones
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>

      <div class="d-flex align-center ml-2 mr-2" style="min-width: 0;">
        <v-menu
          offset="12"
          rounded="lg"
          location="bottom end"
          transition="slide-y-transition"
          min-width="230px"
        >
          <template v-slot:activator="{ props: menuUserProps }">
            <v-btn
              v-bind="menuUserProps"
              variant="text"
              class="pa-1 text-none d-flex align-center"
              style="min-width: 0;"
            >
              <v-avatar
                color="primary"
                size="40"
                class="mr-2 elevation-1"
              >
                <span
                  class="font-weight-bold text-h6"
                  style="color: white; letter-spacing: 0.5px;"
                >
                  {{ authStore.currentUser?.usuario.charAt(0).toUpperCase() }}
                </span>
              </v-avatar>
              <div
                class="d-none d-sm-flex flex-column align-start mr-1"
                style="line-height: 1.25; overflow: hidden;"
              >
                <span
                  class="font-weight-medium text-grey-darken-3 text-truncate"
                  style="font-size: 0.9rem; max-width: 120px;"
                  :title="authStore.currentUser?.usuario"
                >
                  {{ authStore.currentUser?.usuario }}
                </span>
                <span
                  class="text-caption text-grey-darken-1 text-truncate"
                  style="opacity: 0.85; max-width: 120px;"
                  :title="authStore.currentUser?.rol"
                >
                  {{ authStore.currentUser?.rol }}
                </span>
              </div>
              <v-icon
                right
                class="d-none d-sm-flex ml-1 text-grey-darken-1"
                size="small"
              >mdi-chevron-down</v-icon>
              <v-icon
                class="d-flex d-sm-none text-grey-darken-1"
                size="28"
              >mdi-account-circle</v-icon>
            </v-btn>
          </template>
          <v-list dense nav class="pa-1" width="230">
            <v-divider class="my-1"></v-divider>
            <v-list-item
              @click="handleLogout"
              color="error"
              rounded="md"
              class="my-1"
            >
              <template v-slot:prepend>
                <v-icon icon="mdi-logout" size="small"></v-icon>
              </template>
              <v-list-item-title class="text-body-2 font-weight-medium">
                Cerrar Sesión
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <v-main class="bg-grey-lighten-5">
      <router-view v-slot="{ Component }">
        <v-fade-transition mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </v-fade-transition>
      </router-view>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const router = useRouter();
const route = useRoute();

const drawer = ref(true);

// Lógica centralizada para controlar la visibilidad de la navegación
const mostrarNavegacionPrincipal = computed(() => {
  // Lista de rutas públicas que NO deben mostrar la navegación principal
  const rutasSinLayout = ['login', 'registro-aspirante'];

  // La navegación se muestra solo si el usuario está logueado Y la ruta actual NO está en la lista de exclusión.
  return authStore.isLoggedIn && !rutasSinLayout.includes(route.name);
});

const handleLogout = () => {
  authStore.logout();
  notificationStore.clearNotifications();
  drawer.value = false;
  router.push({ name: 'login' });
};

const notifications = computed(() => notificationStore.sortedNotifications);
const unreadNotificationsCount = computed(() => notificationStore.unreadCount);

const fetchUserNotifications = () => {
  if (authStore.isLoggedIn) {
    notificationStore.fetchNotifications();
  }
};

const markAllAsRead = () => {
  notificationStore.markAllAsRead();
};

const handleNotificationClick = (notification) => {
  if (!notification.isRead) {
    notificationStore.markAsRead(notification.id);
  }
  if (notification.link) {
    router.push(notification.link);
  }
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'NuevoRequerimiento':
    case 'Requerimiento':
      return 'mdi-file-plus-outline';
    case 'RequerimientoAprobado':
      return 'mdi-check-circle-outline';
    case 'RequerimientoRechazado':
      return 'mdi-close-circle-outline';
    case 'Anuncio':
      return 'mdi-bullhorn-outline';
    default:
      return 'mdi-email-alert-outline';
  }
};

const getNotificationAvatarColor = (type, isRead) => {
  if (type === 'RequerimientoAprobado') {
    return 'success';
  }
  if (type === 'RequerimientoRechazado') {
    return 'error';
  }
  return isRead ? 'grey-lighten-2' : 'primary';
};

const getNotificationIconColorInAvatar = (type, isRead) => {
  if (type === 'RequerimientoAprobado' || type === 'RequerimientoRechazado') {
    return 'white';
  }
  return isRead ? 'grey-darken-1' : 'white';
};

const getNotificationDotColor = (type) => {
  if (type === 'RequerimientoAprobado') return 'success';
  if (type === 'RequerimientoRechazado') return 'error';
  return 'primary';
};

const formatNotificationTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

  if (diffSeconds < 1) return 'ahora';
  if (diffSeconds < 60) return `hace ${diffSeconds}s`;

  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return `hace ${diffMinutes}m`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `hace ${diffHours}h`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return `ayer`;
  if (diffDays < 7) return `hace ${diffDays}d`;

  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
};

const navigateToNotificationsPage = () => {
  console.log("Navegar a la página de todas las notificaciones (implementar ruta y componente)");
};

onMounted(() => {
  if (authStore.isLoggedIn) {
    fetchUserNotifications();
  }
});

watch(() => authStore.isLoggedIn, (newIsLoggedIn) => {
  if (newIsLoggedIn) {
    fetchUserNotifications();
  } else {
    notificationStore.clearNotifications();
  }
});

const menuSections = computed(() => {
  const userRole = authStore.getUserRole;
  if (!userRole) return [];
  let sections = [
    {
      title: 'DASHBOARD',
      items: [{ title: 'Inicio', icon: 'mdi-home-variant-outline', to: { name: 'home' } }],
      divider: true
    },
    {
      title: 'GESTIÓN',
      items: [],
      divider: true
    },
  ];
  if (userRole === 'Solicitante' || userRole === 'JefeAprobador') {
    sections.find(s => s.title === 'GESTIÓN').items.push(
      { title: 'Requerimientos', icon: 'mdi-file-document-multiple-outline', to: { name: 'gestionRequerimientos' } }
    );
  }
  if (userRole === 'Administrador') {
    sections.find(s => s.title === 'GESTIÓN').items.push(
      { title: 'Requerimientos Aprobados', icon: 'mdi-account-multiple-outline', to: { name: 'gestionRequerimientosAdm' } },
      { title: 'Personal', icon: 'mdi-account-group-outline', to: { name: 'gestionPersonal' } },
      { title: 'Gestión Oferta Laboral', icon: 'mdi-briefcase-outline', to: { name: 'ofertasLaboralesAdm' } }
    );
  }
  if (userRole === 'Aspirante') {
    sections.push({
      title: 'PORTAL',
      items: [
        { title: 'Portal de Ofertas', icon: 'mdi-briefcase-search-outline', to: { name: 'portalOfertas' } }
      ]
    });
  }  
  return sections.filter(section => section.items.length > 0 || !section.title);
});
</script>

<style>
html, body, #app, .v-application {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}
.v-application--wrap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.v-main {
  flex-grow: 1;
  overflow-y: auto;
}
.v-navigation-drawer .v-list-subheader {
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  line-height: 1.5;
}
.v-navigation-drawer .v-list-item {
  padding-inline-start: 12px !important;
}
.v-navigation-drawer .v-list-item-title {
  font-weight: 500;
}
.v-app-bar.v-toolbar {
  transition: box-shadow .2s ease-in-out, background-color .2s ease-in-out;
}
.v-avatar .v-icon, .v-avatar span {
  color: white !important;
}
.v-avatar.bg-primary span {
  color: white !important;
}
.v-navigation-drawer__content::-webkit-scrollbar {
  display: none;
}
.v-navigation-drawer__content {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.v-menu .v-list-item {
    min-height: 60px;
}
.v-menu .v-list-item--active {
    background-color: rgba(var(--v-theme-primary), 0.05);
}
.v-fade-transition-leave-active {
  transition: opacity 0.2s ease-in-out;
}
</style>