
<template>
  <v-container fluid>
    <v-card class="elevation-2 rounded-xl">
      <v-toolbar flat class="px-4 rounded-t-xl">
        <v-icon class="mr-3">mdi-clipboard-check-multiple-outline</v-icon>
        <v-toolbar-title class="text-h5 font-weight-medium">
          Requerimientos Aprobados
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          label="Buscar requerimiento..."
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          flat
          dense
          single-line
          hide-details
          clearable
          style="max-width: 350px;"
        ></v-text-field>
      </v-toolbar>

      <v-divider></v-divider>

      <v-card-text class="pa-0">
        <v-data-table
          v-model:expanded="expanded"
          :headers="headers"
          :items="requerimientos"
          :loading="loading"
          item-value="requerimientoId"
          :search="search"
          density="compact"
          class="transparent-table"
          show-expand
          hover
        >
          <template #loading>
            <v-skeleton-loader type="table-row@7"></v-skeleton-loader>
          </template>

          <template #item.fechaSolicitud="{ value }">
            <v-tooltip location="top">
              <template #activator="{ props }">
                <span v-bind="props">{{ formatRelativeDate(value) }}</span>
              </template>
              <span>{{ formatFullDate(value) }}</span>
            </v-tooltip>
          </template>

          <template #item.fechaAprobacion="{ value }">
            <v-tooltip location="top">
              <template #activator="{ props }">
                <span v-bind="props">{{ formatRelativeDate(value) }}</span>
              </template>
              <span>{{ formatFullDate(value) }}</span>
            </v-tooltip>
          </template>

          <template #item.acciones="{ item }">
            <v-btn
              color="primary"
              variant="tonal"
              size="small"
              prepend-icon="mdi-briefcase-plus-outline"
              @click.stop="generarOfertaDesdeRequerimiento(item)"
            >
              Generar Oferta
            </v-btn>
          </template>

          <template #expanded-row="{ columns, item }">
            <tr>
              <td :colspan="columns.length" class="pa-0">
                <v-card flat color="grey-lighten-5" class="ma-3 rounded-lg">
                   <v-card-text>
                    <v-row>
                      <v-col cols="12" md="4">
                        <div class="text-caption text-grey">Área</div>
                        <div class="text-body-1 font-weight-medium">{{ item.areaNombre }}</div>
                      </v-col>
                      <v-col cols="12" md="4">
                        <div class="text-caption text-grey">Cargo Solicitado</div>
                        <div class="text-body-1 font-weight-medium">{{ item.cargoNombre }}</div>
                      </v-col>
                       <v-col cols="12" md="4">
                        <div class="text-caption text-grey">Vacantes</div>
                        <div class="text-body-1 font-weight-medium">{{ item.numeroVacantes }}</div>
                      </v-col>
                      <v-col cols="12">
                         <div class="text-caption text-grey">Justificación</div>
                         <p class="text-body-2">{{ item.justificacion }}</p>
                      </v-col>
                    </v-row>
                   </v-card-text>
                </v-card>
              </td>
            </tr>
          </template>

          <template #no-data>
            <div class="d-flex flex-column align-center justify-center pa-10">
              <v-icon size="60" color="grey-lighten-1">mdi-file-remove-outline</v-icon>
              <h5 class="text-h5 mt-4 text-grey-darken-1">Sin Requerimientos</h5>
              <p class="text-grey-darken-1">Actualmente no hay requerimientos aprobados pendientes.</p>
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
import FormCrearOfertaLaboralModal from '@/components/ofertasLaborales/FormCrearOfertaLaboralModal.vue';

// --- State ---
const requerimientos = ref([]);
const loading = ref(true);
const modalVisible = ref(false);
const ofertaSeleccionada = ref(null);
const search = ref('');
const expanded = ref([]);

const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
});

// --- Headers para la tabla (incluye columna para expandir) ---
const headers = [
  { title: 'Nombre Requerimiento', key: 'nombreRequerimiento', sortable: true, minWidth: '250px' },
  { title: 'Solicitante', key: 'solicitante', sortable: true },
  { title: 'Aprobador', key: 'aprobador', sortable: true },
  { title: 'Fecha Solicitud', key: 'fechaSolicitud', sortable: true },
  { title: 'Fecha Aprobación', key: 'fechaAprobacion', sortable: true },
  { title: 'Acciones', key: 'acciones', sortable: false, align: 'center', width: '180px' },
  { title: '', key: 'data-table-expand' }, // Columna para el ícono de expansión
];

// --- Methods ---
const showSnackbar = (text, color = 'success') => {
  snackbar.value = { show: true, text, color };
};

const formatFullDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('es-PE', { dateStyle: 'long', timeStyle: 'short' });
};

const formatRelativeDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const formatter = new Intl.RelativeTimeFormat('es-PE', { numeric: 'auto' });
  const diffDays = Math.round((date - new Date()) / (1000 * 60 * 60 * 24));

  if (Math.abs(diffDays) < 30) {
    return formatter.format(diffDays, 'day');
  }
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const cargarRequerimientos = async () => {
  loading.value = true;
  try {
    requerimientos.value = await OfertasLaboralesService.getRequerimientosAprobados();
  } catch (e) {
    showSnackbar('Error al cargar los requerimientos aprobados', 'error');
    requerimientos.value = [];
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const generarOfertaDesdeRequerimiento = async (requerimiento) => {
  try {
    // Aquí podrías mostrar un loader específico en el botón si la llamada es lenta
    ofertaSeleccionada.value = await OfertasLaboralesService.crearOfertaLaboralRequerimiento(requerimiento.requerimientoId);
    modalVisible.value = true;
  } catch (error) {
    showSnackbar('Error al preparar la oferta laboral', 'error');
    console.error(error);
  }
};

const onOfertaGuardada = (msg = 'Oferta laboral creada con éxito') => {
  showSnackbar(msg, 'success');
  cargarRequerimientos(); // Recargar la lista para que desaparezca el requerimiento usado
};

const onOfertaError = (msg = 'Ocurrió un error al guardar la oferta.') => {
  showSnackbar(msg, 'error');
};

onMounted(cargarRequerimientos);
</script>

<style scoped>
/* Para que la v-data-table no tenga su propio fondo y se vea integrada */
.transparent-table :deep(.v-data-table__wrapper) {
  background-color: transparent !important;
}
</style>