<template>
    <v-dialog v-model="visibleInterno" max-width="600px" persistent>
        <v-card>
            <v-card-title class="text-h6">Aprobar Solicitud de Vacaciones</v-card-title>
            <v-card-text>
                <p><strong>Empleado:</strong> {{ solicitud?.nombreEmpleado }}</p>
                <p><strong>Desde:</strong> {{ formatFecha(solicitud?.fechaInicio) }}</p>
                <p><strong>Hasta:</strong> {{ formatFecha(solicitud?.fechaFin) }}</p>
                <p><strong>Días solicitados:</strong> {{ solicitud?.diasSolicitados }}</p>
                <p><strong>Comentarios del empleado:</strong> {{ solicitud?.comentariosEmpleado || 'Sin comentarios' }}</p>

                <v-textarea v-model="comentario"
                            label="Comentario del aprobador (obligatorio si se rechaza)"
                            :error="comentarioError"
                            :error-messages="comentarioError ? ['Este campo es obligatorio para rechazar.'] : []"
                            auto-grow
                            rows="3"
                            class="mt-4" />
            </v-card-text>

            <v-card-actions class="justify-end">
                <v-btn text @click="cerrar">Cancelar</v-btn>
                <v-btn color="green" @click="aprobarSolicitud">Aprobar</v-btn>
                <v-btn color="red" @click="rechazarSolicitud">Rechazar</v-btn>
            </v-card-actions>
        </v-card>

        <!-- Snackbar de notificación -->
        <v-snackbar v-model="snackbar.visible"
                    :color="snackbar.color"
                    timeout="3500"
                    location="top center"
                    rounded="pill"
                    variant="elevated">
            <v-icon :icon="snackbar.icon" class="mr-2" />
            {{ snackbar.text }}
            <template v-slot:actions>
                <v-btn icon @click="snackbar.visible = false" size="small">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </template>
        </v-snackbar>
    </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import SolicitudVacacionesService from '@/services/SolicitudVacacionesService';

const props = defineProps({
  visible: Boolean,
  solicitud: Object
});
const emit = defineEmits(['cerrar', 'solicitud-aprobada']);

const authStore = useAuthStore();

const comentario = ref('');
const comentarioError = ref(false);
const visibleInterno = ref(props.visible);

// Mantener sincronización con la prop `visible`
watch(() => props.visible, (nuevo) => {
  visibleInterno.value = nuevo;
  if (!nuevo) resetForm();
});

// Emitir al padre cuando se cierra
watch(visibleInterno, (nuevo) => {
  if (!nuevo) emit('cerrar');
});

// Limpieza del formulario
function resetForm() {
  comentario.value = '';
  comentarioError.value = false;
  snackbar.value.visible = false;
}

// Formateo de fechas
const formatFecha = (fechaISO) => {
  if (!fechaISO) return 'N/A';
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Snackbar
const snackbar = ref({
  visible: false,
  text: '',
  color: 'success',
  icon: 'mdi-check-circle-outline'
});
const showSnackbar = (text, color = 'success', icon = 'mdi-check-circle-outline') => {
  snackbar.value = { visible: true, text, color, icon };
};

// Aprobar solicitud
const aprobarSolicitud = async () => {
  try {
    await SolicitudVacacionesService.aprobarSolicitud(props.solicitud.id, authStore.user.usuarioId);
    showSnackbar('Solicitud aprobada correctamente');
    emit('solicitud-aprobada');
  } catch (error) {
    console.error('Error al aprobar:', error);
    showSnackbar('Error al aprobar la solicitud', 'error', 'mdi-alert-circle-outline');
  }
};

// Rechazar solicitud
const rechazarSolicitud = async () => {
  if (!comentario.value.trim()) {
    comentarioError.value = true;
    showSnackbar('Debe ingresar un comentario para rechazar.', 'warning', 'mdi-alert');
    return;
  }

  try {
    await SolicitudVacacionesService.rechazarSolicitud(
      props.solicitud.id,
      authStore.user.usuarioId,
      comentario.value
    );
    showSnackbar('Solicitud rechazada correctamente', 'info', 'mdi-close-circle-outline');
    emit('solicitud-aprobada');
  } catch (error) {
    console.error('Error al rechazar:', error);
    showSnackbar('Error al rechazar la solicitud', 'error', 'mdi-alert-circle-outline');
  }
};

// Cerrar manual
const cerrar = () => {
  visibleInterno.value = false;
};
</script>
