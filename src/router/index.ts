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
      path: "/",
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
    {
      path: "/lehrer",
      name: "lehrer",
      component: () => import("@/views/LehrerAmpelView.vue"),
      meta: {
        authRequired: true,
        role:[Roles.TEACHER]
      }
    },
    {
      path: "/lehrer/kv",
      name: "kv",
      component: () => import("@/views/LehrerKVView.vue"),
      meta: {
        authRequired: true,
        role:[Roles.TEACHER]
      }
    },
    {
      path: "/admin",
      name: "admin",
      component: () => import("@/views/Admin/AdminView.vue"),
      meta: { 
        authRequired: true,
        role: [Roles.ADMIN] 
      }
    },
    {
      path: "/admin/database",
      name: "database",
      component: () => import("@/views/Admin/AdminSokratesView.vue"),
      meta: { 
        authRequired: true,
        role: [Roles.ADMIN] 
      }
    },
    {
      path: "/admin/editkv",
      name: "editkv",
      component: () => import("@/views/Admin/AdminEditKVView.vue"),
      meta: { 
        authRequired: true,
        role: [Roles.ADMIN] 
      }
    },
    {
      path: "/admin/editStudents",
      name: "editStudents",
      component: () => import("@/views/Admin/AdminEditStudentsView.vue"),
      meta: { 
        authRequired: true,
        role: [Roles.ADMIN] 
      }
    },
    {
      path: "/admin/editTeachers",
      name: "editTeachers",
      component: () => import("@/views/Admin/AdminEditTeachersView.vue"),
      meta: { 
        authRequired: true,
        role: [Roles.ADMIN] 
      }
    },
  ],
})

router.beforeResolve((to, from, next) => {
  const auth = useAuthenticationStore()
  console.log(auth)
  const snackbar = useSnackbarStore()
  if (to.name === "login" && auth.loggedIn) {
    if (auth.roles.includes(Roles.TEACHER)) {
      return next({ name: "lehrer" })
    } else if (auth.roles.includes(Roles.STUDENT)) {
      return next({ name: "schueler" })
    }
  }
  if (
    auth.loaded && // If Authentication is not loaded preferred to let navigation through and redirect later if first data call returns with 401 or 403.
    !auth.loggedIn &&
    (to.meta?.authRequired == true ||
      (to.meta?.role != undefined && Array.isArray(to.meta.role) && to.meta.role.length > 0))
  ) {
    snackbar.push("Sie müssen sich einloggen, um diese Seite anzuzeigen.")
    router.push({ name: "login" })
  } else if (
    auth.loaded && // If Authentication is not loaded preferred to let navigation through and redirect later if first data call returns with 401 or 403.
    to.meta?.role != undefined &&
    Array.isArray(to.meta.role) &&
    to.meta.role.length > 0 &&
    !to.meta.role.some((role: Roles) => auth.roles.includes(role))
  ) {
    snackbar.push("Sie haben nicht die notwendigen Berechtigungen, um diese Seite aufzurufen.")
    router.back()
  }
  next()
})

export default router
