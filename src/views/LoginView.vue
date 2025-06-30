<template>
  <v-container class="login-page fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        <v-card class="elevation-12 rounded-xl">
          <v-card-text class="pa-8 text-center">
            <v-img
              class="mx-auto mb-4"
              src="https://www.selectra.com.pe/sites/selectra.com.pe/files/images/logos/selectra-logo-2023.svg"
              max-width="180"
              alt="Selectra Logo"
            ></v-img>
            <h1 class="text-h4 font-weight-bold text-primary">Bienvenido</h1>
            <p class="text-medium-emphasis mt-1">Inicia sesión para continuar</p>
          </v-card-text>

          <v-card-text class="px-8">
            <v-form @submit.prevent="handleLogin" ref="loginFormRef">
              
              <v-text-field
                v-model.trim="codUsuario"
                label="Código de Usuario"
                name="codUsuario"
                prepend-inner-icon="mdi-account-outline"
                type="text"
                :rules="[rules.required, rules.codUsuarioLength]"
                required
                variant="outlined"
                density="compact"
                class="mb-4"
                @keyup.enter="handleLogin"
              ></v-text-field>

              <v-text-field
                v-model="clave"
                label="Contraseña"
                name="clave"
                prepend-inner-icon="mdi-lock-outline"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                :rules="[rules.required]"
                required
                variant="outlined"
                density="compact"
                @keyup.enter="handleLogin"
              ></v-text-field>
              
              <v-fade-transition>
                <v-alert v-if="errorMessage" type="error" density="compact" variant="tonal" class="mt-2 mb-4">
                  {{ errorMessage }}
                </v-alert>
              </v-fade-transition>
              
              <v-btn
                color="primary"
                variant="flat"
                @click="handleLogin"
                :loading="loading"
                :disabled="loading"
                size="large"
                block
                class="mt-4"
              >
                Ingresar
              </v-btn>
            </v-form>
          </v-card-text>
          
           <v-card-text class="text-center py-4">
            <a href="#" class="text-secondary text-decoration-none">
              ¿Olvidaste tu contraseña?
            </a>
          </v-card-text>

        </v-card>
        
        <div class="text-center mt-6">
          <p class="text-medium-emphasis" style="color: white !important;">
            ¿No tienes una cuenta?
            <router-link to="/registro-aspirante" class="text-primary font-weight-bold text-decoration-none">
              Regístrate aquí
            </router-link>
          </p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore'; 

// --- State ---
const codUsuario = ref('');
const clave = ref('');
const loading = ref(false);
const errorMessage = ref('');
const showPassword = ref(false); // Para el toggle de visibilidad
const loginFormRef = ref(null); 

const router = useRouter();
const authStore = useAuthStore();

// --- Validation Rules ---
const rules = {
  required: value => !!value || 'Este campo es requerido.',
  codUsuarioLength: value => (value && value.length <= 50) || 'Máximo 50 caracteres.',
};

// --- Methods ---
const handleLogin = async () => {
  const { valid } = await loginFormRef.value.validate();
  if (!valid) {
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    await authStore.login({
      codUsuario: codUsuario.value,
      clave: clave.value,
    });
    const redirectPath = router.currentRoute.value.query.redirect || '/';
    router.push(redirectPath);
  } catch (error) {
    errorMessage.value = authStore.loginError || 'Usuario o contraseña incorrectos.';
    console.error("Error en handleLogin:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  background: linear-gradient(45deg, rgba(2,0,36,1) 0%, rgba(26,26,88,1) 35%, rgba(0,121,141,1) 100%);
}

.v-card {
  /* Opcional: añade una transparencia sutil a la tarjeta para integrar el fondo */
  background-color: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(5px);
}

.v-btn {
  text-transform: none; /* Para que los botones no estén en mayúsculas */
  font-weight: 600;
}
</style>