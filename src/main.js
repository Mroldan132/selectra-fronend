import { createApp } from 'vue'
import { createPinia } from 'pinia';

// --- Importaciones de Vuetify ---
import 'vuetify/styles'; // Importa los estilos base de Vuetify
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components'; // Importa todos los componentes
import * as directives from 'vuetify/directives'; // Importa todas las directivas
import { aliases, mdi } from 'vuetify/iconsets/mdi'; // Importa los iconos (Material Design Icons)
import '@mdi/font/css/materialdesignicons.css'; // CSS para los iconos MDI

import App from './App.vue'
import router from './router'

import './assets/main.css'

// --- TU TEMA PERSONALIZADO ---
const myCustomLightTheme = {
  dark: false,
  colors: {
    primary: '#5D87FF', // Un azul amigable
    secondary: '#4CAF50', // Un verde complementario
    accent: '#FFAB00',
    error: '#F44336',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
    surface: '#FFFFFF',
    background: '#F4F6F8', // Un fondo gris claro, similar al de App.vue
  }
};
// --- FIN DE TU TEMA PERSONALIZADO ---

// --- Crear la instancia de Vuetify CON EL TEMA ---
const vuetifyInstanceWithTheme = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: { // Aquí se aplica tu tema
    defaultTheme: 'myCustomLightTheme', // Establece tu tema como el predeterminado
    themes: {
      myCustomLightTheme, 
    }
  }
});

const app = createApp(App);

// --- Registrar Plugins ---
app.use(createPinia()); // Primero Pinia
app.use(router);       // Luego Vue Router
app.use(vuetifyInstanceWithTheme); // Luego Vuetify con tu tema configurado

// --- Montar la Aplicación ---
app.mount('#app');
