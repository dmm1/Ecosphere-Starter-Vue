import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

// Lazy-loaded components for better performance
const Login = () => import('../views/auth/Login.vue')
const Register = () => import('../views/auth/Register.vue')
const Dashboard = () => import('../views/Dashboard.vue')
const Profile = () => import('../views/profile/Profile.vue')
const ChangePassword = () => import('../views/profile/ChangePassword.vue')
const UserList = () => import('../views/admin/UserList.vue')
const UserDetail = () => import('../views/admin/UserDetail.vue')
const NotFound = () => import('../views/NotFound.vue')

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { guestOnly: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/change-password',
    name: 'change-password',
    component: ChangePassword,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/users',
    name: 'user-list',
    component: UserList,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users/:id',
    name: 'user-detail',
    component: UserDetail,
    props: true,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const isAdmin = authStore.isAdmin
  
  // Check for routes that require authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login' })
  }
  
  // Check for routes that require admin role
  if (to.meta.requiresAdmin && !isAdmin) {
    return next({ name: 'dashboard' })
  }
  
  // Redirect authenticated users away from login/register
  if (to.meta.guestOnly && isAuthenticated) {
    return next({ name: 'dashboard' })
  }
  
  // Proceed to the route
  next()
})

export default router