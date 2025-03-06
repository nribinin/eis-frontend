import { ref } from "vue"
import { defineStore } from "pinia"
import axios, { type AxiosResponse } from "axios"
import type { LoginRequest } from "@/types/LoginRequest.ts"
import type { Authentication } from "@/types/Authentication.ts"
import { Roles } from "@/enum/Roles.ts"
import type { RouteLocationResolvedGeneric } from "vue-router"

export const useAuthenticationStore = defineStore("authentication", () => {
  const loaded = ref(false)
  const loggedIn = ref(false)
  const roles = ref<Roles[]>([])  // Mehrere Rollen speichern
  const displayName = ref<string | null>(null)

  async function login(loginRequest: LoginRequest): Promise<boolean> {
    const response = await axios.post<
      Authentication,
      AxiosResponse<Authentication>,
      LoginRequest
    >("/auth/login", loginRequest, { baseURL: "http://localhost:8080/" })

    if (response.status === 200) {
      setAuthentication(response.data)
      console.log(response.data)
      return true
    }
    return false
  }

  async function logout(): Promise<boolean> {
    const response = await axios.post<string>("/auth/logout", null, {
      baseURL: "http://localhost:8080/"
    })
    if (response.status === 200) {
      loggedIn.value = false
      roles.value = []  // Array zurücksetzen
      displayName.value = null
      return true
    }
    return false
  }

  function setAuthentication(data: Authentication): void {
    const authorities = data.authorities.map((value) => value.authority)
    displayName.value = data.details.displayName
    roles.value = []  // Array initialisieren

    // Prüfe auf alle relevanten Rollen:
    if (authorities.includes("ROLE_TEACHER")) {
      roles.value.push(Roles.TEACHER)
    }
    if (authorities.includes("ROLE_ADMIN")) {
      roles.value.push(Roles.ADMIN)
    }
    if (authorities.includes("ROLE_STUDENT")) {
      roles.value.push(Roles.STUDENT)
    }

    // Setze loggedIn nur, wenn mindestens eine Rolle vorhanden ist
    loggedIn.value = roles.value.length > 0
    loaded.value = true
  }

  function isRouteVisible(route: RouteLocationResolvedGeneric): boolean {
    // Falls in den Meta-Daten mehrere Rollen erlaubt sind, prüfen, ob
    // mindestens eine Rolle vorhanden ist, die in roles.value vorkommt.
    if (
      route.meta?.role !== undefined &&
      Array.isArray(route.meta.role) &&
      route.meta.role.length > 0 &&
      (!loggedIn.value || !route.meta.role.some((r: Roles) => roles.value.includes(r)))
    ) {
      return false
    }
    return true
  }

async function checkLoggedIn() {
  try {
    const response = await axios.get<Authentication>("/auth", { baseURL: "http://localhost:8080/" });
    if (response.status === 200) {
      setAuthentication(response.data);
    }
  } catch (error) {
    // Kein eingeloggter Benutzer – trotzdem den Ladevorgang abschließen
    loaded.value = true;
  }
}

  void checkLoggedIn()

  return {
    loaded,
    loggedIn,
    login,
    logout,
    roles, // jetzt ein Array mit allen Rollen
    isRouteVisible,
    displayName,
    checkLoggedIn,
  }
}, {
  persist: true // <-- sorgt dafür, dass der State gespeichert wird
})
