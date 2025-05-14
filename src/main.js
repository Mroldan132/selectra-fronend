import { createApp } from 'vue'
import { createPinia } from 'pinia';

// --- Importaciones de Vuetify ---
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css';

// Importa el componente raíz y el router ANTES de crear la instancia de la app
import App from './App.vue'
import router from './router' // Asumiendo que está en src/router/index.js

// Estilos globales
import './assets/main.css'

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
        },
    },
    // Aquí puedes añadir tu configuración de tema si la tienes
    // theme: { ... }
});

// --- Crear la instancia de la aplicación Vue ---
const app = createApp(App);

// --- Registrar Plugins ---
app.use(createPinia()); // Primero Pinia (el orden entre Pinia y Router no suele ser crítico, pero antes de Vuetify está bien)
app.use(router);      // Luego Vue Router
app.use(vuetify);     // Luego Vuetify

// --- Montar la Aplicación ---
app.mount('#app');