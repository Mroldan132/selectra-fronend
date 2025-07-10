<template>
  <div>
    <v-card-text class="pa-5">
      <p class="text-body-1 mb-6">
        Bienvenido a tu portal de aspirante. Aquí podrás encontrar nuevas oportunidades laborales,
        gestionar tus postulaciones y mantener tu perfil actualizado.
      </p>

      <h3 class="text-h6 mb-4 text-primary">Accesos Rápidos:</h3>
      <v-row dense class="mb-8">
        <v-col
          v-for="action in quickActions"
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
              :to="action.to"
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

      <h3 class="text-h6 mb-4 text-primary">Tu Actividad en Resumen:</h3>
      <v-row>
        <v-col cols="12" md="6">
          <v-card rounded="xl" class="elevation-2 fill-height">
            <v-card-title class="font-weight-medium text-grey-darken-2">
              Estado de Mis Postulaciones
            </v-card-title>
            <v-card-text>
              <VueApexCharts
                type="donut"
                height="350"
                :options="donutChartOptions"
                :series="donutChartSeries"
              ></VueApexCharts>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card rounded="xl" class="elevation-2 fill-height">
            <v-card-title class="font-weight-medium text-grey-darken-2">
              Postulaciones por Área
            </v-card-title>
            <v-card-text>
              <VueApexCharts
                type="bar"
                height="350"
                :options="barChartOptions"
                :series="barChartSeries"
              ></VueApexCharts>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

    </v-card-text>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

// --- DATA PARA ACCESOS RÁPIDOS ---
const quickActions = ref([
  {
    title: 'Ver Ofertas de Empleo',
    subtitle: 'Encuentra tu próximo desafío',
    icon: 'mdi-briefcase-search-outline',
    color: 'primary',
    to: { name: 'portalOfertas' }
  },
  {
    title: 'Mis Postulaciones',
    subtitle: 'Revisa el estado de tus procesos',
    icon: 'mdi-file-check-outline',
    color: 'green',
    to: { name: 'gestionMisOfertas' }
  },
//   {
//     title: 'Mi Perfil / CV',
//     subtitle: 'Mantén tu información actualizada',
//     icon: 'mdi-account-edit-outline',
//     color: 'orange',
//     to: { name: 'miPerfil' }
//   },
]);


// --- CONFIGURACIÓN PARA GRÁFICO DE DONA (ESTADO DE POSTULACIONES) ---
const donutChartSeries = ref([]);
const donutChartOptions = ref({
  chart: {
    type: 'donut',
  },
  labels: [],
  legend: {
    position: 'bottom'
  },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        width: '100%'
      },
      legend: {
        position: 'bottom'
      }
    }
  }]
});


// --- CONFIGURACIÓN PARA GRÁFICO DE BARRAS (POSTULACIONES POR ÁREA) ---
const barChartSeries = ref([]);
const barChartOptions = ref({
  chart: {
    type: 'bar',
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      horizontal: true,
    }
  },
  dataLabels: {
    enabled: false
  },
  xaxis: {
    categories: [],
  }
});


// --- FUNCIÓN PARA CARGAR LOS DATOS (SIMULADA) ---
const cargarDatosDashboard = async () => {
  // Aquí harías las llamadas a tu API para obtener los datos reales.
  // Por ahora, usaremos datos de ejemplo.

  // Datos para el gráfico de dona
  donutChartSeries.value = [6, 4, 2, 1]; // Datos numéricos
  donutChartOptions.value = {
    ...donutChartOptions.value,
    labels: ['En Revisión', 'Proceso Activo', 'Rechazadas', 'Finalizadas'] // Etiquetas
  };

  // Datos para el gráfico de barras
  barChartSeries.value = [{
    name: 'Postulaciones',
    data: [8, 5, 4, 2]
  }];
  barChartOptions.value = {
    ...barChartOptions.value,
    xaxis: {
      categories: ['Desarrollo Backend', 'Desarrollo Frontend', 'DevOps', 'Data Science']
    }
  };
};


// --- LIFECYCLE HOOK ---
// Llama a la función de carga cuando el componente se monta en la página.
onMounted(() => {
  cargarDatosDashboard();
});

</script>

<style scoped>
.quick-action-card {
  transition: transform 0.2s ease-in-out, background-color 0.2s ease-in-out;
}
.quick-action-card:hover {
  transform: translateY(-3px);
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
}
</style>