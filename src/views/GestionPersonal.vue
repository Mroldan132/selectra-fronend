<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card class="elevation-2" rounded="xl">
          <v-card-title class="d-flex align-center">
            <span class="text-h5 font-weight-bold">Gestión de Personal</span>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="abrirNuevoPersonal" prepend-icon="mdi-account-plus" rounded="lg">
              Nuevo
            </v-btn>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="personalList"
              :loading="loading"
              class="elevation-1"
              item-key="codUsuario"
              :search="search"
            >
              <template #top>
                <v-text-field
                  v-model="search"
                  label="Buscar personal"
                  prepend-inner-icon="mdi-magnify"
                  class="mb-4"
                  clearable
                  rounded
                  dense
                />
              </template>
              <template #item.actions="{ item }">
                <v-btn icon color="primary" @click="abrirEditarPersonal(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <FormPersonalModal
      v-model="modalVisible"
      :personal="personalSeleccionado"
      @saved="cargarPersonal"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import FormPersonalModal from '@/components/personal/FormPersonalModal.vue';
import PersonalService from '@/services/PersonalService'; // Debes crear este servicio

const search = ref('');
const loading = ref(false);
const personalList = ref([]);
const modalVisible = ref(false);
const personalSeleccionado = ref(null);

const headers = [
  { title: 'Usuario', key: 'codUsuario', sortable: true },
  { title: 'Nombres', key: 'nombres', sortable: true },
  { title: 'Apellido Paterno', key: 'apellidoPaterno', sortable: true },
  { title: 'Apellido Materno', key: 'apellidoMaterno', sortable: true },
  { title: 'Rol', key: 'rolNombre', sortable: true },
  { title: 'Área', key: 'areaNombre', sortable: true },
  { title: 'Cargo', key: 'cargoNombre', sortable: true },
  { title: 'Activo', key: 'activo', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center', width: '120px' },
];

const cargarPersonal = async () => {
  loading.value = true;
  try {
    personalList.value = await PersonalService.getPersonal();
  } catch (e) {
    personalList.value = [];
  } finally {
    loading.value = false;
  }
};

const abrirNuevoPersonal = () => {
  personalSeleccionado.value = null;
  modalVisible.value = true;
};

const abrirEditarPersonal = (item) => {
  personalSeleccionado.value = { ...item };
  modalVisible.value = true;
};

onMounted(cargarPersonal);
</script>