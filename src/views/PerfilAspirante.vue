<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="9">
        <v-card :loading="loadingForm" rounded="xl">
          <v-toolbar color="primary" dark flat>
            <v-icon class="ml-4 mr-3">mdi-account-edit</v-icon>
            <v-toolbar-title class="font-weight-medium">Editar Mi Perfil</v-toolbar-title>
          </v-toolbar>

          <v-form ref="formRef">
            <v-card-text class="pa-5">
              <h3 class="text-h6 mb-6">Información de la Cuenta</h3>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field v-model="formData.codUsuario" label="Código de Usuario" variant="outlined" density="compact" disabled />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.clave"
                    label="Nueva Clave (opcional)"
                    :rules="formData.clave ? [rules.min8] : []"
                    :type="showPassword ? 'text' : 'password'"
                    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="showPassword = !showPassword"
                    variant="outlined"
                    density="compact"
                    hint="Déjalo en blanco para no cambiar la clave"
                    persistent-hint
                  />
                </v-col>
              </v-row>

              <v-divider class="my-6"></v-divider>

              <h3 class="text-h6 mb-6">Datos de Identificación</h3>
              <v-row>
                <v-col cols="12" sm="4"><v-text-field v-model="formData.nombres" label="Nombres" :rules="[rules.required]" variant="outlined" density="compact" /></v-col>
                <v-col cols="12" sm="4"><v-text-field v-model="formData.apellidoPaterno" label="Apellido Paterno" :rules="[rules.required]" variant="outlined" density="compact" /></v-col>
                <v-col cols="12" sm="4"><v-text-field v-model="formData.apellidoMaterno" label="Apellido Materno" :rules="[rules.required]" variant="outlined" density="compact" /></v-col>
                <v-col cols="12" sm="4">
                  <v-select v-model="formData.tipoDocumentoId" :items="tiposDocumento" label="Tipo Documento" item-title="nombreTipoDocumento" item-value="tipoDocumentoId" :rules="[rules.required]" variant="outlined" density="compact" />
                </v-col>
                <v-col cols="12" sm="4"><v-text-field v-model="formData.numeroDocumento" label="N° Documento" :rules="[rules.required]" variant="outlined" density="compact" /></v-col>
                <v-col cols="12" sm="4">
                  <v-menu v-model="dateMenuNacimiento" :close-on-content-click="false" transition="scale-transition">
                    <template v-slot:activator="{ props }">
                      <v-text-field v-model="formattedFechaNacimiento" label="Fecha Nacimiento" prepend-inner-icon="mdi-calendar" variant="outlined" readonly v-bind="props" density="compact"/>
                    </template>
                    <v-date-picker v-model="formData.fechaNacimiento" @update:model-value="dateMenuNacimiento = false" hide-header :max="maxBirthDate" />
                  </v-menu>
                </v-col>
              </v-row>

              <v-divider class="my-6"></v-divider>

              <h3 class="text-h6 mb-2">Ubicación e Información de Contacto</h3>
              <UbigeoSelector v-model="formData.ubigeoNacimiento" label-prefix="Nacimiento:" :rules="[rules.required]"/>
              <UbigeoSelector v-model="formData.ubigeoResidencia" label-prefix="Residencia:" :rules="[rules.required]"/>
              <v-row>
                <v-col cols="12" sm="12">
                  <v-select v-model="formData.nivelAcademicoId" :items="nivelesAcademicos" label="Nivel Academico" item-title="nombre" item-value="nivelAcademicoId" :rules="[rules.required]" variant="outlined" density="compact" />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="6"><v-text-field v-model="formData.telefono" label="Teléfono" variant="outlined" density="compact" /></v-col>
                <v-col cols="12" sm="6"><v-text-field v-model="formData.emailPersonal" label="Email Personal" :rules="[rules.email]" variant="outlined" density="compact" /></v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="8">
                  <v-file-input
                    v-model="cvFile"
                    label="Actualizar CV (PDF)"
                    accept=".pdf"
                    prepend-icon="mdi-file-pdf-box"
                    variant="outlined"
                    density="compact"
                    @change="handleCVUpload"
                    show-size
                  />
                </v-col>
                <v-col cols="12" sm="4" class="d-flex align-center">
                  <v-btn
                    v-if="formData.pathCV"
                    color="primary"
                    variant="outlined"
                    size="small"
                    @click="previewCV"
                    prepend-icon="mdi-eye"
                  >
                    Vista Previa
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-form>

          <v-divider></v-divider>

          <v-card-actions class="pa-4 bg-grey-lighten-5">
            <v-alert v-if="errorForm" type="error" density="compact" variant="tonal" class="mr-4" :text="errorForm" />
            <v-spacer></v-spacer>
            <v-btn color="success" variant="flat" @click="guardarPerfil" :loading="loadingForm">
              Guardar Cambios
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.visible" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import UbigeoSelector from '@/components/utils/UbigeoSelector.vue'; 
import UsuarioService from '@/services/UsuarioService';
import AspiranteService from '@/services/AspiranteService';
import NivelAcademicosService from '@/services/NivelAcademicosService';
import DatosPersonalesService from '@/services/DatosPersonalesService';
import { useRouter } from 'vue-router';

