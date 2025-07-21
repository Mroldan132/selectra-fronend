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
                    Postulaste el: {{ postulacion.fecha }}
                  </div>
                </v-card-text>

                <v-spacer></v-spacer>

                <v-divider></v-divider>
                
                <v-card-actions class="pa-4">
                  <v-btn
                    v-if="postulacion.estado === 'Seleccion' && !postulacion.oferta.respondioPreguntas"
                    @click="abrirModalPreguntas(postulacion.oferta)"
                    variant="tonal"
                    color="primary"
                    size="small"
                  >
                    <v-icon start>mdi-pencil-plus-outline</v-icon>
                    Responder Preguntas
                  </v-btn>
                  
                  <div
                    v-else-if="postulacion.estado === 'Seleccion' && postulacion.oferta.respondioPreguntas"
                    class="text-caption text-success font-weight-medium d-flex align-center"
                  >
                    <v-icon start color="success">mdi-check-circle-outline</v-icon>
                    Ya respondiste las preguntas ✅
                  </div>

                  <v-spacer></v-spacer>
                </v-card-actions>
                
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-main>

    <PreguntasAspirantesModal
      v-if="preguntasModalVisible"
      v-model="preguntasModalVisible"
      :id-ofertta="ofertaIdParaPreguntas"
      :pregunta-filtro-id="preguntaFiltroId"
      @guardado="handleRespuestasGuardadas"
    />

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" location="bottom right">
      {{ snackbarText }}
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import PostulacionesService from '@/services/PostulantesService';
import PreguntasAspirantesModal from '@/components/aspirante/PreguntasAspirantesModal.vue';

const router = useRouter();

const postulaciones = ref([]);
const loading = ref(true);

const preguntasModalVisible = ref(false);
const ofertaIdParaPreguntas = ref(null);
const preguntaFiltroId = ref(null);

const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('');

const cargarPostulaciones = async () => {
  loading.value = true;
  try {
    const response = await PostulacionesService.misPostulaciones();
    postulaciones.value = response;
  } catch (error) {
    console.error("Error al cargar las postulaciones:", error);
    snackbarText.value = 'No se pudieron cargar tus postulaciones.';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    loading.value = false;
  }
};

const abrirModalPreguntas = (oferta) => {
  ofertaIdParaPreguntas.value = oferta.idOfertta; 
  preguntaFiltroId.value = oferta.preguntaFiltroId
  preguntasModalVisible.value = true;
};

const handleRespuestasGuardadas = (respuestas) => {
  console.log('Respuestas recibidas en la vista principal:', respuestas);
  snackbarText.value = '¡Gracias! Tus respuestas han sido guardadas.';
  snackbarColor.value = 'success';
  snackbar.value = true;
};

const navegarAExplorarOfertas = () => {
  router.push({ name: 'portalOfertas' });
};

const getColorPorEstado = (estado) => {
  const colores = {
    'Postulado': 'blue-lighten-1',
    'Seleccion': 'primary',
    'Contactado para Entrevista': 'success',
    'Proceso Finalizado': 'grey-darken-1',
    'Rechazado': 'error',
  };
  return colores[estado] || 'default';
};

const getIconoPorEstado = (estado) => {
  const iconos = {
    'Postulado': 'mdi-email-receive-outline',
    'Seleccion': 'mdi-file-eye-outline',
    'Contactado para Entrevista': 'mdi-phone-forward-outline',
    'Proceso Finalizado': 'mdi-check-decagram-outline',
    'Rechazado': 'mdi-close-circle-outline',
  };
  return iconos[estado] || 'mdi-help-circle-outline';
};

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