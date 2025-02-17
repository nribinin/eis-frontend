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
    const role = ref<Roles | null>(null)
    const displayName = ref<string | null>(null)

    async function login(loginRequest: LoginRequest): Promise<boolean> {
        const response = await axios.post<
            Authentication,
            AxiosResponse<Authentication>,
            LoginRequest
        >("/auth/login", loginRequest,{baseURL: "http://localhost:8080/"})
        
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
        });
        if (response.status === 200) {
            loggedIn.value = false
            role.value = null
            displayName.value = null
            return true
        }
        return false
    }

    function setAuthentication(data: Authentication): void {
        const authorities = data.authorities.map((value) => value.authority)
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
        if (
            route.meta?.role !== undefined &&
            Array.isArray(route.meta.role) &&
            route.meta.role.length > 0 &&
            (!loggedIn.value || !route.meta.role.includes(role.value))
        ) {
            return false
        }
        return true
    }

    async function checkLoggedIn() {
        axios.get<Authentication>("/auth", {baseURL: "http://localhost:8080/"}).then((response) => {
            if (response.status === 200) {
                setAuthentication(response.data)
            }
        })
    }

    void checkLoggedIn()

    return {
      loaded,
      loggedIn,
      login,
      logout,
      role,
      isRouteVisible,
      displayName,
      checkLoggedIn, // Falls du diesen später noch benötigst
  }
}, {
  persist: true // <-- sorgt dafür, dass der State gespeichert wird
});