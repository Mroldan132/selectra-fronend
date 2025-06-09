<template>
  <v-app id="portal-ofertas">
    <v-navigation-drawer
      permanent
      :width="350"
      app
      class="border-e"
    >
      <v-sheet class="pa-4" color="grey-lighten-4">
        <v-text-field
          v-model="search"
          label="Buscar por cargo, área..."
          variant="solo"
          flat
          prepend-inner-icon="mdi-magnify"
          hide-details
        ></v-text-field>
      </v-sheet>
      <v-divider></v-divider>

      <v-list nav class="pa-2">
        <v-list-subheader>OFERTAS DISPONIBLES ({{ ofertasDisponibles.length }})</v-list-subheader>
        <v-list-item
          v-for="oferta in ofertasDisponibles"
          :key="oferta.id"
          @click="seleccionarOferta(oferta)"
          :active="ofertaSeleccionada && ofertaSeleccionada.id === oferta.id"
          rounded="lg"
          class="mb-2"
          color="primary"
        >
          <v-list-item-title class="font-weight-bold">{{ oferta.titulo }}</v-list-item-title>
          <v-list-item-subtitle class="mt-1">{{ oferta.publicadoPor }}</v-list-item-subtitle>
          <template v-slot:append>
             <v-icon size="small">mdi-chevron-right</v-icon>
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main class="bg-grey-lighten-5">
      <v-container fluid class="pa-0 fill-height">
        <v-responsive class="fill-height">
          <v-fade-transition mode="out-in">
            <div v-if="!ofertaSeleccionada" class="d-flex flex-column align-center justify-center fill-height text-center text-grey-darken-1">
              <v-icon size="80" class="mb-4">mdi-briefcase-search-outline</v-icon>
              <h2 class="text-h5 font-weight-medium">Bienvenido a nuestro portal de empleo</h2>
              <p class="mt-2">Selecciona una oferta de la lista para ver los detalles.</p>
            </div>

            <div v-else class="d-flex flex-column fill-height">
              <v-sheet color="surface" class="pa-6 border-b">
                <div class="d-flex align-center mb-4">
                  <div>
                    <h1 class="text-h4 font-weight-bold text-primary">{{ ofertaSeleccionada.titulo }}</h1>
                    <p class="text-medium-emphasis mt-1">Publicado el {{ ofertaSeleccionada.fechaPublicacion }}</p>
                  </div>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" variant="flat" size="large" prepend-icon="mdi-send-outline">
                    Postularme
                  </v-btn>
                </div>
                <div class="d-flex flex-wrap ga-2 mt-4">
                  <v-chip prepend-icon="mdi-map-marker-outline" variant="tonal" color="secondary">{{ ofertaSeleccionada.ubicacion }}</v-chip>
                  <v-chip prepend-icon="mdi-briefcase-outline" variant="tonal" color="secondary">{{ ofertaSeleccionada.modalidad }}</v-chip>
                  <v-chip prepend-icon="mdi-file-document-outline" variant="tonal" color="secondary">{{ ofertaSeleccionada.tipoContrato }}</v-chip>
                  <v-chip v-if="ofertaSeleccionada.sueldo" prepend-icon="mdi-cash" variant="tonal" color="success">{{ ofertaSeleccionada.sueldo }}</v-chip>
                </div>
              </v-sheet>

              <v-container fluid class="overflow-y-auto pa-6">
                <v-card variant="outlined" class="mb-6">
                  <v-card-item>
                    <v-card-title>Descripción del Puesto</v-card-title>
                  </v-card-item>
                  <v-card-text class="text-body-1" style="line-height: 1.75;">
                    {{ ofertaSeleccionada.descripcionCompleta }}
                  </v-card-text>
                </v-card>

                <v-card variant="outlined" class="mb-6">
                  <v-card-item><v-card-title>Funciones Principales</v-card-title></v-card-item>
                  <v-list-item v-for="(func, i) in ofertaSeleccionada.funciones" :key="i" :title="func">
                    <template v-slot:prepend>
                      <v-icon color="success" class="mr-4">mdi-check-circle-outline</v-icon>
                    </template>
                  </v-list-item>
                </v-card>
                
                 <v-card variant="outlined" class="mb-6">
                  <v-card-item><v-card-title>Beneficios</v-card-title></v-card-item>
                  <v-list-item v-for="(beneficio, i) in ofertaSeleccionada.beneficios" :key="i" :title="beneficio">
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-4">mdi-star-circle-outline</v-icon>
                    </template>
                  </v-list-item>
                </v-card>

                <v-card variant="outlined">
                  <v-card-item><v-card-title>Competencias Requeridas</v-card-title></v-card-item>
                   <v-card-text>
                      <v-chip v-for="(comp, i) in ofertaSeleccionada.competencias" :key="i" class="ma-1">
                        {{ comp }}
                      </v-chip>
                   </v-card-text>
                </v-card>
              </v-container>
            </div>
          </v-fade-transition>
        </v-responsive>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';

