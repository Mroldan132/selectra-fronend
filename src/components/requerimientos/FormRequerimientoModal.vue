<template>
  <v-dialog v-model="visibleLocal" persistent max-width="800px" @click:outside="manejarCierreExterno">
    <v-card :loading="loadingForm">
      <v-toolbar :color="props.modoEditar ? 'warning darken-1' : 'primary'" dark flat>
        <v-toolbar-title>{{ tituloModal }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="cerrar">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-5">
        <v-alert
          v-if="estadoProcesadoInfo.esProcesado"
          :type="estadoProcesadoInfo.color"
          :prepend-icon="estadoProcesadoInfo.icon"
          variant="tonal"
          dense
          class="mb-4"
          :text="estadoProcesadoInfo.mensaje"
        ></v-alert>

        <v-form @submit.prevent="guardarRequerimiento" ref="formModalRef">
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="requerimientoLocal.tipoRequerimientoId"
                :items="tiposRequerimiento"
                item-title="nombre"
                item-value="tipoRequerimientoId"
                label="Tipo de Requerimiento"
                :rules="[rules.required]"
                variant="outlined"
                density="comfortable"
                required
                :readonly="formularioDeshabilitadoPorEstado"
                :disabled="loadingDropdowns"
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.trim="requerimientoLocal.tituloRequerimiento"
                label="Título del Requerimiento"
                :rules="[rules.required, rules.maxLength(250)]"
                counter="250"
                variant="outlined"
                density="comfortable"
                :readonly="formularioDeshabilitadoPorEstado"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="requerimientoLocal.areaId"
                :items="areas"
                item-title="nombreArea"
                item-value="areaId"
                label="Área Destino"
                :rules="[rules.required]"
                variant="outlined"
                density="comfortable"
                required
                :readonly="formularioDeshabilitadoPorEstado"
                :disabled="loadingDropdowns"
              ></v-select>
            </v-col>
              <v-col cols="12" md="6">
              <v-select
                v-model="requerimientoLocal.cargoId"
                :items="cargos"
                item-title="nombreCargo"
                item-value="cargoId"
                label="Cargo Solicitado"
                :rules="[rules.required]"
                variant="outlined"
                density="comfortable"
                required
                :readonly="formularioDeshabilitadoPorEstado"
                :disabled="loadingDropdowns"
              ></v-select>
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model.trim="requerimientoLocal.motivo"
                label="Motivo del Requerimiento"
                :rules="[rules.required]"
                variant="outlined"
                density="comfortable"
                :readonly="formularioDeshabilitadoPorEstado"
                rows="3"
                auto-grow
                required
              ></v-textarea>
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="requerimientoLocal.sueldoPropuesto"
                label="Sueldo Propuesto (Opc.)"
                type="number" step="0.01" prefix="S/."
                :rules="[rules.positiveNumber]"
                variant="outlined" density="comfortable"
                :readonly="formularioDeshabilitadoPorEstado"
              ></v-text-field>
            </v-col>
            
            <!-- INICIO: MODIFICACIÓN FECHA -->
            <v-col cols="12" md="4">
                <v-menu v-model="dateMenuIngreso" :close-on-content-click="false" transition="scale-transition">
                    <template v-slot:activator="{ props }">
                        <v-text-field
                            v-model="formattedFechaDeseadaIngreso"
                            label="Fecha Deseada Ingreso (Opc.)"
                            prepend-inner-icon="mdi-calendar"
                            variant="outlined"
                            readonly
                            v-bind="props"
                            density="comfortable"
                            :rules="[rules.fechaNoMenorAHoy]"
                            :readonly="formularioDeshabilitadoPorEstado"
                        />
                    </template>
                    <v-date-picker
                        v-model="requerimientoLocal.fechaDeseadaIngreso"
                        @update:model-value="dateMenuIngreso = false"
                        hide-header
                        :min="hoy"
                    />
                </v-menu>
            </v-col>
            <!-- FIN: MODIFICACIÓN FECHA -->

            <v-col cols="12" md="4">
                <v-select
                v-model="requerimientoLocal.jefeDestinoId"
                :items="personalElegibleComoJefe"
                item-title="nombrePersonal"
                item-value="personalId"
                label="Jefe Destino (Opc.)"
                variant="outlined"
                density="comfortable"
                clearable
                :readonly="formularioDeshabilitadoPorEstado"
                :disabled="loadingDropdowns"
                ></v-select>
            </v-col>
            </v-row>
          <v-alert v-if="errorForm" type="error" dense text class="mt-3 mb-0">
            {{ errorForm }}
          </v-alert>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" text @click="cerrar" :disabled="loadingForm">Cancelar</v-btn>
        <v-btn
          :color="props.modoEditar ? 'warning' : 'success'"
          @click="guardarRequerimiento"
          :loading="loadingForm"
          :disabled="loadingForm || formularioDeshabilitadoPorEstado"
        >
          {{ props.modoEditar ? 'Guardar Cambios' : 'Crear Requerimiento' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue';
import RequerimientoService from '@/services/RequerimientoService';
import AreaService from '@/services/AreaService';
import CargoService from '@/services/CargoService';
import PersonalService from '@/services/PersonalService';

const props = defineProps({
  visible: Boolean,
  requerimientoParaEditar: Object,
  modoEditar: Boolean,
});

const emit = defineEmits(['cerrar', 'requerimientoGuardado']);

const formModalRef = ref(null);
const visibleLocal = ref(props.visible);

// --- INICIO: LÓGICA DE FECHA ---
const dateMenuIngreso = ref(false);
const hoy = new Date().toISOString().slice(0, 10);
// --- FIN: LÓGICA DE FECHA ---

const initialState = () => ({
  requerimientoId: null,
  tipoRequerimientoId: null,
  tituloRequerimiento: '',
  areaId: null,
  cargoId: null,
  motivo: '',
  sueldoPropuesto: null,
  fechaDeseadaIngreso: null,
  jefeDestinoId: null,
  historialDeAprobaciones: [],
});

const requerimientoLocal = reactive(initialState());

const tiposRequerimiento = ref([]);
const areas = ref([]);
const cargos = ref([]);
const personalElegibleComoJefe = ref([]);
const loadingDropdowns = ref(false);

const loadingForm = ref(false);
const errorForm = ref('');

const estadoProcesadoInfo = computed(() => {
  const reqData = props.requerimientoParaEditar;
  if (!reqData || !reqData.historialDeAprobaciones || reqData.historialDeAprobaciones.length === 0) {
    return { esProcesado: false };
  }
  const ultimoEstado = reqData.historialDeAprobaciones[0];
  if (ultimoEstado && ultimoEstado.codigoEstado) {
    const estadoLower = ultimoEstado.codigoEstado.toLowerCase();
    if (estadoLower.includes('apr')) {
      return { esProcesado: true, mensaje: 'Este requerimiento ya ha sido APROBADO y no puede ser modificado.', color: 'success', icon: 'mdi-check-circle-outline' };
    }
    if (estadoLower.includes('rec')) {
      return { esProcesado: true, mensaje: 'Este requerimiento ha sido RECHAZADO y no puede ser modificado.', color: 'error', icon: 'mdi-close-circle-outline' };
    }
  }
  return { esProcesado: false };
});

const formularioDeshabilitadoPorEstado = computed(() => estadoProcesadoInfo.value.esProcesado);

const rules = {
  required: value => (formularioDeshabilitadoPorEstado.value) || (value !== null && value !== undefined && value !== '') || 'Este campo es requerido.',
  maxLength: (length) => (value) => (formularioDeshabilitadoPorEstado.value) || (!value || value.length <= length) || `Máximo ${length} caracteres.`,
  positiveNumber: value => (formularioDeshabilitadoPorEstado.value) || (value === null || value === undefined || value === '' || parseFloat(value) >= 0) || 'Debe ser un número positivo.',
  // --- INICIO: REGLA DE FECHA ---
  fechaNoMenorAHoy: value => {
    if (formularioDeshabilitadoPorEstado.value || !value) return true;
    const fechaSeleccionada = new Date(value);
    const fechaHoy = new Date();
    fechaSeleccionada.setUTCHours(0, 0, 0, 0);
    fechaHoy.setUTCHours(0, 0, 0, 0);
    return fechaSeleccionada >= fechaHoy || 'La fecha no puede ser anterior al día actual.';
  }
  // --- FIN: REGLA DE FECHA ---
};

const tituloModal = computed(() => {
    if (formularioDeshabilitadoPorEstado.value) return 'Ver Detalle de Requerimiento';
    return props.modoEditar ? 'Editar Requerimiento' : 'Crear Nuevo Requerimiento';
});

// --- INICIO: COMPUTADA PARA FORMATEAR FECHA ---
const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return new Date(d.getTime() + d.getTimezoneOffset() * 60000).toLocaleDateString('es-ES');
}
const formattedFechaDeseadaIngreso = computed(() => formatDate(requerimientoLocal.fechaDeseadaIngreso));
// --- FIN: COMPUTADA PARA FORMATEAR FECHA ---

watch(() => props.visible, async (newVal) => {
  visibleLocal.value = newVal;
  if (newVal) {
    errorForm.value = '';
    formModalRef.value?.resetValidation();

    if (props.modoEditar && props.requerimientoParaEditar?.requerimientoId) {
      loadingForm.value = true;
      try {
        const data = await RequerimientoService.getRequerimientoPorId(props.requerimientoParaEditar.requerimientoId);
        Object.assign(requerimientoLocal, data);
        // --- INICIO: MANEJO DE FECHA AL CARGAR ---
        if (data.fechaDeseadaIngreso) {
            requerimientoLocal.fechaDeseadaIngreso = new Date(data.fechaDeseadaIngreso + 'T00:00:00');
        } else {
            requerimientoLocal.fechaDeseadaIngreso = null;
        }
        // --- FIN: MANEJO DE FECHA AL CARGAR ---
      } catch (err) {
        errorForm.value = 'Error al cargar los detalles del requerimiento.';
        console.error('Error en watch visible:', err);
        Object.assign(requerimientoLocal, initialState());
      } finally {
        loadingForm.value = false;
      }
    } else {
      Object.assign(requerimientoLocal, initialState());
    }
  }
});

const cargarDatosDropdown = async () => {
  loadingDropdowns.value = true;
  try {
    [tiposRequerimiento.value, areas.value, cargos.value, personalElegibleComoJefe.value] = await Promise.all([
      RequerimientoService.getTiposRequerimiento(),
      AreaService.getAreas(),
      CargoService.getCargos(),
      PersonalService.getPersonalParaJefeDestino()
    ]);
  } catch (error) {
    errorForm.value = 'Error al cargar datos para el formulario.';
    console.error(error);
  } finally {
    loadingDropdowns.value = false;
  }
};

onMounted(cargarDatosDropdown);

const cerrar = () => emit('cerrar');
const manejarCierreExterno = () => { if (!loadingForm.value) cerrar(); };

const guardarRequerimiento = async () => {
  if (formularioDeshabilitadoPorEstado.value) return;

  const { valid } = await formModalRef.value.validate();
  if (!valid) {
    errorForm.value = 'Por favor, complete los campos requeridos correctamente.';
    return;
  }

  loadingForm.value = true;
  errorForm.value = '';

  const payload = { ...requerimientoLocal };
  
  // --- INICIO: FORMATEO DE FECHA ANTES DE ENVIAR ---
  const toISODateString = (date) => {
      if (!(date instanceof Date)) return date || null;
      const d = new Date(date);
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
  };
  payload.fechaDeseadaIngreso = toISODateString(payload.fechaDeseadaIngreso);
  // --- FIN: FORMATEO DE FECHA ANTES DE ENVIAR ---

  payload.sueldoPropuesto = (payload.sueldoPropuesto === '' || payload.sueldoPropuesto == null) ? null : parseFloat(payload.sueldoPropuesto);
  payload.jefeDestinoId = (payload.jefeDestinoId === '' || payload.jefeDestinoId == null) ? null : parseInt(payload.jefeDestinoId, 10);
  
  try {
    if (props.modoEditar) {
      await RequerimientoService.actualizarRequerimiento(requerimientoLocal.requerimientoId, payload);
    } else {
      delete payload.requerimientoId;
      await RequerimientoService.crearRequerimiento(payload);
    }
    emit('requerimientoGuardado');
  } catch (error) {
    errorForm.value = error.message || 'Ocurrió un error al guardar.';
    console.error('Error en guardarRequerimiento:', error.response?.data || error);
  } finally {
    loadingForm.value = false;
  }
};
</script>
