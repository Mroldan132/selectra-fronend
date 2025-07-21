<template>
  <v-container fluid>
    <v-card class="elevation-2 rounded-xl">
      <v-toolbar flat class="px-4 rounded-t-xl">
        <v-icon class="mr-3">mdi-briefcase-search-outline</v-icon>
        <v-toolbar-title class="text-h5 font-weight-medium">
          Gestión de Ofertas Laborales
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          label="Buscar oferta..."
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          flat
          dense
          single-line
          hide-details
          clearable
          class="mr-4"
          style="max-width: 300px;"
        ></v-text-field>
      </v-toolbar>

      <v-divider></v-divider>

      <v-card-text class="pa-0">
        <v-data-table
          v-model:expanded="expanded"
          :headers="headers"
          :items="ofertas"
          :loading="loading"
          :search="search"
          item-value="ofertaLaboralId"
          density="compact"
          class="transparent-table"
          show-expand
          hover
          @click:row="onRowClick"
          :style="{ cursor: 'pointer' }"
        >
          <template #loading>
            <v-skeleton-loader type="table-row@7"></v-skeleton-loader>
          </template>

          <template #item.sueldoOfrecido="{ value }">
            {{ formatCurrency(value) }}
          </template>

          <template #item.estadoOferta="{ value }">
            <v-chip :color="getEstadoColor(value)" size="small" variant="tonal" class="font-weight-bold">
              {{ value }}
            </v-chip>
          </template>
          
          <template #item.fechaCreacion="{ value }">
            <v-tooltip location="top">
              <template #activator="{ props }">
                <span v-bind="props">{{ formatRelativeDate(value) }}</span>
              </template>
              <span>{{ formatFullDate(value) }}</span>
            </v-tooltip>
          </template>

          <template #item.acciones="{ item }">
            <div class="d-flex justify-center">
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <v-btn icon="mdi-pencil" variant="text" color="info" v-bind="props" @click.stop="editarOferta(item)"></v-btn>
                </template>
                <span>Editar</span>
              </v-tooltip>
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <v-btn
                    icon="mdi-arrow-right"
                    variant="text"
                    color="primary"
                    v-bind="props"
                    @click.stop="toggleEstadoOferta(item)"
                    :disabled="item.countPostulantes === 0 && item.estadoOferta !== 'Pendiente'"
                  ></v-btn>
                </template>
                <span>Siguiente estado</span>
              </v-tooltip>
            </div>
          </template>

          <template #expanded-row="{ columns, item }">
            <tr>
              <td :colspan="columns.length" class="pa-0">
                <v-card flat color="grey-lighten-5" class="ma-3 rounded-lg">
                  <v-card-text>
                    <v-row>
                      <v-col cols="12" md="6">
                        <div class="text-caption text-grey">Descripción</div>
                        <p class="text-body-2" style="white-space: pre-wrap;">{{ item.descripcion || 'No especificados.' }}</p>
                      </v-col>
                      <v-col cols="12" md="6">
                        <div class="text-caption text-grey">N° de personas postuladas</div>
                        <p class="text-body-2">{{ item.countPostulantes || 'No existe postulantes.' }}</p>
                      </v-col>
                    </v-row>

                    <v-divider class="my-4"></v-divider>

                    <div>
                      <div class="text-subtitle-1 font-weight-bold mb-2">
                        <v-icon class="mr-1" size="small">mdi-account-check-outline</v-icon>
                        Aspirantes Seleccionados
                      </div>

                      <div v-if="loadingAspirantes" class="text-center pa-4">
                        <v-progress-circular indeterminate color="primary"></v-progress-circular>
                        <p class="text-caption mt-2">Cargando aspirantes...</p>
                      </div>

                      <div v-else>
                        <div v-if="!aspirantesSeleccionados.length" class="text-center text-grey-darken-1 pa-4">
                          No hay aspirantes seleccionados para esta oferta.
                        </div>

                        <v-row v-else>
                          <v-col v-for="aspirante in aspirantesSeleccionados" :key="aspirante.postulanteId" cols="12" md="6">
                            <v-card variant="outlined" rounded="lg">
                              <v-card-title class="text-body-1 font-weight-medium d-flex justify-space-between align-center">
                                <span>{{ aspirante.nombrePostulante }}</span>
                                <v-btn
                                  variant="tonal"
                                  color="primary"
                                  size="small"
                                  prepend-icon="mdi-download"
                                  @click="descargarCvAspirante(aspirante.aspitateId)"
                                  :loading="downloadingCvId === aspirante.aspitateId"
                                >
                                  CV
                                </v-btn>
                              </v-card-title>
                              <v-divider></v-divider>
                              <v-card-text class="pt-2">
                                <div class="text-caption text-grey mb-2">Cuestionario</div>
                                <div v-for="(qa, index) in aspirante.respuestas" :key="index" class="mb-3">
                                  <p class="text-body-2 font-weight-bold">{{ qa.pregunta }}</p>
                                  <p class="text-body-2 pl-2">- {{ qa.respuesta }}</p>
                                </div>
                              </v-card-text>

                              <v-card-actions v-if="item.estadoOferta !== 'Cerrada'">
                                <v-spacer></v-spacer>
                                <v-btn
                                  color="success"
                                  variant="elevated"
                                  prepend-icon="mdi-account-check"
                                  @click="contratar(item, aspirante)"
                                  :loading="hiringAspiranteId === aspirante.aspitateId"
                                >
                                  Contratar
                                </v-btn>
                              </v-card-actions>
                              </v-card>
                          </v-col>
                        </v-row>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </td>
            </tr>
          </template>
          
          <template #no-data>
            <div class="d-flex flex-column align-center justify-center pa-10">
              <v-icon size="60" color="grey-lighten-1">mdi-briefcase-off-outline</v-icon>
              <h5 class="text-h5 mt-4 text-grey-darken-1">No hay ofertas creadas</h5>
              <p class="text-grey-darken-1">Crea una nueva oferta para empezar a reclutar.</p>
            </div>
          </template>

        </v-data-table>
      </v-card-text>
    </v-card>

    <FormCrearOfertaLaboralModal
      v-model="modalVisible"
      :oferta="ofertaSeleccionada"
      @saved="onOfertaGuardada"
      @error="onOfertaError"
    />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000" location="top right" variant="elevated">
      {{ snackbar.text }}
      <template #actions>
        <v-btn icon="mdi-close" variant="text" @click="snackbar.show = false"></v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import OfertasLaboralesService from '@/services/OfertasLaboralesService';
