<template>
  <v-dialog v-model="visibleLocal" persistent max-width="900px">
    <v-card :loading="loadingForm" rounded="xl">
      <v-toolbar color="primary" dark flat>
         <v-icon class="ml-4 mr-3">{{ isEdit ? 'mdi-account-edit' : 'mdi-account-plus' }}</v-icon>
        <v-toolbar-title class="font-weight-medium">{{ isEdit ? 'Editar Personal' : 'Nuevo Personal' }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="cerrar">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-form ref="formModalRef">
        <v-stepper v-model="step" :items="stepperItems" alt-labels class="elevation-0" hide-actions>
          <template #item.1>
            <v-card-text class="pa-5">
              <h3 class="text-h6 mb-6">Información de la Cuenta</h3>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field v-model="formData.codUsuario" label="Código de Usuario" :rules="[rules.required, rules.max50]" variant="outlined" density="compact" :disabled="isEdit" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.clave"
                    :label="isEdit ? 'Nueva Clave (opcional)' : 'Clave'"
                    :rules="isEdit && !formData.clave ? [] : [rules.required, rules.min8]"
                    :type="showPassword ? 'text' : 'password'"
                    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="showPassword = !showPassword"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select v-model="formData.rolId" :items="roles" label="Rol del Sistema" item-title="nombre" item-value="rolId" :rules="[rules.required]" variant="outlined" density="compact"/>
                </v-col>
                <v-col cols="12" md="6" class="d-flex align-center">
                  <v-switch v-model="formData.activo" label="Usuario Activo" color="success" inset/>
                </v-col>
              </v-row>
            </v-card-text>
          </template>

          <template #item.2>
            <v-card-text class="pa-5">
              <h3 class="text-h6 mb-2">Datos de Identificación</h3>
              <v-row>
                <v-col cols="12" sm="4"><v-text-field v-model="formData.nombres" label="Nombres" :rules="[rules.required]" variant="outlined" density="compact" /></v-col>
                <v-col cols="12" sm="4"><v-text-field v-model="formData.apellidoPaterno" label="Apellido Paterno" :rules="[rules.required]" variant="outlined" density="compact" /></v-col>
                <v-col cols="12" sm="4"><v-text-field v-model="formData.apellidoMaterno" label="Apellido Materno" :rules="[rules.required]" variant="outlined" density="compact" /></v-col>
                <v-col cols="12" sm="4">
                    <v-select v-model="formData.tipoDocumentoId" :items="tiposDocumento" label="Tipo Documento" item-title="nombreTipoDocumento" item-value="tipoDocumentoId" :rules="[rules.required]" variant="outlined" density="compact" />
                </v-col>
                <v-col cols="12" sm="4"><v-text-field v-model="formData.numeroDocumento" label="N° Documento" :rules="[rules.required]" variant="outlined" density="compact" /></v-col>
                <v-col cols="12" sm="4">
                   <v-menu v-model="dateMenuNacimiento" :close-on-content-click="false" transition="scale-transition">
                      <template v-slot:activator="{ props }">
                        <v-text-field v-model="formattedFechaNacimiento" label="Fecha Nacimiento" prepend-inner-icon="mdi-calendar" variant="outlined" readonly v-bind="props" density="compact"/>
                      </template>
                      <v-date-picker
                        v-model="formData.fechaNacimiento"
                        @update:model-value="dateMenuNacimiento = false"
                        hide-header
                        :max="maxBirthDate"
                      />
                    </v-menu>
                </v-col>
              </v-row>
              <v-divider class="my-4"></v-divider>
              <h3 class="text-h6 mb-2">Ubicación e Información de Contacto</h3>
               <UbigeoSelector v-model="formData.ubigeoNacimiento" label-prefix="Nacimiento:" :rules="[rules.required]"/>
              <UbigeoSelector v-model="formData.ubigeoResidencia" label-prefix="Residencia:" :rules="[rules.required]"/>
              <v-row>
                <v-col cols="12" sm="6"><v-text-field v-model="formData.telefono" label="Teléfono" variant="outlined" density="compact" /></v-col>
                <v-col cols="12" sm="6"><v-text-field v-model="formData.emailPersonal" label="Email Personal" :rules="[rules.email]" variant="outlined" density="compact" /></v-col>
              </v-row>
            </v-card-text>
          </template>

          <template #item.3>
             <v-card-text class="pa-5">
              <h3 class="text-h6 mb-6">Información Laboral</h3>
              <v-row>
                <v-col cols="12" md="6"><v-select v-model="formData.areaId" :items="areas" label="Área" item-title="nombreArea" item-value="areaId" :rules="[rules.required]" variant="outlined" density="compact" /></v-col>
                <v-col cols="12" md="6"><v-select v-model="formData.cargoId" :items="cargos" label="Cargo" item-title="nombreCargo" item-value="cargoId" :rules="[rules.required]" variant="outlined" density="compact" /></v-col>
                <v-col cols="12" md="6"><v-select v-model="formData.jefeDirectoId" :items="jefes" label="Jefe Directo" item-title="nombrePersonal" item-value="personalId" clearable variant="outlined" density="compact" /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="formData.emailCorporativo" label="Email Corporativo" :rules="[rules.required, rules.email]" variant="outlined" density="compact" /></v-col>
                <v-col cols="12" md="6">
                   <v-menu v-model="dateMenuIngreso" :close-on-content-click="false" transition="scale-transition">
                      <template v-slot:activator="{ props }">
                        <v-text-field v-model="formattedFechaIngreso" label="Fecha Ingreso Compañía" prepend-inner-icon="mdi-calendar" variant="outlined" readonly v-bind="props" density="compact" />
                      </template>
                      <v-date-picker v-model="formData.fechaIngresoCompania" @update:model-value="dateMenuIngreso = false" hide-header />
                    </v-menu>
                </v-col>
              </v-row>
             </v-card-text>
          </template>
        </v-stepper>
      </v-form>

      <v-divider></v-divider>
      <v-card-actions class="pa-4 bg-grey-lighten-5">
         <v-alert v-if="errorForm" type="error" density="compact" variant="tonal" class="mr-4" :text="errorForm" />
        <v-spacer></v-spacer>
        <v-btn :disabled="step === 1" variant="text" @click="step--">Atrás</v-btn>
        <v-btn v-if="step < 3" color="primary" variant="tonal" @click="siguientePaso">Siguiente</v-btn>
        <v-btn v-else color="success" variant="flat" @click="guardarPersonal" :loading="loadingForm">
          {{ isEdit ? 'Guardar Cambios' : 'Crear Personal' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue';
import UbigeoSelector from '@/components/utils/UbigeoSelector.vue'; 
import CargoService from '@/services/CargoService';
import AreaService from '@/services/AreaService';
import UsuarioService from '@/services/UsuarioService';
import PersonalService from '@/services/PersonalService';
import DatosPersonalesService from '@/services/DatosPersonalesService';

// --- Props y Emits ---
const props = defineProps({ modelValue: Boolean, personal: Object });
const emit = defineEmits(['update:modelValue', 'saved', 'error']);

// --- Estado del Componente ---
const visibleLocal = ref(props.modelValue);
const formModalRef = ref(null);
const loadingForm = ref(false);
const errorForm = ref('');
const step = ref(1);
const showPassword = ref(false);
const dateMenuNacimiento = ref(false);
const dateMenuIngreso = ref(false);

const stepperItems = [
  { title: 'Cuenta', value: 1 },
  { title: 'Datos Personales', value: 2 },
  { title: 'Datos Laborales', value: 3 }
];

const formData = reactive({
  // ... (tu objeto formData es perfecto, no necesita cambios)
});

// --- Estado para Selects y Datos Externos ---
const roles = ref([]);
const tiposDocumento = ref([]);
const areas = ref([]);
const cargos = ref([]);
const jefes = ref([]);

// --- Reglas de Validación ---
const rules = { /* ... (tus reglas son perfectas) */ };

// --- Computed Properties ---
const isEdit = computed(() => !!props.personal?.codUsuario);
const formatDate = (date) => date ? new Date(date).toLocaleDateString('es-ES') : '';
const formattedFechaNacimiento = computed(() => formatDate(formData.fechaNacimiento));
const formattedFechaIngreso = computed(() => formatDate(formData.fechaIngresoCompania));

const maxBirthDate = computed(() => {
  const today = new Date();
  const year = today.getFullYear() - 18;
  const month = today.getMonth();
  const day = today.getDate();
  // Retorna la fecha de hace 18 años en formato YYYY-MM-DD
  return new Date(year, month, day).toISOString().slice(0, 10);
});

// --- Watchers ---
watch(() => props.modelValue, (val) => {
  visibleLocal.value = val;
  if (val) {
    step.value = 1; // Resetear al primer paso al abrir
    cargarDatosDelPersonal();
  }
});
watch(visibleLocal, val => { if (!val) emit('update:modelValue', false) });

// --- Métodos ---
const cargarDatosDelPersonal = () => {
  if (props.personal) {
    
    Object.assign(formData, props.personal);
    console.log('Datos recibidos en el modal (props.personal):', props.personal);
    if (props.personal.fechaNacimiento) formData.fechaNacimiento = new Date(props.personal.fechaNacimiento);
    if (props.personal.fechaIngresoCompania) formData.fechaIngresoCompania = new Date(props.personal.fechaIngresoCompania);
  } else {
    Object.keys(formData).forEach(key => formData[key] = (key === 'activo') ? true : null);
  }
};

const cerrar = () => {
  if (loadingForm.value) return;
  visibleLocal.value = false;
};

const siguientePaso = async () => {
  const { valid } = await formModalRef.value.validate();
  if (valid) {
    step.value++;
    errorForm.value = '';
  } else {
    errorForm.value = 'Por favor, corrige los errores antes de continuar.';
  }
};

const guardarPersonal = async () => {
  errorForm.value = '';
  const { valid } = await formModalRef.value.validate();
  if (!valid) {
    errorForm.value = 'Faltan campos obligatorios por completar.';
    return;
  }

  loadingForm.value = true;
  try {
    const payload = { ...formData };
    if (payload.fechaNacimiento instanceof Date) payload.fechaNacimiento = payload.fechaNacimiento.toISOString().slice(0, 10);
    if (payload.fechaIngresoCompania instanceof Date) payload.fechaIngresoCompania = payload.fechaIngresoCompania.toISOString().slice(0, 10);

    if (isEdit.value) {
      await PersonalService.updatePersonal(payload.personalId, payload);
      emit('saved', 'Personal actualizado con éxito.');
      loadingForm.value = false;
    } else {
      await UsuarioService.registrarUsuario(payload);
      emit('saved', 'Personal creado con éxito.');
      loadingForm.value = false;

    }
    cerrar();
  } catch (error) {
    console.error(error);
    errorForm.value = error.response?.data?.message || 'Ocurrió un error al guardar.';
  } finally {
    loadingForm.value = false;
  }
};

// --- Lifecycle Hooks ---
onMounted(async () => {
  loadingForm.value = true;
  [
    roles.value,
    tiposDocumento.value,
    areas.value,
    cargos.value,
    jefes.value
  ] = await Promise.all([
    UsuarioService.getRoles(),
    DatosPersonalesService.getTiposDocumento(),
    AreaService.getAreas(),
    CargoService.getCargos(),
    PersonalService.getPersonalParaJefeDestino()
  ]);
  loadingForm.value = false;
  cargarDatosDelPersonal();
});
</script>