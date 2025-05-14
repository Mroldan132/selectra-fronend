<template>
  <v-container class="gestion-requerimientos-view pa-md-6" fluid>
    <v-card class="elevation-3">
      <v-toolbar color="primary" dark flat>
        <v-toolbar-title>Gestión de Requerimientos de Personal</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="success" @click="abrirModalNuevoRequerimiento" prepend-icon="mdi-plus-box">
          Nuevo Requerimiento
        </v-btn>
      </v-toolbar>

      <v-card-text>
        <v-text-field
          v-model="search"
          append-inner-icon="mdi-magnify"
          label="Buscar requerimiento..."
          single-line
          hide-details
          variant="outlined"
          density="compact"
          class="mb-4"
        ></v-text-field>

        <v-data-table
          :headers="headers"
          :items="listaRequerimientos"
          :search="search"
          :loading="loadingTabla"
          class="elevation-1"
          item-value="requerimientoId"
          hover
          no-data-text="No hay requerimientos para mostrar."
          loading-text="Cargando requerimientos..."
        >
          <template v-slot:item.fechaCreacion="{ item }">
            {{ formatFecha(item.raw.fechaCreacion) }}
          </template>

          <template v-slot:item.estadoNombre="{ item }">
            <v-chip :color="getEstadoColor(item.raw.estadoNombre)" small>
              {{ item.raw.estadoNombre }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-tooltip location="top" text="Ver Detalle">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon="mdi-eye-outline"
                  variant="text"
                  color="info"
                  size="small"
                  v-bind="props"
                  @click="verDetalle(item.raw.requerimientoId)"
                ></v-btn>
              </template>
            </v-tooltip>
            <v-tooltip location="top" text="Editar">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="puedeEditar(item.raw.estadoNombre)"
                  icon="mdi-pencil-outline"
                  variant="text"
                  color="warning"
                  size="small"
                  v-bind="props"
                  @click="abrirModalEditarRequerimiento(item.raw)"
                ></v-btn>
              </template>
            </v-tooltip>
            </template>
        </v-data-table>
        <v-alert v-if="errorTabla" type="error" dense text class="mt-4">
          {{ errorTabla }}
        </v-alert>
      </v-card-text>
    </v-card>

    <FormRequerimientoModal
      :visible="dialogVisible"
      :requerimientoParaEditar="requerimientoSeleccionado"
      :modoEditar="modoEditar"
      @cerrar="cerrarModal"
      @requerimientoGuardado="onRequerimientoGuardado"
    />

  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import RequerimientoService from '@/services/RequerimientoService'; // Asume que existe y está completo
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import FormRequerimientoModal from '@/components/requerimientos/FormRequerimientoModal.vue'; // Componente del Modal

const router = useRouter();
const authStore = useAuthStore();

const search = ref('');
const loadingTabla = ref(true);
const listaRequerimientos = ref([]);
const errorTabla = ref('');

const dialogVisible = ref(false);
const modoEditar = ref(false);
const requerimientoSeleccionado = ref(null);

// Definición de las columnas para v-data-table
const headers = [
  { title: 'ID', key: 'requerimientoId', align: 'start', width: '80px' },
  { title: 'Título', key: 'tituloRequerimiento', minWidth: '250px' },
  { title: 'Tipo', key: 'tipoRequerimientoNombre', width: '180px' },
  { title: 'Cargo', key: 'cargoNombre', width: '200px' }, // Ajusta según el DTO
  { title: 'Fecha Creación', key: 'fechaCreacion', width: '180px' },
  { title: 'Estado', key: 'estadoNombre', align: 'center', width: '150px' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center', width: '150px' }, // Aumentado para más botones
];

const cargarRequerimientos = async () => {
  loadingTabla.value = true;
  errorTabla.value = '';
  try {
    // Aquí decides qué endpoint llamar basado en el rol del usuario
    // Por ahora, asumimos que se listan "Mis Requerimientos"
    // Si es Admin/RRHH, podrías tener un endpoint para ver todos o con filtros.
    if (authStore.isLoggedIn) { // Asegurarse que hay un usuario logueado
         // TODO: Determinar qué endpoint usar según el rol.
         // Por ahora, usamos misSolicitudes como ejemplo, pero podría ser un endpoint GET /api/RequerimientosPersonales general
        listaRequerimientos.value = await RequerimientoService.getMisRequerimientos();
    }
  } catch (error) {
    errorTabla.value = error.message || 'Error al cargar la lista de requerimientos.';
    console.error(error);
  } finally {
    loadingTabla.value = false;
  }
};

onMounted(cargarRequerimientos);

const formatFecha = (fechaISO) => { /* ... (tu función de formato de fecha) ... */
  if (!fechaISO) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(fechaISO).toLocaleDateString(undefined, options);
};
const getEstadoColor = (estadoNombre) => { /* ... (tu función de color de estado) ... */
  if (estadoNombre?.toLowerCase().includes('pendiente')) return 'orange';
  if (estadoNombre?.toLowerCase().includes('aprobado')) return 'green';
  if (estadoNombre?.toLowerCase().includes('rechazado')) return 'red';
  if (estadoNombre?.toLowerCase().includes('cerrado')) return 'grey';
  if (estadoNombre?.toLowerCase().includes('en aprobación')) return 'blue';
  return 'default';
};

const verDetalle = (requerimientoId) => {
  router.push({ name: 'detalleRequerimiento', params: { id: requerimientoId } });
};

const puedeEditar = (estadoNombre) => {
  // Lógica para determinar si se puede editar (ej. solo en estado "Pendiente" o "Borrador")
  // También podrías verificar el rol del usuario aquí.
  const userRole = authStore.getUserRole;
  const estadosEditables = ['Pendiente', 'Borrador']; // Define tus estados editables
  return estadosEditables.includes(estadoNombre) // Y el usuario tiene permiso
         // && (userRole === 'Solicitante' || userRole === 'Administrador' || userRole === 'RRHH');
};

const abrirModalNuevoRequerimiento = () => {
  requerimientoSeleccionado.value = null; // Asegurarse que no hay datos de edición
  modoEditar.value = false;
  dialogVisible.value = true;
};

const abrirModalEditarRequerimiento = (requerimiento) => {
  // Hacemos una copia para no modificar el original directamente en la tabla
  requerimientoSeleccionado.value = { ...requerimiento };
  modoEditar.value = true;
  dialogVisible.value = true;
};

const cerrarModal = () => {
  dialogVisible.value = false;
  requerimientoSeleccionado.value = null; // Limpiar
};

const onRequerimientoGuardado = () => {
  cerrarModal();
  cargarRequerimientos(); // Recargar la lista para ver los cambios
};

</script>

<style scoped>
/* Tus estilos para la vista principal de gestión */
</style>