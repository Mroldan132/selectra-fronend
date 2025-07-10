<template>
  <v-container class="gestion-solicitudes-view pa-md-6" fluid>
    <v-card class="elevation-2" rounded="xl">
      <v-toolbar color="primary" dark flat rounded="t-xl">
        <v-toolbar-title class="font-weight-medium">Gestión de Solicitudes Vacacionales</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="abrirModalNuevaSolicitud"><v-icon>mdi-plus</v-icon></v-btn>
      </v-toolbar>

      <v-card-text class="pa-4 pa-md-6">
        <v-data-table
          :headers="headers"
          :items="listaSolicitudes"
          :loading="loadingTabla"
          loading-text="Cargando solicitudes..."
          no-data-text="No tienes solicitudes para mostrar."
          class="data-table-rounded"
          hover
          @click:row="(_, { item }) => abrirModalDetalle(item)"
        >
          <!-- Slot para formatear la fecha de inicio -->
          <template v-slot:item.fechaInicio="{ item }">
            {{ formatDate(item.fechaInicio) }}
          </template>

          <!-- Slot para formatear la fecha de fin -->
          <template v-slot:item.fechaFin="{ item }">
            {{ formatDate(item.fechaFin) }}
          </template>

          <!-- Slot para mostrar el estado como un chip de color -->
          <template v-slot:item.estado="{ item }">
            <v-chip :color="getStatusColor(item.estado)" size="small" label>
              {{ item.estado }}
            </v-chip>
          </template>

          <!-- Slot para los botones de acciones -->
          <template v-slot:item.actions="{ item }">
            <v-tooltip location="top" text="Editar Solicitud">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon="mdi-pencil-outline"
                  variant="text"
                  color="info"
                  size="small"
                  v-bind="props"
                  @click.stop="abrirModalEditar(item)"
                ></v-btn>
              </template>
            </v-tooltip>
            <v-tooltip location="top" text="Gestionar">
              <template v-slot:activator="{ props }">
                  <v-btn
                    v-if="esJefeAprobador"
                    icon="mdi-check-decagram-outline"
                    variant="text"
                    color="deep-purple-accent-3"
                    size="small"
                    v-bind="props"
                    @click.stop="abrirModalGestion(item)"
                  ></v-btn>
              </template>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- El modal ahora escucha el evento 'save-success' -->
    <SolicitudVacacionesModal
      v-model="dialogVisible"
      :solicitud="solicitudSeleccionada"
      :mode="modalMode"
      @save-success="handleSaveSuccess"
    />
    
    <!-- Snackbar para notificaciones -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top right">
      {{ snackbar.text }}
    </v-snackbar>

  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import SolicitudVacacionesService from '@/services/SolicitudVacacionesService';
import SolicitudVacacionesModal from '@/components/SolicitudVacaciones/AprobarSolicitudVacacionesModal.vue'; // Asegúrate que el nombre y ruta sean correctos
import { useAuthStore } from '@/stores/authStore'; // Asumiendo que usas Pinia para el rol

// --- STATE ---
const loadingTabla = ref(true);
const listaSolicitudes = ref([]);
const dialogVisible = ref(false);
const solicitudSeleccionada = ref(null);
const modalMode = ref('view'); // 'view', 'create', 'edit'

const snackbar = ref({ show: false, text: '', color: 'success' });
const authStore = useAuthStore();
const userRole = computed(() => authStore.user?.rol || 'Visitante');
const esJefeAprobador = computed(() => userRole.value === 'JefeAprobador');
const esSolicitante = computed(() => userRole.value === 'Solicitante');

// --- HEADERS PARA LA TABLA ---
const headers = [
  { title: 'Fecha de Inicio', key: 'fechaInicio' },
  { title: 'Fecha de Fin', key: 'fechaFin' },
  { title: 'Días', key: 'diasSolicitados', align: 'center' },
  { title: 'Estado', key: 'estado', align: 'center' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
];

// --- FUNCIONES ---
const cargarSolicitudes = async () => {
  loadingTabla.value = true;
  try {
    listaSolicitudes.value = await SolicitudVacacionesService.getMisSolicitudes();
  } catch (error) {
    showSnackbar(error.message || 'Error al cargar las solicitudes.', 'error');
  } finally {
    loadingTabla.value = false;
  }
};

onMounted(cargarSolicitudes);

function abrirModalNuevaSolicitud() {
  modalMode.value = 'create';
  solicitudSeleccionada.value = null;
  dialogVisible.value = true;
}

function abrirModalEditar(item) {
  modalMode.value = 'edit';
  solicitudSeleccionada.value = item;
  dialogVisible.value = true;
}

function abrirModalDetalle(item) {
  modalMode.value = 'view';
  solicitudSeleccionada.value = item;
  dialogVisible.value = true;
}

function abrirModalGestion(item) {
    // Aquí iría la lógica para un futuro modal de aprobación.
    abrirModalDetalle(item);
}

// Se ejecuta cuando el modal emite 'save-success'
function handleSaveSuccess() {
  showSnackbar('Solicitud guardada con éxito.');
  cargarSolicitudes(); // Recargar la tabla para ver los cambios
}

function showSnackbar(text, color = 'success') {
  snackbar.value.text = text;
  snackbar.value.color = color;
  snackbar.value.show = true;
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  // Se construye la fecha manualmente para asegurar el orden MM/DD/YYYY
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}


function getStatusColor(status) {
  const lowerStatus = status?.toLowerCase() || '';
  if (lowerStatus === 'aprobada') return 'success';
  if (lowerStatus === 'pendiente') return 'warning';
  if (lowerStatus === 'rechazada') return 'error';
  return 'grey';
}
</script>

<style scoped>
.data-table-rounded {
  border-radius: 0 0 16px 16px; /* Ajusta para que coincida con el rounded="xl" del v-card */
}

.gestion-solicitudes-view .v-data-table__tr:hover {
  cursor: pointer;
}
</style>
