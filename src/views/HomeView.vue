<template>
  <v-container fluid class="home-view-container pa-4 pa-sm-6">
    <v-row justify="center">
      <v-col cols="12" md="11" lg="10">
        <v-card class="elevation-2 welcome-card mb-6" rounded="xl">
          <v-card-title class="text-h4 text-center bg-primary text-white pa-5">
            ¡Bienvenido a Selectra RH!
          </v-card-title>
          <v-card-subtitle class="text-center pt-3 pb-4" v-if="authStore.isLoggedIn && authStore.currentUser">
            Sesión iniciada como: <strong>{{ authStore.currentUser.usuario }}</strong>
            (Rol: <strong>{{ authStore.currentUser.rol || 'No asignado' }}</strong>)
          </v-card-subtitle>  
          <v-divider></v-divider>
        </v-card>

        <HomeAdministrador v-if="userRole === 'Administrador'" />

        <HomePersonal v-if="userRole === 'Solicitante' || userRole === 'JefeAprobador'" />

        <HomeAspirante v-else-if="userRole === 'Aspirante'" />

        

        <!-- <template v-else>
          <v-card class="elevation-2 pa-8 text-center" rounded="xl">
            <p class="text-h6">Por favor, inicia sesión para acceder a las funcionalidades.</p>
            <v-btn color="primary" :to="{ name: 'login' }" class="mt-4" rounded="lg" size="large">
              Ir a Iniciar Sesión
            </v-btn>
          </v-card>
        </template> -->

      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import HomePersonal from '@/components/home/HomePersonal.vue';
import HomeAspirante from '@/components/home/HomeAspirante.vue';
import HomeAdministrador from '@/components/home/HomeAdministrador.vue';


const authStore = useAuthStore();
const userRole = computed(() => authStore.currentUser?.rol);
</script>

<style scoped>
.home-view-container {
  background-color: rgb(var(--v-theme-background));
}
.welcome-card .v-card-title {
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
}
.text-primary {
  color: rgb(var(--v-theme-primary)) !important;
}
.bg-primary {
  background-color: rgb(var(--v-theme-primary)) !important;
}
.text-white {
  color: white !important;
}
</style>