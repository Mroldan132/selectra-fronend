<template>
  <v-container class="pa-md-6" fluid>
    <v-card class="elevation-2" rounded="xl">
      <v-toolbar color="primary" dark flat rounded="t-xl">
        <v-toolbar-title>Solicitudes Pendientes de Aprobación</v-toolbar-title>
      </v-toolbar>

      <v-card-text class="pa-4 pa-md-6">
        <v-data-table
          :headers="headers"
          :items="solicitudes"
          :search="search"
          :loading="loading"
          item-value="id"
          no-data-text="No hay solicitudes pendientes."
          loading-text="Cargando solicitudes..."
          class="data-table-rounded elevation-0"
          :footer-props="{ 'items-per-page-options': [10, 25, 50, { value: -1, title: 'Todos' }] }"
        >
          <template v-slot:top>
            <v-text-field
              v-model="search"
              append-inner-icon="mdi-magnify"
              label="Buscar por empleado, fecha o estado"
              hide-details
              single-line
              variant="solo-filled"
              flat
              density="comfortable"
              rounded="lg"
              class="mb-4"
            />
          </template>

          <template v-slot:item.fechaInicio="{ item }">
            {{ formatFecha(item.fechaInicio) }}
          </template>

          <template v-slot:item.fechaFin="{ item }">
            {{ formatFecha(item.fechaFin) }}
          </template>

          <template v-slot:item.fechaCreacion="{ item }">
            {{ formatFecha(item.fechaCreacion) }}
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              icon="mdi-check-decagram-outline"
              variant="text"
              color="deep-purple-accent-3"
              @click="abrirModalAprobacion(item)"
            />
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <AprobacionVacacionesModal
      :visible="modalVisible"
      :solicitud="solicitudSeleccionada"
      @cerrar="modalVisible = false"
      @solicitud-aprobada="onSolicitudAprobada"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import SolicitudVacacionesService from '@/services/SolicitudVacacionesService';
import AprobacionVacacionesModal from '@/components/SolicitudVacaciones/AprobacionVacacionesModal.vue';



const authStore = useAuthStore();
const solicitudes = ref([]);
const loading = ref(true);
const search = ref('');

const modalVisible = ref(false);
const solicitudSeleccionada = ref(null);

const headers = [
{ title: 'ID', key: 'id', width: '70px' },
  { title: 'Empleado', key: 'nombreEmpleado', minWidth: '200px' },
  { title: 'Desde', key: 'fechaInicio', width: '130px' },
  { title: 'Hasta', key: 'fechaFin', width: '130px' },
  { title: 'Días', key: 'diasSolicitados', width: '90px' },
  { title: 'Fecha Solicitud', key: 'fechaCreacion', width: '160px' },
     { title: 'Estado', key: 'estado', width: '130px' },
  { title: 'Comentario Empleado', key: 'comentariosEmpleado', minWidth: '200px' },
  { title: 'Comentario Aprobador', key: 'comentariosAprobador', minWidth: '200px' },
   { title: 'Acciones', key: 'actions', sortable: false, align: 'center', width: '130px' },
];

const cargarSolicitudes = async () => {
  loading.value = true;
  try {
    const data = await SolicitudVacacionesService.getSolicitudesPendientes(authStore.user.usuarioId);
    solicitudes.value = data;
  } catch (error) {
    console.error('Error al cargar solicitudes:', error);
  } finally {
    loading.value = false;
  }
};

const formatFecha = (fechaISO) => {
  if (!fechaISO) return 'N/A';
  return new Date(fechaISO).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const abrirModalAprobacion = (item) => {
  solicitudSeleccionada.value = item;
  modalVisible.value = true;
};

const onSolicitudAprobada = () => {
  modalVisible.value = false;
  cargarSolicitudes(); // Recargar al aprobar o rechazar
};

onMounted(cargarSolicitudes);
</script>
