<template>
  <v-dialog :model-value="modelValue" @update:model-value="cerrar" persistent max-width="700px">
    <v-card rounded="xl">
      <v-form ref="form" @submit.prevent="guardar">
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title class="font-weight-medium">{{ tituloDelModal }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon dark @click="cerrar"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>

        <v-card-text class="pa-5">
          <v-alert v-if="error" type="error" variant="tonal" class="mb-4" border="start" closable @click:close="error = ''">
            {{ error }}
          </v-alert>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.fechaInicio"
                label="Fecha de Inicio"
                type="date"
                variant="outlined"
                density="comfortable"
                :rules="[reglas.requerido, reglas.noFechasPasadas]"
                :readonly="!esEditable"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.fechaFin"
                label="Fecha de Fin"
                type="date"
                variant="outlined"
                density="comfortable"
                :rules="[reglas.requerido, reglas.noFechasPasadas, reglas.fechaFinValida]"
                :readonly="!esEditable"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model.trim="formData.comentariosEmpleado"
                label="Mis Comentarios"
                variant="outlined"
                density="comfortable"
                rows="3"
                counter
                maxlength="500"
                :readonly="!esEditable"
              ></v-textarea>
            </v-col>

            <v-col cols="12" v-if="mostrarComentariosAprobador">
              <v-textarea
                v-model.trim="formData.comentariosAprobador"
                label="Comentarios del Aprobador"
                variant="solo-filled"
                flat
                rows="3"
                readonly
              ></v-textarea>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-3" variant="text" @click="cerrar">
            {{ esEditable ? 'Cancelar' : 'Cerrar' }}
          </v-btn>
          <v-btn
            v-if="esEditable"
            color="primary"
            variant="flat"
            type="submit"
            :loading="guardando"
          >
            Guardar Cambios
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import SolicitudVacacionesService from '@/services/SolicitudVacacionesService';

const props = defineProps({
  modelValue: Boolean,
  solicitud: Object,
  mode: { 
    type: String,
    default: 'view',
  }
});

const emit = defineEmits(['update:modelValue', 'save-success']);

const form = ref(null);
const guardando = ref(false);
const formData = ref({});
const error = ref('');


const esEditable = computed(() => {
  debugger  
  if (props.mode === 'create') return true;
  if (props.mode === 'edit' && props.solicitud?.estado?.toLowerCase() === 'pendiente') {
    return true;
  }
  return false;
});

const mostrarComentariosAprobador = computed(() => {
  const estado = props.solicitud?.estado?.toLowerCase();
  const tieneComentarios = !!props.solicitud?.comentariosAprobador;
  return (estado === 'aprobada' || estado === 'rechazada') && tieneComentarios;
});

const tituloDelModal = computed(() => {
  if (props.mode === 'create') return 'Crear Nueva Solicitud';
  // Si no es editable, siempre es 'Detalle', aunque el modo sea 'edit'
  if (props.mode === 'edit' && esEditable.value) return 'Editar Solicitud';
  return 'Detalle de Solicitud';
});


watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    error.value = '';
    form.value?.resetValidation();

    if (props.mode === 'create' || !props.solicitud) {
      formData.value = {
        fechaInicio: '',
        fechaFin: '',
        comentariosEmpleado: '',
      };
    } else {
      formData.value = { 
        ...props.solicitud,
        fechaInicio: props.solicitud.fechaInicio ? props.solicitud.fechaInicio.split('T')[0] : '',
        fechaFin: props.solicitud.fechaFin ? props.solicitud.fechaFin.split('T')[0] : '',
      };
    }
  }
});

const reglas = {
  requerido: v => !!v || 'Este campo es requerido.',
  noFechasPasadas: v => {
    if (!v || !esEditable.value) return true; 
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return new Date(v) >= hoy || 'No se pueden seleccionar fechas pasadas.';
  },
  fechaFinValida: v => {
    if (!formData.value.fechaInicio || !v || !esEditable.value) return true;
    return new Date(v) >= new Date(formData.value.fechaInicio) || 'La fecha de fin no puede ser anterior a la de inicio.';
  }
};

const cerrar = () => {
  emit('update:modelValue', false);
};

const guardar = async () => {
  if (!esEditable.value) return; 

  const { valid } = await form.value.validate();
  if (!valid) return;

  guardando.value = true;
  error.value = '';

  try {
    const payload = {
      FechaInicio: formData.value.fechaInicio,
      FechaFin: formData.value.fechaFin,
      ComentariosEmpleado: formData.value.comentariosEmpleado || '',
    };
    
    if (props.mode === 'create') {
      await SolicitudVacacionesService.crearSolicitud(payload);
    } else {
      console.warn('Lógica de Actualización no implementada en el ejemplo.');
    }
    
    emit('save-success');
    cerrar();

  } catch (err) {
    error.value = err.message || 'Ocurrió un error inesperado.';
    console.error("Error al guardar la solicitud:", err);
  } finally {
    guardando.value = false;
  }
};
</script>