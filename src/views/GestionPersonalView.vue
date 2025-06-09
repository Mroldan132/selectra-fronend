<template>
  <v-container fluid>
    <v-card class="elevation-2 rounded-xl">
      <v-toolbar flat class="px-4 rounded-t-xl">
        <v-icon class="mr-3">mdi-account-group-outline</v-icon>
        <v-toolbar-title class="text-h5 font-weight-medium">Gestión de Personal</v-toolbar-title>
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
          @click="abrirNuevoPersonal"
          variant="tonal"
          prepend-icon="mdi-account-plus"
        >
          Nuevo Personal
        </v-btn>
      </v-toolbar>

      <v-divider></v-divider>

      <v-card-text class="pa-0">
        <v-data-table
          :headers="headers"
          :items="personalList"
          :loading="loading"
          item-value="codUsuario"
          :search="search"
          density="compact"
          class="transparent-table"
        >
          <template #loading>
            <v-skeleton-loader type="table-row@5"></v-skeleton-loader>
          </template>

          <template #item.activo="{ value }">
            <v-chip :color="value ? 'success' : 'error'" size="small" variant="tonal" class="font-weight-bold">
              {{ value ? 'Activo' : 'Inactivo' }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex justify-center">
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <v-btn icon="mdi-pencil" variant="text" color="info" v-bind="props" @click="abrirEditarPersonal(item)"></v-btn>
                </template>
                <span>Editar Personal</span>
              </v-tooltip>
              <!-- <v-tooltip location="top">
                <template #activator="{ props }">
                   <v-btn icon="mdi-delete-outline" variant="text" color="error" v-bind="props" @click="abrirDialogoEliminar(item)"></v-btn>
                </template>
                <span>Eliminar Personal</span>
              </v-tooltip> -->
            </div>
          </template>

          <template #no-data>
            <div class="d-flex flex-column align-center justify-center pa-10">
              <v-icon size="60" color="grey-lighten-1">mdi-account-off-outline</v-icon>
              <h5 class="text-h5 mt-4 text-grey-darken-1">No se encontraron registros</h5>
              <p class="text-grey-darken-1">Intente con otra búsqueda o agregue nuevo personal.</p>
            </div>
          </template>

        </v-data-table>
      </v-card-text>
    </v-card>

    <FormPersonalModal
      v-model="modalVisible"
      :personal="personalSeleccionado"
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
import FormPersonalModal from '@/components/personal/FormPersonalModal.vue';
import PersonalService from '@/services/PersonalService';

// --- State ---
const search = ref('');
const loading = ref(true);
const personalList = ref([]);
const modalVisible = ref(false);
const personalSeleccionado = ref(null);
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
  { title: 'Estado', key: 'activo', sortable: true, align: 'center' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center', width: '120px' },
];

// --- Methods ---
const showSnackbar = (text, color = 'success') => {
  snackbar.value = { show: true, text, color };
};

const cargarPersonal = async () => {
  loading.value = true;
  try {
    const data = await PersonalService.getPersonal();
    personalList.value = data.map(p => ({
      ...p,
      fullName: `${p.nombres} ${p.apellidoPaterno} ${p.apellidoMaterno}`.trim()
    }));
  } catch (e) {
    personalList.value = [];
    showSnackbar('Error al cargar el personal', 'error');
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const handleSave = (message) => {
  showSnackbar(message || 'Personal guardado con éxito.');
  cargarPersonal();
};

const handleError = (message) => {
  showSnackbar(message || 'Ocurrió un error.', 'error');
};

const abrirNuevoPersonal = () => {
  personalSeleccionado.value = null;
  modalVisible.value = true;
};

const  abrirEditarPersonal = async (item) => {
  const personal = await PersonalService.getPersonalById(item.personalId);
  console.log('Editando personal:', personal);
  personalSeleccionado.value = { ...personal };
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
  // Reemplazar con tu llamada de servicio real: await PersonalService.delete(itemToDelete.value.codUsuario);
  console.log('Eliminando:', itemToDelete.value.codUsuario);
  
  // Simulamos la eliminación de la lista por ahora
  const index = personalList.value.findIndex(p => p.codUsuario === itemToDelete.value.codUsuario);
  if (index > -1) {
    personalList.value.splice(index, 1);
  }
  
  showSnackbar(`'${itemToDelete.value.fullName}' fue eliminado.`, 'warning');
  cerrarDialogoEliminar();
};

onMounted(cargarPersonal);
</script>

<style scoped>
.transparent-table :deep(.v-data-table__wrapper) {
  background-color: transparent !important;
}

.v-toolbar .v-text-field {
  max-width: 350px;
}
</style>