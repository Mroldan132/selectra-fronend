<template>
  <div class="pa-4 pa-md-6">
    <!-- 1. Saludo Personalizado y Descripción -->
    <div class="mb-8">
      <h2 class="text-h4 font-weight-light mb-2">
        Hola, <span class="font-weight-medium text-primary">{{ authStore.currentUser?.nombre || 'Usuario' }}</span>
      </h2>
      <p class="text-body-1 text-grey-darken-1">
        Bienvenido a tu portal. Aquí tienes un resumen de tu actividad y accesos directos.
      </p>
    </div>

    <!-- 2. KPIs (Indicadores Clave de Rendimiento) -->
    <v-row dense class="mb-8">
      <v-col v-for="kpi in dashboardKPIs" :key="kpi.title" cols="12" sm="6" md="3">
        <v-card rounded="xl" class="fill-height elevation-2 hover-card">
          <v-card-text class="d-flex align-center pa-4">
            <v-avatar :color="kpi.color" rounded="lg" size="56" class="mr-4 elevation-1">
              <v-icon color="white" :icon="kpi.icon" size="30"></v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold text-grey-darken-3">{{ kpi.value }}</div>
              <div class="text-body-2 text-grey-darken-1">{{ kpi.title }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- 3. Contenido Principal del Dashboard -->
    <v-row>
      <!-- Columna Izquierda: Información General (Requerimientos y Vacaciones) -->
      <v-col cols="12" md="7">
        <v-card rounded="xl" class="elevation-2 fill-height">
          <v-tabs v-model="tabPrincipal" bg-color="transparent" color="primary">
            <v-tab value="requerimientos">Requerimientos</v-tab>
            <v-tab value="vacaciones">Vacaciones</v-tab>
          </v-tabs>
          <v-divider></v-divider>
          <v-window v-model="tabPrincipal">
            <!-- Pestaña Requerimientos -->
            <v-window-item value="requerimientos">
              <v-card-title class="d-flex align-center text-h6 font-weight-medium text-grey-darken-2 py-3">
                Mis Requerimientos Recientes
                <v-spacer></v-spacer>
                <v-btn variant="text" color="primary" size="small" :to="{ name: 'gestionRequerimientos' }" class="text-capitalize">Ver todos</v-btn>
              </v-card-title>
              <v-list lines="two" class="py-0">
                <template v-if="recentRequirements.length > 0">
                  <template v-for="(req, index) in recentRequirements" :key="req.requerimientoId">
                    <v-list-item @click="verDetalleRequerimiento(req.requerimientoId)" class="py-3 list-item-hover">
                      <template v-slot:prepend>
                        <v-avatar :color="getEstadoColor(req.estadoNombre)" size="40" class="mr-3 elevation-1">
                          <v-icon color="white">{{ getEstadoIcon(req.estadoNombre) }}</v-icon>
                        </v-avatar>
                      </template>
                      <v-list-item-title class="font-weight-medium text-body-1 mb-1">{{ req.tituloRequerimiento }}</v-list-item-title>
                      <v-list-item-subtitle class="text-caption">ID: {{ req.requerimientoId }} | Creado: {{ formatRelativeTime(req.fechaCreacion) }}</v-list-item-subtitle>
                      <template v-slot:append>
                        <v-chip :color="getEstadoColor(req.estadoNombre)" size="small" variant="tonal" label class="mr-2">{{ req.estadoNombre }}</v-chip>
                        <v-icon color="grey-darken-1">mdi-chevron-right</v-icon>
                      </template>
                    </v-list-item>
                    <v-divider v-if="index < recentRequirements.length - 1"></v-divider>
                  </template>
                </template>
                <v-list-item v-else class="text-center text-grey-darken-1 py-10">
                  <p>No hay requerimientos recientes.</p>
                </v-list-item>
              </v-list>
            </v-window-item>
            <!-- Pestaña Vacaciones -->
            <v-window-item value="vacaciones">
              <v-card-title class="d-flex align-center text-h6 font-weight-medium text-grey-darken-2 py-3">
                Estado de Mis Solicitudes
                <v-spacer></v-spacer>
                <v-btn variant="text" color="primary" size="small" :to="{ name: 'gestionSolicitudVacaciones' }" class="text-capitalize">Ver todas</v-btn>
              </v-card-title>
              <v-card-text v-if="misSolicitudes.length > 0">
                <VueApexCharts type="donut" height="320" :options="chartEstadoOptions" :series="chartEstadoSeries"></VueApexCharts>
              </v-card-text>
              <v-card-text v-else class="text-center text-grey-darken-1 py-10">
                <p>No tienes solicitudes de vacaciones para mostrar.</p>
              </v-card-text>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>

      <!-- Columna Derecha: Tareas Pendientes (Aprobaciones y Notificaciones) -->
      <v-col cols="12" md="5">
        <v-card rounded="xl" class="elevation-2 fill-height">
          <v-tabs v-model="tabAcciones" bg-color="transparent" color="primary">
            <v-tab v-if="esJefeAprobador" value="aprobaciones">Aprobaciones</v-tab>
            <v-tab value="notificaciones">Notificaciones</v-tab>
          </v-tabs>
          <v-divider></v-divider>
          <v-window v-model="tabAcciones">
            <!-- Pestaña Aprobaciones (Solo Jefes) -->
            <v-window-item v-if="esJefeAprobador" value="aprobaciones">
              <v-card-title class="d-flex align-center text-subtitle-1 font-weight-medium text-grey-darken-2 py-2">
                Vacaciones por Aprobar
              </v-card-title>
              <v-list lines="two" class="py-0">
                <template v-if="solicitudesPorAprobar.length > 0">
                  <template v-for="(req, index) in solicitudesPorAprobar.slice(0, 4)" :key="req.id">
                    <v-list-item @click="irAGestionar(req)" class="py-3 list-item-hover">
                      <template v-slot:prepend>
                        <v-avatar color="blue-grey-lighten-4" size="40" class="mr-3">
                          <span class="text-blue-grey-darken-2 font-weight-bold">{{ req.nombreEmpleado.charAt(0) }}</span>
                        </v-avatar>
                      </template>
                      <v-list-item-title class="font-weight-medium">{{ req.nombreEmpleado }}</v-list-item-title>
                      <v-list-item-subtitle>{{ req.diasSolicitados }} días ({{ formatDate(req.fechaInicio) }})</v-list-item-subtitle>
                      <template v-slot:append><v-icon color="grey-darken-1">mdi-chevron-right</v-icon></template>
                    </v-list-item>
                    <v-divider v-if="index < solicitudesPorAprobar.slice(0, 4).length - 1"></v-divider>
                  </template>
                </template>
                <v-list-item v-else class="text-center text-grey-darken-1 py-10">
                  <p>No hay solicitudes pendientes.</p>
                </v-list-item>
              </v-list>
              <v-card-actions v-if="solicitudesPorAprobar.length > 0" class="pa-2">
                <v-btn variant="text" color="primary" block :to="{ name: 'gestionAprobacionVacaciones' }" class="text-capitalize">Gestionar todas</v-btn>
              </v-card-actions>
            </v-window-item>
            <!-- Pestaña Notificaciones -->
            <v-window-item value="notificaciones">
              <v-card-title class="text-subtitle-1 font-weight-medium text-grey-darken-2 py-2">Notificaciones Pendientes</v-card-title>
              <v-list lines="one" class="py-0" v-if="unreadNotifications.length > 0">
                <template v-for="(notif, index) in unreadNotifications.slice(0, 5)" :key="notif.id">
                  <v-list-item @click="irANotificacion(notif)" class="py-3 list-item-hover">
                    <template v-slot:prepend>
                      <v-icon :color="getNotifColor(notif.type)" class="mr-3" size="28">{{ getNotifIcon(notif.type) }}</v-icon>
                    </template>
                    <v-list-item-title class="text-body-2 font-weight-medium">{{ notif.title }}</v-list-item-title>
                    <v-list-item-subtitle class="text-caption">{{ formatRelativeTime(notif.timestamp) }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-divider v-if="index < unreadNotifications.slice(0, 5).length - 1"></v-divider>
                </template>
              </v-list>
              <v-card-text v-else class="text-center text-grey-darken-1 py-10">
                <p>No tienes notificaciones pendientes.</p>
              </v-card-text>
            </v-window-item>
          </v-window>
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
import SolicitudVacacionesService from '@/services/SolicitudVacacionesService';
import RequerimientoService from '@/services/RequerimientoService';
import VueApexCharts from 'vue3-apexcharts';

const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const esJefeAprobador = computed(() => authStore.currentUser?.rol === 'JefeAprobador');

// --- STATE ---
const tabPrincipal = ref('requerimientos');
const tabAcciones = ref(esJefeAprobador.value ? 'aprobaciones' : 'notificaciones');
const loading = ref(true);

// Data
const misSolicitudes = ref([]);
const solicitudesPorAprobar = ref([]);
const recentRequirements = ref([]);
const dashboardKPIs = ref([]);

// --- CARGA DE DATOS ---
onMounted(async () => {
  loading.value = true;
  await cargarDatosDashboard();
  loading.value = false;
});

const cargarDatosDashboard = async () => {
  try {
    const promesas = [
      SolicitudVacacionesService.getMisSolicitudes(),
      RequerimientoService.getMisRequerimientosRecientes()
    ];
    if (esJefeAprobador.value) {
      promesas.push(SolicitudVacacionesService.getMisPentientes());
    }
    
    const [resMisSolicitudes, resRecentReqs, resPorAprobar] = await Promise.all(promesas);

    misSolicitudes.value = resMisSolicitudes || [];
    recentRequirements.value = resRecentReqs || [];
    if (resPorAprobar) {
      solicitudesPorAprobar.value = resPorAprobar;
    }

    prepararKPIs();
    prepararGraficos();
  } catch (error) {
    console.error("Error al cargar datos del dashboard:", error);
  }
};

// --- KPIs ---
const prepararKPIs = () => {
  const kpis = [];
  
  if (esJefeAprobador.value) {
    kpis.push({
      title: 'Vacaciones por Aprobar',
      value: solicitudesPorAprobar.value.length,
      icon: 'mdi-account-clock-outline',
      color: 'orange-darken-2'
    });
  }

  kpis.push({
    title: 'Requerimientos Pendientes',
    value: recentRequirements.value.filter(r => r.estadoNombre?.toLowerCase().includes('pendiente')).length,
    icon: 'mdi-clipboard-text-clock-outline',
    color: 'blue'
  });

  kpis.push({
    title: 'Vacaciones Pendientes',
    value: misSolicitudes.value.filter(s => s.estado.toLowerCase() === 'pendiente').length,
    icon: 'mdi-clock-alert-outline',
    color: 'deep-purple-accent-3'
  });

  kpis.push({
    title: 'Días Aprobados (Año)',
    value: misSolicitudes.value.filter(s => s.estado.toLowerCase() === 'aprobada').reduce((acc, s) => acc + s.diasSolicitados, 0),
    icon: 'mdi-calendar-check-outline',
    color: 'teal'
  });

  dashboardKPIs.value = kpis;
};

// --- GRÁFICOS ---
const chartEstadoSeries = ref([]);
const chartEstadoOptions = ref({
  chart: { type: 'donut' },
  labels: [],
  colors: ['#FF9800', '#4CAF50', '#F44336'], // Naranja, Verde, Rojo
  legend: { position: 'bottom' },
  responsive: [{ breakpoint: 480, options: { chart: { width: '100%' }, legend: { position: 'bottom' } } }]
});

const prepararGraficos = () => {
  const estados = { Pendiente: 0, Aprobada: 0, Rechazada: 0 };
  misSolicitudes.value.forEach(s => {
    const estadoNormalizado = s.estado.charAt(0).toUpperCase() + s.estado.slice(1).toLowerCase();
    if (estadoNormalizado in estados) {
      estados[estadoNormalizado]++;
    }
  });
  chartEstadoOptions.value.labels = Object.keys(estados);
  chartEstadoSeries.value = Object.values(estados);
};

// --- NOTIFICACIONES ---
const unreadNotifications = computed(() => {
  return notificationStore.notifications
    .filter(n => !n.isRead)
    .sort((a, b) => new Date(b.timestamp || b.fechaCreacion) - new Date(a.timestamp || a.fechaCreacion));
});

// --- HELPERS ---
const formatRelativeTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
  if (diffSeconds < 60) return `hace ${diffSeconds}s`;
  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return `hace ${diffMinutes}m`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `hace ${diffHours}h`;
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
};

const getEstadoColor = (estado) => (estado?.toLowerCase().includes('aprobado') ? 'green' : estado?.toLowerCase().includes('pendiente') ? 'orange' : 'red');
const getEstadoIcon = (estado) => (estado?.toLowerCase().includes('aprobado') ? 'mdi-check' : estado?.toLowerCase().includes('pendiente') ? 'mdi-clock-outline' : 'mdi-close');
const getNotifIcon = (type) => (type?.toLowerCase().includes('aprobado') ? 'mdi-check-circle-outline' : type?.toLowerCase().includes('rechazado') ? 'mdi-close-circle-outline' : 'mdi-bell-ring-outline');
const getNotifColor = (type) => (type?.toLowerCase().includes('aprobado') ? 'success' : type?.toLowerCase().includes('rechazado') ? 'error' : 'primary');

// --- NAVEGACIÓN ---
const verDetalleRequerimiento = (id) => router.push({ name: 'gestionRequerimientos', query: { accionModal: 'ver', idRequerimiento: id } });
const irAGestionar = () => router.push({ name: 'gestionAprobacionVacaciones' });
const irANotificacion = (notif) => {
  if (notif.link) router.push(notif.link);
  if (!notif.isRead) notificationStore.markAsRead(notif.id);
};
</script>

<style scoped>
.hover-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.08) !important;
}
.list-item-hover:hover {
  background-color: rgba(0,0,0,0.04);
  cursor: pointer;
}
</style>
