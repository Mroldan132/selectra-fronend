<template>
  <v-app>
    <v-navigation-drawer
      v-if="authStore.isLoggedIn && mostrarNavegacionPrincipal"
      v-model="drawer"
      app
      clipped
      color="grey-lighten-4"
    >
      <v-list dense nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.to"
          link
          exact
          color="primary"
        >
          <template v-slot:prepend>
            <v-icon>{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn block color="secondary" @click="handleLogout">
            Cerrar Sesión
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar app color="primary" dark clipped-left>
      <v-app-bar-nav-icon
        v-if="authStore.isLoggedIn && mostrarNavegacionPrincipal"
        @click="drawer = !drawer"
      ></v-app-bar-nav-icon>
      <v-toolbar-title>Selectra RH</v-toolbar-title>
      <v-spacer></v-spacer>
      <span v-if="authStore.isLoggedIn && authStore.currentUser" class="mr-4">
        {{ authStore.currentUser.usuario }} ({{ authStore.currentUser.rol }})
      </span>
      <v-btn
        text
        :to="{ name: 'login' }"
        v-if="!authStore.isLoggedIn && route.name !== 'login'"
      >
        Iniciar Sesión
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-0 fill-height" v-if="!mostrarNavegacionPrincipal">
        <RouterView />
      </v-container>
      <v-container fluid v-else class="page-container">
        <RouterView />
      </v-container>
    </v-main>

    </v-app>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { RouterView, useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const router = useRouter();

const drawer = ref(true); // Controla si el navigation drawer está abierto o cerrado

// Determina si se debe mostrar el layout principal (nav drawer, app bar con contenido completo, footer)
const mostrarNavegacionPrincipal = computed(() => {
  const rutasSinLayout = ['login']; // Añade 'registro', 'recuperarPassword', etc. si las tienes
  return authStore.isLoggedIn && !rutasSinLayout.includes(route.name);
});

const handleLogout = () => {
  authStore.logout();
  drawer.value = false; // Cierra el drawer al hacer logout
  router.push({ name: 'login' });
};

// --- Definición de Items del Menú por Rol ---
const menuItems = computed(() => {
  debugger
  const userRole = authStore.getUserRole; // Asegúrate que este getter devuelva el string del rol
  if (!userRole) return [];

  let items = [
    { title: 'Inicio', icon: 'mdi-home-outline', to: { name: 'home' } },
    // Puedes añadir más items comunes a todos los roles aquí
  ];
  if (userRole === 'Administrador') {
    items.push(
      { title: 'Gestionar Usuarios', icon: 'mdi-account-group-outline', to: { name: 'gestionUsuarios' } }, // Necesitas crear esta ruta/vista
      { title: 'Configuración General', icon: 'mdi-cog-outline', to: { name: 'configuracionGeneral' } }, // Ejemplo
      { title: 'Ver Todos Requerimientos', icon: 'mdi-file-document-multiple-outline', to: { name: 'todosRequerimientosAdmin' } },
      { title: 'Ver Todas Ofertas', icon: 'mdi-briefcase-search-outline', to: { name: 'todasOfertasAdmin' } }
    );
  }

  if (userRole === 'RRHH' || userRole === 'Administrador') { // RRHH puede heredar de Admin o tener propios
    items.push(
      { title: 'Gestionar Ofertas', icon: 'mdi-briefcase-edit-outline', to: { name: 'gestionarOfertas' } }, // Crear/ver/editar ofertas
      { title: 'Ver Postulantes', icon: 'mdi-account-search-outline', to: { name: 'verPostulantes' } }
    );
  }

  if (userRole === 'JefeAprobador' || userRole === 'Administrador') {
     if (!items.some(item => item.to.name === 'crearRequerimiento')) { // Evitar duplicados si ya lo tiene RRHH/Admin
        items.push({ title: 'Crear Requerimiento', icon: 'mdi-text-box-plus-outline', to: { name: 'crearRequerimiento' } });
     }
    items.push(
      { title: 'Mis Requerimientos', icon: 'mdi-file-document-outline', to: { name: 'misRequerimientos' } },
      { title: 'Pendientes de Aprobar', icon: 'mdi-file-check-outline', to: { name: 'pendientesAprobacion' } }
    );
  }

  if (userRole === 'Solicitante') { // Asumimos que 'Solicitante' es un rol específico
     if (!items.some(item => item.to.name === 'gestionRequerimientos')) {
        items.push({ title: 'Lista de Requerimientos', icon: 'mdi-text-box-plus-outline', to: { name: 'gestionRequerimientos' } });
     };
  }
  
  if (userRole === 'Colaborador') {
    items.push(
    );
  }


  // Filtrar duplicados por 'to.name' si diferentes roles comparten la misma ruta/título
  const uniqueMenuItems = [];
  const seenRoutes = new Set();
  for (const item of items) {
    if (item.to && item.to.name && !seenRoutes.has(item.to.name)) {
      uniqueMenuItems.push(item);
      seenRoutes.add(item.to.name);
    } else if (!item.to || !item.to.name) { // Para items que no son rutas (ej. divisores)
        uniqueMenuItems.push(item);
    }
  }
  return uniqueMenuItems;
});

// Observa cambios en la ruta para cerrar el drawer en pantallas pequeñas después de navegar
const route = useRouter();
watch(() => route.path, () => {
  // Esto es más relevante para UX en móviles.
  // Puedes obtener el breakpoint actual de Vuetify si quieres ser más específico.
  if (drawer.value && window.innerWidth < 960) { // 960px es el breakpoint 'md' por defecto de Vuetify
    // drawer.value = false; // Descomenta si quieres este comportamiento
  }
});

</script>

<style>
/* Estilos globales o para asegurar que v-main ocupe espacio */
html, body, #app, .v-application {
  height: 100%;
  margin: 0;
  padding: 0;
}
.v-application--wrap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.v-main {
  flex-grow: 1;
  /* background-color: #f4f7f6;  Un fondo suave para el área de contenido */
}
/* Ajuste para que el contenido no quede debajo de la app-bar fija */
/* .v-main {
  padding-top: 64px !important; /* Altura de la v-app-bar estándar */
/* } */

.page-container {
  height: 100%; /* Para que el fill-height de las vistas funcione bien */
}

/* Opcional: Personalizar el v-navigation-drawer */
.v-navigation-drawer .v-list-item {
  margin-bottom: 4px;
}
</style>