// --- Estado del Componente (sin lógica de stepper) ---
const formRef = ref(null);
const loadingForm = ref(true);
const errorForm = ref('');
const showPassword = ref(false);
const dateMenuNacimiento = ref(false);
const cvFile = ref(null);
const router = useRouter();

const snackbar = reactive({
  visible: false,
  text: '',
  color: 'success'
});

const formData = reactive({
  //... todos tus campos
});

// --- Estado para Selects y Datos Externos ---
const tiposDocumento = ref([]);
const nivelesAcademicos = ref([]);

// --- Reglas de Validación (sin cambios) ---
const rules = {
  required: v => !!v || 'Este campo es requerido.',
  min8: v => (v && v.length >= 8) || 'La clave debe tener al menos 8 caracteres.',
  max50: v => (v && v.length <= 50) || 'Máximo 50 caracteres.',
  email: v => /.+@.+\..+/.test(v) || 'Email no válido.',
};

// --- Computed Properties (sin cambios) ---
const formatDate = (date) => date ? new Date(date).toLocaleDateString('es-ES') : '';
const formattedFechaNacimiento = computed(() => formatDate(formData.fechaNacimiento));
const maxBirthDate = computed(() => new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().slice(0, 10));

// --- MÉTODOS (sin 'siguientePaso') ---

const showSnackbar = (text, color = 'success') => {
  snackbar.text = text;
  snackbar.color = color;
  snackbar.visible = true;
};

// Funciones de CV (sin cambios)
const handleCVUpload = async (event) => { /* ... */ };
const convertToBase64 = (file) => { /* ... */ };
const previewCV = () => { /* ... */ };

// Función de guardado (sin cambios en su lógica interna)
const guardarPerfil = async () => {
  errorForm.value = '';
  const { valid } = await formRef.value.validate();
  if (!valid) {
    errorForm.value = 'Faltan campos obligatorios por completar.';
    return;
  }

  loadingForm.value = true;
  try {
    const payload = { ...formData };
    if (!payload.clave) { delete payload.clave; }
    if (payload.fechaNacimiento instanceof Date) {
        payload.fechaNacimiento = payload.fechaNacimiento.toISOString().slice(0, 10);
    }
    await AspiranteService.updateAspirante(payload.aspiranteId, payload);
    showSnackbar('Perfil actualizado con éxito.');
  } catch (error) {
    console.error(error);
    errorForm.value = error.response?.data?.message || 'Ocurrió un error al guardar.';
    showSnackbar(errorForm.value, 'error');
  } finally {
    loadingForm.value = false;
  }
};

// --- Ciclo de Vida: onMounted (sin cambios) ---
onMounted(async () => {
  loadingForm.value = true;
  try {
    const [tiposDocData, nivelesAcaData] = await Promise.all([
      DatosPersonalesService.getTiposDocumento(),
      NivelAcademicosService.obtenerNivelAcademicos()
    ]);
    tiposDocumento.value = tiposDocData;
    nivelesAcademicos.value = nivelesAcaData;

    const aspiranteData = await AspiranteService.getAspiranteById(1); 
    Object.assign(formData, aspiranteData);
    if (aspiranteData.fechaNacimiento) {
      formData.fechaNacimiento = new Date(aspiranteData.fechaNacimiento);
    }
    formData.rolId = 1;
  } catch (error) {
      console.error("Error al cargar los datos del perfil:", error);
      errorForm.value = "No se pudieron cargar los datos de tu perfil.";
      showSnackbar(errorForm.value, 'error');
  } finally {
      loadingForm.value = false;
  }
});
</script>