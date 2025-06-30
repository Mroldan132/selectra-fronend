<template>
  <v-container class="fill-height" fluid style="background-color: rgb(var(--v-theme-grey-lighten-4));">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="7" xl="6">
        <v-card class="elevation-12 rounded-xl" :loading="loading">
          <v-toolbar color="secondary" dark flat>
            <v-toolbar-title class="font-weight-medium d-flex align-center">
              <v-icon class="mr-3">mdi-account-plus-outline</v-icon>
              Registro de Aspirante
            </v-toolbar-title>
          </v-toolbar>

          <v-form ref="registerFormRef">
            <v-window v-model="step">
              <v-window-item :value="1">
                <v-card-text class="pa-md-8 pa-4">
                  <div class="text-center mb-8">
                    <h2 class="text-h4 font-weight-bold text-secondary">Crea tu Cuenta</h2>
                    <p class="text-medium-emphasis">Comienza con tus credenciales de acceso.</p>
                  </div>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model.trim="formData.codUsuario"
                        label="Nombre de usuario"
                        :rules="[rules.required, rules.maxLength(50), usernameRule]"
                        variant="outlined"
                        density="compact"
                        prepend-inner-icon="mdi-account-circle-outline"
                        @blur="checkUsername"
                        :loading="verifyingUsername"
                        :disabled="verifyingUsername"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="formData.clave" label="Contraseña" :rules="[rules.required, rules.minLength(8)]" :type="showPassword ? 'text' : 'password'" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'" @click:append-inner="showPassword = !showPassword" variant="outlined" density="compact" prepend-inner-icon="mdi-lock-outline" />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-window-item>

              <v-window-item :value="2">
                <v-card-text class="pa-md-8 pa-4">
                   <div class="text-center mb-8">
                    <h2 class="text-h4 font-weight-bold text-secondary">Tu Identidad</h2>
                    <p class="text-medium-emphasis">Cuéntanos un poco sobre ti.</p>
                  </div>
                  <v-row>
                    <v-col cols="12"><v-text-field v-model="formData.nombres" label="Nombres" :rules="[rules.required]" variant="outlined" density="compact" /></v-col>
                    <v-col cols="12" md="6"><v-text-field v-model="formData.apellidoPaterno" label="Apellido Paterno" :rules="[rules.required]" variant="outlined" density="compact" /></v-col>
                    <v-col cols="12" md="6"><v-text-field v-model="formData.apellidoMaterno" label="Apellido Materno" :rules="[rules.required]" variant="outlined" density="compact" /></v-col>
                    <v-col cols="12" md="6">
                      <v-select v-model="formData.tipoDocumentoId" :items="tiposDocumento" item-value="id" item-title="nombre" label="Tipo de Documento" :rules="[rules.required]" variant="outlined" density="compact" />
                    </v-col>
                    <!-- INICIO: MODIFICACIÓN -->
                    <v-col cols="12" md="6">
                        <v-text-field
                            v-model="formData.numeroDocumento"
                            label="Número de Documento"
                            :rules="[rules.required, rules.maxLength(20), rules.numeric]"
                            variant="outlined"
                            density="compact"
                        />
                    </v-col>
                    <!-- FIN: MODIFICACIÓN -->
                     <v-col cols="12" md="6"><v-text-field v-model="formData.emailPersonal" label="Email Personal" type="email" :rules="[rules.required, rules.email]" variant="outlined" density="compact" /></v-col>
                    <v-col cols="12" md="6"><v-text-field v-model="formData.telefono" label="Teléfono (Opcional)" variant="outlined" density="compact" /></v-col>
                  </v-row>
                </v-card-text>
              </v-window-item>

              <v-window-item :value="3">
                <v-card-text class="pa-md-8 pa-4">
                   <div class="text-center mb-8">
                    <h2 class="text-h4 font-weight-bold text-secondary">Tus Detalles</h2>
                    <p class="text-medium-emphasis">Ya casi terminamos. Completa tu información.</p>
                  </div>
                  <UbigeoSelector v-model="formData.ubigeoNacimiento" label-prefix="Nacimiento:" :rules="[rules.required]" />
                  <UbigeoSelector v-model="formData.ubigeoResidencia" label-prefix="Residencia:" :rules="[rules.required]" />
                   <v-row>
                     <v-col cols="12" md="6">
                       <v-menu v-model="dateMenu" :close-on-content-click="false" transition="scale-transition">
                         <template #activator="{ props }">
                           <v-text-field v-model="formattedFechaNacimiento" label="Fecha de Nacimiento" :rules="[rules.required]" prepend-inner-icon="mdi-calendar" variant="outlined" readonly v-bind="props" density="compact"/>
                         </template>
                         <v-date-picker v-model="formData.fechaNacimiento" @update:model-value="dateMenu = false" hide-header :max="new Date().toISOString().slice(0,10)" />
                       </v-menu>
                     </v-col>
                      <v-col cols="12" md="6">
                        <v-select v-model="formData.nivelAcademicoId" :items="nivelesAcademicos" item-value="nivelAcademicoId" item-title="nombre" label="Nivel Académico" :rules="[rules.required]" variant="outlined" density="compact" />
                      </v-col>
                   </v-row>
                </v-card-text>
              </v-window-item>

              <v-window-item :value="4">
                 <v-card-text class="text-center pa-16">
                   <v-scale-transition>
                     <v-icon v-if="success" class="mb-4" color="success" icon="mdi-check-decagram-outline" size="88"></v-icon>
                   </v-scale-transition>
                   <h2 class="text-h4 font-weight-bold mb-2">¡Registro Exitoso!</h2>
                   <p class="text-medium-emphasis">
                     Hemos creado tu cuenta. Serás redirigido a la página de inicio de sesión en unos segundos.
                   </p>
                   <v-progress-linear indeterminate color="primary" class="mt-8"></v-progress-linear>
                 </v-card-text>
              </v-window-item>

            </v-window>
          </v-form>

          <v-divider></v-divider>

          <v-card-actions class="pa-4" v-if="step < 4">
             <v-alert v-if="errorMessage" type="error" density="compact" variant="tonal" class="mr-auto" :text="errorMessage" />
             <v-spacer v-else></v-spacer>
             <v-btn :disabled="step === 1" variant="text" @click="step--">Atrás</v-btn>
             <v-btn v-if="step < 3" color="secondary" variant="tonal" @click="siguientePaso" :disabled="verifyingUsername">Siguiente</v-btn>
             <v-btn v-else color="success" variant="flat" size="large" @click="handleRegister" :loading="loading">
               Finalizar Registro
             </v-btn>
          </v-card-actions>
        </v-card>

         <div class="text-center mt-6">
           <p class="text-medium-emphasis">¿Ya tienes una cuenta?
             <router-link to="/login" class="text-secondary font-weight-bold">Inicia Sesión</router-link>
           </p>
         </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'; // Se añade watch
