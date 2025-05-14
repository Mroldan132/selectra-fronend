<template>
  <v-dialog v-model="visibleLocal" persistent max-width="800px" @click:outside="manejarCierreExterno">
    <v-card :loading="loadingForm">
      <v-toolbar :color="modoEditar ? 'warning' : 'primary'" dark flat>
        <v-toolbar-title>{{ tituloModal }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="cerrar">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-5">
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
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="requerimientoLocal.fechaDeseadaIngreso"
                label="Fecha Deseada Ingreso (Opc.)"
                type="date"
                variant="outlined" density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="requerimientoLocal.jefeDestinoId"
                :items="personalElegibleComoJefe"
                item-title="nombreCompleto" item-value="personalId"
                label="Jefe Destino (Opc.)"
                variant="outlined" density="comfortable" clearable
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
          :color="modoEditar ? 'warning' : 'success'"
          @click="guardarRequerimiento"
          :loading="loadingForm"
          :disabled="loadingForm"
        >
          {{ modoEditar ? 'Guardar Cambios' : 'Crear Requerimiento' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue';
import RequerimientoService from '@/services/RequerimientoService';

const props = defineProps({
  visible: Boolean,
  requerimientoParaEditar: Object, // Null si es para crear nuevo
  modoEditar: Boolean,
});

const emit = defineEmits(['cerrar', 'requerimientoGuardado']);

const formModalRef = ref(null);
const visibleLocal = ref(props.visible); // Para controlar la visibilidad internamente

// Estado inicial para el formulario
const initialState = () => ({
  requerimientoId: null, // Importante para edición
  tipoRequerimientoId: null,
  tituloRequerimiento: '',
  areaId: null,
  cargoId: null,
  motivo: '',
  sueldoPropuesto: null,
  fechaDeseadaIngreso: null,
  jefeDestinoId: null,
});

const requerimientoLocal = reactive(initialState());

// Datos para los dropdowns
const tiposRequerimiento = ref([]);
const areas = ref([]);
const cargos = ref([]);
const personalElegibleComoJefe = ref([]);
const loadingDropdowns = ref(false);

const loadingForm = ref(false);
const errorForm = ref('');

// Reglas de validación de Vuetify
const rules = {
  required: value => (value !== null && value !== undefined && value !== '') || 'Este campo es requerido.', // Mejorada para selects
  maxLength: (length) => (value) => (!value || value.length <= length) || `Máximo ${length} caracteres.`,
  positiveNumber: value => (value === null || value === undefined || value === '' || parseFloat(value) >= 0) || 'Debe ser un número positivo.',
};

const tituloModal = computed(() => props.modoEditar ? 'Editar Requerimiento' : 'Crear Nuevo Requerimiento');

// Observa cambios en la prop 'visible' para mostrar/ocultar el modal
watch(() => props.visible, (newVal) => {
  visibleLocal.value = newVal;
  if (newVal) { // Cuando el modal se abre
    errorForm.value = ''; // Limpiar errores
    if (props.modoEditar && props.requerimientoParaEditar) {
      // Si es modo edición, copia los datos del requerimiento a editar
      Object.assign(requerimientoLocal, props.requerimientoParaEditar);
      // Asegurar que los campos numéricos y de fecha se manejen bien si son null
      requerimientoLocal.sueldoPropuesto = props.requerimientoParaEditar.sueldoPropuesto || null;
      requerimientoLocal.fechaDeseadaIngreso = props.requerimientoParaEditar.fechaDeseadaIngreso ? props.requerimientoParaEditar.fechaDeseadaIngreso.split('T')[0] : null; // Formato YYYY-MM-DD para input date
      requerimientoLocal.jefeDestinoId = props.requerimientoParaEditar.jefeDestinoId || null;
    } else {
      // Si es modo nuevo, resetea el formulario
      Object.assign(requerimientoLocal, initialState());
    }
    formModalRef.value?.resetValidation(); // Resetea la validación
  }
});

// Cargar datos para los dropdowns
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
      RequerimientoService.getAreas(),
      RequerimientoService.getCargos(),
      RequerimientoService.getPersonalParaJefeDestino()
    ]);
  } catch (error) {
    errorForm.value = 'Error al cargar datos para el formulario. ' + error.message;
    console.error(error);
  } finally {
    loadingDropdowns.value = false;
  }
};

onMounted(cargarDatosDropdown); // Cargar al montar el componente

const cerrar = () => {
  emit('cerrar');
};

const manejarCierreExterno = () => {
    if (!loadingForm.value) { // No cerrar si está cargando
        cerrar();
    }
};

const guardarRequerimiento = async () => {
  const { valid } = await formModalRef.value.validate();
  if (!valid) {
    errorForm.value = 'Por favor, complete todos los campos requeridos correctamente.';
    return;
  }

  loadingForm.value = true;
  errorForm.value = '';

  // Preparar payload, asegurando que los opcionales no se envíen como strings vacíos si son números o fechas
  const payload = { ...requerimientoLocal };
  if (payload.sueldoPropuesto === '' || payload.sueldoPropuesto === undefined) payload.sueldoPropuesto = null;
  if (!payload.fechaDeseadaIngreso) delete payload.fechaDeseadaIngreso;
  if (!payload.jefeDestinoId) delete payload.jefeDestinoId;


  try {
    if (props.modoEditar) {
      // LLAMAR AL SERVICIO DE ACTUALIZAR (necesitarás crear este método en RequerimientoService y su endpoint)
      // await RequerimientoService.actualizarRequerimiento(payload.requerimientoId, payload);
      console.log("Actualizando requerimiento (simulado):", payload);
      // Simulación
      setTimeout(() => {
         emit('requerimientoGuardado');
         loadingForm.value = false;
      }, 1000);
    } else {
      // Crear nuevo
      const nuevoRequerimiento = await RequerimientoService.crearRequerimiento(payload);
      console.log("Requerimiento creado:", nuevoRequerimiento);
      emit('requerimientoGuardado');
    }
  } catch (error) {
    errorForm.value = error.message || 'Ocurrió un error al guardar el requerimiento.';
  } finally {
    if (!(props.modoEditar && loadingForm.value)) { // No resetear si es simulación y sigue cargando
        loadingForm.value = false;
    }
  }
};
</script>

<style scoped>
/* Estilos para el modal si son necesarios */
</style>