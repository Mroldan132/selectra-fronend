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
            <v-col cols="12" md="4">
              <v-text-field
                v-model="requerimientoLocal.fechaDeseadaIngreso"
                label="Fecha Deseada Ingreso (Opc.)"
                type="date"
                variant="outlined" density="comfortable"
                :readonly="formularioDeshabilitadoPorEstado"
              ></v-text-field>
            </v-col>
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

// Computada para la información del estado procesado (para la alerta)
const estadoProcesadoInfo = computed(() => {
  const reqData = props.requerimientoParaEditar

  if (!reqData || !reqData.historialDeAprobaciones || reqData.historialDeAprobaciones.length === 0) {
    return { esProcesado: false, mensaje: '', color: 'info', icon: '' };
  }
  const ultimoEstado = reqData.historialDeAprobaciones[0]; 

  if (ultimoEstado && ultimoEstado.codigoEstado) {
    const estadoLower = ultimoEstado.codigoEstado.toLowerCase();
    if (estadoLower.includes('apr')) { 
      return { 
        esProcesado: true, 
        mensaje: 'Este requerimiento ya ha sido APROBADO y no puede ser modificado.', 
        color: 'success',
        icon: 'mdi-check-circle-outline'
      };
    }
    if (estadoLower.includes('rec')) { 
      return { 
        esProcesado: true, 
        mensaje: 'Este requerimiento ha sido RECHAZADO y no puede ser modificado.', 
        color: 'error',
        icon: 'mdi-close-circle-outline'
      };
    }
  }
  return { esProcesado: false, mensaje: '', color: 'info', icon: '' };
});

const formularioDeshabilitadoPorEstado = computed(() => {
  return estadoProcesadoInfo.value.esProcesado;
});


const rules = {
  required: value => {
    if (formularioDeshabilitadoPorEstado.value) return true; // Si está deshabilitado, no validar
    return (value !== null && value !== undefined && value !== '') || 'Este campo es requerido.'
  },
  maxLength: (length) => (value) => {
    if (formularioDeshabilitadoPorEstado.value) return true;
    return (!value || value.length <= length) || `Máximo ${length} caracteres.`
  },
  positiveNumber: value => {
    if (formularioDeshabilitadoPorEstado.value) return true;
    return (value === null || value === undefined || value === '' || parseFloat(value) >= 0) || 'Debe ser un número positivo.'
  },
};

const tituloModal = computed(() => {
    if (formularioDeshabilitadoPorEstado.value) return 'Ver Detalle de Requerimiento';
    return props.modoEditar ? 'Editar Requerimiento' : 'Crear Nuevo Requerimiento';
});

watch(() => props.visible, async (newVal) => {
  visibleLocal.value = newVal;
  if (newVal) {
    errorForm.value = '';
    formModalRef.value?.resetValidation(); 

    if (props.modoEditar) {
      if (props.requerimientoParaEditar && props.requerimientoParaEditar.requerimientoId) {
        loadingForm.value = true;
        try {
          const datosCompletosDelServicio = await RequerimientoService.getRequerimientoPorId(props.requerimientoParaEditar.requerimientoId);
          if (datosCompletosDelServicio) {
            Object.assign(requerimientoLocal, datosCompletosDelServicio);
            requerimientoLocal.sueldoPropuesto = datosCompletosDelServicio.sueldoPropuesto || null;
            if (datosCompletosDelServicio.fechaDeseadaIngreso) {
              if (typeof datosCompletosDelServicio.fechaDeseadaIngreso === 'string' && datosCompletosDelServicio.fechaDeseadaIngreso.includes('T')) {
                requerimientoLocal.fechaDeseadaIngreso = datosCompletosDelServicio.fechaDeseadaIngreso.split('T')[0];
              } else {
                requerimientoLocal.fechaDeseadaIngreso = datosCompletosDelServicio.fechaDeseadaIngreso;
              }
            } else {
              requerimientoLocal.fechaDeseadaIngreso = null;
            }
            requerimientoLocal.jefeDestinoId = datosCompletosDelServicio.jefeDestinoId || null;
            requerimientoLocal.requerimientoId = datosCompletosDelServicio.requerimientoId || null;
            // Asegurar que historialDeAprobaciones también se copie si viene del servicio
            requerimientoLocal.historialDeAprobaciones = datosCompletosDelServicio.historialDeAprobaciones || [];
          } else {
            console.error('Modal: El servicio getRequerimientoPorId no devolvió datos para el ID:', props.requerimientoParaEditar.requerimientoId);
            errorForm.value = 'No se pudieron cargar los detalles completos del requerimiento.';
            Object.assign(requerimientoLocal, initialState());
          }
        } catch (err) {
          console.error('Modal: Error al llamar a getRequerimientoPorId:', err);
          errorForm.value = err.message || 'Error crítico al cargar los datos del requerimiento.';
          Object.assign(requerimientoLocal, initialState()); 
        } finally {
          loadingForm.value = false;
        }
      } else {
        if (props.requerimientoParaEditar) {
            Object.assign(requerimientoLocal, props.requerimientoParaEditar);
            requerimientoLocal.historialDeAprobaciones = props.requerimientoParaEditar.historialDeAprobaciones || [];
        } else {
            console.error('Modal: Se intentó editar pero props.requerimientoParaEditar no es válido.');
            errorForm.value = 'No hay información válida del requerimiento para editar/ver.';
            Object.assign(requerimientoLocal, initialState());
        }
      }
    } else { 
      Object.assign(requerimientoLocal, initialState());
    }
  }
});