import { useRouter } from 'vue-router';
import AspiranteService from '@/services/AspiranteService';
import NivelAcademicoService from '@/services/NivelAcademicosService';
import DatosPersonalesService from '@/services/DatosPersonalesService';
import UsuarioService from '@/services/UsuarioService';
import UbigeoSelector from '@/components/utils/UbigeoSelector.vue';

const router = useRouter();
const loading = ref(false);
const success = ref(false);
const errorMessage = ref('');
const registerFormRef = ref(null);

// --- State ---
const step = ref(1);
const showPassword = ref(false);
const dateMenu = ref(false);

const formData = reactive({
  codUsuario: '', clave: '', activo: true, apellidoPaterno: '',
  apellidoMaterno: '', nombres: '', tipoDocumentoId: null,
  numeroDocumento: '', telefono: '', emailPersonal: '',
  ubigeoNacimiento: null, ubigeoResidencia: null, fechaNacimiento: null,
  nivelAcademicoId: null,
});

const nivelesAcademicos = ref([]);
const tiposDocumento = ref([]);

const verifyingUsername = ref(false);
const usernameExists = ref(false);
let debounceTimer = null;

// --- Computed ---
const formattedFechaNacimiento = computed(() => {
  return formData.fechaNacimiento ? new Date(formData.fechaNacimiento).toLocaleDateString('es-ES') : '';
});