import AspiranteService from '@/services/AspiranteService';
import PostulantesService from '@/services/PostulantesService'; // <-- IMPORTAR SERVICIO
import FormCrearOfertaLaboralModal from '@/components/ofertasLaborales/FormCrearOfertaLaboralModal.vue';

// --- State ---
const ofertas = ref([]);
const loading = ref(true);
const modalVisible = ref(false);
const ofertaSeleccionada = ref(null);
const search = ref('');
const expanded = ref([]);
const snackbar = ref({ show: false, text: '', color: 'success' });
const aspirantesSeleccionados = ref([]);
const loadingAspirantes = ref(false);
const downloadingCvId = ref(null);
const hiringAspiranteId = ref(null); // <-- NUEVO ESTADO DE CARGA

// --- Headers ---
const headers = [
  { title: 'Título de la Oferta', key: 'titulo', sortable: true, minWidth: '300px' },
  { title: 'Área', key: 'area', sortable: true },
  { title: 'Sueldo', key: 'sueldoOfrecido', sortable: true, align: 'end' },
  { title: 'Estado', key: 'estadoOferta', sortable: true, align: 'center' },
  { title: 'Fecha de Creación', key: 'fechaCreacion', sortable: true },
  { title: 'Acciones', key: 'acciones', sortable: false, align: 'center', width: '150px' },
  { title: '', key: 'data-table-expand' },
];

// --- Methods ---
const showSnackbar = (text, color = 'success') => {
  snackbar.value = { show: true, text, color };
};

const formatCurrency = (value) => {
  if (typeof value !== 'number') return '-';
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);
};

const formatFullDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('es-PE', { dateStyle: 'long', timeStyle: 'short' });
};

const formatRelativeDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('es-PE', {day: '2-digit', month: 'short', year: 'numeric'});
};

const getEstadoColor = (estado) => {
  const map = { 'Activa': 'success', 'Pendiente': 'warning', 'Cerrada': 'error', 'Borrador': 'grey' };
  return map[estado] || 'default';
};

const cargarOfertas = async () => {
  loading.value = true;
  try {
    ofertas.value = await OfertasLaboralesService.getOfertasLaborales();
  } catch (error) {
    showSnackbar('Error al cargar las ofertas laborales', 'error');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const onOfertaGuardada = (msg) => {
  showSnackbar(msg || 'Acción completada con éxito.');
  cargarOfertas();
};

const onOfertaError = (msg) => {
  showSnackbar(msg || 'Ocurrió un error.', 'error');
};

const editarOferta = async (oferta) => {
  ofertaSeleccionada.value = await OfertasLaboralesService.detalleOfertaLaboral(oferta.ofertaLaboralId);
  modalVisible.value = true;
};

const descargarCvAspirante = async (aspiranteId) => {
  if (!aspiranteId) return;
  
  downloadingCvId.value = aspiranteId;
  try {
    await AspiranteService.descargarCV(aspiranteId);
  } catch (error) {
    showSnackbar(error.message || 'Error al descargar el CV', 'error');
    console.error(error);
  } finally {
    downloadingCvId.value = null;
  }
};

// ***** INICIO: NUEVA FUNCIÓN PARA CONTRATAR *****
const contratar = async (oferta, aspirante) => {
  const confirmado = window.confirm(
    `¿Estás seguro de que deseas contratar a "${aspirante.nombrePostulante}" para la oferta "${oferta.titulo}"? Esta acción cerrará la oferta.`
  );

  if (!confirmado) {
    return;
  }

  hiringAspiranteId.value = aspirante.aspitateId;
  try {
    // Usamos el servicio que ya creaste
    await OfertasLaboralesService.contratarAspirante(oferta.ofertaLaboralId, aspirante.aspitateId);
    showSnackbar('¡Aspirante contratado con éxito! La oferta ha sido cerrada.', 'success');
    
    // Recargamos los datos para que se refleje el nuevo estado
    expanded.value = []; // Cierra la fila expandida
    await cargarOfertas();

  } catch (error) {
    showSnackbar(error.message || 'Ocurrió un error al intentar contratar.', 'error');
    console.error(error);
  } finally {
    hiringAspiranteId.value = null;
  }
};
// ***** FIN: NUEVA FUNCIÓN PARA CONTRATAR *****

const cargarAspirantesDeFila = async (item) => {
  loadingAspirantes.value = true;
  aspirantesSeleccionados.value = [];
  try {
    const data = await OfertasLaboralesService.getAspirantesSeleccionados(item.ofertaLaboralId);
    aspirantesSeleccionados.value = data;
  } catch (error) {
    showSnackbar('Error al cargar los aspirantes seleccionados', 'error');
  } finally {
    loadingAspirantes.value = false;
  }
};

const onRowClick = (event, { item }) => {
  const id = item.ofertaLaboralId;
  const index = expanded.value.indexOf(id);

  if (index > -1) {
    expanded.value.splice(index, 1);
  } else {
    expanded.value = [id];
    cargarAspirantesDeFila(item);
  }
};

const toggleEstadoOferta = async (oferta) => {
  if (!oferta || !oferta.ofertaLaboralId) {
    showSnackbar('Oferta no válida.', 'error');
    return;
  }

  OfertasLaboralesService.pasarOfertaSiguienteEstado(oferta.ofertaLaboralId)
    .then(() => {
      showSnackbar(`La oferta "${oferta.titulo}" ha sido actualizada.`);
      cargarOfertas();
    })
    .catch(error => {
      console.error('Error al cambiar el estado de la oferta:', error);
      showSnackbar('Error al cambiar el estado de la oferta.', 'error');
    });
};

onMounted(cargarOfertas);
</script>

<style scoped>
.transparent-table :deep(.v-data-table__wrapper) {
  background-color: transparent !important;
}
</style>