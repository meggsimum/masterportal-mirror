import "core-js/stable";
import "regenerator-runtime/runtime";

import "../css/bootstrap.scss";
import "../css/style.css";

import Vue from "vue";
import App from "./App.vue";
import store from "./app-store";

/* eslint-disable no-process-env */
if (process.env.NODE_ENV === "development") {
    Vue.config.devtools = true;
}
Vue.config.productionTip = false;

const configPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/") + 1) + "config.js",
    loadConfigJs = new Promise((resolve, reject) => {
        const script = document.createElement("script");

        document.body.appendChild(script);
        script.onload = resolve;
        script.onerror = reject;
        script.async = true;
        script.src = configPath;
    });

// Wait until config.js is loaded
loadConfigJs.then(() => {
    const app = new Vue({
        el: "#masterportal-root",
        name: "VueApp",
        render: h => h(App),
        store
    });

    app.$mount();
});
