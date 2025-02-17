<template>
  <div class="maincontainer">
    <div class="fixed headcontainer">
      <div class="header">
        <nav>
          <ul>
            <div class="goBack" @click="goBack">
              <p>Zurück</p>
            </div>
            <li>
              <h3>{{ title }}</h3>
            </li>
            <div class="selectedSite:hover logout right">
              <div class="material-icons" @click="logout">exit_to_app</div>
            </div>
          </ul>
        </nav>
      </div>
      <EditTeachers />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAuthenticationStore } from "@/stores/AuthenticationStore";
import { useRouter } from "vue-router";
import EditTeachers from "@/components/Admin/AdminEditTeachers.vue";
import { useSnackbarStore } from "@/stores/SnackbarStore.ts";
const snackbar = useSnackbarStore();
const authenticationStore = useAuthenticationStore();
const router = useRouter();
const title = "Lehrer bearbeiten";
async function logout() {
  try {
    const success = await authenticationStore.logout();
    if (success) {
      await router.push("/");
    } else {
      snackbar.push("Logout fehlgeschlagen.");
    }
  } catch (error) {
    snackbar.push("Logout fehlgeschlagen: " + error);
  }
}
async function goBack() {
  await router.push("/admin");
}
</script>

<style scoped>
.maincontainer {
  max-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  width: 100%;
  padding: 1em 0;
  background-color: black;
}

.fixed {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1000;
}

nav ul {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: bold;
  background-color: black;
}

h3 {
  margin: 0 !important;
  margin-left: 0.5em !important;
  color: white;
}

nav {
  background-color: black;
}

.selectedSite {
  color: #000000;
  background-color: #ffffff;
}

.selectedSite:hover {
  color: #000000;
  background-color: #cdc1c1;
}

.footer {
  background-color: black;
  color: white;
  text-align: center;
  padding: 1em 0;
  margin-top: auto;
}

.footer-logo {
  width: 6.5em;
  height: auto;
}

.footer h2 {
  font-size: 1.5em;
  margin: 0;
}

.footer p {
  margin: 0.5em 0 0;
  font-size: 1em;
  color: #ffffff;
}
.logout {
  margin-right: 1em;
  cursor: pointer;
}
.goBack {
  cursor: pointer;
  padding-left: 0.5em;
}
@media screen and (max-width: 600px) {
  h3{
    font-size: 1.8em; 
  }
}
</style>
