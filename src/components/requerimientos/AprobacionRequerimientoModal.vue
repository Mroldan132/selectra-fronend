<template>
  <v-dialog v-model="visibleLocal" persistent max-width="600px" @click:outside="manejarCierreExterno">
    <v-card :loading="loading || loadingEstados">
      <v-toolbar color="deep-purple-accent-3" dark flat>
        <v-toolbar-title>Gestionar Aprobación de Requerimiento</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="cerrar">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-5">
        <div v-if="props.requerimientoActual" class="mb-4">
          <p><strong>Requerimiento ID:</strong> {{ props.requerimientoId }}</p>
          <p><strong>Título:</strong> {{ props.requerimientoActual.titulo }}</p>
          <p><strong>Estado Actual:</strong>
            <v-chip :color="getEstadoChipColor(props.requerimientoActual.estadoActual)" size="small" variant="tonal">
              {{ props.requerimientoActual.estadoActual }}
            </v-chip>
          </p>
        </div>
        <v-divider class="my-4" v-if="props.requerimientoActual"></v-divider>

        <v-alert
          v-if="formularioDeshabilitadoPorEstado"
          type="info"
          variant="tonal"
          dense
          class="mb-4"
          text="Este requerimiento ya ha sido procesado (aprobado o rechazado) y no puede ser modificado."
        ></v-alert>

        <v-form @submit.prevent="procesar" ref="formAprobacionRef">
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="accionSeleccionada"
                :items="listaAccionesDisponibles"
                item-title="nombreEstado"
                item-value="codigoEstado"
                label="Acción a Realizar"
                :rules="[rules.required]"
                variant="outlined"
                density="comfortable"
                required
                :loading="loadingEstados"
                :disabled="loadingEstados || formularioDeshabilitadoPorEstado"
                hint="Seleccione la acción que desea aplicar al requerimiento."
                persistent-hint
              ></v-select>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model.trim="observaciones"
                label="Observaciones"
                :rules="[rules.requiredObservaciones]"
                variant="outlined"
                density="comfortable"
                rows="4"
                auto-grow
                counter
                maxlength="1000"
                :disabled="formularioDeshabilitadoPorEstado"
              ></v-textarea>
            </v-col>
          </v-row>
          <v-alert v-if="error && !formularioDeshabilitadoPorEstado" type="error" dense text class="mt-3 mb-0">
            {{ error }}
          </v-alert>
          <v-alert v-if="errorCargaEstados && !formularioDeshabilitadoPorEstado" type="warning" dense text class="mt-3 mb-0">
            {{ errorCargaEstados }}
          </v-alert>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" text @click="cerrar" :disabled="loading || loadingEstados">Cancelar</v-btn>
        <v-btn
          :color="botonProcesarColor"
          @click="procesar"
          :loading="loading"
          :disabled="loading || loadingEstados || listaAccionesDisponibles.length === 0 || formularioDeshabilitadoPorEstado"
        >
          {{ textoBotonProcesar }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import RequerimientoService from '@/services/RequerimientoService'; 

const props = defineProps({
  visible: Boolean,
  requerimientoId: Number,
  requerimientoActual: Object, 
});

const emit = defineEmits(['cerrar', 'requerimientoProcesado']);

const formAprobacionRef = ref(null);
const visibleLocal = ref(props.visible);
const loading = ref(false); 
const error = ref(''); 

const observaciones = ref('');
const accionSeleccionada = ref(null); 

const listaAccionesDisponibles = ref([]);
const loadingEstados = ref(false); 
const errorCargaEstados = ref(''); 


const formularioDeshabilitadoPorEstado = computed(() => {
  if (props.requerimientoActual && props.requerimientoActual.estadoActual) {
    const estado = props.requerimientoActual.estadoActual.toLowerCase();
    return estado.includes('aprobado') || estado.includes('rechazado');
  }
  return false;
});

const rules = {
  required: value => {
    if (formularioDeshabilitadoPorEstado.value) return true;
    return !!value || 'Este campo es requerido.';
  },
  requiredObservaciones: value => {
    if (formularioDeshabilitadoPorEstado.value) return true;

    if (value && value.trim().length > 1000) {
      return 'Máximo 1000 caracteres para observaciones.';
    }
    return true;
  },
};

const botonProcesarColor = computed(() => {
  return 'deep-purple-accent-3';
});

const textoBotonProcesar = computed(() => {
  if (formularioDeshabilitadoPorEstado.value) return 'Procesado'; // Cambiar texto si está deshabilitado

  const accion = listaAccionesDisponibles.value.find(a => a.codigoEstado === accionSeleccionada.value);
  if (accion && accion.nombreEstado) {
    return `Confirmar ${accion.nombreEstado}`;
  }
});

const cargarAccionesDisponibles = async () => {
  loadingEstados.value = true;
  errorCargaEstados.value = '';
  try {
    const estados = await RequerimientoService.getEstadosRequerimientos();
    listaAccionesDisponibles.value = estados;

    if (!listaAccionesDisponibles.value || listaAccionesDisponibles.value.length === 0) {
        errorCargaEstados.value = 'No hay acciones de aprobación/rechazo disponibles o no se pudieron cargar.';
    }
  } catch (err) {
    console.error('Modal Aprobación: Error al cargar estados/acciones:', err);
    errorCargaEstados.value = err.message || 'No se pudieron cargar las acciones disponibles.';
    listaAccionesDisponibles.value = [];
  } finally {
    loadingEstados.value = false;
  }
};

onMounted(() => {
  cargarAccionesDisponibles();
});

watch(() => props.visible, (newVal) => {
  visibleLocal.value = newVal;
  if (newVal) {
    const historialDeAprobaciones = props.requerimientoActual?.Historial || [];
    if(historialDeAprobaciones.length > 0) {
        observaciones.value = historialDeAprobaciones[0].observaciones|| '';
        accionSeleccionada.value = historialDeAprobaciones[0].codigoEstado || null;
    } else {
            observaciones.value = '';
            accionSeleccionada.value = null;
            error.value = '';
            formAprobacionRef.value?.resetValidation();
    }
     if (listaAccionesDisponibles.value.length === 0 && !loadingEstados.value && !errorCargaEstados.value) {
      cargarAccionesDisponibles();
    }
  }
});

const cerrar = () => {
  emit('cerrar');
};

const manejarCierreExterno = () => {
  if (!loading.value && !loadingEstados.value) {
    cerrar();
  }
};

const procesar = async () => {
  if (formularioDeshabilitadoPorEstado.value) {
    console.warn('Intento de procesar un requerimiento ya finalizado.');
    return;
  }

  if (!formAprobacionRef.value) return;
  const validationResult = await formAprobacionRef.value.validate();
  if (!validationResult.valid) {
    return;
  }

  if (!props.requerimientoId) {
    error.value = "ID de requerimiento no especificado.";
    return;
  }
  if (!accionSeleccionada.value) {
    error.value = "Debe seleccionar una acción a realizar.";
    return;
  }

  loading.value = true;
  error.value = '';

  const datosParaServicio = {
    idRequerimiento: props.requerimientoId,
    CodigoEstado: accionSeleccionada.value,
    Observaciones: observaciones.value.trim(),
  };

  try {
    await RequerimientoService.aprobarRechazarRequerimiento(datosParaServicio);
    emit('requerimientoProcesado');
  } catch (err) {
    error.value = err.message || 'Ocurrió un error al procesar el requerimiento.';
    console.error('Modal Aprobación: Error en procesar:', err);
  } finally {
    loading.value = false;
  }
};

// Determina el color del chip para mostrar el estado actual del requerimiento
const getEstadoChipColor = (estadoNombre) => {
  if (!estadoNombre) return 'grey';
  const lowerEstado = estadoNombre.toLowerCase();
  if (lowerEstado.includes('pendiente')) return 'orange';
  if (lowerEstado.includes('aprobado')) return 'green';
  if (lowerEstado.includes('rechazado')) return 'red';
  return 'default';
};

</script>

<style scoped>
/* Estilos específicos para el modal de aprobación si son necesarios */
.v-toolbar-title {
  font-size: 1.1rem;
}
p {
  margin-bottom: 0.5rem;
}
</style>