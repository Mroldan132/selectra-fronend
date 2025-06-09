<template>
  <v-row>
    <v-col cols="12" sm="4">
      <v-select
        v-model="selectedDepartamento"
        :items="departamentos"
        :label="`${labelPrefix} Departamento`"
        item-title="nombre"
        item-value="ubigeoId"
        variant="outlined"
        density="compact"
        :rules="rules"
        :loading="loading.departamentos"
        clearable
      />
    </v-col>
    <v-col cols="12" sm="4">
      <v-select
        v-model="selectedProvincia"
        :items="provincias"
        :label="`${labelPrefix} Provincia`"
        item-title="nombre"
        item-value="ubigeoId"
        variant="outlined"
        density="compact"
        :rules="rules"
        :disabled="!selectedDepartamento"
        :loading="loading.provincias"
        clearable
      />
    </v-col>
    <v-col cols="12" sm="4">
      <v-select
        v-model="selectedDistrito"
        :items="distritos"
        :label="`${labelPrefix} Distrito`"
        item-title="nombre"
        item-value="ubigeoId"
        variant="outlined"
        density="compact"
        :rules="rules"
        :disabled="!selectedProvincia"
        :loading="loading.distritos"
        clearable
      />
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, watch, onMounted, reactive } from 'vue';
import DatosPersonalesService from '@/services/DatosPersonalesService';

const props = defineProps({
  modelValue: String,
  labelPrefix: { type: String, default: '' },
  rules: { type: Array, default: () => [] }
});
const emit = defineEmits(['update:modelValue']);

// --- ESTADO ---
const departamentos = ref([]);
const provincias = ref([]);
const distritos = ref([]);

const selectedDepartamento = ref(null);
const selectedProvincia = ref(null);
const selectedDistrito = ref(null);

const loading = reactive({
  departamentos: false,
  provincias: false,
  distritos: false
});

const isSettingUbigeo = ref(false);

// --- WATCHERS ---

watch(() => props.modelValue, async (newUbigeo) => {
  const ubigeo = newUbigeo ? String(newUbigeo).trim() : null;
  // No hacer nada si el valor no ha cambiado realmente
  if (ubigeo === selectedDistrito.value) return;

  if (ubigeo && ubigeo.length === 6) {
    isSettingUbigeo.value = true;
    try {
      selectedDepartamento.value = ubigeo.substring(0, 2);
      selectedProvincia.value = ubigeo.substring(0, 4);
      selectedDistrito.value = ubigeo;

      const depId = selectedDepartamento.value;
      const provId = selectedProvincia.value;

      loading.provincias = true;
      loading.distritos = true;
      
      const [provinciasData, distritosData] = await Promise.all([
        DatosPersonalesService.getProvincias(depId),
        DatosPersonalesService.getDistritos(provId)
      ]);
      
      provincias.value = provinciasData;
      distritos.value = distritosData;

      
    } catch(error) {
      console.error("Error al cargar el ubigeo completo:", error);
    }
    finally {
      isSettingUbigeo.value = false;
      loading.provincias = false;
      loading.distritos = false;
    }
  } else {
    selectedDepartamento.value = null;
  }
}, { immediate: true });

watch(selectedDepartamento, async (newVal) => {
  if (isSettingUbigeo.value) return;

  // Limpiar selecciones y listas hijas
  provincias.value = [];
  distritos.value = [];
  selectedProvincia.value = null;
  selectedDistrito.value = null;

  if (newVal) {
    loading.provincias = true;
    try {
      provincias.value = await DatosPersonalesService.getProvincias(newVal);
    } finally {
      loading.provincias = false;
    }
  }
});

// Watcher para cuando el USUARIO cambia la provincia
watch(selectedProvincia, async (newVal) => {
  if (isSettingUbigeo.value) return;
  
  distritos.value = [];
  selectedDistrito.value = null;
  
  if (newVal) {
    loading.distritos = true;
    try {
      distritos.value = await DatosPersonalesService.getDistritos(newVal);
    } finally {
      loading.distritos = false;
    }
  }
});

// Watcher para emitir el valor final al componente padre
watch(selectedDistrito, (newVal) => {
  // Solo emitir si el valor es diferente al del prop para evitar bucles infinitos
  if (newVal !== props.modelValue) {
    emit('update:modelValue', newVal);
  }
});

// Carga inicial solo de departamentos
onMounted(async () => {
  loading.departamentos = true;
  try {
    departamentos.value = await DatosPersonalesService.getDepartamentos();
  } finally {
    loading.departamentos = false;
  }
});
</script>