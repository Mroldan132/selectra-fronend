<template>
  <div>
    <v-card-text class="pa-5">
      <p class="text-body-1 mb-6">
        Desde aquí podrás gestionar los procesos de reclutamiento y selección de personal.
        Utiliza las acciones rápidas a continuación o el menú de navegación principal.
      </p>

      <h3 class="text-h6 mb-4 text-primary">Accesos Rápidos:</h3>
      <v-row dense>
        <v-col
          v-for="action in quickActionsFiltered"
          :key="action.title"
          cols="12" sm="6" md="4"
        >
          <v-hover v-slot="{ isHovering, props: hoverProps }">
            <v-card
              v-bind="hoverProps"
              :color="action.color ? `${action.color}-lighten-5` : 'grey-lighten-5'"
              class="quick-action-card fill-height"
              rounded="lg"
              :elevation="isHovering ? 8 : 2"
              @click="action.click ? action.click() : (action.to ? router.push(action.to) : null)"
              :to="action.to && !action.click ? action.to : undefined"
              link
            >
              <v-list-item class="pa-4">
                <template v-slot:prepend>
                  <v-avatar :color="action.color || 'primary'" rounded="md" size="48" class="mr-4">
                    <v-icon color="white" :icon="action.icon" size="28"></v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="text-body-1 font-weight-medium text-grey-darken-3">{{ action.title }}</v-list-item-title>
                <v-list-item-subtitle v-if="action.subtitle" class="text-caption">{{ action.subtitle }}</v-list-item-subtitle>
              </v-list-item>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-card-text>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="4" v-for="kpi in kpiData" :key="kpi.title">
        <v-card rounded="xl" class="fill-height d-flex flex-column elevation-2 hover-card">
          <v-card-text class="d-flex align-center pa-4">
            <v-avatar :color="kpi.avatarColor || 'primary'" rounded="lg" size="52" class="mr-4 elevation-1">
              <v-icon color="white" :icon="kpi.icon" size="28"></v-icon>
            </v-avatar>
            <div>
              <div class="text-h5 font-weight-bold text-grey-darken-3">{{ kpi.value }}</div>
              <div class="text-caption text-grey-darken-1">{{ kpi.title }}</div>
            </div>
          </v-card-text>
          <v-spacer></v-spacer>
          <v-card-actions v-if="kpi.actionLink" class="pt-0 px-4 pb-3">
            <v-btn
              variant="text"
              :color="kpi.actionColor || 'primary'"
              :to="kpi.actionLink.to"
              block
              class="text-capitalize"
              size="small"
            >
              {{ kpi.actionLink.text }}
              <v-icon right size="small" class="ml-1">mdi-arrow-right-thin</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="7">
        <v-card rounded="xl" class="elevation-2">
          <v-card-title class="d-flex align-center text-h6 font-weight-medium text-grey-darken-2 py-3">
            Mis Requerimientos Recientes
            <v-spacer></v-spacer>
            <v-btn variant="text" color="primary" size="small" :to="{ name: 'gestionRequerimientos' }" class="text-capitalize">
              Ver todos
            </v-btn>
          </v-card-title>
          <v-divider></v-divider>
          <v-list lines="two" class="py-0">
            <template v-if="recentRequirements.length > 0">
              <template v-for="(req, index) in recentRequirements" :key="req.requerimientoId">
                <v-list-item
                  @click="verDetalleRequerimiento(req.requerimientoId)"
                  class="py-3 list-item-hover"
                >
                  <template v-slot:prepend>
                    <v-avatar :color="getEstadoColor(req.estadoNombre)" size="40" class="mr-3 elevation-1">
                      <v-icon color="white">{{ getEstadoIcon(req.estadoNombre) }}</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-medium text-body-1 mb-1">{{ req.tituloRequerimiento }}</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    ID: {{ req.requerimientoId }} | Creado: {{ formatRelativeTime(req.fechaCreacion) }}
                  </v-list-item-subtitle>
                  <template v-slot:append>
                    <v-chip :color="getEstadoColor(req.estadoNombre)" size="small" variant="tonal" label class="mr-2">
                      {{ req.estadoNombre }}
                    </v-chip>
                    <v-icon color="grey-darken-1">mdi-chevron-right</v-icon>
                  </template>
                </v-list-item>
                <v-divider v-if="index < recentRequirements.length - 1"></v-divider>
              </template>
            </template>
            <v-list-item v-else>
              <v-list-item-title class="text-center text-grey-darken-1 py-4">
                No hay requerimientos recientes para mostrar.
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card rounded="xl" class="fill-height elevation-2">
          <v-card-title class="text-h6 font-weight-medium text-grey-darken-2 py-3">
            Notificaciones Pendientes
          </v-card-title>
          <v-divider></v-divider>
          <v-list lines="one" class="py-0" v-if="unreadNotifications.length > 0">
            <template v-for="(notif, index) in unreadNotifications.slice(0, 5)" :key="notif.id">
              <v-list-item @click="irANotificacion(notif)" class="py-3 list-item-hover">
                <template v-slot:prepend>
                  <v-icon :color="getNotifColor(notif.type)" class="mr-3" size="28">{{ getNotifIcon(notif.type) }}</v-icon>
                </template>
                <v-list-item-title class="text-body-2 font-weight-medium">{{ notif.title }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption">{{ formatRelativeTime(notif.timestamp) }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-icon color="grey-darken-1" size="small">mdi-chevron-right</v-icon>
                </template>
              </v-list-item>
              <v-divider v-if="index < unreadNotifications.slice(0, 5).length - 1"></v-divider>
            </template>
          </v-list>
          <v-card-text v-else class="text-center text-grey-darken-1 py-10">
            <v-icon size="36" class="mb-2">mdi-bell-check-outline</v-icon>
            <p>No tienes notificaciones pendientes.</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import RequerimientoService from '@/services/RequerimientoService';

const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

// --- Datos Simulados para KPIs ---
const kpiData = ref([
  // Agrega aquí tus KPIs reales
]);
const allQuickActions = ref([
  { title: 'Mis Requerimientos', icon: 'mdi-format-list-checks', color: 'primary', variant: 'tonal', to: { name: 'gestionRequerimientos' }, roles: ['Solicitante', 'JefeAprobador'] },
  // Agrega más acciones rápidas si lo necesitas
]);

const quickActionsFiltered = computed(() => {
  const userRole = authStore.currentUser?.rol;
  if (!userRole) return [];
  return allQuickActions.value.filter(action => action.roles.includes(userRole));
});

// --- Datos Simulados para Requerimientos Recientes ---
const recentRequirements = ref([]);
const fetchRecentRequirements = async () => {
  recentRequirements.value = await RequerimientoService.getMisRequerimientosRecientes();
};

const unreadNotifications = computed(() => {
  return notificationStore.notifications
    .filter(n => !n.isRead)
    .sort((a, b) => new Date(b.timestamp || b.fechaCreacion) - new Date(a.timestamp || a.fechaCreacion));
});

const formatRelativeTime = (isoString) => {
  if (!isoString) return 'hace un momento';
  const date = new Date(isoString);
  const now = new Date();
  const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

  if (diffSeconds < 1) return 'ahora';
  if (diffSeconds < 60) return `hace ${diffSeconds}s`;
  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return `hace ${diffMinutes}m`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `hace ${diffHours}h`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return `ayer`;
  if (diffDays < 7) return `hace ${diffDays} días`;
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getEstadoColor = (estadoNombre) => {
  if (!estadoNombre) return 'grey';
  const lowerEstado = estadoNombre.toLowerCase();
  if (lowerEstado.includes('pendiente')) return 'orange-darken-1';
  if (lowerEstado.includes('aprobado')) return 'green-darken-1';
  if (lowerEstado.includes('rechazado')) return 'red-darken-1';
  if (lowerEstado.includes('proceso')) return 'blue-darken-1';
  return 'grey-darken-1';
};

const getEstadoIcon = (estadoNombre) => {
  if (!estadoNombre) return 'mdi-help-circle-outline';
  const lowerEstado = estadoNombre.toLowerCase();
  if (lowerEstado.includes('pendiente')) return 'mdi-clock-alert-outline';
  if (lowerEstado.includes('aprobado')) return 'mdi-check-circle-outline';
  if (lowerEstado.includes('rechazado')) return 'mdi-close-circle-outline';
  if (lowerEstado.includes('proceso')) return 'mdi-progress-wrench';
  return 'mdi-file-document-outline';
};

const getNotifIcon = (type) => {
  switch (type) {
    case 'NuevoRequerimiento': case 'Requerimiento': return 'mdi-file-plus-outline';
    case 'RequerimientoAprobado': return 'mdi-check-circle-outline';
    case 'RequerimientoRechazado': return 'mdi-close-circle-outline';
    default: return 'mdi-bell-ring-outline';
  }
};
const getNotifColor = (type) => {
  switch (type) {
    case 'NuevoRequerimiento': case 'Requerimiento': return 'primary';
    case 'RequerimientoAprobado': return 'success';
    case 'RequerimientoRechazado': return 'error';
    default: return 'info';
  }
};

const verDetalleRequerimiento = (id) => {
  router.push({ name: 'gestionRequerimientos', query: { accionModal: 'ver', idRequerimiento: id } });
};

const irANotificacion = (notificacion) => {
  if (notificacion.link) {
    router.push(notificacion.link);
  }
  if (!notificacion.isRead) {
    notificationStore.markAsRead(notificacion.id);
  }
};

onMounted(() => {
  fetchRecentRequirements();
});
</script>

<style scoped>
.hover-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
}

.quick-action-card {
  transition: transform 0.2s ease-in-out, background-color 0.2s ease-in-out;
}
.quick-action-card:hover {
  transform: translateY(-3px);
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
}

.list-item-hover:hover {
  background-color: rgba(0,0,0,0.03);
  cursor: pointer;
}
</style>