const cargarDatosDropdown = async () => {
  loadingDropdowns.value = true;
  try {
    [
      tiposRequerimiento.value,
      areas.value,
      cargos.value,
      personalElegibleComoJefe.value
    ] = await Promise.all([
      RequerimientoService.getTiposRequerimiento(),
      AreaService.getAreas(),
      CargoService.getCargos(),
      PersonalService.getPersonalParaJefeDestino()
    ]);
  } catch (error) {
    errorForm.value = 'Error al cargar datos para el formulario. ' + error.message;
    console.error(error);
  } finally {
    loadingDropdowns.value = false;
  }
};

onMounted(cargarDatosDropdown); 

const cerrar = () => {
  emit('cerrar');
};

const manejarCierreExterno = () => {
    if (!loadingForm.value) {
        cerrar();
    }
};

const guardarRequerimiento = async () => {
  if (formularioDeshabilitadoPorEstado.value) {
    console.warn("Intento de guardar un requerimiento ya procesado.");
    return;
  }

  if (!formModalRef.value) return;
  const validationResult = await formModalRef.value.validate();
  if (!validationResult.valid) {
    errorForm.value = 'Por favor, complete todos los campos requeridos correctamente.';
    return;
  }

  loadingForm.value = true;
  errorForm.value = '';

  const payload = { ...requerimientoLocal };

  payload.sueldoPropuesto = (payload.sueldoPropuesto === '' || payload.sueldoPropuesto === undefined || payload.sueldoPropuesto === null)
    ? null
    : parseFloat(payload.sueldoPropuesto);

  payload.fechaDeseadaIngreso = payload.fechaDeseadaIngreso || null;

  payload.jefeDestinoId = (payload.jefeDestinoId === '' || payload.jefeDestinoId === undefined || payload.jefeDestinoId === null)
    ? null
    : parseInt(payload.jefeDestinoId, 10); 

  try {
    if (requerimientoLocal.requerimientoId && props.modoEditar) {
      await RequerimientoService.actualizarRequerimiento(requerimientoLocal.requerimientoId, payload);
      emit('requerimientoGuardado', { esNuevo: false }); // Siempre es actualización aquí
    } else { 
      if ('requerimientoId' in payload) {
        if (!payload.requerimientoId || !props.modoEditar) { 
            delete payload.requerimientoId;
        }
      }
      await RequerimientoService.crearRequerimiento(payload);
      emit('requerimientoGuardado', { esNuevo: true });
    }
    
  } catch (error) {
    errorForm.value = error.message || 'Ocurrió un error al guardar el requerimiento.';
    console.error('Error en guardarRequerimiento:', error.response?.data || error.message || error);
  } finally {
    loadingForm.value = false; 
  }
};
</script>