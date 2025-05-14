<template>
  <v-container class="home-view-container" fluid>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card class="elevation-2 welcome-card">
          <v-card-title class="text-h4 text-center primary white--text pa-4">
            ¡Bienvenido a Selectra RH!
          </v-card-title>
          <v-card-subtitle class="text-center pt-2 pb-4" v-if="authStore.isLoggedIn && authStore.currentUser">
            Sesión iniciada como: <strong>{{ authStore.currentUser.usuario }}</strong> (Rol: <strong>{{ authStore.currentUser.rol || 'No asignado' }}</strong>)
          </v-card-subtitle>
          <v-divider></v-divider>

          <v-card-text v-if="authStore.isLoggedIn" class="pa-5">
            <p class="text-body-1 mb-6">
              Desde aquí podrás gestionar los procesos de reclutamiento y selección de personal.
              Utiliza las acciones rápidas a continuación o el menú de navegación principal.
            </p>

            <h3 class="text-h6 mb-3 primary--text">Acciones Rápidas:</h3>
            <v-list dense nav>
              <v-list-item
                v-if="puedeCrearRequerimiento"
                link
                :to="{ name: 'crearRequerimiento' }"
                prepend-icon="mdi-text-box-plus-outline"
                color="primary"
              >
                <v-list-item-title>Crear Nuevo Requerimiento</v-list-item-title>
              </v-list-item>

              <v-list-item
                v-if="puedeVerMisRequerimientos"
                link
                :to="{ name: 'misRequerimientos' }" prepend-icon="mdi-file-document-multiple-outline"
                color="primary"
              >
                <v-list-item-title>Ver Mis Requerimientos</v-list-item-title>
              </v-list-item>

              <v-list-item
                v-if="puedeAprobarRequerimientos"
                link
                :to="{ name: 'pendientesAprobacion' }" prepend-icon="mdi-file-check-outline"
                color="primary"
              >
                <v-list-item-title>Requerimientos Pendientes de Aprobar</v-list-item-title>
                </v-list-item>

              <v-list-item
                v-if="esAdminORrhh"
                link
                :to="{ name: 'gestionUsuarios' }" prepend-icon="mdi-account-group-outline"
                color="primary"
              >
                <v-list-item-title>Gestionar Usuarios</v-list-item-title>
              </v-list-item>
              </v-list>
          </v-card-text>

          <v-card-text v-else class="text-center pa-5">
            <p class="text-h6">Por favor, inicia sesión para acceder a las funcionalidades.</p>
            <v-btn color="primary" :to="{ name: 'login' }" class="mt-4">
              Ir a Iniciar Sesión
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card class="mt-6 elevation-2" v-if="authStore.isLoggedIn">
          <v-card-title class="text-h6 primary--text">
            Dashboard General
          </v-card-title>
          <v-card-text>
            <p class="text-center text-disabled pa-5">
              <em>(Próximamente: Gráficos e indicadores clave del proceso de reclutamiento)</em>
            </p>
            </v-card-text>
        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
// RouterLink no se importa explícitamente aquí porque usamos la prop :to en v-list-item y v-btn

const authStore = useAuthStore();

// Lógica para determinar qué acciones mostrar basado en el rol
// Asegúrate que los strings de los roles coincidan con los de tu backend/authStore
const puedeCrearRequerimiento = computed(() => {
  const userRole = authStore.getUserRole;
  return ['Solicitante', 'Jefe Aprobador', 'RRHH', 'Administrador'].includes(userRole);
});

const puedeVerMisRequerimientos = computed(() => {
  const userRole = authStore.getUserRole;
  // Normalmente todos los roles que crean pueden ver los suyos
  return ['Solicitante', 'Jefe Aprobador', 'RRHH', 'Administrador'].includes(userRole);
});

const puedeAprobarRequerimientos = computed(() => {
  const userRole = authStore.getUserRole;
  // Ajusta estos roles según tu flujo de aprobación
  return ['Jefe Aprobador', 'Gerente', 'Administrador'].includes(userRole);
});

const esAdminORrhh = computed(() => {
  const userRole = authStore.getUserRole;
  return ['Administrador', 'RRHH'].includes(userRole);
});

</script>

<style scoped>
.home-view-container {
  padding-top: 24px; /* Espacio desde la barra de navegación si es fija */
  padding-bottom: 24px;
}



.primary--text {
  color: #1976D2; /* Color primario de Vuetify por defecto, o el que definas en tu tema */
}

.white--text {
  color: white !important;
}

/* Si quieres que los v-list-item tengan un hover más pronunciado */
.v-list-item--link:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

/* Estilos adicionales que puedas necesitar */
</style>