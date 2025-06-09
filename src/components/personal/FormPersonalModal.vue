<template>
  <v-dialog v-model="visibleLocal" persistent max-width="800px" @click:outside="manejarCierreExterno">
    <v-card :loading="loadingForm" rounded="xl">
      <v-toolbar color="primary" dark flat>
        <v-toolbar-title>{{ isEdit ? 'Editar Personal' : 'Nuevo Personal' }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="cerrar">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="pa-5">
        <v-alert v-if="errorForm" type="error" dense class="mb-4" :text="errorForm" />
        <v-form ref="formModalRef" @submit.prevent="guardarPersonal">
          <v-row>
            <!-- Campos de Usuario -->
            <v-col cols="12" sm="6">
              <v-text-field v-model="formData.codUsuario" label="Usuario" :rules="[rules.required, rules.max50]" variant="outlined" density="comfortable" required />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="formData.clave" label="Clave" :rules="[rules.required, rules.min8]" type="password" variant="outlined" density="comfortable" required />
            </v-col>
            <v-col cols="12" sm="6">
                <v-select v-model="formData.rolId" :items="roles" item-title="nombre" item-value="rolId" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-switch v-model="formData.activo" label="Activo" />
            </v-col>

            <!-- Datos Personales -->
            <v-col cols="12" sm="6">
              <v-text-field v-model="formData.apellidoPaterno" label="Apellido Paterno" :rules="[rules.required, rules.max200]" variant="outlined" density="comfortable" required />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="formData.apellidoMaterno" label="Apellido Materno" :rules="[rules.required, rules.max200]" variant="outlined" density="comfortable" required />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="formData.nombres" label="Nombres" :rules="[rules.required, rules.max200]" variant="outlined" density="comfortable" required />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select v-model="formData.tipoDocumentoId" :items="tiposDocumento" label="Tipo Documento" item-title="nombre" item-value="id" :rules="[rules.required]" variant="outlined" density="comfortable" required />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="formData.numeroDocumento" label="N° Documento" :rules="[rules.required, rules.max20]" variant="outlined" density="comfortable" required />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="formData.telefono" label="Teléfono" :rules="[rules.max40]" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="formData.emailPersonal" label="Email Personal" :rules="[rules.email, rules.max50]" variant="outlined" density="comfortable" />
            </v-col>

            <!-- Ubigeo Nacimiento -->
            <v-col cols="12" sm="4">
              <v-select v-model="selectedDepartamentoNacimiento" :items="departamentosNacimiento" label="Departamento de Nacimiento" item-title="nombre" item-value="ubigeoId" :rules="[rules.required]" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" sm="4">
              <v-select v-model="selectedProvinciaNacimiento" :items="provinciasNacimiento" label="Provincia de Nacimiento" item-title="nombre" item-value="ubigeoId" :disabled="!selectedDepartamentoNacimiento" :rules="[rules.required]" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" sm="4">
              <v-select v-model="selectedDistritoNacimiento" :items="distritosNacimiento" label="Distrito de Nacimiento" item-title="nombre" item-value="ubigeoId" :disabled="!selectedProvinciaNacimiento" :rules="[rules.required]" variant="outlined" density="comfortable" />
            </v-col>

            <!-- Ubigeo Residencia -->
            <v-col cols="12" sm="4">
              <v-select v-model="selectedDepartamentoResidencia" :items="departamentosResidencia" label="Departamento de Residencia" item-title="nombre" item-value="ubigeoId" :rules="[rules.required]" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" sm="4">
              <v-select v-model="selectedProvinciaResidencia" :items="provinciasResidencia" label="Provincia de Residencia" item-title="nombre" item-value="ubigeoId" :disabled="!selectedDepartamentoResidencia" :rules="[rules.required]" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" sm="4">
              <v-select v-model="selectedDistritoResidencia" :items="distritosResidencia" label="Distrito de Residencia" item-title="nombre" item-value="ubigeoId" :disabled="!selectedProvinciaResidencia" :rules="[rules.required]" variant="outlined" density="comfortable" />
            </v-col>

            <!-- Otros Datos -->
            <v-col cols="12" sm="6">
              <v-text-field v-model="formData.fechaNacimiento" label="Fecha Nacimiento" type="date" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="formData.emailCorporativo" label="Email Corporativo" :rules="[rules.required, rules.email, rules.max100]" variant="outlined" density="comfortable" required />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select v-model="formData.areaId" :items="areas" label="Área" item-title="nombreArea" item-value="areaId" :rules="[rules.required]" variant="outlined" density="comfortable" required />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select v-model="formData.cargoId" :items="cargos" label="Cargo" item-title="nombreCargo" item-value="cargoId" :rules="[rules.required]" variant="outlined" density="comfortable" required />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select v-model="formData.jefeDirectoId" :items="jefes" label="Jefe Directo" item-title="nombreCompleto" item-value="id" clearable variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="formData.fechaIngresoCompania" label="Fecha Ingreso Compañía" type="date" variant="outlined" density="comfortable" />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" text @click="cerrar" :disabled="loadingForm">Cancelar</v-btn>
        <v-btn color="success" @click="guardarPersonal" :loading="loadingForm" :disabled="loadingForm">
          {{ isEdit ? 'Guardar Cambios' : 'Crear Personal' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue';
import CargoService from '@/services/CargoService';
import AreaService from '@/services/AreaService';
import UsuarioService from '@/services/UsuarioService';
import PersonalService from '@/services/PersonalService';
import DatosPersonalesService from '@/services/DatosPersonalesService';

const props = defineProps({
  modelValue: Boolean,
  personal: Object
});
const emit = defineEmits(['update:modelValue', 'saved']);

const visibleLocal = ref(props.modelValue);
watch(() => props.modelValue, val => visibleLocal.value = val);
watch(visibleLocal, val => { if (!val) cerrar(); });

const isEdit = computed(() => !!props.personal);

const formModalRef = ref(null);
const loadingForm = ref(false);
const errorForm = ref('');

const formData = reactive({
  codUsuario: '',
  clave: '',
  rolId: null,
  activo: true,
  apellidoPaterno: '',
  apellidoMaterno: '',
  nombres: '',
  tipoDocumentoId: null,
  numeroDocumento: '',
  telefono: '',
  emailPersonal: '',
  ubigeoNacimiento: '',
  ubigeoResidencia: '',
  fechaNacimiento: '',
  emailCorporativo: '',
  areaId: null,
  cargoId: null,
  jefeDirectoId: null,
  fechaIngresoCompania: ''
});

const roles = ref([]);
const tiposDocumento = ref([]);
const areas = ref([]);
const cargos = ref([]);
const jefes = ref([]);

const departamentosNacimiento = ref([]);
const provinciasNacimiento = ref([]);
const distritosNacimiento = ref([]);

const departamentosResidencia = ref([]);
const provinciasResidencia = ref([]);
const distritosResidencia = ref([]);

const selectedDepartamentoNacimiento = ref(null);
const selectedProvinciaNacimiento = ref(null);
const selectedDistritoNacimiento = ref(null);

const selectedDepartamentoResidencia = ref(null);
const selectedProvinciaResidencia = ref(null);
const selectedDistritoResidencia = ref(null);

const rules = {
  required: v => !!v || 'Requerido',
  max50: v => !v || v.length <= 50 || 'Máx 50 caracteres',
  max100: v => !v || v.length <= 100 || 'Máx 100 caracteres',
  max200: v => !v || v.length <= 200 || 'Máx 200 caracteres',
  max40: v => !v || v.length <= 40 || 'Máx 40 caracteres',
  max20: v => !v || v.length <= 20 || 'Máx 20 caracteres',
  min8: v => !v || v.length >= 8 || 'Mín 8 caracteres',
  email: v => !v || /^\S+@\S+\.\S+$/.test(v) || 'Email inválido',
};

onMounted(async () => {
  roles.value = await UsuarioService.getRoles();
  tiposDocumento.value = await DatosPersonalesService.getTiposDocumento();
  areas.value = await AreaService.getAreas();
  cargos.value = await CargoService.getCargos();
  jefes.value = await PersonalService.getPersonalParaJefeDestino();

  departamentosNacimiento.value = await DatosPersonalesService.getDepartamentos();
  departamentosResidencia.value = departamentosNacimiento.value;

  // Si hay personal cargado, inicializamos selects de ubigeo
  if (props.personal) {
    cargarPersonalEnFormulario(props.personal);
  }
});

watch(selectedDepartamentoNacimiento, async (newVal) => {
  if (newVal) {
    provinciasNacimiento.value = await DatosPersonalesService.getProvincias(newVal);
    selectedProvinciaNacimiento.value = null;
    selectedDistritoNacimiento.value = null;
    distritosNacimiento.value = [];
  } else {
    provinciasNacimiento.value = [];
    distritosNacimiento.value = [];
    selectedProvinciaNacimiento.value = null;
    selectedDistritoNacimiento.value = null;
  }
});

watch(selectedProvinciaNacimiento, async (newVal) => {
  if (newVal) {
    distritosNacimiento.value = await DatosPersonalesService.getDistritos(newVal);
    selectedDistritoNacimiento.value = null;
  } else {
    distritosNacimiento.value = [];
    selectedDistritoNacimiento.value = null;
  }
});

watch(selectedDepartamentoResidencia, async (newVal) => {
  if (newVal) {
    provinciasResidencia.value = await DatosPersonalesService.getProvincias(newVal);
    selectedProvinciaResidencia.value = null;
    selectedDistritoResidencia.value = null;
    distritosResidencia.value = [];
  } else {
    provinciasResidencia.value = [];
    distritosResidencia.value = [];
    selectedProvinciaResidencia.value = null;
    selectedDistritoResidencia.value = null;
  }
});

watch(selectedProvinciaResidencia, async (newVal) => {
  if (newVal) {
    distritosResidencia.value = await DatosPersonalesService.getDistritos(newVal);
    selectedDistritoResidencia.value = null;
  } else {
    distritosResidencia.value = [];
    selectedDistritoResidencia.value = null;
  }
});

watch([selectedDepartamentoNacimiento, selectedProvinciaNacimiento, selectedDistritoNacimiento], () => {
  const dep = selectedDepartamentoNacimiento.value || '';
  const prov = selectedProvinciaNacimiento.value?.substring(2, 4) || '';
  const dist = selectedDistritoNacimiento.value?.substring(4, 6) || '';
  formData.ubigeoNacimiento = dep + prov + dist;
});

watch([selectedDepartamentoResidencia, selectedProvinciaResidencia, selectedDistritoResidencia], () => {
  const dep = selectedDepartamentoResidencia.value || '';
  const prov = selectedProvinciaResidencia.value?.substring(2, 4) || '';
  const dist = selectedDistritoResidencia.value?.substring(4, 6) || '';
  formData.ubigeoResidencia = dep + prov + dist;
});

watch(() => props.personal, (nuevo) => {
  if (nuevo) {
    cargarPersonalEnFormulario(nuevo);
  } else {
    // Nuevo personal: resetear formulario
    resetFormulario();
  }
}, { immediate: true });

function resetFormulario() {
  Object.assign(formData, {
    codUsuario: '',
    clave: '',
    rolId: null,
    activo: true,
    apellidoPaterno: '',
    apellidoMaterno: '',
    nombres: '',
    tipoDocumentoId: null,
    numeroDocumento: '',
    telefono: '',
    emailPersonal: '',
    ubigeoNacimiento: '',
    ubigeoResidencia: '',
    fechaNacimiento: '',
    emailCorporativo: '',
    areaId: null,
    cargoId: null,
    jefeDirectoId: null,
    fechaIngresoCompania: ''
  });

  selectedDepartamentoNacimiento.value = null;
  selectedProvinciaNacimiento.value = null;
  selectedDistritoNacimiento.value = null;

  selectedDepartamentoResidencia.value = null;
  selectedProvinciaResidencia.value = null;
  selectedDistritoResidencia.value = null;
}


function cargarPersonalEnFormulario(personal) {
  Object.assign(formData, {
    codUsuario: personal.codUsuario || '',
    clave: personal.clave || '',
    rolId: personal.rolId || null,
    activo: personal.activo !== undefined ? personal.activo : true,
    apellidoPaterno: personal.apellidoPaterno || '',
    apellidoMaterno: personal.apellidoMaterno || '',
    nombres: personal.nombres || '',
    tipoDocumentoId: personal.tipoDocumentoId || null,
    numeroDocumento: personal.numeroDocumento || '',
    telefono: personal.telefono || '',
    emailPersonal: personal.emailPersonal || '',
    ubigeoNacimiento: personal.ubigeoNacimiento || '',
    ubigeoResidencia: personal.ubigeoResidencia || '',
    fechaNacimiento: personal.fechaNacimiento || '',
    emailCorporativo: personal.emailCorporativo || '',
    areaId: personal.areaId || null,
    cargoId: personal.cargoId || null,
    jefeDirectoId: personal.jefeDirectoId || null,
    fechaIngresoCompania: personal.fechaIngresoCompania || ''
  });

  selectedDepartamentoNacimiento.value = personal.ubigeoNacimiento?.substring(0, 2) || null;
  selectedProvinciaNacimiento.value = personal.ubigeoNacimiento?.substring(0, 4) || null;
  selectedDistritoNacimiento.value = personal.ubigeoNacimiento || null;

  selectedDepartamentoResidencia.value = personal.ubigeoResidencia?.substring(0, 2) || null;
  selectedProvinciaResidencia.value = personal.ubigeoResidencia?.substring(0, 4) || null;
  selectedDistritoResidencia.value = personal.ubigeoResidencia || null;
}

function manejarCierreExterno() {
  if (!loadingForm) {
    cerrar();
  }
}

function cerrar() {
  visibleLocal.value = false;
  emit('update:modelValue', false);
}

async function guardarPersonal() {
  errorForm.value = '';
  if (!formModalRef.value.validate()) {
    errorForm.value = 'Corrija los errores del formulario.';
    return;
  }
  loadingForm.value = true;
  try {
    if (isEdit.value) {
      await PersonalService.updatePersonal(formData);
    } else {
        console.log('Registrando nuevo usuario:', formData);
      await UsuarioService.registrarUsuario(formData);
    }
    emit('saved');
    cerrar();
  } catch (error) {
    errorForm.value = error.message || 'Error al guardar personal.';
  } finally {
    loadingForm.value = false;
  }
}
</script>
