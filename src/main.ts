import { createApp } from "vue";
import { createPinia } from "pinia";
import persistedstate from "pinia-plugin-persistedstate"; // Plugin importieren

import "materialize-css/dist/css/materialize.min.css";
import App from "./App.vue";
import router from "./router";
import axios from "axios";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "vuetify/styles";
import 'choices.js/public/assets/styles/choices.min.css'
import { useSnackbarStore } from "@/stores/SnackbarStore.ts";

const app = createApp(App);
app.use(createVuetify({ components, directives }));

// Pinia einrichten und Persist Plugin hinzufügen
const pinia = createPinia();
pinia.use(persistedstate);
app.use(pinia);

app.use(router);

const snackbar = useSnackbarStore();

const port = 8080;
axios.defaults.baseURL = "http://10.110.0.58:" + port + "/api";
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
axios.defaults.xsrfCookieName = "XSRF-TOKEN";
axios.defaults.xsrfHeaderName = "X-XSRF-TOKEN";
axios.interceptors.request.use((request) => {
  return request;
});
axios.interceptors.response.use(null, (error) => {
  if (error.response.status == 401) {
    snackbar.push("Sie müssen sich einloggen, um diese Seite anzuzeigen.");
    router.push("/");
  }
  if (error.response.status == 403) {
    snackbar.push("Sie haben nicht die notwendigen Berechtigungen, um diese Seite aufzurufen.");
  }
  if (error.response.status == 500 && error.response.data === "Bad credentials") {
    snackbar.push("Benutzername oder Passwort falsch.");
  }
  else if (error.response.status == 500 && error.response.data === "Empty Password") {
    snackbar.push("Passwort darf nicht leer sein.");
  }
  else if (error.response.status == 500 && error.response.data === "Benutzer nicht gefunden") {
    snackbar.push("Username nicht gefunden.");
  }
  return Promise.reject(error);
});

app.mount("#app");
