<template>
  <v-app>
    <v-main class="bg-grey-lighten-5">
      <v-container fluid class="fill-height">
        <v-card variant="outlined" class="pa-4 w-100">
          <v-card-title class="text-h5 font-weight-bold">
            🌳 Organigrama de la Empresa
          </v-card-title>
          <v-card-subtitle>
            Visualización de la estructura jerárquica de puestos.
          </v-card-subtitle>

          <div v-if="loading" class="d-flex justify-center align-center loading-container">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          </div>

          <div
            v-show="!loading"
            id="organigrama-container"
            class="organigrama-container"
          ></div>

          <!-- Botones de control al pie -->
          <v-card-actions class="justify-center mt-4 flex-wrap gap-2">
            <v-btn
              color="primary"
              icon="mdi-cog-outline"
              title="Configuración"
              @click="abrirConfiguracion"
            ></v-btn>

            <v-btn
              color="primary"
              icon="mdi-file-export-outline"
              title="Exportar como PNG"
              @click="exportarComoPNG"
            ></v-btn>

            <v-btn
              v-if="layoutType === 'tree'"
              color="primary"
              :icon="orientacion === 'horizontal' ? 'mdi-arrow-down' : 'mdi-arrow-right'"
              :title="orientacion === 'horizontal' ? 'Orientación Vertical' : 'Orientación Horizontal'"
              @click="toggleOrientacion"
            ></v-btn>

            <v-btn
              color="primary"
              :icon="layoutType === 'tree' ? 'mdi-chart-bubble' : 'mdi-graph-outline'"
              :title="layoutType === 'tree' ? 'Vista Circular' : 'Vista de Árbol'"
              @click="toggleLayout"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as d3 from 'd3';
import PersonalService from '@/services/PersonalService';

const loading = ref(true);
const orientacion = ref('horizontal');
const layoutType = ref('tree');
let organigramaData = null;
let resizeObserver = null;

/** Construye el árbol jerárquico a partir de datos planos */
function construirArbol(personal) {
  const mapa = {};
  let raiz = null;
  personal.forEach(empleado => mapa[empleado.id] = { ...empleado, children: [] });
  personal.forEach(empleado => {
    if (empleado.jefeDirectoId && mapa[empleado.jefeDirectoId]) {
      mapa[empleado.jefeDirectoId].children.push(mapa[empleado.id]);
    } else {
      raiz = mapa[empleado.id];
    }
  });
  return raiz;
}

/** Renderiza el organigrama según el layout seleccionado */
function dibujarOrganigrama(data) {
  const container = document.getElementById('organigrama-container');
  if (!container || container.clientWidth === 0) return;

  const width = container.clientWidth;
  const height = 800;

  d3.select(container).select('svg').remove();
  const svg = d3.select(container).append('svg')
    .attr('width', width)
    .attr('height', height);

  if (layoutType.value === 'pack') {
    dibujarLayoutPack(svg, data, width, height);
  } else {
    dibujarLayoutTree(svg, data, width, height);
  }
}

/** Layout tipo árbol */
function dibujarLayoutTree(svg, data, width, height) {
  const g = svg.append('g');
  const isVertical = orientacion.value === 'vertical';

  const treeLayout = d3.tree().size(isVertical ? [width - 100, height - 200] : [height - 100, width - 240]);
  const linkGenerator = isVertical
    ? d3.linkVertical().x(d => d.x).y(d => d.y)
    : d3.linkHorizontal().x(d => d.y).y(d => d.x);
  const transform = isVertical ? `translate(50, 50)` : `translate(120, 50)`;

  g.attr('transform', transform);

  const root = d3.hierarchy(data);
  treeLayout(root);

  g.selectAll('path.link')
    .data(root.links())
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('fill', 'none')
    .attr('stroke', '#ccc')
    .attr('stroke-width', 2)
    .attr('d', linkGenerator);

  const node = g.selectAll('g.node')
    .data(root.descendants())
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', d => isVertical ? `translate(${d.x},${d.y})` : `translate(${d.y},${d.x})`);

  node.append('circle')
    .attr('r', 10)
    .attr('fill', '#fff')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 3);

  node.append('text')
    .attr('dy', isVertical ? '2.2em' : '.35em')
    .attr('x', isVertical ? 0 : d => d.children ? -20 : 20)
    .attr('text-anchor', isVertical ? 'middle' : d => d.children ? 'end' : 'start')
    .style('font-size', '14px')
    .text(d => d.data.nombre);
}

