<template>
  <v-dialog :model-value="modelValue" persistent max-width="600px" @update:model-value="cerrar">
    <v-card>
      <v-toolbar color="primary" dark flat>
        <v-toolbar-title class="font-weight-bold">
          <v-icon class="mr-2">mdi-help-rhombus-outline</v-icon>
          Responder Preguntas de la Oferta
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="cerrar"><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>

      <v-card-text class="pa-5">
        <div v-if="cargando" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="mt-4 text-grey-darken-1">Cargando preguntas...</p>
        </div>

        <v-alert v-else-if="error" type="error" variant="tonal" prominent>
          {{ error }}
        </v-alert>

        <div v-else>
          <div v-for="pregunta in preguntas" :key="pregunta.preguntaFiltroId" class="mb-6">
            <label class="v-label font-weight-medium text-grey-darken-3">{{ pregunta.pregunta }}</label>
            <v-radio-group
              v-model="respuestasSeleccionadas[pregunta.preguntaFiltroId]"
              class="mt-2"
              hide-details
            >
              <v-radio
                v-for="respuesta in pregunta.respuestas"
                :key="respuesta"
                :label="respuesta"
                :value="respuesta"
              ></v-radio>
            </v-radio-group>
          </div>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="cerrar">Cancelar</v-btn>
        <v-btn
          color="success"
          variant="flat"
          @click="guardarRespuestas"
          :disabled="cargando || error || preguntas.length === 0"
        >
          Guardar Respuestas
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import OfertasLaboralesService from '@/services/OfertasLaboralesService';

const props = defineProps({
  modelValue: Boolean,
  idOfertta: {
    type: Number,
    required: true
  },
  preguntaFiltroId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'guardado']);

const cargando = ref(false);
const guardando = ref(false);
const error = ref(null);
const preguntas = ref([]);
const respuestasSeleccionadas = reactive({});


const fetchPreguntas = async () => {
  if (props.idOfertta === null || props.idOfertta === undefined) {
    console.error("Error: idOfertta no tiene un valor válido.");
    error.value = "No se pudo cargar las preguntas: ID de oferta inválido.";
    return;
  }
  cargando.value = true;
  error.value = null;
  preguntas.value = [];
  Object.keys(respuestasSeleccionadas).forEach(key => delete respuestasSeleccionadas[key]);
  try {
    const data = await OfertasLaboralesService.getListaPreguntasOfertaLaboral(props.idOfertta);
    preguntas.value = data;
    if (!data || data.length === 0) {
        error.value = "Esta oferta no tiene preguntas para responder.";
    }
  } catch (err) {
    error.value = err.message || "No se pudieron cargar las preguntas.";
  } finally {
    cargando.value = false;
  }
};

const guardarRespuestas = async () => {
  guardando.value = true;
  error.value = null; 

  const payload = Object.keys(respuestasSeleccionadas).map(preguntaId => {
    const preguntaIdNum = parseInt(preguntaId);
    
    const preguntaOriginal = preguntas.value.find(p => p.preguntaFiltroId === preguntaIdNum);

    return {
      preguntaFiltroId: preguntaIdNum,
      pregunta: preguntaOriginal ? preguntaOriginal.pregunta : '', 
      respuesta: respuestasSeleccionadas[preguntaId]
    };
  });

  try {
    const resultado = await OfertasLaboralesService.registrarRespuestaPreguntaAspirante(props.idOfertta, payload);
    
    emit('guardado', resultado); 
    cerrar();

  } catch (err) {
    error.value = err.message || "Ocurrió un error inesperado al guardar tus respuestas.";
  } finally {
    guardando.value = false;
  }
};

const cerrar = () => {
  emit('update:modelValue', false);
};

watch(() => props.modelValue, (esVisible) => {
  if (esVisible) {
    fetchPreguntas();
  }
}, { immediate: true });
</script>