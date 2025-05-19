// src/plugins/vuetify.js (o vuetify.ts si usas TypeScript)

import 'vuetify/styles' // Importa los estilos base de Vuetify
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components' // Importa todos los componentes de Vuetify
import * as directives from 'vuetify/directives' // Importa todas las directivas de Vuetify

// Importa los iconos (Material Design Icons en este ejemplo)
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css' // Asegúrate de tener esta dependencia o la fuente de iconos que uses

// --- TU TEMA PERSONALIZADO ---
const myCustomLightTheme = {
  dark: false,
  colors: {
    primary: '#5D87FF', // Un azul amigable
    secondary: '#4CAF50', // Un verde complementario u otro color
    accent: '#FFAB00',
    error: '#F44336',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
    // También puedes definir surface, background, etc.
    surface: '#FFFFFF',
    background: '#F4F6F8', // Similar a bg-grey-lighten-5 que usaste en App.vue
  }
};
// --- FIN DE TU TEMA PERSONALIZADO ---

// Crea la instancia de Vuetify
const vuetify = createVuetify({
  components, // Registra los componentes importados
  directives, // Registra las directivas importadas
  icons: {     // Configuración de iconos
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {     // Aquí se aplica tu tema
    defaultTheme: 'myCustomLightTheme', // Establece tu tema como el predeterminado
    themes: {
      myCustomLightTheme, // Registra tu tema para que Vuetify lo conozca
      // Podrías definir un myCustomDarkTheme aquí también si lo necesitas
      // myCustomDarkTheme: { dark: true, colors: { ... } }
    }
  },
  // Aquí puedes añadir otras opciones globales de Vuetify si las necesitas, por ejemplo:
  // defaults: {
  //   VBtn: {
  //     color: 'primary',
  //     variant: 'flat',
  //   },
  //   VTextField: {
  //     variant: 'outlined',
  //     density: 'compact',
  //   },
  // },
});

// Exporta la instancia de Vuetify para usarla en main.js (o main.ts)
export default vuetify;