const search = ref('');
const ofertaSeleccionada = ref(null);

// --- DATOS FALSOS PARA GUIAR TU API ---
// En el futuro, reemplazarás esto con una llamada a tu API en onMounted.
const ofertasDisponibles = ref([
  {
    id: 1,
    titulo: 'Ingeniero QA - Civil',
    publicadoPor: 'Leandra Anna Malo Alba',
    fechaPublicacion: '06/12/2025',
    ubicacion: 'Lima, Perú',
    modalidad: 'Presencial',
    tipoContrato: 'Tiempo Completo',
    sueldo: 'S/ 5,500 - S/ 6,500',
    descripcionCompleta: 'El Ingeniero QA Civil es el profesional responsable de garantizar que las obras de construcción cumplan con los estándares de calidad establecidos por la empresa, las normativas locales e internacionales, y las especificaciones del proyecto. Este ingeniero supervisa todo el proceso de construcción, asegurando que los materiales, procesos y productos finales sean de alta calidad.',
    funciones: [
      'Crear, implementar y actualizar los procedimientos de control de calidad.',
      'Supervisar la ejecución de las obras para asegurar que se sigan los estándares.',
      'Asegurar que los materiales de construcción cumplan con las especificaciones técnicas.',
      'Coordinar y realizar pruebas de calidad, como ensayos de resistencia de materiales y pruebas de suelo.'
    ],
    beneficios: [
      'Ingreso a planilla con todos los beneficios de ley.',
      'Seguro de vida ley desde el primer día.',
      'Oportunidades de desarrollo profesional y línea de carrera.',
      'Excelente clima laboral y actividades de integración.'
    ],
    competencias: ['Atención al Detalle', 'Resolución de Problemas', 'Comunicación Efectiva', 'Normativa de Construcción', 'Trabajo en Equipo']
  },
  {
    id: 2,
    titulo: 'Administrador de Infraestructura de TI',
    publicadoPor: 'Carlos Ruiz Z.',
    fechaPublicacion: '05/12/2025',
    ubicacion: 'Arequipa, Perú',
    modalidad: 'Híbrido',
    tipoContrato: 'Tiempo Completo',
    sueldo: 'S/ 7,000',
    descripcionCompleta: 'Buscamos un Administrador de Infraestructura de TI para gestionar, mantener y optimizar nuestros servidores, redes y sistemas de almacenamiento. Serás responsable de la seguridad, el rendimiento y la disponibilidad de toda la infraestructura tecnológica de la compañía.',
    funciones: ['Gestión de servidores Windows y Linux.', 'Administración de redes (firewalls, switches, VPN).', 'Monitoreo de rendimiento y seguridad de la infraestructura.', 'Gestión de backups y planes de recuperación ante desastres.'],
    beneficios: ['Trabajo en un entorno tecnológicamente avanzado.', 'Capacitación constante en nuevas tecnologías.', 'EPS cubierta al 80%.'],
    competencias: ['Sistemas Operativos', 'Redes y Seguridad', 'Virtualización (VMware)', 'Cloud (AWS/Azure)', 'Scripting (PowerShell/Bash)']
  },
  {
    id: 3,
    titulo: 'Controlador de Proyectos',
    publicadoPor: 'Ana Torres',
    fechaPublicacion: '04/12/2025',
    ubicacion: 'Trujillo, Perú',
    modalidad: 'Remoto',
    tipoContrato: 'Por Proyecto',
    sueldo: null,
    descripcionCompleta: 'El Controlador de Proyectos es el profesional encargado de supervisar, coordinar y asegurar que un proyecto se complete a tiempo, dentro del presupuesto y cumpliendo con los estándares de calidad requeridos.',
    funciones: ['Elaborar y mantener el cronograma del proyecto.', 'Controlar los costos y el presupuesto asignado.', 'Generar informes de avance y KPIs.', 'Identificar y gestionar riesgos y problemas.'],
    beneficios: ['Flexibilidad de trabajo remoto.', 'Participación en proyectos de alto impacto.', 'Bonos por cumplimiento de objetivos.'],
    competencias: ['MS Project', 'Primavera P6', 'Gestión de Costos', 'Metodología PMI', 'Análisis de Datos']
  }
]);

// --- MÉTODOS ---
const seleccionarOferta = (oferta) => {
  ofertaSeleccionada.value = oferta;
};

// Seleccionar la primera oferta por defecto al cargar la página
if (ofertasDisponibles.value.length > 0) {
  seleccionarOferta(ofertasDisponibles.value[0]);
}

</script>

<style scoped>
#portal-ofertas .v-navigation-drawer__content::-webkit-scrollbar {
  width: 6px;
}
#portal-ofertas .v-navigation-drawer__content::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 3px;
}
</style>