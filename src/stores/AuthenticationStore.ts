import { ref } from "vue"
import { defineStore } from "pinia"
import axios, { type AxiosResponse } from "axios"
import type { LoginRequest } from "@/types/LoginRequest.ts"
import type { Authentication } from "@/types/Authentication.ts"
import { Roles } from "@/enum/Roles.ts"
import type { RouteLocationResolvedGeneric } from "vue-router"
import { useSnackbarStore } from "@/stores/SnackbarStore.ts"


export const useAuthenticationStore = defineStore("authentication", () => {
  const loaded = ref(false)
  const loggedIn = ref(false)
  const role = ref<Roles | null>(null)
  const displayName = ref<string | null>(null);
  const snackbar = useSnackbarStore()

  async function login(loginRequest: LoginRequest): Promise<boolean> {
    const response = await axios.post<Authentication, AxiosResponse<Authentication>, LoginRequest>(
      "/auth/login",
      loginRequest,
    )
    if (response.status == 200) {
      setAuthentication(response.data)
      return true
    }
    return false
  }

  async function logout(): Promise<boolean> {
    const response = await axios.post<string>("/auth/logout")
    if (response.status == 200) {
      loggedIn.value = false
      role.value = null
      return true
    }
    return false
  }

  function setAuthentication(data: Authentication) {
    const authorities = data.authorities.map((value) => value.authority)
    console.log("authorities", authorities)
    displayName.value = data.details.displayName
    if (authorities.includes("ROLE_LEHRER")) {
      loggedIn.value = true
      role.value = Roles.TEACHER
    } else if (authorities.includes("ROLE_SCHUELER")) {
      loggedIn.value = true
      role.value = Roles.STUDENT
    } else {
      loggedIn.value = false
      role.value = null
    }
    loaded.value = true
  }

  function isRouteVisible(route: RouteLocationResolvedGeneric): boolean {
    console.log("route", route)
    if (
      route.meta?.role != undefined &&
      Array.isArray(route.meta.role) &&
      route.meta.role.length > 0 &&
      (!loggedIn.value || !route.meta.role.includes(role.value))
    ) {
      return false
    } else {
      return true
    }
  }

  async function checkLoggedIn() {
    axios.get<Authentication>("/auth").then((response) => {
      if (response.status == 200) {
        setAuthentication(response.data)
      }
    })
  }

  void checkLoggedIn()

  return {loaded, loggedIn, login, logout, role, isRouteVisible, displayName }
})
