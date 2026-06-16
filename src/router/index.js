import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const routes = [
  {
    path: '/',
    component: () => import('../components/layout/MainLayout.vue'),
    meta: { requiresAuth: true }, // Rutas protegidas por el token
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/dashboard/Dashboard.vue')
      },
      {
        path: 'cursos',
        name: 'Cursos',
        component: () => import('../views/courses/CourseList.vue')
      },
      {
        path: 'marketing',
        name: 'Marketing',
        component: () => import('../views/marketing/MarketingTools.vue')
      },
      {
        path: 'ecomercademico',
        name: 'EcomerAcademico',
        component: () => import('../views/courses/EcomerAcademico.vue')
      },
      {
        path: 'liderbot',
        name: 'Liderbot',
        component: () => import('../views/marketing/Liderbot.vue')
      },
      {
        path: 'leadboost',
        name: 'LeadBoost',
        component: () => import('../views/marketing/LeadBoost.vue')
      },
      {
        path: 'smartfunnel',
        name: 'SmartFunnel',
        component: () => import('../views/marketing/SmartFunnel.vue')
      },
      {
        path: 'billetera',
        name: 'Billetera',
        component: () => import('../views/wallet/WalletOverview.vue')
      },
      {
        path: 'reportes',
        name: 'Reportes',
        component: () => import('../views/reports/ReportsOverview.vue')
      },
      {
        path: 'configuracion',
        name: 'Configuracion',
        component: () => import('../views/settings/SettingsPanel.vue')
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: { requiresGuest: true } // Solo accesible si NO tienes token
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Si intenta ir al Dashboard u otra ruta bloqueada sin token -> Login
    next({ name: 'Login' });
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // Si intenta ir al Login y ya tiene un token válido -> Dashboard
    next({ name: 'Dashboard' });
  } else {
    // Si todo está correcto, pasa
    next();
  }
});

export default router;
