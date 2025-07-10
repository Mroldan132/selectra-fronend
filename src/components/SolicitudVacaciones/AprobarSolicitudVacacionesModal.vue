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
          <!-- Alerta para mostrar errores de la API -->
          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="mb-4"
            border="start"
            closable
            @click:close="error = ''"
          >
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
                :min="today"
                :rules="[reglas.requerido, reglas.noFechasPasadas]"
                :readonly="esSoloLectura"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.fechaFin"
                label="Fecha de Fin"
                type="date"
                variant="outlined"
                density="comfortable"
                :min="today"
                :rules="[reglas.requerido, reglas.noFechasPasadas, reglas.fechaFinValida]"
                :readonly="esSoloLectura"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model.trim="formData.comentariosEmpleado"
                label="Comentarios del Solicitante"
                variant="outlined"
                density="comfortable"
                rows="3"
                counter
                maxlength="500"
                :readonly="esSoloLectura"
              ></v-textarea>
            </v-col>
            <v-col cols="12" v-if="esSoloLectura && formData.comentariosAprobador">
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
            {{ esSoloLectura ? 'Cerrar' : 'Cancelar' }}
          </v-btn>
          <v-btn
            v-if="!esSoloLectura"
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
// 1. Importa tu servicio
import SolicitudVacacionesService from '@/services/SolicitudVacacionesService';

const props = defineProps({
  modelValue: Boolean,
  solicitud: Object,
  mode: {
    type: String,
    default: 'view',
  }
});

// Se cambia el evento a 'save-success' para mayor claridad
const emit = defineEmits(['update:modelValue', 'save-success']);

const form = ref(null);
const guardando = ref(false);
const formData = ref({});
const error = ref(''); // Variable para mensajes de error

const esSoloLectura = computed(() => props.mode === 'view');

const tituloDelModal = computed(() => {
  if (props.mode === 'create') return 'Crear Nueva Solicitud';
  if (props.mode === 'edit') return 'Editar Solicitud';
  return 'Detalle de Solicitud';
});

const today = computed(() => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split('T')[0];
});

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    error.value = ''; // Limpia errores al abrir el modal
    if (props.mode === 'create' || !props.solicitud) {
      formData.value = {
        fechaInicio: '',
        fechaFin: '',
        comentariosEmpleado: '',
      };
    } else {
      formData.value = { ...props.solicitud };
    }
  }
});

const reglas = {
  requerido: v => !!v || 'Este campo es requerido.',
  noFechasPasadas: v => {
    if (!v) return true;
    return new Date(v) >= new Date(today.value) || 'No se pueden seleccionar fechas pasadas.';
  },
  fechaFinValida: v => {
    if (!formData.value.fechaInicio || !v) return true;
    return new Date(v) >= new Date(formData.value.fechaInicio) || 'La fecha de fin no puede ser anterior a la de inicio.';
  }
};

const cerrar = () => {
  emit('update:modelValue', false);
};

// 2. Lógica de guardado implementada
const guardar = async () => {
  if (esSoloLectura.value) return;

  const { valid } = await form.value.validate();
  if (!valid) return;

  guardando.value = true;
  error.value = ''; // Resetea el error antes de intentar

  try {
    // --- INICIO DEL CAMBIO ---
    // Mapea los datos del formulario al formato esperado por el DTO del backend
    const payload = {
      FechaInicio: formData.value.fechaInicio,
      FechaFin: formData.value.fechaFin,
      ComentariosEmpleado: formData.value.comentariosEmpleado || '', // Asegura que no sea null
    };
    // --- FIN DEL CAMBIO ---

    if (props.mode === 'create') {
      await SolicitudVacacionesService.crearSolicitud(payload); // Envía el payload formateado
    } else {
      // Asumiendo que tienes un método para actualizar en tu servicio
      // const updatePayload = { ...payload, Id: formData.value.id }; // Añadir el ID para actualizar
      // await SolicitudVacacionesService.actualizarSolicitud(updatePayload);
      console.warn('Método de actualización no implementado en el ejemplo.');
    }
    
    // 3. Emite un evento de éxito para que el padre refresque la lista
    emit('save-success');
    cerrar();

  } catch (err) {
    // Captura y muestra el error de la API
    error.value = err.message || 'Ocurrió un error inesperado.';
    console.error("Error al guardar la solicitud:", err);
  } finally {
    guardando.value = false;
  }
};
</script>
