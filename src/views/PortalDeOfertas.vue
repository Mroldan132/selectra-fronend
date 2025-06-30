<template>
  <v-app id="portal-ofertas">
    <v-navigation-drawer
      permanent
      :width="350"
      app
      class="border-e"
    >
      <v-sheet class="pa-4" color="grey-lighten-4">
        <v-text-field
          v-model="search"
          label="Buscar por cargo, área..."
          variant="solo"
          flat
          prepend-inner-icon="mdi-magnify"
          hide-details
        ></v-text-field>
      </v-sheet>
      <v-divider></v-divider>

      <div v-if="loading" class="pa-4">
        <v-skeleton-loader type="list-item-two-line" v-for="n in 5" :key="n"></v-skeleton-loader>
      </div>

      <div v-else>
        <v-list nav class="pa-2">
          <v-list-subheader>OFERTAS DISPONIBLES ({{ ofertasFiltradas.length }})</v-list-subheader>
          
          <div v-if="ofertasFiltradas.length === 0" class="text-center text-grey pa-4">
            <v-icon size="48" class="mb-2">mdi-database-search-outline</v-icon>
            <p>No se encontraron ofertas que coincidan con tu búsqueda.</p>
          </div>

          <v-list-item
            v-for="oferta in ofertasFiltradas"
            :key="oferta.id"
            @click="seleccionarOferta(oferta)"
            :active="ofertaSeleccionada && ofertaSeleccionada.id === oferta.id"
            rounded="lg"
            class="mb-2"
            color="primary"
          >
            <v-list-item-title class="font-weight-bold">{{ oferta.titulo }}</v-list-item-title>
            <v-list-item-subtitle class="mt-1">{{ oferta.publicadoPor }}</v-list-item-subtitle>
            <template v-slot:append>
                <v-icon size="small">mdi-chevron-right</v-icon>
            </template>
          </v-list-item>
        </v-list>
      </div>
    </v-navigation-drawer>

    <v-main class="bg-grey-lighten-5">
      <v-container fluid class="pa-0 fill-height">
        <v-responsive class="fill-height">
          <v-fade-transition mode="out-in">
            <div v-if="!ofertaSeleccionada && !loading" class="d-flex flex-column align-center justify-center fill-height text-center text-grey-darken-1">
              <v-icon size="80" class="mb-4">mdi-briefcase-search-outline</v-icon>
              <h2 class="text-h5 font-weight-medium">Bienvenido a nuestro portal de empleo</h2>
              <p class="mt-2">Selecciona una oferta de la lista para ver los detalles.</p>
            </div>

            <div v-else-if="ofertaSeleccionada" class="d-flex flex-column fill-height">
              <v-sheet color="surface" class="pa-6 border-b">
                <div class="d-flex align-center mb-4">
                  <div>
                    <h1 class="text-h4 font-weight-bold text-primary">{{ ofertaSeleccionada.titulo }}</h1>
                    <p class="text-medium-emphasis mt-1">Publicado el {{ ofertaSeleccionada.fechaPublicacion }}</p>
                  </div>
                  <v-spacer></v-spacer>
                  
                  <v-btn
                    color="primary"
                    variant="flat"
                    size="large"
                    prepend-icon="mdi-send-outline"
                    @click="postularme(ofertaSeleccionada)"
                  >
                    Postularme
                  </v-btn>
                </div>
                <div class="d-flex flex-wrap ga-2 mt-4">
                  <v-chip prepend-icon="mdi-map-marker-outline" variant="tonal" color="secondary">{{ ofertaSeleccionada.ubicacion }}</v-chip>
                  <v-chip prepend-icon="mdi-briefcase-outline" variant="tonal" color="secondary">{{ ofertaSeleccionada.modalidad }}</v-chip>
                  <v-chip prepend-icon="mdi-file-document-outline" variant="tonal" color="secondary">{{ ofertaSeleccionada.tipoContrato }}</v-chip>
                  <v-chip v-if="ofertaSeleccionada.sueldo" prepend-icon="mdi-cash" variant="tonal" color="success">{{ ofertaSeleccionada.sueldo }}</v-chip>
                </div>
              </v-sheet>

              <v-container fluid class="overflow-y-auto pa-6">
                <v-card variant="outlined" class="mb-6">
                  <v-card-item>
                    <v-card-title>Descripción del Puesto</v-card-title>
                  </v-card-item>
                  <v-card-text class="text-body-1" style="line-height: 1.75;">
                    {{ ofertaSeleccionada.descripcionCompleta }}
                  </v-card-text>
                </v-card>

                <v-card variant="outlined" class="mb-6">
                  <v-card-item><v-card-title>Funciones Principales</v-card-title></v-card-item>
                  <v-list-item v-for="(func, i) in ofertaSeleccionada.funciones" :key="i" :title="func">
                    <template v-slot:prepend>
                      <v-icon color="success" class="mr-4">mdi-check-circle-outline</v-icon>
                    </template>
                  </v-list-item>
                </v-card>
                
                <v-card variant="outlined" class="mb-6">
                  <v-card-item><v-card-title>Beneficios</v-card-title></v-card-item>
                  <v-list-item v-for="(beneficio, i) in ofertaSeleccionada.beneficios" :key="i" :title="beneficio">
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-4">mdi-star-circle-outline</v-icon>
                    </template>
                  </v-list-item>
                </v-card>

                <v-card variant="outlined">
                  <v-card-item><v-card-title>Competencias Requeridas</v-card-title></v-card-item>
                    <v-card-text>
                      <v-chip v-for="(comp, i) in ofertaSeleccionada.competencias" :key="i" class="ma-1">
                        {{ comp }}
                      </v-chip>
                    </v-card-text>
                </v-card>
              </v-container>
            </div>
          </v-fade-transition>
        </v-responsive>
      </v-container>
    </v-main>
    
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" location="bottom right">
      {{ snackbarText }}
    </v-snackbar>

  </v-app>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import OfertasLaboralesService from '@/services/OfertasLaboralesService';
