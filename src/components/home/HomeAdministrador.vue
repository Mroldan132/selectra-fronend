<template>
  <div>
    <v-card-text class="pa-5">
      <h3 class="text-h6 mb-4 text-primary">Vistas Importantes:</h3>

      <v-row>
        <v-col cols="12" md="6">
          <v-card rounded="xl" class="elevation-2 fill-height">
            <v-card-title>Cantidad de Personales por Área</v-card-title>
            <v-card-text>
              <VueApexCharts
                type="donut"
                height="350"
                :options="donutChartOptions"
                :series="donutChartSeries"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card rounded="xl" class="elevation-2 fill-height">
            <v-card-title>Cantidad de Personales por Cargo</v-card-title>
            <v-card-text>
              <VueApexCharts
                type="bar"
                height="350"
                :options="barChartOptions"
                :series="barChartSeries"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import VueApexCharts from 'vue3-apexcharts';

// Donut: Personales por Área
const donutChartSeries = ref([]);
const donutChartOptions = ref({
  chart: { type: 'donut' },
  labels: [],
  legend: { position: 'bottom' },
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: { width: '100%' },
        legend: { position: 'bottom' }
      }
    }
  ]
});

// Bar: Personales por Cargo
const barChartSeries = ref([]);
const barChartOptions = ref({
  chart: { type: 'bar' },
  plotOptions: {
    bar: { borderRadius: 4, horizontal: true }
  },
  xaxis: { categories: [] },
  dataLabels: { enabled: false }
});


const cargarResumenAdministrador = async () => {
  try {
    const [porAreaRes, porCargoRes] = await Promise.all([
      axios.get('/api/personales/resumenPorArea'),
      axios.get('/api/personales/resumenPorCargo')
    ]);

    console.log("Respuesta resumenPorArea:", porAreaRes.data);
    console.log("Respuesta resumenPorCargo:", porCargoRes.data);

    // --- Donut Chart ---
    const datosArea = Array.isArray(porAreaRes.data)
      ? porAreaRes.data
      : porAreaRes.data.resultado || [];

    donutChartSeries.value = datosArea.map(item => item.cantidad);
    donutChartOptions.value.labels = datosArea.map(item => item.nombre);

    // --- Bar Chart ---
    const datosCargo = Array.isArray(porCargoRes.data)
      ? porCargoRes.data
      : porCargoRes.data.resultado || [];

    barChartSeries.value = [{
      name: 'Personales',
      data: datosCargo.map(item => item.cantidad)
    }];
    barChartOptions.value.xaxis.categories = datosCargo.map(item => item.nombre);

  } catch (error) {
    console.error('Error al cargar resumen del administrador:', error);
  }
};


onMounted(() => {
  cargarResumenAdministrador();
});
</script>
