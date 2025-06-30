<template>
  <v-app id="gestion-mis-ofertas">
    <v-main class="bg-grey-lighten-5">
      <v-container>
        <div class="d-flex align-center mb-8">
          <h1 class="text-h4 font-weight-bold text-grey-darken-3">Mis Postulaciones</h1>
          <v-spacer></v-spacer>
          <v-btn
            variant="tonal"
            color="primary"
            prepend-icon="mdi-briefcase-search-outline"
            @click="navegarAExplorarOfertas"
          >
            Explorar más ofertas
          </v-btn>
        </div>

        <div v-if="loading">
          <v-row>
            <v-col v-for="n in 3" :key="n" cols="12" md="6" lg="4">
              <v-skeleton-loader type="card-avatar, actions"></v-skeleton-loader>
            </v-col>
          </v-row>
        </div>

        <div v-else-if="postulaciones.length === 0" class="text-center pa-16 border rounded-lg bg-surface">
          <v-icon size="80" class="mb-4 text-grey-lighten-1">mdi-file-find-outline</v-icon>
          <h2 class="text-h5 font-weight-medium text-grey-darken-2">Aún no has postulado a ninguna oferta</h2>
          <p class="mt-2 text-medium-emphasis">¡Tu próxima oportunidad laboral te está esperando!</p>
          <v-btn
            color="primary"
            class="mt-6"
            size="large"
            @click="navegarAExplorarOfertas"
          >
            Buscar Ofertas
          </v-btn>
        </div>

        <div v-else>
          <v-row>
            <v-col v-for="postulacion in postulaciones" :key="postulacion.id" cols="12" md="6" lg="4">
              <v-card class="d-flex flex-column fill-height" variant="outlined">
                <v-card-item class="pb-0">
                  <v-card-title class="text-wrap font-weight-bold">{{ postulacion.oferta.titulo }}</v-card-title>
                  <v-card-subtitle>{{ postulacion.oferta.area }}</v-card-subtitle>
                </v-card-item>

                <v-card-text>
                  <div class="d-flex align-center my-4">
                    <v-chip
                      :color="getColorPorEstado(postulacion.estado)"
                      variant="flat"
                      label
                      class="font-weight-bold"
                    >
                      <v-icon start :icon="getIconoPorEstado(postulacion.estado)"></v-icon>
                      {{ postulacion.estado }}
                    </v-chip>
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Postulaste el: {{ postulacion.fechaPostulacion }}
                  </div>
                </v-card-text>

                <v-spacer></v-spacer>

                <v-divider></v-divider>
                <v-card-actions>
                  <v-btn @click="verOferta(postulacion.oferta)" variant="text">
                    Ver Oferta Original
                  </v-btn>
                  <v-spacer></v-spacer>
                  <v-menu location="top end">
                    <template v-slot:activator="{ props }">
                      <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></v-btn>
                    </template>
                    <!-- <v-list dense>
                      <v-list-item @click="retirarPostulacion(postulacion.id)" class="text-error">
                        <template v-slot:prepend>
                          <v-icon>mdi-delete-outline</v-icon>
                        </template>
                        <v-list-item-title>Retirar Postulación</v-list-item-title>
                      </v-list-item>
                    </v-list> -->
                  </v-menu>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-main>

    <v-dialog v-model="dialogVisible" max-width="800px">
      <v-card v-if="ofertaSeleccionada">
        <v-card-title class="text-h5 pa-4 bg-primary">
          {{ ofertaSeleccionada.titulo }}
        </v-card-title>
        <v-card-text class="pa-6" style="line-height: 1.75;">
          <p class="font-weight-bold">Descripción:</p>
          <p>{{ ofertaSeleccionada.descripcionCompleta }}</p>
          </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="dialogVisible = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" location="bottom right">
      {{ snackbarText }}
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// Asume que tienes un servicio para manejar las postulaciones del usuario
// import PostulacionesService from '@/services/PostulacionesService';

