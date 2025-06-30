<template>
  <v-container fluid>
    <v-card class="elevation-2 rounded-lg">
      <v-toolbar flat color="white">
        <v-toolbar-title class="font-weight-bold text-grey-darken-2">
          <v-icon class="mr-2">mdi-help-rhombus-outline</v-icon>
          Gestión de Areas
        </v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-btn color="primary" dark class="mb-2" @click="abrirModalNuevo">
          <v-icon left class="mr-2">mdi-plus-circle-outline</v-icon>
          Nuev Area
        </v-btn>
      </v-toolbar>
      
      <v-card-text>
        <v-text-field
            v-model="search"
            append-inner-icon="mdi-magnify"
            label="Buscar area..."
            variant="outlined"
            density="compact"
            hide-details
        ></v-text-field>
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="areas"
        :search="search"
        :loading="loading"
        loading-text="Cargando datos..."
        no-data-text="No se encontraron areas"
        class="elevation-0"
      >
        <template v-slot:item.actions="{ item }">
          <v-icon small class="mr-2" @click="abrirModalEditar(item)" color="blue" title="Editar">
            mdi-pencil
          </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <AreaModal
      :visible="dialogVisible"
      :areaParaEditar="areaSeleccionada"
      :modoEditar="modoEditar"
      @cerrar="cerrarModal"
      @guardado="handleGuardado"
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
import AreaModal from '@/components/Area/AreaModal.vue'; 
import AreaService from '@/services/AreaService'; 

const loading = ref(true);
const search = ref('');
const areas = ref([]);

const dialogVisible = ref(false);
const modoEditar = ref(false);
const areaSeleccionada = ref(null);

const snackbar = ref({ show: false, text: '', color: 'success' });

const headers = ref([
  { title: 'ID', key: 'areaId', align: 'start' },
  { title: 'Nombre', key: 'nombreArea' },
  { title: 'Descripcion', key: 'descripcion' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
]);

const fetchAreas = async () => {
  loading.value = true;
  try {
    areas.value = await AreaService.getAreas();
  } catch (error) {
    console.error("Error al obtener las areas:", error);
    showSnackbar('Error al cargar los datos', 'error');
  } finally {
    loading.value = false;
  }
};

const showSnackbar = (text, color = 'success') => {
  snackbar.value = { show: true, text, color };
};

const abrirModalNuevo = () => {
  modoEditar.value = false;
  areaSeleccionada.value = null;
  dialogVisible.value = true;
};

const abrirModalEditar = (item) => {
  modoEditar.value = true;
  areaSeleccionada.value = { ...item };
  dialogVisible.value = true;
};

const cerrarModal = () => {
  dialogVisible.value = false;
  areaSeleccionada.value = null;
};

const handleGuardado = () => {
  cerrarModal();
  const message = modoEditar.value ? 'Area actualizada correctamente.' : 'Area creada correctamente.';
  showSnackbar(message);
  fetchAreas(); 
};



onMounted(fetchAreas);
</script>
