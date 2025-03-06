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

router.beforeResolve(async (to, from, next) => {
  const auth = useAuthenticationStore();
  const snackbar = useSnackbarStore();

  // Warten, bis auth geladen ist
  if (!auth.loaded) {
    
  }

  if (to.name === "login" && auth.loggedIn) {
    if (auth.roles.includes(Roles.TEACHER)) {
      return next({ name: "lehrer" });
    } else if (auth.roles.includes(Roles.STUDENT)) {
      return next({ name: "schueler" });
    }
  }

  if (
    !auth.loggedIn &&
    (to.meta?.authRequired === true ||
      (to.meta?.role && Array.isArray(to.meta.role) && to.meta.role.length > 0))
  ) {
    snackbar.push("Sie müssen sich einloggen, um diese Seite anzuzeigen.");
    return next({ name: "login" });
  }

  if (
    to.meta?.role &&
    Array.isArray(to.meta.role) &&
    to.meta.role.length > 0 &&
    !to.meta.role.some((role) => auth.roles.includes(role))
  ) {
    snackbar.push("Sie haben nicht die notwendigen Berechtigungen, um diese Seite aufzurufen.");
    if (auth.roles.includes(Roles.TEACHER)) {
      return next({ name: "lehrer" });
    } else if (auth.roles.includes(Roles.STUDENT)) {
      return next({ name: "schueler" });
    }
    return next(false);
  }

  next();
});
export default router
