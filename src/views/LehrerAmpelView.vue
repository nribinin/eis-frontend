<template>
  <div class="maincontainer">
    <div class="fixed headcontainer">
      <div class="header">
        <nav>
          <ul>
            <li>
              <h3>Ampeleintragung</h3>
            </li>
            <div>
              <li class="selectedSite choose">Ampeleintragung</li>
              <li @click="toKV" class="selectSite hoveOnKV choose">
                KV-Ansicht
              </li>
              <div class="logout right">
                <div class="material-icons" @click="logout">exit_to_app</div>
              </div>
            </div>
          </ul>
        </nav>
      </div>

    </div>
    <Legende />
    <Teacher />
  </div>
</template>

<script lang="ts" setup>
import Teacher from "@/components/Teacher/TeacherComponent.vue";
import Legende from "@/components/Teacher/LegendeKomp.vue";
import { useAuthenticationStore } from "@/stores/AuthenticationStore.ts";
import { useRouter } from "vue-router";
import { useSnackbarStore } from "@/stores/SnackbarStore.ts";
const snackbar = useSnackbarStore();

const router = useRouter();
const authenticationStore = useAuthenticationStore();

async function toKV() {
  router.push("/lehrer/kv");
}

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
</script>

<style scoped>
.icontext {
  display: flex !important;
  align-items: center !important;
  flex-direction: initial;
}

.maincontainer {
  overflow-y: auto;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  width: 100%;
}

.fixed {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1000;
}

body {
  overflow-y: hidden;
  height: auto;
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
}

.selectedSite {
  color: #000000;
  background-color: #ffffff;
}

.hoveOnKV:hover {
  color: #000000;
  background-color: #cdc1c1;
  cursor: pointer;
}

.choose {
  padding-right: 10px;
  padding-left: 10px;
}

.selectSite {
  cursor: pointer;
}

.logout {
  margin-right: 1em;
  margin-left: 10px;
  margin-top: 6px;
  margin-bottom: -5.6px;
}

.logout:hover {
  cursor: pointer;
}

@media screen and (max-width: 900px) {
  h3 {
    font-size: 2em !important;
  }

  nav {
    height: 10vh !important;
  }

  ul {
    height: 10vh !important;
  }
}

@media screen and (max-width: 600px) {
  h3 {
    display: none;
  }

  nav ul {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5em;
    height: 4em !important;
    background-color: black !important;
  }

  ul {
    height: 4em !important;
  }

  li {
    height: 4em !important;
    display: flex;
    align-items: center;
  }

  .nav-links {
    display: flex;
    gap: 0.5em;
    flex-wrap: wrap;
  }

  .choose {
    padding: 0.7em 0.7em;
  }

  .logout {
    height: 4em !important;
    display: flex;
    align-items: center;
    margin: 0 !important;
    margin-left: 0.5em !important;
    margin-right: 0.5em !important;
    float: right;
  }

  .material-icons {
    font-size: 2em;
  }
}

@media screen and (max-width: 450px) {
  nav {
    background-color: black !important;
    height: 4em !important;
  }

  ul {
    background-color: black !important;
    height: 3em !important;
  }
}
</style>
