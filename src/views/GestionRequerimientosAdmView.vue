<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card class="elevation-2" rounded="xl">
          <v-card-title class="d-flex align-center">
            <span class="text-h5 font-weight-bold">Requerimientos Aprobados</span>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="ofertas"
              :loading="loading"
              class="elevation-1"
              item-key="id"
              loading-text="Cargando requerimientos..."
              no-data-text="No hay requerimientos aprobados"
              dense
            >
              <template #item.acciones="{ item }">
                <v-btn color="primary" @click="verDetalle(item)" size="small" rounded="lg">
                  Generar Oferta
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import OfertasLaborales from '@/services/OfertasLaboralesService'

const ofertas = ref([])
const loading = ref(true)

const headers = [
  { title: 'Nombre', key: 'nombreRequerimiento', sortable: true },
  { title: 'Solicitante', key: 'solicitante', sortable: true },
  { title: 'Aprobador', key: 'aprobador', sortable: true },
  { title: 'Fecha Solicitud', key: 'fechaSolicitud', sortable: true },
  { title: 'Fecha Aprobación', key: 'fechaAprobacion', sortable: true },
  { title: 'Acciones', key: 'acciones', sortable: false, align: 'center', width: '160px' }
]

onMounted(async () => {
  try {
    ofertas.value = await OfertasLaborales.getRequerimientosAprobados()
  } catch (e) {
    ofertas.value = []
  } finally {
    loading.value = false
  }
})

function verDetalle(oferta) {
  // Lógica para ver detalle o generar oferta
  alert(`Detalle de: ${oferta.nombreRequerimiento}`)
}
</script>