// --- INICIO: MODIFICACIÓN EN REGLAS ---
const rules = {
  required: value => !!value || 'Este campo es obligatorio.',
  minLength: length => value => (value && value.length >= length) || `Mínimo ${length} caracteres.`,
  maxLength: length => value => (!value || value.length <= length) || `Máximo ${length} caracteres.`,
  email: value => /.+@.+\..+/.test(value) || 'El formato del email no es válido.',
  numeric: value => /^\d*$/.test(value) || 'Este campo solo debe contener números.', // Permite campo vacío
};
// --- FIN: MODIFICACIÓN EN REGLAS ---

// --- INICIO: NUEVO WATCH PARA FILTRAR EN TIEMPO REAL ---
watch(() => formData.numeroDocumento, (newValue, oldValue) => {
    if (newValue && !/^\d*$/.test(newValue)) {
        // Si el nuevo valor no son solo dígitos, lo revierte al valor anterior válido.
        formData.numeroDocumento = oldValue;
    }
});
// --- FIN: NUEVO WATCH ---


const usernameRule = () => !usernameExists.value || 'Este nombre de usuario ya está en uso.';

const checkUsername = () => {
  clearTimeout(debounceTimer);
  if (!formData.codUsuario) {
    usernameExists.value = false;
    return;
  }

  debounceTimer = setTimeout(async () => {
    verifyingUsername.value = true;
    usernameExists.value = false;
    try {
      const existe = await UsuarioService.verificarUsuario(formData.codUsuario);
      usernameExists.value = existe;
      registerFormRef.value?.validate();
    } catch (error) {
      errorMessage.value = error.message || 'Error de conexión al verificar usuario.';
    } finally {
      verifyingUsername.value = false;
    }
  }, 500);
};

const siguientePaso = async () => {
  const { valid } = await registerFormRef.value.validate();
  if (usernameExists.value) {
    errorMessage.value = "Por favor, elige otro nombre de usuario.";
    return;
  }
  if (verifyingUsername.value) {
     errorMessage.value = "Aguarde mientras verificamos el usuario...";
    return;
  }

  if (valid) {
    step.value++;
    errorMessage.value = '';
  } else {
    errorMessage.value = 'Por favor, corrige los errores del formulario.';
  }
};

const handleRegister = async () => {
  errorMessage.value = '';
  await checkUsername();
  if (usernameExists.value) {
    step.value = 1;
    errorMessage.value = "Este nombre de usuario ya está en uso.";
    return;
  }

  const { valid } = await registerFormRef.value.validate();
  if (!valid) {
    // Se cambia el alert por un mensaje en el formulario
    errorMessage.value = 'Por favor, completa todos los campos requeridos correctamente.';
    return;
  }

  loading.value = true;
  try {
    const payload = { ...formData };
    if (payload.fechaNacimiento instanceof Date) {
        payload.fechaNacimiento = payload.fechaNacimiento.toISOString().slice(0, 10);
    }
console.log(payload)
    await AspiranteService.registrarAspirante(payload);
    success.value = true;
    step.value = 4;
    setTimeout(() => router.push('/login'), 4000);

  } catch (error) {
    errorMessage.value = error;
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    nivelesAcademicos.value = await NivelAcademicoService.obtenerNivelAcademicos();
    tiposDocumento.value = await DatosPersonalesService.getTiposDocumento();
  } catch (error) {
    console.error("Error al cargar datos iniciales:", error);
    errorMessage.value = 'No se pudieron cargar los datos para el formulario.';
  }
});
</script>

<style scoped>
  .v-card-actions {
    border-top: 1px solid rgba(0,0,0,0.08);
  }
</style>
