<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="7" xl="6"> 
        <v-card class="elevation-12" :loading="loading">
          <v-toolbar color="secondary" dark flat>
            <v-toolbar-title>Registro de Aspirante</v-toolbar-title>
          </v-toolbar>
          <v-card-text class="pa-md-6 pa-sm-4 pa-3">
            <v-form @submit.prevent="handleRegister" ref="registerFormRef">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field 
                    v-model.trim="formData.codUsuario" 
                    label="Código de Usuario" 
                    :rules="[rules.required, rules.maxLength(50)]" 
                    class="mb-2"
                    dense
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field 
                    v-model="formData.clave" 
                    label="Contraseña" 
                    type="password" 
                    :rules="[rules.required, rules.minLength(8)]" 
                    class="mb-2"
                    dense
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-text-field 
                    v-model="formData.nombres" 
                    label="Nombres" 
                    :rules="[rules.required, rules.maxLength(200)]" 
                    class="mb-2"
                    dense
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field 
                    v-model="formData.apellidoPaterno" 
                    label="Apellido Paterno" 
                    :rules="[rules.required, rules.maxLength(200)]" 
                    class="mb-2"
                    dense
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field 
                    v-model="formData.apellidoMaterno" 
                    label="Apellido Materno" 
                    :rules="[rules.required, rules.maxLength(200)]" 
                    class="mb-2"
                    dense
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-select 
                    v-model="formData.tipoDocumentoId" 
                    :items="tiposDocumento" 
                    item-value="id" 
                    item-title="nombre" 
                    label="Tipo de Documento" 
                    :rules="[rules.required]" 
                    class="mb-2"
                    dense
                    outlined
                  ></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field 
                    v-model="formData.numeroDocumento" 
                    label="Número de Documento" 
                    :rules="[rules.required, rules.maxLength(20)]" 
                    class="mb-2"
                    dense
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field 
                    v-model="formData.emailPersonal" 
                    label="Email Personal" 
                    type="email" 
                    :rules="[rules.email, rules.maxLength(50)]" 
                    class="mb-2"
                    dense
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field 
                    v-model="formData.telefono" 
                    label="Teléfono" 
                    :rules="[rules.maxLength(40)]" 
                    class="mb-2"
                    dense
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>
              
              <div class="text-subtitle-1 mt-4 mb-1">Lugar de Nacimiento</div>
              <v-row>
                <v-col cols="12">
                  <v-select 
                    v-model="selectedDepartamentoNacimiento" 
                    :items="departamentos" 
                    item-title="nombre" 
                    item-value="ubigeoId" 
                    label="Departamento de Nacimiento" 
                    :rules="[rules.required]" 
                    class="mb-2"
                    dense
                    outlined
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-select 
                    v-model="selectedProvinciaNacimiento" 
                    :items="provinciasNacimiento" 
                    item-title="nombre" 
                    item-value="ubigeoId" 
                    label="Provincia de Nacimiento" 
                    :rules="[rules.required]" 
                    :disabled="!selectedDepartamentoNacimiento" 
                    class="mb-2"
                    dense
                    outlined
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select 
                    v-model="selectedDistritoNacimiento" 
                    :items="distritosNacimiento" 
                    item-title="nombre" 
                    item-value="ubigeoId" 
                    label="Distrito de Nacimiento" 
                    :rules="[rules.required]" 
                    :disabled="!selectedProvinciaNacimiento" 
                    class="mb-2"
                    dense
                    outlined
                  />
                </v-col>
              </v-row>

              <div class="text-subtitle-1 mt-4 mb-1">Lugar de Residencia</div>
              <v-row>
                <v-col cols="12">
                  <v-select 
                    v-model="selectedDepartamentoResidencia" 
                    :items="departamentos" 
                    item-title="nombre" 
                    item-value="ubigeoId" 
                    label="Departamento de Residencia" 
                    :rules="[rules.required]" 
                    class="mb-2"
                    dense
                    outlined
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-select 
                    v-model="selectedProvinciaResidencia" 
                    :items="provinciasResidencia" 
                    item-title="nombre" 
                    item-value="ubigeoId" 
                    label="Provincia de Residencia" 
                    :rules="[rules.required]" 
                    :disabled="!selectedDepartamentoResidencia" 
                    class="mb-2"
                    dense
                    outlined
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select 
                    v-model="selectedDistritoResidencia" 
                    :items="distritosResidencia" 
                    item-title="nombre" 
                    item-value="ubigeoId" 
                    label="Distrito de Residencia" 
                    :rules="[rules.required]" 
                    :disabled="!selectedProvinciaResidencia" 
                    class="mb-2"
                    dense
                    outlined
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field 
                    v-model="formData.fechaNacimiento" 
                    label="Fecha de Nacimiento" 
                    type="date" 
                    class="mb-2"
                    dense
                    outlined
                    :rules="[rules.required]"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select 
                    v-model="formData.nivelAcademicoId" 
                    :items="nivelesAcademicos" 
                    item-value="id" 
                    item-title="nombre" 
                    label="Nivel Académico" 
                    :rules="[rules.required]" 
                    class="mb-2"
                    dense
                    outlined
                  />
                </v-col>
              </v-row>

              <v-alert v-if="errorMessage" type="error" dense text class="mt-3 mb-3">{{ errorMessage }}</v-alert>
              <v-alert v-if="successMessage" type="success" dense text class="mt-3 mb-3">{{ successMessage }}</v-alert>
            </v-form>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn color="secondary" @click="handleRegister" :loading="loading" :disabled="loading" large>Registrarme</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import AspiranteService from '@/services/AspiranteService';