import PostulantesService from '@/services/PostulantesService';

// --- STATE ---
const search = ref('');
const ofertaSeleccionada = ref(null);
const ofertasDisponibles = ref([]);
const loading = ref(true); // Para mostrar indicadores de carga

// Snackbar state
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('');

// --- COMPUTED ---
// Propiedad computada para filtrar las ofertas según el campo de búsqueda
const ofertasFiltradas = computed(() => {
  if (!search.value) {
    return ofertasDisponibles.value;
  }
  return ofertasDisponibles.value.filter(oferta => 
    oferta.titulo.toLowerCase().includes(search.value.toLowerCase()) ||
    (oferta.publicadoPor && oferta.publicadoPor.toLowerCase().includes(search.value.toLowerCase()))
  );
});

// --- METHODS ---
const cargarOfertas = async () => {
  loading.value = true;
  try {
    // Simula una llamada a la API. Reemplaza esto con tu servicio real.
    const respuesta = await OfertasLaboralesService.listaOfertasPublicadas();
    ofertasDisponibles.value = respuesta;
    
    // Si hay ofertas, selecciona la primera por defecto
    if (ofertasDisponibles.value.length > 0) {
      ofertaSeleccionada.value = ofertasDisponibles.value[0]; 
    }
  } catch (error) {
    console.error("Error al cargar las ofertas:", error);
    snackbarText.value = 'No se pudieron cargar las ofertas.';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    loading.value = false;
  }
};

const seleccionarOferta = (oferta) => {
  ofertaSeleccionada.value = oferta;
};

const postularme = async (oferta) => {
  if (!oferta) return;
  try {
    await PostulantesService.postularOfertaLaboral(oferta.ofertaId);
    snackbarText.value = 'Postulado correctamente';
    snackbarColor.value = 'success';
    snackbar.value = true;
  } catch (error) {
    console.error("Error al postular:", error);
    snackbarText.value = 'Error al postularse. Intente nuevamente.';
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
};

// --- LIFECYCLE HOOKS ---
onMounted(cargarOfertas);
</script>

<style scoped>
#portal-ofertas .v-navigation-drawer__content::-webkit-scrollbar {
  width: 6px;
}
#portal-ofertas .v-navigation-drawer__content::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 3px;
}
</style>