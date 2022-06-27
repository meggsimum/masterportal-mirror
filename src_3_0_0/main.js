import "core-js/stable";
import "regenerator-runtime/runtime";

import "../css/bootstrap.scss";
import "../css/style.css";

import Vue from "vue";
import App from "./App.vue";
import store from "./app-store";

import loadAddons from "./plugins/addons";
import remoteInterface from "./plugins/remoteInterface";
import {instantiateVuetify} from "./plugins/vuetify";
import {initiateVueI18Next, initLanguage} from "./plugins/i18next";

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
    initLanguage(Config.portalLanguage);
    loadAddons(Config.addons);

    // Load remoteInterface
    if (Object.prototype.hasOwnProperty.call(Config, "remoteInterface")) {
        Vue.use(remoteInterface, Config.remoteInterface);
    }

    const app = new Vue({
        el: "#masterportal-root",
        name: "VueApp",
        render: h => h(App),
        store,
        i18n: initiateVueI18Next(),
        vuetify: instantiateVuetify()
    });

    app.$mount();
});
