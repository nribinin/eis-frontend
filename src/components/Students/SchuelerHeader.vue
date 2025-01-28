<template>
  <nav class="header">
    <div class="valign-wrapper left">
      <h3 style="padding: 0px !important; margin: 5px !important">
        Ampel von {{ title }}
      </h3>
    </div>
    <div class="selectedSite:hover logout right">
      <div class="material-icons" @click="logout">exit_to_app</div>
    </div>
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
.selectedSite:hover {
  background-color: #cdc1c1;
}

.header {
  background-color: black;
}
.logout {
  margin-right: 1em;
  margin-top: 5px;
  cursor: pointer;
}
</style>
