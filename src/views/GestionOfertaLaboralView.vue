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
        <!-- <v-btn
          color="primary"
          variant="tonal"
          @click="abrirNuevaOferta"
          prepend-icon="mdi-briefcase-plus-outline"
        >
          Nueva Oferta
        </v-btn> -->
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
                  ></v-btn>
                </template>
                <span>Siguiente estado</span>
              </v-tooltip>
               <v-tooltip location="top">
                <template #activator="{ props }">
                   <v-btn icon="mdi-delete-outline" variant="text" color="error" v-bind="props" @click.stop="abrirDialogoEliminar(item)"></v-btn>
                </template>
                <span>Eliminar</span>
              </v-tooltip>
            </div>
          </template>

          <template #expanded-row="{ columns, item }">
            <tr>
              <td :colspan="columns.length" class="pa-0">
                <v-card flat color="grey-lighten-5" class="ma-3 rounded-lg">
                   <v-card-text>
                      <v-row>
                          <v-col cols="12" md="7">
                              <div class="text-caption text-grey">Descripción</div>
                              <p class="text-body-2" style="white-space: pre-wrap;">{{ item.descripcion || 'No especificada.' }}</p>
                          </v-col>
                          <v-col cols="12" md="5">
                              <div class="text-caption text-grey">Funciones Principales</div>
                              <p class="text-body-2" style="white-space: pre-wrap;">{{ item.funciones || 'No especificadas.' }}</p>
                          </v-col>
                           <v-col cols="12">
                              <div class="text-caption text-grey">Beneficios</div>
                              <p class="text-body-2" style="white-space: pre-wrap;">{{ item.beneficios || 'No especificados.' }}</p>
                          </v-col>
                      </v-row>
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

     <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card rounded="xl">
        <v-card-title class="text-h5 d-flex align-center"><v-icon color="warning" class="mr-2">mdi-alert-circle-outline</v-icon>Confirmar Acción</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar la oferta <strong>{{ itemToDelete?.titulo }}</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="cerrarDialogoEliminar">Cancelar</v-btn>
          <v-btn color="error" variant="tonal" @click="eliminarOfertaConfirmado" :loading="deleting">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
const ofertas = ref([]);
const loading = ref(true);
const modalVisible = ref(false);
const ofertaSeleccionada = ref(null);
const search = ref('');
const expanded = ref([]);
const dialogDelete = ref(false);
const itemToDelete = ref(null);
const deleting = ref(false);

const snackbar = ref({ show: false, text: '', color: 'success' });

// --- Headers ---
const headers = [
  { title: 'Título de la Oferta', key: 'titulo', sortable: true, minWidth: '300px' },
  { title: 'Área', key: 'area', sortable: true },
  { title: 'Sueldo', key: 'sueldo', sortable: true, align: 'end' },
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
  
  ofertaSeleccionada.value = await OfertasLaboralesService.detalleOfertaLaboral(oferta.ofertaLaboralId) ;
  modalVisible.value = true;
};

const abrirNuevaOferta = () => {
  ofertaSeleccionada.value = null;
  modalVisible.value = true;
};

const toggleEstadoOferta = async (oferta) => {
  console.log(oferta.ofertaLaboralId)

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

const abrirDialogoEliminar = (item) => {
  itemToDelete.value = item;
  dialogDelete.value = true;
};

const cerrarDialogoEliminar = () => {
  dialogDelete.value = false;
  setTimeout(() => { itemToDelete.value = null }, 300);
};

const eliminarOfertaConfirmado = async () => {
  if (!itemToDelete.value) return;
  deleting.value = true;
  try {
    // Lógica real de eliminación:
    // await OfertasLaboralesService.delete(itemToDelete.value.ofertaLaboralId);
    showSnackbar(`Oferta "${itemToDelete.value.titulo}" eliminada.`, 'warning');
    // Para simulación:
     const index = ofertas.value.findIndex(o => o.ofertaLaboralId === itemToDelete.value.ofertaLaboralId);
    if(index > -1) ofertas.value.splice(index, 1);
    cerrarDialogoEliminar();
  } catch(error) {
    showSnackbar('Error al eliminar la oferta.', 'error');
  } finally {
    deleting.value = false;
  }
};

onMounted(cargarOfertas);
</script>

<style scoped>
.transparent-table :deep(.v-data-table__wrapper) {
  background-color: transparent !important;
}
</style>