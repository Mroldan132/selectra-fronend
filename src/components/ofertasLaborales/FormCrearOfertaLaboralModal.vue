<template>
  <v-dialog v-model="visibleLocal" max-width="800px" persistent>
    <v-card rounded="xl">
      <v-toolbar color="primary" dark flat>
        <v-icon class="ml-4">mdi-briefcase-plus-outline</v-icon>
        <v-toolbar-title class="font-weight-medium">
          {{ form.ofertaId ? 'Editar Oferta Laboral' : 'Generar Oferta Laboral' }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="cerrar">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-form ref="formRef" @submit.prevent="guardarOfertaLaboral">
        <v-card-text class="pa-0">
          <v-tabs v-model="tab" bg-color="grey-lighten-4" grow>
            <v-tab value="details">Detalles del Puesto</v-tab>
            <v-tab value="conditions">Condiciones y Ubicación</v-tab>
            <v-tab value="requirements">Requisitos</v-tab>
          </v-tabs>

          <v-window v-model="tab">
            <v-window-item value="details">
              <v-container class="pa-5">
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="form.titulo"
                      label="Título de la oferta"
                      variant="outlined"
                      :rules="[rules.required]"
                      autofocus
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-textarea v-model="form.descripcion" label="Descripción del puesto" variant="outlined" rows="4" />
                  </v-col>
                   <v-col cols="12">
                    <v-textarea v-model="form.funciones" label="Funciones principales" variant="outlined" rows="4" />
                  </v-col>
                </v-row>
              </v-container>
            </v-window-item>

            <v-window-item value="conditions">
              <v-container class="pa-5">
                <v-row>
                  <v-col cols="12" md="6">
                     <v-text-field
                      v-model.number="form.sueldoOfrecido"
                      label="Sueldo ofrecido (opcional)"
                      variant="outlined"
                      type="number"
                      prepend-inner-icon="mdi-currency-usd"
                      prefix="S/ "
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-menu v-model="dateMenu" :close-on-content-click="false" transition="scale-transition" offset-y>
                      <template v-slot:activator="{ props }">
                        <v-text-field
                          v-model="formattedDate"
                          label="Fecha estimada de ingreso"
                          prepend-inner-icon="mdi-calendar"
                          variant="outlined"
                          readonly
                          v-bind="props"
                        />
                      </template>
                      <v-date-picker v-model="form.fechaEstimadaIngreso" @update:model-value="dateMenu = false" hide-header />
                    </v-menu>
                  </v-col>
                   <v-col cols="12">
                    <v-textarea v-model="form.beneficios" label="Beneficios ofrecidos" variant="outlined" rows="3" />
                  </v-col>
                   <v-col cols="12" md="6">
                    <v-text-field v-model="form.direccionTrabajo" label="Dirección del trabajo" variant="outlined" prepend-inner-icon="mdi-map-marker-outline"/>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="form.referenciaUbicacion" label="Referencia de ubicación" variant="outlined" prepend-inner-icon="mdi-map-marker-path"/>
                  </v-col>
                </v-row>
              </v-container>
            </v-window-item>

            <v-window-item value="requirements">
               <v-container class="pa-5">
                <v-row>
                   <v-col cols="12" md="6">
                    <v-select
                      v-model="form.areaId"
                      :items="areas"
                      item-value="areaId"
                      item-title="nombreArea"
                      label="Área"
                      variant="outlined"
                      :rules="[rules.required]"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="form.tipoPregunta"
                      label="Tipo de Pregunta"
                      type="number"
                      variant="outlined"
                      :rules="[v => v === 1 || v === 2 || 'Debe ingresar 1 o 2']"
                      min="1"
                      max="2"
                      required
                    />
                  </v-col> 
   

                  <v-col cols="12" md="6">
                    <v-select
                      v-model="form.cargoId"
                      :items="cargos"
                      item-value="cargoId"
                      item-title="nombreCargo"
                      label="Cargo"
                      variant="outlined"
                      :rules="[rules.required]"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-textarea v-model="form.competencias" label="Competencias requeridas" variant="outlined" rows="4" />
                  </v-col>
                </v-row>
              </v-container>
            </v-window-item>
          </v-window>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="grey-darken-1" @click="cerrar">Cancelar</v-btn>
          <v-btn
            color="primary"
            variant="tonal"
            type="submit"
            :loading="isSaving"
          >
            Guardar Oferta
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import AreaService from '@/services/AreaService'
import CargoService from '@/services/CargoService'
import OfertasLaboralesService from '@/services/OfertasLaboralesService'

const props = defineProps({
  modelValue: Boolean,
  oferta: Object
})

const emit = defineEmits(['update:modelValue', 'saved', 'error'])

// --- State ---
const visibleLocal = ref(props.modelValue)
const formRef = ref(null) // Referencia al v-form
const isSaving = ref(false)
const tab = ref('details') // Pestaña inicial
const dateMenu = ref(false) // Control del menú de fecha

const form = ref({
  requimientoId: null,
  ofertaId: null,
  titulo: '',
  descripcion: '',
  funciones: '',
  beneficios: '',
  competencias: '',
  sueldoOfrecido: null,
  areaId: null,
  cargoId: null,
  tipoPregunta: 1,
  responsable: '',
  direccionTrabajo: '',
  referenciaUbicacion: '',
  fechaEstimadaIngreso: null
})

const areas = ref([])
const cargos = ref([])
// const tipoPreguntas = ref([]); 



// --- Reglas de Validación ---
const rules = {
  required: value => !!value || 'Este campo es obligatorio.'
}

// --- Computed properties ---
const formattedDate = computed(() => {
  return form.value.fechaEstimadaIngreso ? new Date(form.value.fechaEstimadaIngreso).toLocaleDateString('es-ES') : ''
})

// --- Watchers ---
watch(() => props.modelValue, val => {
  visibleLocal.value = val
  if (val) {
    cargarOferta()
    // Resetear la pestaña y validaciones al abrir
    tab.value = 'details'
    formRef.value?.resetValidation()
  }
})

watch(visibleLocal, val => {
  if (!val) {
    emit('update:modelValue', false)
  }
})

// --- Lifecycle Hooks ---
onMounted(async () => {
  try {
    areas.value = await AreaService.getAreas()
    cargos.value = await CargoService.getCargos()
  } catch (error) {
    console.error("Error al cargar datos iniciales:", error)
    emit('error', 'No se pudieron cargar las áreas y cargos.')
  }
})

// --- Methods ---
function cargarOferta() {
  if (props.oferta) {
    const val = props.oferta
    form.value = {
      requerimientoId: val.requerimientoId ?? null,
      ofertaId: val.ofertaId ?? null,
      titulo: val.titulo ?? '',
      descripcion: val.descripcion ?? '',
      funciones: val.funciones ?? '',
      beneficios: val.beneficios ?? '',
      competencias: val.competencias ?? '',
      sueldoOfrecido: val.sueldoOfrecido ?? null,
      areaId: val.areaId ?? null,
      cargoId: val.cargoId ?? null,
      responsable: val.responsable ?? '', // Se mantiene en el modelo, no en el template
      direccionTrabajo: val.direccionTrabajo ?? '',
      referenciaUbicacion: val.referenciaUbicacion ?? '',
      fechaEstimadaIngreso: val.fechaEstimadaIngreso ? new Date(val.fechaEstimadaIngreso) : null
    }
  } else {
    resetForm()
  }
}

function resetForm() {
  form.value = {
    requimientoId: null,
    ofertaId: null,
    titulo: '',
    descripcion: '',
    funciones: '',
    beneficios: '',
    competencias: '',
    sueldoOfrecido: null,
    areaId: null,
    cargoId: null,
    responsable: '',
    direccionTrabajo: '',
    referenciaUbicacion: '',
    fechaEstimadaIngreso: null
  }
}

function cerrar() {
  visibleLocal.value = false
  // Es buena práctica resetear el formulario al cerrar por si se vuelve a abrir para crear uno nuevo
  setTimeout(resetForm, 200);
}

const guardarOfertaLaboral = async () => {
  const { valid } = await formRef.value.validate()

  if (!valid) {
    emit('error', 'Por favor, complete los campos obligatorios.')
    return
  }

  isSaving.value = true
  try {
    // Formatear la fecha a YYYY-MM-DD antes de enviar si es necesario por el backend
    const payload = { ...form.value }
    if (payload.fechaEstimadaIngreso instanceof Date) {
        payload.fechaEstimadaIngreso = payload.fechaEstimadaIngreso.toISOString().slice(0, 10);
    }
    
    if(form.value.ofertaId){
      await OfertasLaboralesService.actualizarOfertaLaboral(payload)
    }else{
      await OfertasLaboralesService.generarOfertaLaboral(payload)
    }
    const message = form.value.ofertaId ? 'Oferta laboral actualizada correctamente.' : 'Oferta laboral creada y enviada satisfactoriamente.'
    emit('saved', message)
    cerrar()
  } catch (error) {
    console.error('Error al guardar la oferta laboral:', error)
    emit('error', 'Ocurrió un error al guardar la oferta.')
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.v-card-actions {
  border-top: 1px solid rgba(0,0,0,0.08);
}
</style>