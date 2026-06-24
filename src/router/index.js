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
