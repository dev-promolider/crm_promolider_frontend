import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/features/auth/stores/authStore';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/features/auth/views/LoginView.vue'),
    meta: { requiresAuth: false, layout: 'AuthLayout' }
  },
  {
    path: '/preregistro/:username',
    name: 'preregistro-landing',
    component: () => import('@/features/registration/views/PreregistroLandingView.vue'),
    meta: { requiresAuth: false, layout: 'AuthLayout' }
  },
  {
    path: '/register/:id/:timestamp/:hash',
    name: 'registro-landing',
    component: () => import('@/features/registration/views/RegistroPublicView.vue'),
    meta: { requiresAuth: false, layout: 'AuthLayout' }
  },

  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true, layout: 'DashboardLayout' },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/features/dashboard/views/DashboardView.vue')
      },
      {
        path: 'preregistro',
        name: 'dashboard-preregistro',
        component: () => import('@/features/registration/views/PreregistroDashboardView.vue')
      },
      {
        path: '/registro',
        name: 'dashboard-registro',
        component: () => import('@/features/registration/views/RegistroDashboardView.vue')
      }
    ]
  },
  {
    path: '/mi-dashboard',
    component: () => import('@/layouts/PreregisteredLayout.vue'),
    meta: { requiresAuth: false, layout: 'PreregisteredLayout' },
    children: [
      {
        path: '',
        name: 'preregistered-dashboard',
        component: () => import('@/features/registration/views/PreregisteredDashboardView.vue')
      },
      {
        path: 'pago',
        name: 'preregistered-payment',
        component: () => import('@/features/registration/views/PreregisteredPaymentView.vue')
      },
      {
        path: 'liderbot',
        name: 'preregistered-liderbot',
        component: () => import('@/features/registration/views/PreregisteredLiderbotView.vue')
      },
      {
        path: 'leadboost',
        name: 'preregistered-leadboost',
        component: () => import('@/features/registration/views/PreregisteredLeadBoostView.vue')
      },
      {
        path: 'smartfunnel',
        name: 'preregistered-smartfunnel',
        component: () => import('@/features/registration/views/PreregisteredSmartFunnelView.vue')
      },
      {
        path: 'ecomercademico',
        name: 'preregistered-ecomercademico',
        component: () => import('@/features/registration/views/PreregisteredEcomerAcademicoView.vue')
      },
      {
        path: 'reportes',
        name: 'preregistered-reportes',
        component: { template: '<div><h2 class="p-8">Reportes en construcción</h2></div>' }
      }
    ]
  },
  {
    path: '/admin',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: '',
        name: 'admin-panel',
        component: { template: '<div>Admin Panel Placeholder</div>' }
      }
    ]
  },
  {
    path: '/producer',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true, role: 'producer' },
    children: [
      {
        path: '',
        name: 'producer-dashboard',
        component: { template: '<div>Producer Dashboard Placeholder</div>' }
      }
    ]
  },
  {
    path: '/affiliate',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true, role: 'affiliate' },
    children: [
      {
        path: '',
        name: 'affiliate-market',
        component: { template: '<div>Affiliate Market Placeholder</div>' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach((to, from) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  if (to.name === 'login' && isAuthenticated) {
    return { name: 'dashboard' };
  }

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      return { name: 'login' };
    }

    if (to.meta.role && !authStore.hasRole(to.meta.role)) {
      return { name: 'dashboard' };
    }
  }

  return true;
});

export default router;
