<template>
  <v-dialog :model-value="modelValue" @update:model-value="cerrar" persistent max-width="700px">
    <v-card rounded="xl">
      <v-toolbar color="deep-purple-accent-3" dark flat>
        <v-toolbar-title class="font-weight-medium">Gestionar Solicitud de Vacaciones</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="cerrar"><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>

      <v-form ref="form">
        <v-card-text class="pa-5">
          <v-alert v-if="error" type="error" variant="tonal" class="mb-4" border="start" closable @click:close="error = ''">
            {{ error }}
          </v-alert>

          <div class="mb-4">
            <p class="text-subtitle-1 font-weight-medium text-grey-darken-3">Detalles del Solicitante</p>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field :model-value="solicitud.nombreEmpleado" label="Nombre del Empleado" variant="solo-filled" readonly flat></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field :model-value="solicitud.diasSolicitados + ' días'" label="Total Días Solicitados" variant="solo-filled" readonly flat></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field :model-value="formatDate(solicitud.fechaInicio)" label="Fecha de Inicio" variant="solo-filled" readonly flat></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field :model-value="formatDate(solicitud.fechaFin)" label="Fecha de Fin" variant="solo-filled" readonly flat></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea :model-value="solicitud.comentariosEmpleado || 'Sin comentarios.'" label="Comentarios del Solicitante" variant="solo-filled" readonly flat rows="3"></v-textarea>
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-4"></v-divider>
          
          <div>
            <p class="text-subtitle-1 font-weight-medium text-grey-darken-3">
              {{ esGestionable ? 'Acción del Aprobador' : 'Comentarios Finales del Aprobador' }}
            </p>
            <v-textarea
              v-model.trim="comentariosAprobador"
              label="Comentarios del Aprobador"
              variant="outlined"
              rows="3"
              counter
              maxlength="500"
              :rules="[reglas.comentarioRequeridoParaRechazo]"
              :readonly="!esGestionable"
              :placeholder="esGestionable ? 'Requerido para rechazar...' : 'Sin comentarios.'"
              clearable
            ></v-textarea>
          </div>
        </v-card-text>
        
        <v-divider></v-divider>

        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer></v-spacer>
          <template v-if="esGestionable">
            <v-btn color="error" variant="flat" @click="handleRechazar" :loading="loadingRechazar" :disabled="loadingAprobar">
              Rechazar
            </v-btn>
            <v-btn color="success" variant="flat" @click="handleAprobar" :loading="loadingAprobar" :disabled="loadingRechazar">
              Aprobar
            </v-btn>
          </template>
          <template v-else>
            <v-btn color="grey-darken-3" variant="text" @click="cerrar">
              Cerrar
            </v-btn>
          </template>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import SolicitudVacacionesService from '@/services/SolicitudVacacionesService';
// Asumo que sigues necesitando la lógica de autenticación para enviar el ID del aprobador.
import { useAuthStore } from '@/stores/authStore';

const props = defineProps({
  modelValue: Boolean,
  solicitud: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue', 'gestion-finalizada']);

const authStore = useAuthStore();
const form = ref(null);
const comentariosAprobador = ref('');
const loadingAprobar = ref(false);
const loadingRechazar = ref(false);
const error = ref('');
let accionRechazo = false;

// --- CAMBIO: Propiedad Computada para controlar el estado ---
const esGestionable = computed(() => {
  // Retorna true solo si el estado de la solicitud es 'Pendiente' (insensible a mayúsculas/minúsculas)
  return props.solicitud?.estado?.toLowerCase() === 'pendiente';
});

const aprobadorId = computed(() => authStore.user?.id);

// --- CAMBIO: Watch actualizado para cargar comentarios existentes ---
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    comentariosAprobador.value = props.solicitud.comentariosAprobador || '';
    error.value = '';
    accionRechazo = false;
    form.value?.resetValidation();
  }
});

const reglas = {
  comentarioRequeridoParaRechazo: v => {
    if (accionRechazo) {
      return !!v || 'El motivo de rechazo es obligatorio.';
    }
    return true;
  }
};

const cerrar = () => {
  emit('update:modelValue', false);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

async function handleAprobar() {
  if (!esGestionable.value) return; // Doble seguro

  loadingAprobar.value = true;
  error.value = '';
  
  try {
    await SolicitudVacacionesService.aprobarSolicitud({
      solicitudId: props.solicitud.id,
      motivo: comentariosAprobador.value
    });
    emit('gestion-finalizada');
    cerrar();
  } catch (err) {
    error.value = err.message || 'Ocurrió un error inesperado.';
  } finally {
    loadingAprobar.value = false;
  }
}

async function handleRechazar() {
  if (!esGestionable.value) return; // Doble seguro

  accionRechazo = true;
  const { valid } = await form.value.validate();
  if (!valid) {
    accionRechazo = false;
    return;
  }

  loadingRechazar.value = true;
  error.value = '';

  try {
    await SolicitudVacacionesService.rechazarSolicitud({
      solicitudId: props.solicitud.id,
      aprobadorId: aprobadorId.value,
      motivo: comentariosAprobador.value
    });
    emit('gestion-finalizada');
    cerrar();
  } catch (err) {
    error.value = err.message;
  } finally {
    loadingRechazar.value = false;
    accionRechazo = false;
  }
}
</script>