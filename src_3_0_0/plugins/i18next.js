import VueI18Next from "@panter/vue-i18next";
import Vue from "vue";
import HttpApi from "i18next-http-backend";
import i18nextBrowserLanguageDetector from "i18next-browser-languagedetector";

const exportContainer = {
    instance: null
};

export default exportContainer;

/**
 * Initialization. Wrapped in a function to avoid calling it initially
 * in a mochapack run.
 * @returns {object} VueI18Next instance
 */
export function initiateVueI18Next () {
    Vue.use(VueI18Next);
    exportContainer.instance = new VueI18Next(i18next, {namespaces: ["additional", "common"]});
    return exportContainer.instance;
}

/**
* initialization of the language with i18next
* @pre i18next is not initialized
* @post i18next is initialized
* @param {Object} portalLanguageConfig the configuration red from config.js
* @param {Boolean} config.enabled activates the GUI for language switching
* @param {Boolean} config.debug if true i18next show debugging for developing
* @param {Object} config.languages the languages to be used as {krz: full} where krz is "en" and full is "english"
* @param {String} config.fallbackLanguage the language to use on startup
* @param {Array} config.changeLanguageOnStartWhen the incidents that changes the language on startup as Array where the order is important
* @returns {void}
*/
export function initLanguage (portalLanguageConfig) {
    // default language configuration
    const portalLanguage = Object.assign({
        "enabled": false,
        "debug": false,
        "languages": {
            "de": "deutsch",
            "en": "english"
        },
        "fallbackLanguage": "de",
        "changeLanguageOnStartWhen": ["querystring", "localStorage", "navigator", "htmlTag"],
        "loadPath": "/locales/{{lng}}/{{ns}}.json"
    }, portalLanguageConfig);

    // init i18next
    if (Config.portalLanguage !== undefined && Config.portalLanguage.enabled) {
        i18next.use(i18nextBrowserLanguageDetector);
    }
    i18next
        .use(HttpApi)
        .init({
            debug: portalLanguage.debug,

            // lng overrides language detection - so shall not be set (!)
            // lng: portalLanguage.fallbackLanguage,
            fallbackLng: portalLanguage.fallbackLanguage,
            supportedLngs: Object.keys(portalLanguage.languages),

            // to allow en-US when only en is on the supportedLngs - nonExplicitSupportedLngs must be set to true
            nonExplicitSupportedLngs: true,
            // to not look into a folder like /locals/en-US/... when en-US is detected, use load: "languageOnly" to avoid using Country-Code in path
            load: "languageOnly",

            /**
            * getter for configured languages
            * @returns {Object}  an object {krz: full} with krz the language shortform and full the language longform
            */
            getLanguages: function () {
                return portalLanguage.languages;
            },

            /**
            * check wheather portalLanguage switcher is enabled or not
            * @returns {Boolean}  true if switcher has to be shown
            */
            isEnabled: function () {
                return portalLanguage.enabled;
            },

            ns: ["common"],
            defaultNS: "common",

            backend: {
                loadPath: portalLanguage.loadPath,
                crossDomain: false
            },

            detection: {
                // order and from where user language should be detected
                order: portalLanguage.changeLanguageOnStartWhen,

                // keys or params to lookup language from
                lookupQuerystring: "lng",
                lookupCookie: "i18next",
                lookupLocalStorage: "i18nextLng",
                lookupFromPathIndex: 0,
                lookupFromSubdomainIndex: 0,

                // cache user language on
                caches: ["localStorage"],
                excludeCacheFor: ["cimode"], // languages to not persist (cookie, localStorage)

                // optional expire and domain for set cookie
                // cookieMinutes: 10,
                // cookieDomain: "myDomain",

                // only detect languages that are in the whitelist
                checkWhitelist: true
            }
        });
    i18next.on("initialized", () => {
        if (!portalLanguage.enabled) {
            i18next.changeLanguage("de");
        }
    });
}
