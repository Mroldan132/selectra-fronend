<template>
  <v-container class="gestion-solicitudes-view pa-md-6" fluid>
    <v-card class="elevation-2" rounded="xl"> 
      <v-toolbar color="primary" dark flat rounded="t-xl">
        <v-toolbar-title class="font-weight-medium">Gestión de Solicitudes Vacacionales</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-tooltip location="bottom" text="Crear Nueva Solicitud">
          <template v-slot:activator="{ props: tooltipActivatorProps }">
            <v-btn
              icon
              v-bind="tooltipActivatorProps"
              color="primary"
              class="text-white mr-2"
              variant="elevated"
              @click="abrirModalNuevaSolicitud"
            >
              <v-icon>mdi-plus-box-outline</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </v-toolbar>

      <v-card-text class="pa-4 pa-md-6">
        <v-text-field
          v-model="search"
          append-inner-icon="mdi-magnify"
          label="Buscar por título, tipo, cargo, estado..."
          single-line
          hide-details
          variant="solo-filled"
          flat
          density="comfortable" 
          rounded="lg"
          class="mb-5"
        ></v-text-field>

        <v-data-table
          :headers="headers"
          :items="listaSolicitudes"
          :search="search"
          :loading="loadingTabla"
          class="data-table-rounded elevation-0"
          item-value="id"
          hover
          density="comfortable"
          no-data-text="No hay solicitudes para mostrar."
          loading-text="Cargando solicitudes..."
          :header-props="{ class: 'bg-grey-lighten-4 text-grey-darken-2 font-weight-bold' }" 
          :footer-props="{ 'items-per-page-options': [10, 25, 50, { value: -1, title: 'Todos' }] }"
        >
          <template v-slot:item.fechaCreacion="{ item }">
            <span class="text-caption">{{ formatFecha(item.fechaCreacion) }}</span>
          </template>

          <template v-slot:item.estado="{ item }">
            <v-chip :color="getEstadoColor(item.estado)" size="small" variant="tonal" label class="font-weight-medium">
              {{ item.estado }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <div class="d-flex justify-center">
              <v-tooltip location="top" text="Ver Detalle / Editar">
                <template v-slot:activator="{ props: tooltipProps }">
                  <v-btn
                    icon="mdi-file-eye-outline"
                    variant="text"
                    color="info"
                    size="small"
                    class="mr-1"
                    v-bind="tooltipProps"
                    @click="abrirModalVerOEditarSolicitud(item)"
                    :disabled="!puedeEditarSolicitud(item)"
                  ></v-btn>
                </template>
              </v-tooltip>

              <v-tooltip location="top" text="Aprobar / Rechazar">
                <template v-slot:activator="{ props: tooltipProps }">
                  <v-btn
                    v-if="esJefeAprobador && puedeGestionarAprobacion(item)"
                    icon="mdi-check-decagram-outline"
                    variant="text"
                    color="deep-purple-accent-3"
                    size="small"
                    v-bind="tooltipProps"
                    @click="abrirModalAprobacion(item)"
                  ></v-btn>
                </template>
              </v-tooltip>
            </div>
          </template>

          <template v-slot:loading>
            <v-skeleton-loader type="table-row@5"></v-skeleton-loader>
          </template>

           <template v-slot:no-data>
            <div class="text-center pa-8">
              <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-file-search-outline</v-icon>
              <p class="text-subtitle-1 text-grey-darken-1">No se encontraron solicitudes.</p>
              <p class="text-caption text-grey">Intenta ajustar tu búsqueda o crea una nueva solicitud.</p>
            </div>
          </template>

        </v-data-table>
        <v-alert v-if="errorTabla" type="error" dense text class="mt-4" rounded="lg">
          {{ errorTabla }}
        </v-alert>
      </v-card-text>
    </v-card>

    <v-snackbar
      v-model="snackbar.visible"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="top center"
      rounded="pill"
      variant="elevated"
      class="mt-2"
    >
      <v-icon :icon="snackbar.icon" class="mr-2"></v-icon>
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn icon @click="snackbar.visible = false" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>     
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SolicitudVacacionesService from '@/services/SolicitudVacacionesService';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const search = ref('');
const loadingTabla = ref(true);
const listaSolicitudes = ref([]);
const errorTabla = ref('');

const dialogVisible = ref(false);
const modoEditar = ref(false);
const solicitudSeleccionada = ref(null);

const aprobacionDialogVisible = ref(false);
const solicitudParaAprobarId = ref(null);
const solicitudParaAprobarInfo = ref(null); 

const userRole = computed(() => authStore.user?.rol || 'Visitante');
const esJefeAprobador = computed(() => userRole.value === 'JefeAprobador');
const esSolicitante = computed(() => userRole.value === 'Solicitante');

const snackbar = ref({
  visible: false,
  text: '',
  color: 'success',
  icon: 'mdi-check-circle-outline',
  timeout: 3500,
});

const showSnackbar = (text, color = 'success', icon = 'mdi-check-circle-outline', timeout = 3500) => {
  snackbar.value.text = text;
  snackbar.value.color = color;
  snackbar.value.icon = icon;
  snackbar.value.timeout = timeout;
  snackbar.value.visible = true;
};

const headers = [
  { title: 'ID', key: 'id', align: 'start', width: '80px', sortable: true },
  { title: 'Fecha Inicio', key: 'fechaInicio', minWidth: '250px', sortable: true },
  { title: 'Fecha Fin', key: 'fechaFin', width: '180px', sortable: true },
  { title: 'Dias Solicitados', key: 'diasSolicitados', width: '200px', sortable: true },
  { title: 'Fecha Creación', key: 'fechaCreacion', width: '180px', sortable: true },
  { title: 'Estado', key: 'estado', align: 'center', width: '150px', sortable: true },
  { title: 'Comentarios Empleado', key: 'comentariosEmpleado', align: 'center', width: '150px', sortable: true },
  { title: 'Comentarios Aprobador', key: 'comentariosAprobador', align: 'center', width: '150px', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center', width: '130px' }, 
];

const cargarSolicitudes = async () => {
  loadingTabla.value = true;
  errorTabla.value = '';
  try {
    if (authStore.isLoggedIn) {
      const data = await SolicitudVacacionesService.getMisSolicitudes(authStore.currentUser.usuario);
      listaSolicitudes.value = data;
      await nextTick();
      verificarAccionDesdeQuery();
    } else {
      listaSolicitudes.value = [];
    }
  } catch (error) {
    errorTabla.value = error.message || 'Error al cargar la lista de solicitudes.';
    console.error('Error en cargarSolicitudes:', error);
    showSnackbar(errorTabla.value, 'error', 'mdi-alert-circle-outline');
    listaSolicitudes.value = [];
  } finally {
    loadingTabla.value = false;
  }
};

const procesarQueryDeAccion = () => {
  const query = route.query;
  
  switch(query.accion) {
    case 'aprobar':
      if (query.idSolicitud) {
        const idSol = parseInt(query.idSolicitud, 10);
        if (listaSolicitudes.value.length > 0) {
            const solicitud = listaSolicitudes.value.find(r => r.id === idSol);
            if (solicitud) {
                if (esJefeAprobador.value && puedeGestionarAprobacion(solicitud)) {
                    abrirModalAprobacion(solicitud); 
                } else {
                    showSnackbar('No tiene permisos para aprobar esta solicitud o no está en un estado aprobable.', 'warning');
                }
                router.replace({ query: {} });
            } else {
                showSnackbar(`Solicitud ID ${idSol} no encontrada en la lista.`, 'warning');
                router.replace({ query: {} });
            }
        } else if (!loadingTabla.value) {
            showSnackbar(`Solicitud ID ${idSol} no encontrada (lista vacía).`, 'warning');
            router.replace({ query: {} });
        }
      }
    break;
    case 'detalle':
      if (query.idSolicitud) {
        const idSol = parseInt(query.idSolicitud, 10);
        if (listaSolicitudes.value.length > 0) {
            const solicitud = listaSolicitudes.value.find(r => r.id === idSol);
            if (solicitud) {
                abrirModalVerOEditarSolicitud(solicitud); 
            } else {
                showSnackbar(`Solicitud ID ${idSol} no encontrada en la lista.`, 'warning');
            }
            router.replace({ query: {} });
        } else if (!loadingTabla.value) {
            showSnackbar(`Solicitud ID ${idSol} no encontrada (lista vacía).`, 'warning');
            router.replace({ query: {} });
        }
      }
      break;
    default:
      break;
  }
};

const verificarAccionDesdeQuery = () => {
    procesarQueryDeAccion();
};

watch(
  [() => route.query, listaSolicitudes],
  ([newQuery, newList], [oldQuery, oldList]) => {
    if ((newQuery.accion === 'aprobar' || newQuery.accion === 'detalle') && newQuery.idSolicitud) {
        if (newList.length > 0 && (oldList.length === 0 || newQuery.idSolicitud !== oldQuery.idSolicitud || newQuery.accion !== oldQuery.accion) ) {
            procesarQueryDeAccion();
        }
    }
  },
  { deep: true, immediate: false }
);

onMounted(cargarSolicitudes);

const formatFecha = (fechaISO) => {
  if (!fechaISO) return 'N/A';
  try {
    const fecha = new Date(fechaISO);
    const opciones = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return fecha.toLocaleDateString('es-ES', opciones); 
  } catch (e) {
    return fechaISO; 
  }
};

const getEstadoColor = (estadoNombre) => {
  if (!estadoNombre) return 'grey-lighten-1';
  const lowerEstado = estadoNombre.toLowerCase();
  if (lowerEstado.includes('pendiente')) return 'orange-darken-2';
  if (lowerEstado.includes('aprobado')) return 'green-darken-1';
  if (lowerEstado.includes('rechazado')) return 'red-darken-2';
  if (lowerEstado.includes('cerrado')) return 'blue-grey-lighten-1';
  if (lowerEstado.includes('en aprobación')) return 'blue-darken-1';
  if (lowerEstado.includes('borrador')) return 'grey-darken-1';
  return 'grey';
};

const abrirModalNuevaSolicitud = () => {
  solicitudSeleccionada.value = null;
  modoEditar.value = false;
  dialogVisible.value = true;
};

const abrirModalVerOEditarSolicitud = (item) => {
  solicitudSeleccionada.value = { ...item };
  modoEditar.value = true;
  dialogVisible.value = true;
};

const cerrarModal = () => {
  dialogVisible.value = false;
  solicitudSeleccionada.value = null;
};

const onSolicitudGuardada = (eventData) => {
  cerrarModal();
  cargarSolicitudes(); 
  let mensaje = 'Operación realizada correctamente';
    if (eventData && typeof eventData.esNuevo === 'boolean') {
      mensaje = eventData.esNuevo
        ? 'Solicitud creada correctamente'
        : 'Cambios guardados correctamente';
    } else if (eventData === undefined) {
    }
  showSnackbar(mensaje, 'success', 'mdi-check-circle-outline');
};

const abrirModalAprobacion = (item) => {
  if (item && item.id) {
    solicitudParaAprobarId.value = item.id;
    solicitudParaAprobarInfo.value = {
        fechaInicio: item.fechaInicio,
        fechaFin: item.fechaFin,
        diasSolicitados: item.diasSolicitados,
        estadoActual: item.estadoNombre,
    };
    aprobacionDialogVisible.value = true;
  } else {
    console.error("Error: No se pudo obtener el ID de la solicitud para aprobación.");
    showSnackbar("Error al obtener información de la solicitud.", 'error');
  }
};

const cerrarModalAprobacion = () => {
  aprobacionDialogVisible.value = false;
  solicitudParaAprobarId.value = null;
  solicitudParaAprobarInfo.value = null;
  if (route.query.accion || route.query.idSolicitud) {
      router.replace({ query: {} });
  }
};

const onSolicitudProcesada = () => {
  cerrarModalAprobacion();
  cargarSolicitudes();
  showSnackbar('Solicitud procesada correctamente', 'info', 'mdi-information-outline');
};

const puedeEditarSolicitud = (solicitud) => {
  console.log(esJefeAprobador, esSolicitante);
  if (!solicitud || !solicitud.estadoNombre) return false;
  const estado = solicitud.estadoNombre.toLowerCase();
  if (esSolicitante.value) {
    return ['aprobado', 'pendiente','rechazado'].includes(estado);
  }
  if (esJefeAprobador.value) {
    return ['pendiente', 'aprobado','rechazado'].includes(estado);
  }
  return false;
};

const puedeGestionarAprobacion = (solicitud) => {
  if (!solicitud || !solicitud.estadoNombre) return false;
  const estadosGestionables = ['pendiente', 'aprobado','rechazado'];
  return estadosGestionables.includes(solicitud.estadoNombre.toLowerCase());
};

</script>

<style scoped>
.data-table-rounded {
  border-radius: 12px; 
  overflow: hidden; 
  border: 1px solid rgba(0,0,0,0.08); 
}

.v-data-table .v-btn--icon.v-btn--density-default {
  width: calc(var(--v-btn-height) + 0px);
  margin: 0 2px; 
}

.v-data-table > .v-table__wrapper > table > thead > tr > th {
  background-color: #f5f5f5 !important; 
  color: #424242 !important;
  font-weight: bold !important;
  text-transform: uppercase; 
  font-size: 0.78rem; 
  border-bottom: 1px solid #e0e0e0 !important;
}


.v-data-table tbody tr:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) {
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
}

.v-data-table__empty-wrapper td { 
  text-align: center;
}
</style>