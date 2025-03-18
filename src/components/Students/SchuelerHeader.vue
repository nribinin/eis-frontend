<template>
  <nav class="header">
    <div class="header-title">
      <h3>Ampel von {{ title }}</h3>
    </div>
    <button class="logout" @click="logout" aria-label="Logout">
      <span class="material-icons">exit_to_app</span>
    </button>
  </nav>
</template>

<script lang="ts" setup>
import { useAuthenticationStore } from "@/stores/AuthenticationStore.ts";
import { useRouter } from "vue-router";
import { useSnackbarStore } from "@/stores/SnackbarStore.ts";

const snackbar = useSnackbarStore();
const router = useRouter();
const authenticationStore = useAuthenticationStore();

async function logout() {
  try {
    const success = await authenticationStore.logout();
    if (success) {
      await router.push("/");
    } else {
      snackbar.push("Logout fehlgeschlagen.");
    }
  } catch (error) {
    snackbar.push("Logout fehlgeschlagen");
  }
}

const title = authenticationStore.displayName;
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: black;
  color: white;
  padding: 1rem 1.5rem;
  flex-wrap: nowrap; /* Verhindert Zeilenumbruch */
}

/* Der Title nimmt den verfügbaren Platz ein und wird bei zu langem Text abgeschnitten */
.header-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-title h3 {
  margin: 0;
  font-size: 1.5rem;
}

/* Logout als Button – bleibt durch flex-shrink unverändert */
.logout {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  flex-shrink: 0;
}

/* Material Icons Styling */
.material-icons {
  font-size: 2rem;
}

/* Responsive Anpassungen für kleinere Bildschirme */
@media (max-width: 768px) {
  .header {
    padding: 1rem;
  }
  .header-title h3 {
    font-size: 1.3rem;
  }
  .material-icons {
    font-size: 1.8rem;
  }
}

@media (max-width: 480px) {
  .header-title h3 {
    font-size: 1.1rem;
  }
  .material-icons {
    font-size: 1.6rem;
  }
}
</style>
