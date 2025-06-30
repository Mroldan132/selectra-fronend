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
          class="data-table-rounded"
          hover
          @click:row="(_, { item }) => abrirModalDetalle(item)"
        >
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

    <SolicitudVacacionesModal
      v-model="dialogVisible"
      :solicitud="solicitudSeleccionada"
      :mode="modalMode"
      @save="handleGuardar"
    />
    
    </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import SolicitudVacacionesService from '@/services/SolicitudVacacionesService';
import SolicitudVacacionesModal from '@/components/SolicitudVacaciones/AprobarSolicitudVacacionesModal.vue'; // Asegúrate que el nombre y ruta sean correctos

// ... (refs de tabla, snackbar, etc., sin cambios) ...
const loadingTabla = ref(true);
const listaSolicitudes = ref([]);
const esJefeAprobador = computed(() => authStore.user?.rol === 'JefeAprobador');

// --- State unificado para el modal ---
const dialogVisible = ref(false);
const solicitudSeleccionada = ref(null);
const modalMode = ref('view'); // 'view', 'create', 'edit'

const cargarSolicitudes = async () => { /* ... */ };
onMounted(cargarSolicitudes);

// --- Funciones para abrir el modal en diferentes modos ---

function abrirModalNuevaSolicitud() {
  modalMode.value = 'create';
  solicitudSeleccionada.value = null; // No hay solicitud existente
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
    // Por ahora, solo muestra los detalles.
    abrirModalDetalle(item);
}

// --- Función única para guardar (crear o actualizar) ---
async function handleGuardar(solicitudData) {
  try {
    if (modalMode.value === 'create') {
      await SolicitudVacacionesService.crear(solicitudData);
      showSnackbar('Solicitud creada con éxito.');
    } else if (modalMode.value === 'edit') {
      await SolicitudVacacionesService.actualizar(solicitudData.id, solicitudData);
      showSnackbar('Solicitud actualizada con éxito.');
    }
    cargarSolicitudes(); // Recargar la tabla
  } catch (error) {
    showSnackbar(error.message || 'Error al guardar la solicitud.', 'error');
  }
}
</script>