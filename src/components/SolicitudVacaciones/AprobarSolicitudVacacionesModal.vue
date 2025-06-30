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
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.fechaInicio"
                label="Fecha de Inicio"
                type="date"
                variant="outlined"
                density="comfortable"
                :rules="[reglas.requerido]"
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
                :rules="[reglas.requerido, reglas.fechaFinValida]"
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

const props = defineProps({
  modelValue: Boolean,
  solicitud: Object, // Puede ser null (para crear) o un objeto (para ver/editar)
  mode: {         // El nuevo prop "inteligente"
    type: String,
    default: 'view', // 'view', 'create', 'edit'
  }
});

const emit = defineEmits(['update:modelValue', 'save']);

const form = ref(null);
const guardando = ref(false);

// Usamos un objeto local para los datos del formulario para poder editar
const formData = ref({});

// Computada para saber si los campos son de solo lectura
const esSoloLectura = computed(() => props.mode === 'view');

// Computada para el título dinámico
const tituloDelModal = computed(() => {
  if (props.mode === 'create') return 'Crear Nueva Solicitud';
  if (props.mode === 'edit') return 'Editar Solicitud';
  return 'Detalle de Solicitud';
});

// Watcher que se activa cuando el modal se abre o cambia la solicitud
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (props.mode === 'create' || !props.solicitud) {
      // Si es para crear, reseteamos el formulario
      formData.value = {
        fechaInicio: '',
        fechaFin: '',
        comentariosEmpleado: '',
      };
    } else {
      // Si es para ver/editar, copiamos los datos de la prop
      formData.value = { ...props.solicitud };
    }
  }
});

const reglas = {
  requerido: v => !!v || 'Este campo es requerido.',
  fechaFinValida: v => {
    if (!formData.value.fechaInicio || !v) return true;
    return new Date(v) >= new Date(formData.value.fechaInicio) || 'La fecha de fin no puede ser anterior a la de inicio.';
  }
};

const cerrar = () => {
  emit('update:modelValue', false);
};

const guardar = async () => {
  if (esSoloLectura.value) return; // No hacer nada si es solo lectura

  const { valid } = await form.value.validate();
  if (!valid) return;

  guardando.value = true;
  // Emitimos el evento con los datos del formulario para que el padre decida si crea o actualiza
  emit('save', formData.value);
  guardando.value = false;
  cerrar();
};
</script>