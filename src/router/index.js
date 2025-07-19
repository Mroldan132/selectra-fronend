// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import HomeView from '../views/HomeView.vue';
import GestionRequerimientosView from '../views/GestionRequerimientosView.vue';
import RegistroAspirantePage from '../views/RegistroAspirante.vue'; 
import GestionRequerimientosAdmView from '../views/GestionRequerimientosAdmView.vue';
import GestionSolicitudVacacionesView from '../views/GestionSolicitudVacacionesView.vue';

import { useAuthStore } from '@/stores/authStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
    path: '/registro-aspirante', 
    name: 'RegistroAspirante',
    component: RegistroAspirantePage,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    
    {
      path: '/requerimientos',
      name: 'gestionRequerimientos',
      component: GestionRequerimientosView,
      meta: { requiresAuth: true, roles: ['Solicitante', 'JefeAprobador', 'RRHH', 'Administrador'] }
    },
    {
      path: '/requerimientosAdm',
      name: 'gestionRequerimientosAdm',
      component: GestionRequerimientosAdmView,
      meta: { requiresAuth: true, roles: ['Administrador'] }

    },
    { 
      path: '/personal',
      name: 'gestionPersonal',
      component: () => import('@/views/GestionPersonalView.vue'),
      meta: { requiresAuth: true, roles: ['Administrador'] }
    },
    {
      path: '/ofertasLaboralesAdm',
      name: 'ofertasLaboralesAdm',
      component: () => import('@/views/GestionOfertaLaboralView.vue'),
      meta: { requiresAuth: true, roles: ['Administrador'] }
    }
    ,
    {
      path: '/portalOfertas',
      name: 'portalOfertas',
      component: () => import('@/views/PortalDeOfertas.vue'),
      meta: { requiresAuth: true, roles: ['Administrador'] }
    },
      {
        path: '/TipoPreguntasFiltro',
        name: 'gestionTiposPreguntasFiltro',
        component: () => import('@/views/GestionTipoPreguntasView.vue'),
       meta: { requiresAuth: true, roles: ['Administrador'] }
      },
      {
        path: '/preguntas-filtro',
        name: 'gestionPreguntasFiltro',
        component: () => import('@/views/PreguntasFiltrosView.vue'),
        meta: { requiresAuth: true, roles: ['Administrador'] }
      },
      {
         path: '/opcion-pregunta-filtro',
         name: 'gestionOpcionPreguntaFiltro',
        component: () => import('@/views/OpcionPreguntaFiltroView.vue'),
         meta: { requiresAuth: true, roles: ['Administrador'] }
      },
    {
      path: '/areas',
      name: 'gestionAreas',
      component: () => import('@/views/GestionAreasView.vue'),
      meta: { requiresAuth: true, roles: ['Administrador'] }
      },
    {
       path: '/NivelAcademicos',
       name: 'gestionNivelAcademicos',
       component: () => import('@/views/GestionNivelAcademicosView.vue'),
       meta: { requiresAuth: true, roles: ['Administrador'] }
      },
      {
      path: '/TipoDocumentos',
      name: 'gestionTiposDocumentos',
      component: () => import('@/views/GestionTipoDocumentosView.vue'),
      meta: { requiresAuth: true, roles: ['Administrador'] }
    },
    {
      path: '/SolicitudVacaciones',
      name: 'gestionSolicitudVacaciones',
      component: GestionSolicitudVacacionesView,
      meta: { requiresAuth: true, roles: ['Solicitante', 'JefeAprobador', 'RRHH', 'Administrador'] }
    },
    {
      path: '/Cargos',
      name: 'gestionCargos',
      component: () => import('@/views/GestionCargosView.vue'),
      meta: { requiresAuth: true, roles: ['Administrador'] }
    },
    {
      path: '/mis-postulaciones',
      name: 'gestionMisOfertas',
      component: () => import('@/views/GestionMisOfertas.vue'),
    },
    {
      path: '/organigrama',
      name: 'gestionArbolPuestos',
      component: () => import('@/views/ArbolPuestosView.vue'),
      meta: { requiresAuth: true, roles: ['Administrador'] }
    }   
  ]
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isLoggedIn) {
    // Pasa la ruta original como query para redirigir de vuelta después del login.
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else if (to.name === 'login' && authStore.isLoggedIn) {
    // Si ya está logueado e intenta ir a /login, redirige a la página de inicio.
    next({ name: 'home' });
  }
  // else if (guestOnly && authStore.isLoggedIn) {
  //   next({ name: 'home' }); // Si es una ruta solo para invitados y está logueado, va a home
  // }
  else {
    // En cualquier otro caso, permite la navegación.
    next();
  }
});

export default router;