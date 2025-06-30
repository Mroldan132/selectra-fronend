<template>
  <v-dialog v-model="visibleLocal" persistent max-width="600px" @click:outside="manejarCierreExterno">
    <v-card :loading="loading">
      <v-toolbar color="deep-purple-accent-3" dark flat>
        <v-toolbar-title>Detalle del Requerimiento</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="cerrar">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-5">
        <div v-if="props.requerimientoActual">
          <p><strong>Fecha Inicio:</strong> {{ props.requerimientoActual.fechaInicio }}</p>
          <p><strong>Fecha Fin:</strong> {{ props.requerimientoActual.fechaFin }}</p>
        </div>

        <v-form ref="formAprobacionRef">
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model.trim="comentariosAprobador"
                label="Comentarios Aprobador"
                variant="outlined"
                density="comfortable"
                rows="3"
                auto-grow
                counter
                maxlength="1000"
                readonly
              ></v-textarea>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model.trim="ComentariosEmpleado"
                label="Comentarios Solicitante"
                variant="outlined"
                density="comfortable"
                rows="3"
                auto-grow
                counter
                maxlength="1000"
                readonly
              ></v-textarea>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" text @click="cerrar">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>



<script setup>
import { ref, watch } from 'vue';
import TipoDocumentoService from '@/services/TipoDocumentoService';

const props = defineProps({
  visible: Boolean,
  requerimientoActual: Object
});

const emit = defineEmits(['cerrar']);

const visibleLocal = ref(props.visible);
const comentariosAprobador = ref('');
const ComentariosEmpleado = ref('');


watch(() => props.visible, (newVal) => {
  visibleLocal.value = newVal;
  if (newVal && props.requerimientoActual) {
    
    comentariosAprobador.value = props.requerimientoActual.comentarioAprobador || '';
    ComentariosEmpleado.value = props.requerimientoActual.comentarioSolicitante || '';
  }
});

const cerrar = () => {
  emit('cerrar');
};

const manejarCierreExterno = () => {
  cerrar();
};
</script>
