<template>
  <v-container fluid>
    <v-card class="elevation-2 rounded-xl">
      <v-toolbar flat class="px-4 rounded-t-xl">
        <v-icon class="mr-3">mdi-account-group-outline</v-icon>
        <v-toolbar-title class="text-h5 font-weight-medium">Gestión de Aspirantes</v-toolbar-title>
        <v-spacer></v-spacer>

        <v-text-field
          v-model="search"
          label="Buscar..."
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          flat
          dense
          single-line
          hide-details
          clearable
          class="mr-4"
          style="max-width: 350px;"
        ></v-text-field>

        <v-btn
          color="primary"
          @click="abrirNuevoAspirante"
          variant="tonal"
          prepend-icon="mdi-account-plus"
        >
          Nuevo Aspirante
        </v-btn>
      </v-toolbar>

      <v-divider></v-divider>

      <v-card-text class="pa-0">
        <v-data-table
          :headers="headers"
          :items="aspirantesList"
          :loading="loading"
          item-value="codUsuario"
          :search="search"
          density="compact"
          class="transparent-table"
        >
          <template #loading>
            <v-skeleton-loader type="table-row@5"></v-skeleton-loader>
          </template>

          <template #item.estado="{ value }">
            <v-chip :color="value ? 'success' : 'error'" size="small" variant="tonal" class="font-weight-bold">
              {{ value ? 'Activo' : 'Inactivo' }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex justify-center">
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <v-btn icon="mdi-pencil" variant="text" color="info" v-bind="props" @click="abrirEditarAspirante(item)"></v-btn>
                </template>
                <span>Editar Aspirante</span>
              </v-tooltip>
            </div>
          </template>

          <template #no-data>
            <div class="d-flex flex-column align-center justify-center pa-10">
              <v-icon size="60" color="grey-lighten-1">mdi-account-off-outline</v-icon>
              <h5 class="text-h5 mt-4 text-grey-darken-1">No se encontraron registros</h5>
              <p class="text-grey-darken-1">Intente con otra búsqueda o agregue nuevo aspirante.</p>
            </div>
          </template>

        </v-data-table>
      </v-card-text>
    </v-card>

    <FormAspiranteModal
      v-model="modalVisible"
      :aspirante="aspiranteSeleccionado"
      @saved="handleSave"
      @error="handleError"
    />

    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card rounded="xl">
        <v-card-title class="text-h5 d-flex align-center"><v-icon color="warning" class="mr-2">mdi-alert-circle-outline</v-icon>Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar a <strong>{{ itemToDelete?.fullName }}</strong>? Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="cerrarDialogoEliminar">Cancelar</v-btn>
          <v-btn color="error" variant="tonal" @click="eliminarItemConfirmado">Eliminar</v-btn>
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
import FormAspiranteModal from '@/components/aspirante/FormAspiranteModal.vue';
import AspiranteService from '@/services/AspiranteService';

// --- State ---
const search = ref('');
const loading = ref(true);
const aspirantesList = ref([]);
const modalVisible = ref(false);
const aspiranteSeleccionado = ref(null);
const dialogDelete = ref(false);
const itemToDelete = ref(null);

const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
});

// --- Headers para la tabla (con Nombre Completo) ---
const headers = [
  { title: 'Usuario', key: 'codUsuario', sortable: true },
  { title: 'Nombre Completo', key: 'fullName', sortable: true, minWidth: '250px' },
  { title: 'Rol', key: 'rolNombre', sortable: true },
  { title: 'Área', key: 'areaNombre', sortable: true },
  { title: 'Cargo', key: 'cargoNombre', sortable: true },
  { title: 'Estado', key: 'estado', sortable: true, align: 'center' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center', width: '120px' },
];

// --- Methods ---
const showSnackbar = (text, color = 'success') => {
  snackbar.value = { show: true, text, color };
};

const cargarAspirantes = async () => {
  loading.value = true;
  try {
    const data = await AspiranteService.getAspirantes();
    aspirantesList.value = data.map(p => ({
      ...p,
      fullName: `${p.nombres} ${p.apellidoPaterno} ${p.apellidoMaterno}`.trim()
    }));
  } catch (e) {
    aspirantesList.value = [];
    showSnackbar('Error al cargar los aspirantes', 'error');
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const handleSave = (message) => {
  showSnackbar(message || 'Aspirante guardado con éxito.');
  cargarAspirantes();
};

const handleError = (message) => {
  showSnackbar(message || 'Ocurrió un error.', 'error');
};

const abrirNuevoAspirante = () => {
  aspiranteSeleccionado.value = null;
  modalVisible.value = true;
};

const  abrirEditarAspirante = async (item) => {
  const aspirante = await AspiranteService.getAspiranteById(item.aspiranteId);
  console.log('Editando aspirante:', aspirante);
  aspiranteSeleccionado.value = { ...aspirante };
  modalVisible.value = true;
};

const abrirDialogoEliminar = (item) => {
  itemToDelete.value = item;
  dialogDelete.value = true;
};

const cerrarDialogoEliminar = () => {
  dialogDelete.value = false;
  setTimeout(() => { itemToDelete.value = null }, 300);
};

const eliminarItemConfirmado = async () => {
  if (!itemToDelete.value) return;
  // --- Lógica de eliminación ---
  // Reemplazar con tu llamada de servicio real: await AspiranteService.delete(itemToDelete.value.codUsuario);
  console.log('Eliminando:', itemToDelete.value.codUsuario);
  
  // Simulamos la eliminación de la lista por ahora
  const index = aspirantesList.value.findIndex(p => p.codUsuario === itemToDelete.value.codUsuario);
  if (index > -1) {
    aspirantesList.value.splice(index, 1);
  }
  
  showSnackbar(`'${itemToDelete.value.fullName}' fue eliminado.`, 'warning');
  cerrarDialogoEliminar();
};

onMounted(cargarAspirantes);
</script>

<style scoped>
.transparent-table :deep(.v-data-table__wrapper) {
  background-color: transparent !important;
}

.v-toolbar .v-text-field {
  max-width: 350px;
}
</style>