import NivelAcademicoService from '@/services/NivelAcademicoService';
import DatosPersonalesService from '@/services/DatosPersonalesService';

const router = useRouter();
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const registerFormRef = ref(null);

const formData = reactive({
  codUsuario: '',
  clave: '',
  activo: true,
  apellidoPaterno: '',
  apellidoMaterno: '',
  nombres: '',
  tipoDocumentoId: null,
  numeroDocumento: '',
  telefono: '',
  emailPersonal: '',
  ubigeoNacimiento: null,
  ubigeoResidencia: null,
  fechaNacimiento: null,
  nivelAcademicoId: null,
});

const nivelesAcademicos = ref([]);
const tiposDocumento = ref([]);
const departamentos = ref([]);
const provinciasNacimiento = ref([]);
const distritosNacimiento = ref([]);
const provinciasResidencia = ref([]);
const distritosResidencia = ref([]);

const selectedDepartamentoNacimiento = ref(null);
const selectedProvinciaNacimiento = ref(null);
const selectedDistritoNacimiento = ref(null);

const selectedDepartamentoResidencia = ref(null);
const selectedProvinciaResidencia = ref(null);
const selectedDistritoResidencia = ref(null);

const rules = {
  required: value => !!value || 'Campo requerido.',
  minLength: length => value => (value && value.length >= length) || `Mínimo ${length} caracteres.`,
  maxLength: length => value => (value && value.length <= length) || `Máximo ${length} caracteres.`,
  email: value => /.+@.+\..+/.test(value) || 'Email no válido.',
};

onMounted(async () => {
  try {
    nivelesAcademicos.value = await NivelAcademicoService.obtenerNivelesAcademicos();
    tiposDocumento.value = await DatosPersonalesService.getTiposDocumento();
    departamentos.value = await DatosPersonalesService.getDepartamentos();
  } catch (error) {
    console.error("Error al cargar datos iniciales:", error);
    errorMessage.value = 'No se pudieron cargar los datos iniciales.';
  }
});

watch(selectedDepartamentoNacimiento, async (id) => {
  selectedProvinciaNacimiento.value = null;
  selectedDistritoNacimiento.value = null;
  provinciasNacimiento.value = [];
  distritosNacimiento.value = [];
  if (id) provinciasNacimiento.value = await DatosPersonalesService.getProvincias(id);
});

watch(selectedProvinciaNacimiento, async (id) => {
  selectedDistritoNacimiento.value = null;
  distritosNacimiento.value = [];
  if (id) distritosNacimiento.value = await DatosPersonalesService.getDistritos(id);
});

watch(selectedDepartamentoResidencia, async (id) => {
  selectedProvinciaResidencia.value = null;
  selectedDistritoResidencia.value = null;
  provinciasResidencia.value = [];
  distritosResidencia.value = [];
  if (id) provinciasResidencia.value = await DatosPersonalesService.getProvincias(id);
});

watch(selectedProvinciaResidencia, async (id) => {
  selectedDistritoResidencia.value = null;
  distritosResidencia.value = [];
  if (id) distritosResidencia.value = await DatosPersonalesService.getDistritos(id);
});

const pad = (n) => n.toString().padStart(2, '0');

const handleRegister = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  const { valid } = await registerFormRef.value.validate();
  if (!valid) {
    errorMessage.value = 'Por favor, complete todos los campos requeridos correctamente.';
    return;
  }

  if (!selectedDepartamentoNacimiento.value || !selectedProvinciaNacimiento.value || !selectedDistritoNacimiento.value ||
      !selectedDepartamentoResidencia.value || !selectedProvinciaResidencia.value || !selectedDistritoResidencia.value) {
    errorMessage.value = 'Debe seleccionar el lugar de nacimiento y residencia completos.';
    return;
  }

  formData.ubigeoNacimiento = selectedDistritoNacimiento.value;
  formData.ubigeoResidencia = selectedDistritoResidencia.value;

  loading.value = true;
  try {
    const data = await AspiranteService.registrarAspirante(formData);
    successMessage.value = `¡Registro exitoso! Usuario: ${data.codUsuario}, ID: ${data.usuarioId}. Ahora puedes iniciar sesión.`;
    
    // Resetear campos del formulario
    registerFormRef.value.reset();
    
    // Resetear Ubigeo Nacimiento
    selectedDepartamentoNacimiento.value = null;

    // Resetear Ubigeo Residencia
    selectedDepartamentoResidencia.value = null;


    setTimeout(() => router.push('/login'), 3000);
  } catch (error) {
    errorMessage.value = error.message || 'Ocurrió un error durante el registro.';
    console.error("Error en handleRegister:", error);
  } finally {
    loading.value = false;
  }
};
</script>