/** Layout tipo pack (circular) */
function dibujarLayoutPack(svg, data, width, height) {
  const packLayout = d3.pack().size([width - 20, height - 20]).padding(10); // Aumentamos el padding

  // El método .hierarchy crea la estructura que D3 entiende.
  const root = d3.hierarchy(data)
    // CORRECCIÓN: Hacemos la lógica de .sum() más robusta.
    // Si un nodo no tiene hijos o su array de hijos está vacío, le damos valor 1.
    .sum(d => (d.children && d.children.length > 0) ? 0 : 1)
    .sort((a, b) => b.value - a.value);

  // Verificación en consola (puedes quitar esto después)
  console.log("Datos para el layout Pack:", root.descendants());

  packLayout(root);

  const node = svg.selectAll('g')
    .data(root.descendants())
    .join('g')
    .attr('transform', d => `translate(${d.x},${d.y})`);

  node.append('circle')
    .attr('r', d => d.r)
    .attr('fill', d => d.children ? 'rgba(91, 155, 213, 0.3)' : 'steelblue')
    .attr('stroke', d => d.children ? '#5B9BD5' : '#335185');

  // Solo mostrar texto en nodos que no tienen hijos (empleados)
  node.filter(d => !d.children && d.r > 15)
    .append('text')
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('fill', 'white')
    .style('pointer-events', 'none') // Para que el texto no interfiera con eventos del círculo
    .selectAll('tspan')
    .data(d => d.data.nombre.split(' '))
    .join('tspan')
    .attr('x', 0)
    .attr('y', (d, i, arr) => `${i - arr.length / 2 + 0.8}em`)
    .text(d => d);
}

/** Controles */
function toggleOrientacion() {
  orientacion.value = orientacion.value === 'horizontal' ? 'vertical' : 'horizontal';
  dibujarOrganigrama(organigramaData);
}

function toggleLayout() {
  layoutType.value = layoutType.value === 'tree' ? 'pack' : 'tree';
  dibujarOrganigrama(organigramaData);
}

function abrirConfiguracion() {
  console.log("Abrir configuración (pendiente agregar modal/configuración avanzada)");
}

/** Exporta como PNG */
async function exportarComoPNG() {
  const svgElement = document.querySelector('#organigrama-container svg');
  if (!svgElement) return;

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = svgElement.width.baseVal.value;
    canvas.height = svgElement.height.baseVal.value;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    const link = document.createElement('a');
    link.download = 'organigrama.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

/** Carga inicial y responsividad */
onMounted(async () => {
  loading.value = true;
  try {
    const personal = await PersonalService.organigrama();
    if (!personal || personal.length === 0) throw new Error('No se encontraron datos de personal.');
    organigramaData = construirArbol(personal);
  } finally {
    loading.value = false;
  }

  const container = document.getElementById('organigrama-container');
  if (container) {
    resizeObserver = new ResizeObserver(() => dibujarOrganigrama(organigramaData));
    resizeObserver.observe(container);
  }
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
});
</script>
<style scoped>
.loading-container {
  min-height: 600px;
}

.organigrama-container {
  width: 100%;
  min-height: 600px;
  background-color: #fdfdfd;
}

/* Usamos :deep() para que los estilos lleguen a los elementos de D3 */
:deep(.node circle) {
  cursor: pointer;
  transition: fill 0.2s ease;
}

:deep(.node circle:hover) {
  fill: #f0f8ff;
}

:deep(.node text) {
  font-weight: 500;
  pointer-events: none; /* Evita que el texto interfiera con los clics en el círculo */
}

:deep(.link) {
  transition: stroke 0.2s ease;
}
</style>