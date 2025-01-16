<template>
  <nav class="header">
    <div class="valign-wrapper left">
      <h3 style="padding: 0px !important; margin: 5px !important">
        Ampel von {{ title }}
      </h3>
    </div>
    <div class="selectedSite:hover logout right">
      <router-link to="/logout">
    <div class="material-icons" @click="logout">exit_to_app</div>
  </router-link>
    </div>
  </nav>
</template>
<script lang="ts" setup>
import { useAuthenticationStore } from "@/stores/AuthenticationStore.ts"
import { useRouter } from "vue-router"
const router = useRouter()
const authenticationStore = useAuthenticationStore()

async function logout() {
  const success = await authenticationStore.logout();
  if (success) {
    router.push("/login");
  }
}

const title = authenticationStore.displayName;
console.log(title);


</script>
<style scoped>
.selectedSite:hover {
  background-color: #cdc1c1;
}

.header {
  background-color: black;
}
</style>
