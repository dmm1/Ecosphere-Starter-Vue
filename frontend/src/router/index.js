import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

// Import layouts
import DefaultLayout from '../layouts/DefaultLayout.vue'

const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'), 
        meta: { requiresAuth: true }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/profile/Profile.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'change-password',
        name: 'ChangePassword',
        component: () => import('../views/profile/ChangePassword.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('../views/admin/UserManagement.vue')
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue'),
    meta: { guestOnly: true }
  },
  // Removed ForgotPassword and ResetPassword routes since they don't exist yet
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  linkActiveClass: 'active'
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if the user is authenticated
  if (!authStore.isAuthenticated && to.meta.requiresAuth) {
    return next('/login')
  }
  
  // Check if the route requires admin privileges
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next('/')
  }
  
  // Redirect authenticated users away from guest-only pages
  if (authStore.isAuthenticated && to.meta.guestOnly) {
    return next('/')
  }
  
  next()
})

export default router