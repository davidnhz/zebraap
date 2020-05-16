import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import { store } from "./store.js";
import VTooltip from "v-tooltip";

const fb = require("./firebaseConfig.js");

import "./assets/scss/app.scss";

Vue.config.productionTip = false;

Vue.use(VTooltip);

// handle page reloads
let app;
fb.auth.onAuthStateChanged(user => {
  if (!app) {
    app = new Vue({
      el: "#app",
      router,
      store,
      render: h => h(App)
    });
  }
});
