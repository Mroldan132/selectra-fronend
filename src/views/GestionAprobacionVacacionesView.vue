<template>
  <v-container class="gestion-aprobaciones-view pa-md-6" fluid>
    <v-card class="elevation-2" rounded="xl">
      <v-toolbar color="deep-purple-accent-3" dark flat rounded="t-xl">
        <v-toolbar-title class="font-weight-medium">Gestión de Aprobaciones de Vacaciones</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="cargarPendientes" :loading="loadingTabla">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-4 pa-md-6">
        <v-data-table
          :headers="headers"
          :items="solicitudesPendientes"
          :loading="loadingTabla"
          loading-text="Cargando solicitudes pendientes..."
          no-data-text="No hay solicitudes pendientes de aprobación."
          class="data-table-rounded"
          hover
          @click:row="(_, { item }) => abrirModalGestion(item)"
        >
          <template v-slot:item.fechaInicio="{ item }">
            {{ formatDate(item.fechaInicio) }}
          </template>

          <template v-slot:item.fechaFin="{ item }">
            {{ formatDate(item.fechaFin) }}
          </template>

          <template v-slot:item.estado="{ item }">
            <v-chip :color="getStatusColor(item.estado)" size="small" label>
              {{ item.estado }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-tooltip location="top" text="Gestionar Solicitud">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon="mdi-check-decagram-outline"
                  variant="text"
                  color="info"
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

    <AprobarSolicitudVacacionesModal
      v-model="dialogVisible"
      :solicitud="solicitudSeleccionada"
      @gestion-finalizada="handleGestionSuccess"
    />
    
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top right">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import SolicitudVacacionesService from '@/services/SolicitudVacacionesService';
import AprobarSolicitudVacacionesModal from '@/components/SolicitudVacaciones/AprobarSolicitudVacacionesModal.vue'; 

// --- STATE ---
const loadingTabla = ref(true);
const solicitudesPendientes = ref([]);
const dialogVisible = ref(false);
const solicitudSeleccionada = ref(null);

const snackbar = ref({ show: false, text: '', color: 'success' });

const headers = [
  { title: 'Nombre Empleado', key: 'nombreEmpleado' },
  { title: 'Fecha de Inicio', key: 'fechaInicio' },
  { title: 'Fecha de Fin', key: 'fechaFin' },
  { title: 'Días', key: 'diasSolicitados', align: 'center' },
  { title: 'Estado', key: 'estado', align: 'center' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
];

// --- MÉTODOS ---
const cargarPendientes = async () => {
  loadingTabla.value = true;
  try {
    solicitudesPendientes.value = await SolicitudVacacionesService.getMisPentientes();
  } catch (error) {
    showSnackbar(error.message || 'Error al cargar las solicitudes pendientes.', 'error');
  } finally {
    loadingTabla.value = false;
  }
};

onMounted(cargarPendientes);

function abrirModalGestion(item) {
  solicitudSeleccionada.value = item;
  dialogVisible.value = true;
}

// Se ejecuta cuando el modal de aprobación emite 'gestion-finalizada'
function handleGestionSuccess() {
  showSnackbar('La solicitud ha sido gestionada con éxito.');
  cargarPendientes(); // Recargar la tabla para que la solicitud desaparezca de la lista de pendientes.
}

function showSnackbar(text, color = 'success') {
  snackbar.value.text = text;
  snackbar.value.color = color;
  snackbar.value.show = true;
}

// Reutilizamos las funciones de formato que ya tenías.
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  // Formato DD/MM/YYYY para mayor claridad en Latam
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
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
  border-radius: 0 0 16px 16px; 
}

.gestion-aprobaciones-view .v-data-table tbody tr:hover {
  cursor: pointer;
}
</style>