<template>
  <v-container class="login-page fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12" :loading="loading">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Iniciar Sesión en Selectra</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleLogin" ref="loginFormRef">
              <v-text-field
                v-model.trim="codUsuario"
                label="Código de Usuario"
                name="codUsuario"
                prepend-icon="mdi-account"
                type="text"
                :rules="[rules.required, rules.codUsuarioLength]"
                required
                class="mb-3"
                @keyup.enter="handleLogin"
              ></v-text-field>

              <v-text-field
                v-model="clave"
                label="Contraseña"
                name="clave"
                prepend-icon="mdi-lock"
                type="password"
                :rules="[rules.required]"
                required
                class="mb-3"
                @keyup.enter="handleLogin"
              ></v-text-field>

              <v-alert v-if="errorMessage" type="error" dense text class="mb-4">
                {{ errorMessage }}
              </v-alert>
            </v-form>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-btn
              color="primary"
              variant="outlined"
              @click="handleLogin"
              :loading="loading"
              :disabled="loading"
              large
              class="w-50 mb-2"
            >
              Ingresar
            </v-btn>            
            <v-btn
              color="secondary" 
              variant="outlined"
              @click="navigateToRegisterAspirante"
              large
              class="w-10 mb-2"
            >
              Registrarse como Aspirante
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore'; 
const codUsuario = ref('');
const clave = ref('');
const loading = ref(false);
const errorMessage = ref('');
const loginFormRef = ref(null); 

const router = useRouter();
const authStore = useAuthStore();


const rules = {
  required: value => !!value || 'Este campo es requerido.',
  codUsuarioLength: value => (value && value.length <= 50) || 'Máximo 50 caracteres.',
};

const handleLogin = async () => {
  const { valid } = await loginFormRef.value.validate();
  if (!valid) {
    errorMessage.value = 'Por favor, corrija los errores en el formulario.';
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
    errorMessage.value = authStore.loginError || 'Error al intentar iniciar sesión. Verifique sus credenciales.';
    console.error("Error en handleLogin:", error);
  } finally {
    loading.value = false;
  }
};

const navigateToRegisterAspirante = () => {
  router.push('/registro-aspirante'); 
};
</script>

<style scoped>
.login-page {
  background-color: #f0f2f5; 
}

</style>