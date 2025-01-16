import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import SchuelerView from '@/views/SchuelerView.vue'
import { Roles } from "@/enum/Roles.ts"
import { useAuthenticationStore } from "@/stores/AuthenticationStore.ts"
import { useSnackbarStore } from "@/stores/SnackbarStore.ts"


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/schueler",
      name: "schueler",
      component: SchuelerView,
      meta: {
        authRequired: true,
        role:[Roles.STUDENT]
      }
    },
  ],
})

router.beforeResolve((to, from, next) => {
  const auth = useAuthenticationStore()
  const snackbar = useSnackbarStore()
  if (
    (to.meta?.authRequired == true && !auth.loggedIn) ||
    (to.meta?.role != undefined &&
      Array.isArray(to.meta.role) &&
      to.meta.role.length > 0 &&
      !auth.loggedIn)
  ) {
    snackbar.push("Sie müssen sich einloggen, um diese Seite anzuzeigen.")
    router.push({ name: "login" })
  } else if (
    to.meta?.role != undefined &&
    Array.isArray(to.meta.role) &&
    to.meta.role.length > 0 &&
    !to.meta.role.includes(auth.role)
  ) {
    snackbar.push("Sie haben nicht die notwendigen Berechtigungen, um diese Seite aufzurufen.")
    router.push("/login")
  }
  next()
})

export default router
