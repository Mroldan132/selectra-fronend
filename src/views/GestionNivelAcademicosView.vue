<template>
  <v-container fluid>
    <v-card class="elevation-2 rounded-lg">
      <v-toolbar flat color="white">
        <v-toolbar-title class="font-weight-bold text-grey-darken-2"> 
          <v-icon class="mr-3">mdi-school</v-icon>
          Gestión de Niveles Académicos
        </v-toolbar-title>
          <v-divider class="mx-2" vertical></v-divider>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="text" @click="crearNivelNuevo">
         <v-icon left>mdi-plus</v-icon>
          Nuevo Nivel
         </v-btn>
       </v-toolbar>
        <v-card-text> 
        <v-text-field
          v-model="search"
          label="Buscar nivel..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
           density="compact"
          hide-details
            ></v-text-field>
         </v-card-text>
        

        <v-data-table
          :headers="headers"
          :items="niveles"
          :search="search"
          :loading="loading"
          loading-text="Cargando niveles..."
          no-results-text="No se encontraron niveles"
          class="elevation-1"
        >
             <template v-slot:item.actions="{ item }">
            <v-icon class="mr-3" @click="crearNivelEditar(item)" color="blue" title="Editar">
              mdi-pencil
            </v-icon>
          </template>
        </v-data-table>
    </v-card>

      <NivelAcademicoModal
        :visible="dialogVisible"
        :nivel-para-editar="nivelSeleccionado"
        :modo-editar="modoEditar"
        @cerrar="cerrarModal"
       @nivel-guardado="handleGuardado"
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
    import NivelAcademicosModal from '@/components/NivelAcademicos/NivelAcademicosModal.vue';
    import NivelAcademicosService from '@/services/NivelAcademicosService';

    const loading = ref(true);
    const search = ref('');
    const tipoNivel = ref([]);

    const dialogVisible = ref(false);
    const dialogdeleteVisible = ref(false);
    const modoEditar = ref(false);
    const nivelSeleccionado = ref(null);
    const tipoNivelParaEliminar = ref(null);

    const snackbar = ref({
      show: false,
      text: '',
      color: 'success',
    });

    const headers = ref([
      { title: 'ID', key: 'nivelAcademicoId', align: 'start' },
      { title: 'Nombre', key: 'nombre' },
      { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
    ]);

    const fetchNiveles = async () => {
     loading.value = true;
      try {
        tipoNivel.value = await NivelAcademicosService.getNivelesAcademicos();
      } catch (error) {
        console.error('Error al cargar los niveles académicos:', error);
        showSnackbar('Error al cargar los niveles académicos', 'error');
      } finally {
        loading.value = false;
      }
    };

    const showSnackbar = (text, color = 'success') => {
      snackbar.value = { show: true, text, color };
};


    const crearNivelNuevo = () => {
      modoEditar.value = false;
      nivelSeleccionado.value = null;
        dialogVisible.value = true;
    };
     
    const crearNivelEditar = (item) => {
    modoEditar.value = true;  
   nivelSeleccionado.value = {....item};
    dialogVisible.value = true;
    };
    const cerrarModal = () => {
      dialogVisible.value = false;
      nivelSeleccionado.value = null;
    };
    const handleGuardado = () => {
    
      cerrarModal();
     const message = modoEditar.value ? 'Nivel académico actualizado correctamente.' : 'Nivel académico creado correctamente.';
      showSnackbar(message);
        fetchNiveles();
    };

    onMounted(() => {
      fetchNiveles();
    });
    </script>