// --- ROUTER ---
const router = useRouter();

// --- STATE ---
const postulaciones = ref([]);
const loading = ref(true);
const dialogVisible = ref(false);
const ofertaSeleccionada = ref(null);

// Snackbar state
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('');

// --- MOCK DATA (reemplazar con llamada a la API) ---
const mockData = [
  { id: 1, fechaPostulacion: '15 de Mayo, 2025', estado: 'CV Recibido', oferta: { id: 101, titulo: 'Desarrollador Frontend Vue.js', area: 'Tecnología', descripcionCompleta: 'Buscamos un desarrollador Vue con 3 años de experiencia para unirse a nuestro equipo de innovación...' }},
  { id: 2, fechaPostulacion: '10 de Mayo, 2025', estado: 'En Revisión', oferta: { id: 102, titulo: 'Diseñador UX/UI Senior', area: 'Diseño', descripcionCompleta: 'Responsable de crear experiencias de usuario intuitivas y atractivas para nuestras aplicaciones móviles.' }},
  { id: 3, fechaPostulacion: '05 de Mayo, 2025', estado: 'Proceso Finalizado', oferta: { id: 103, titulo: 'Analista de Datos PowerBI', area: 'Business Intelligence', descripcionCompleta: 'Analizar grandes volúmenes de datos y crear dashboards interactivos para la toma de decisiones.' }},
  { id: 4, fechaPostulacion: '01 de Mayo, 2025', estado: 'Contactado para Entrevista', oferta: { id: 104, titulo: 'Project Manager', area: 'Operaciones', descripcionCompleta: 'Liderar proyectos de implementación de software desde la planificación hasta el cierre.' }},
];

// --- METHODS ---
const cargarPostulaciones = async () => {
  loading.value = true;
  try {
    // LLAMADA REAL A LA API:
    // postulaciones.value = await PostulacionesService.getMisPostulaciones();
    
    // Usando datos de ejemplo por ahora:
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simula la carga de red
    postulaciones.value = mockData;

  } catch (error) {
    console.error("Error al cargar las postulaciones:", error);
    snackbarText.value = 'No se pudieron cargar tus postulaciones.';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    loading.value = false;
  }
};

const verOferta = (oferta) => {
  ofertaSeleccionada.value = oferta;
  dialogVisible.value = true;
};

const retirarPostulacion = async (id) => {
  // Aquí iría la lógica para llamar al servicio y eliminar la postulación
  console.log(`Retirando postulación con id: ${id}`);
  snackbarText.value = 'Tu postulación ha sido retirada.';
  snackbarColor.value = 'success';
  snackbar.value = true;
  // Opcional: Recargar la lista para que desaparezca la tarjeta
  cargarPostulaciones(); 
};

const navegarAExplorarOfertas = () => {
  router.push({ name: 'portalOfertas' }); // Asegúrate de que esta ruta exista
};

// --- HELPERS VISUALES ---
const getColorPorEstado = (estado) => {
  const colores = {
    'CV Recibido': 'blue-lighten-1',
    'En Revisión': 'primary',
    'Contactado para Entrevista': 'success',
    'Proceso Finalizado': 'grey-darken-1',
    'Rechazado': 'error',
  };
  return colores[estado] || 'default';
};

const getIconoPorEstado = (estado) => {
  const iconos = {
    'CV Recibido': 'mdi-email-receive-outline',
    'En Revisión': 'mdi-file-eye-outline',
    'Contactado para Entrevista': 'mdi-phone-forward-outline',
    'Proceso Finalizado': 'mdi-check-decagram-outline',
    'Rechazado': 'mdi-close-circle-outline',
  };
  return iconos[estado] || 'mdi-help-circle-outline';
};

// --- LIFECYCLE HOOKS ---
onMounted(cargarPostulaciones);
</script>

<style scoped>
.v-card {
  transition: all 0.2s ease-in-out;
}
.v-card:hover {
  box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
  transform: translateY(-4px);
}
</style>