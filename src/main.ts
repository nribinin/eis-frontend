import { createApp } from "vue";
import { createPinia } from "pinia";
import persistedstate from "pinia-plugin-persistedstate"; // Plugin importieren

import "materialize-css/dist/css/materialize.min.css";
import App from "./App.vue";
import router from "./router";
import axios, {HttpStatusCode} from "axios";
import 'choices.js/public/assets/styles/choices.min.css'

const app = createApp(App);

// Pinia einrichten und Persist Plugin hinzufügen
const pinia = createPinia();
pinia.use(persistedstate);
app.use(pinia);

app.use(router);

axios.defaults.baseURL = (import.meta.env.VITE_API ?? '') + '/eis/api'
//axios.defaults.baseURL = "http://10.2.24.50:10001/api";
axios.defaults.withCredentials = true;
/*axios.defaults.withXSRFToken = true;
axios.defaults.xsrfCookieName = "XSRF-TOKEN";
axios.defaults.xsrfHeaderName = "X-XSRF-TOKEN";*/
axios.interceptors.request.use((request) => {
  return request;
});
axios.interceptors.response.use(null, (error) => {
  console.log(error.config?.method);
  if (error.response.status == HttpStatusCode.Unauthorized) {
    if (error.config?.method?.toLowerCase() == 'get') {
      M.toast({html: 'Sie müssen sich einloggen, um diese Seite anzuzeigen.'})
    } else {
      M.toast({html: 'Session abgelaufen, bitte loggen Sie sich erneut ein.'})
    }
  }
  /*if ((error.response.status == HttpStatusCode.BadRequest || error.response.status == HttpStatusCode.ImUsed) && error.response?.data != null) {
    M.toast({html: error.response?.data});
  }*/
  if (error.response.status == HttpStatusCode.Forbidden) {
    M.toast({html: 'Sie haben nicht die notwendigen Berechtigungen, um diese Seite aufzurufen.'})
  }
  if (error.response.status >= 500) {
    M.toast({html: 'Serverfehler, bitte melden Sie sich bitte beim Systemadministrator!'})
  }
  return Promise.reject(error);
});

app.mount("#app");
