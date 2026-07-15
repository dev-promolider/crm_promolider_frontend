import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/features/auth/stores/authStore';

const routes = [
  {
    path: '/invitacion',
    name: 'invitacion-public',
    component: () => import('@/features/marketing/views/InvitacionPublicView.vue'),
    meta: { requiresAuth: false, layout: 'AuthLayout' }
  },
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
    path: '/d/:slug',
    name: 'dinamica-public',
    component: () => import('@/features/marketing/views/PublicDinamicaView.vue'),
    meta: { requiresAuth: false, layout: 'AuthLayout' }
  },
  {
    path: '/d/:slug/resultados',
    name: 'dinamica-public-resultados',
    component: () => import('@/features/marketing/views/PublicTriviaResultsView.vue'),
    meta: { requiresAuth: false, layout: 'AuthLayout' }
  },

  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/infoproducts',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true, layout: 'DashboardLayout' },
    children: [
      {
        path: '',
        name: 'infoproducts',
        component: () => import('@/features/infoproducts/views/InfoproductsView.vue')
      }
    ]
  },
  {
    path: '/courses/create',
    name: 'courses.create',
    component: { template: '<div>Create Course Placeholder</div>' }
  },
  {
    path: '/course/module/:courseId/editModule',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true, layout: 'DashboardLayout' },
    children: [
      {
        path: '',
        name: 'course.module.edit',
        component: { template: '<div>Edit Module Placeholder</div>' }
      }
    ]
  },
  {
    path: '/books/create',
    name: 'books.create',
    component: { template: '<div>Create Book Placeholder</div>' }
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
      },
      {
        path: 'billetera',
        name: 'wallet',
        component: () => import('@/features/wallet/views/WalletHistoryUser.vue')
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
        component: { template: '<div><h2 class="p-8">Reportes en construccion</h2></div>' }
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
    path: '/marketing',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true, layout: 'DashboardLayout' },
    children: [
      {
        path: '',
        redirect: { name: 'marketing-herramientas' }
      },
      {
        path: 'herramientas',
        name: 'marketing-herramientas',
        component: () => import('@/features/marketing/views/MarketingToolsView.vue')
      },
      {
        path: 'marketplace',
        name: 'marketing-marketplace',
        component: () => import('@/features/marketing/views/MarketplaceView.vue')
      },
      {
        path: 'marketplace/masterclass/:id',
        name: 'marketing-marketplace-masterclass-detail',
        component: () => import('@/features/marketing/views/MasterclassDetailView.vue')
      },
      {
        path: 'marketplace/ebook/:id',
        name: 'marketing-marketplace-ebook-detail',
        component: () => import('@/features/marketing/views/EbookDetailView.vue')
      },
      {
        path: 'marketplace/mini-course/:id',
        name: 'marketing-marketplace-minicourse-detail',
        component: () => import('@/features/marketing/views/MiniCourseDetailView.vue')
      },
      {
        path: 'calendario',
        name: 'marketing-calendario',
        component: () => import('@/features/marketing/views/CalendarView.vue')
      },
      {
        path: 'pages',
        name: 'marketing-pages',
        component: () => import('@/features/marketing/views/PagesView.vue')
      },
      {
        path: 'pages/editor',
        name: 'marketing-pages-editor',
        component: () => import('@/features/marketing/views/PageEditorView.vue')
      },
      {
        path: 'reportes',
        name: 'marketing-reportes',
        component: () => import('@/features/marketing/views/ReportsView.vue')
      },
      {
        path: 'masterclass/crear',
        name: 'marketing-masterclass-crear',
        component: () => import('@/features/marketing/views/MasterclassCreateView.vue')
      },
      {
        path: 'mini-course/:id/modules',
        name: 'marketing-minicourse-modules',
        component: () => import('@/features/marketing/views/MiniCourseModuleEditorView.vue')
      },
      {
        path: 'mini-course/:id/viewer',
        name: 'marketing-minicourse-viewer',
        component: () => import('@/features/marketing/views/MiniCourseViewer.vue')
      },
      {
        path: 'mini-course/crear',
        name: 'marketing-minicourse-crear',
        component: () => import('@/features/marketing/views/MiniCourseCreateView.vue')
      },
      {
        path: 'ebook/crear',
        name: 'marketing-ebook-crear',
        component: () => import('@/features/marketing/views/EbookCreateView.vue')
      },
      {
        path: 'dinamica/crear',
        name: 'marketing-dinamica',
        component: () => import('@/features/marketing/views/DinamicaView.vue')
      },

      {
        path: 'categorias-preguntas',
        name: 'marketing-question-categories',
        component: () => import('@/features/marketing/views/QuestionCategoriesView.vue')
      },
      {
        path: 'categorias-preguntas/crear',
        name: 'marketing-question-category-create',
        component: () => import('@/features/marketing/views/QuestionCategoryFormView.vue')
      },
      {
        path: 'categorias-preguntas/:id/editar',
        name: 'marketing-question-category-edit',
        component: () => import('@/features/marketing/views/QuestionCategoryFormView.vue')
      },
      {
        path: 'categorias-preguntas/:id',
        name: 'marketing-question-category-detail',
        component: () => import('@/features/marketing/views/QuestionCategoryDetailView.vue')
      },
      {
        path: 'categorias-preguntas/:categoryId/preguntas/crear',
        name: 'marketing-question-create',
        component: () => import('@/features/marketing/views/QuestionItemFormView.vue')
      },
      {
        path: 'categorias-preguntas/:categoryId/preguntas/:questionId/editar',
        name: 'marketing-question-edit',
        component: () => import('@/features/marketing/views/QuestionItemFormView.vue')
      },
      {
        path: 'enlaces-pago',
        name: 'marketing-payment-links',
        component: () => import('@/features/marketing/views/PaymentLinksView.vue')
      },
      {
        path: 'enlaces-pago/crear',
        name: 'marketing-payment-links-create',
        component: () => import('@/features/marketing/views/PaymentLinkFormView.vue')
      },
      {
        path: 'enlaces-pago/:id/editar',
        name: 'marketing-payment-links-edit',
        component: () => import('@/features/marketing/views/PaymentLinkFormView.vue')
      },
      {
        path: 'enlaces-invitacion',
        name: 'marketing-invitation-links',
        component: () => import('@/features/marketing/views/InvitationLinksView.vue')
      },
      {
        path: 'gamificacion',
        name: 'marketing-gamification',
        component: () => import('@/features/marketing/views/GamificationView.vue')
      },
      {
        path: 'cursos',
        name: 'marketing-courses',
        component: () => import('@/features/marketing/views/CoursesView.vue')
      },
      {
        path: 'dinamicas',
        name: 'marketing-dinamicas',
        component: () => import('@/features/marketing/views/DinamicasView.vue')
      },
    ]
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

const loginRoute = { name: 'login' }
const dashboardRoute = { name: 'dashboard' }

router.beforeEach((to, from) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.name === 'login' && isAuthenticated) {
    return { name: 'dashboard' }
  }

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      return { name: 'login' }
    }

    if (to.meta.role && !authStore.hasRole(to.meta.role)) {
      return { name: 'dashboard' }
    }
  }

  return true
})

export default router