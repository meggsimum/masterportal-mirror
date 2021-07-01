import store from "./app-store";
import Vue from "vue";

/* eslint-disable no-undef */
const allAddons = VUE_ADDONS || {};

/**
 * Adds all addons based on config.js and addonsConf.json to the Vue Instance and store
 * @param {String[]} config The array of addonKeys specified in config.js
 * @returns {void}
 */
export default async function (config) {
    Vue.prototype.$toolAddons = []; // add .$toolAddons to store tools in
    Vue.prototype.$gfiThemeAddons = []; // add .$gfiThemeAddons to store themes in
    if (config) {
        const addons = config.map(async addonKey => {
            try {
                const addonConf = allAddons[addonKey];

                if (Object.prototype.hasOwnProperty.call(addonConf, "type")) {
                    if (addonConf.type === "tool") {
                        await loadToolAddons(addonKey);
                    }
                    else if (addonConf.type === "gfiTheme") {
                        await loadGfiThemes(addonKey);
                    }
                }
            }
            catch (e) {
                console.warn(e);
                console.warn(`The module ${addonKey} does not include a Vue-component and/or vuex-store-module. Please make sure the folder contains a ${addonKey}.vue and ${addonKey}.js file. Maybe it is an backbone-addon.`, e);
            }
        });

        await Promise.all(addons);
    }
}

/**
 * Loads the gfi themes and creates the Vue component and adds it to Vue instance globally
 * @param {String} addonKey specified in config.js
 * @returns {void}
 */
async function loadGfiThemes (addonKey) {
    const addon = await loadAddon(addonKey);

    Vue.component(addon.component.name, addon.component);
    // Add the componentName to a global array on vue instance called $gfiThemeAddons
    Vue.prototype.$gfiThemeAddons.push(addon.component.name);
}

/**
 * Creates the Vue component and adds it to Vue instance globally.
 * Registeres the store at module "Tools" and adds the local-files.
 * @param {String} addonKey specified in config.js
 * @returns {void}
 */
async function loadToolAddons (addonKey) {
    const addon = await loadAddon(addonKey);

    // Add the addonKey to a global array on vue instance
    Vue.prototype.$toolAddons.push(addon.component.name);

    // register the vuex store module
    store.registerModule(["Tools", addon.component.name], addon.store);
    store.dispatch("Tools/addTool", addon.component);
}

/**
 * Loads the addon with locales.
 * @param {String} addonKey specified in config.js
 * @returns {Object} The addon.
 */
async function loadAddon (addonKey) {
    const addonModule = await import(
        /* webpackChunkName: "[request]" */
        /* webpackInclude: /addons[\\\/].*[\\\/]index.js$/ */
        /* webpackExclude: /(node_modules)|(.+unittests.)|(.+test.)+/ */
            `../addons/${allAddons[addonKey].entry}`
        ),
        addon = addonModule.default;

    // Add the locale
    for (const localeKey in addon.locales) {
        i18next.addResourceBundle(localeKey, "additional", addon.locales[localeKey], true);
    }

    return addon;
}

