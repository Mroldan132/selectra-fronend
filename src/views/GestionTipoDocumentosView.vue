<template>
  <v-container fluid>
    <v-card class="elevation-2 rounded-lg">
      <v-toolbar flat color="white">
        <v-toolbar-title class="font-weight-bold text-grey-darken-2">
          <v-icon class="mr-2">mdi-help-rhombus-outline</v-icon>
          Gestión de Tipos de Documentos
        </v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-btn color="primary" dark class="mb-2" @click="abrirModalNuevo">
          <v-icon left class="mr-2">mdi-plus-circle-outline</v-icon>
          Nuevo Tipo
        </v-btn>
      </v-toolbar>
      
      <v-card-text>
        <v-text-field
            v-model="search"
            append-inner-icon="mdi-magnify"
            label="Buscar tipo de documento..."
            variant="outlined"
            density="compact"
            hide-details
        ></v-text-field>
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="tiposDocumento"
        :search="search"
        :loading="loading"
        loading-text="Cargando datos..."
        no-data-text="No se encontraron tipos de documentos"
        class="elevation-0"
      >
        <template v-slot:item.actions="{ item }">
          <v-icon small class="mr-2" @click="abrirModalEditar(item)" color="blue" title="Editar">
            mdi-pencil
          </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <TipoDocumentoModal
      :visible="dialogVisible"
      :tipo-documento-para-editar="tipoDocumentoSeleccionado"
      :modo-editar="modoEditar"
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
import TipoDocumentoModal from '@/components/TipoDocumentos/TipoDocumentoModal.vue'; 
import TipoDocumentoService from '@/services/TipoDocumentoService'; 

const loading = ref(true);
const search = ref('');
const tiposDocumento = ref([]);

const dialogVisible = ref(false);
const modoEditar = ref(false);
const tipoDocumentoSeleccionado = ref(null);

const snackbar = ref({ show: false, text: '', color: 'success' });

const headers = ref([
  { title: 'ID', key: 'tipoDocumentoId', align: 'start' },
  { title: 'Nombre', key: 'nombreTipoDocumento' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
]);

const fetchTiposDocumento = async () => {
  loading.value = true;
  try {
    tiposDocumento.value = await TipoDocumentoService.obtenerTiposDocumento();
  } catch (error) {
    console.error("Error al obtener los tipos de documento:", error);
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
  tipoDocumentoSeleccionado.value = null;
  dialogVisible.value = true;
};

const abrirModalEditar = (item) => {
  modoEditar.value = true;
  tipoDocumentoSeleccionado.value = { ...item };
  dialogVisible.value = true;
};

const cerrarModal = () => {
  dialogVisible.value = false;
  tipoDocumentoSeleccionado.value = null;
};

const handleGuardado = () => {
  cerrarModal();
  const message = modoEditar.value ? 'Tipo de documento actualizado correctamente.' : 'Tipo de documento creado correctamente.';
  showSnackbar(message);
  fetchTiposDocumento(); 
};



onMounted(fetchTiposDocumento);
</script>
