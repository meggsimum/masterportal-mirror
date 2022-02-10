/**
 * @file
 * <h1>Welcome to the Open Source Project "Masterportal" of the [Implementierungspartnerschaft Masterportal]{@link https://www.masterportal.org/}</h1>
 */
import "core-js/stable";
import "regenerator-runtime/runtime";
import {fetch} from "./layerList";
import "../css/bootstrap.scss";
// CSS-Handling: Importieren von Css damit Webpack das verarbeitet.
import "../css/style.css";
import HttpApi from "i18next-http-backend";
import i18nextBrowserLanguageDetector from "i18next-browser-languagedetector";

const scriptTags = document.getElementsByTagName("script"),
    scriptTagsArray = Array.prototype.slice.call(scriptTags);
let strippedLocation = null,
    loadConfigJs = null,
    context = null,
    configPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/") + 1) + "config.js";

// wenn Config.js nicht in der index.html als Script-Tag eingebunden ist, muss sie zunächst zugefügt und geladen werden
if (!("Config" in window)) {

    // Pfad zur Config.js bei ParametricUrl
    if (window.location.search !== "") {
        strippedLocation = window.location.href.split("?").shift();

        // GET parameters are there for a reason - do not drop them!
        configPath = strippedLocation.substring(0, strippedLocation.lastIndexOf("/") + 1) + "config.js" + window.location.search;
    }

    // add mouseevent polyfill to fix ie11 clickhandler
    // for 3d mode
    (function (window) {
        if (typeof window.CustomEvent === "function") {
            return false; // If not IE
        }

        // Polyfills DOM4 MouseEvent

        /**
         * MouseEvent
         * @param {String} eventType parameter
         * @param {Object} params parameter
         * @returns {Event} mouseEvent
         * @constructor
         */
        function MouseEvent (eventType, params) {
            const paramsObj = params || {bubbles: false, cancelable: false},
                mouseEvent = document.createEvent("MouseEvent");

            mouseEvent.initMouseEvent(eventType, paramsObj.bubbles, paramsObj.cancelable, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

            return mouseEvent;
        }

        MouseEvent.prototype = Event.prototype;

        window.MouseEvent = MouseEvent;
        return true;
    })(window);
    // Pfad zur Config.js über data-lgv-config
    scriptTagsArray.forEach(function (scriptTag) {
        if (scriptTag.getAttribute("data-masterportal-config") !== null) {
            // ?noext notwendig, damit nicht automatisch von Require ein .js an den Pfad angehängt wird!
            configPath = scriptTag.getAttribute("data-masterportal-config");

            if (window.location.search !== "") {
                // GET parameters are there for a reason - do not drop them!
                configPath = configPath.split("?");
                configPath = configPath.shift() + "?" + configPath.concat([window.location.search.slice(1)]).join("&");
            }

            configPath += (configPath.indexOf("?") !== -1 ? "&" : "?") + "noext";
        }
    }, this);

    // Config.js laden
    loadConfigJs = new Promise((resolve, reject) => {
        const script = document.createElement("script");

        document.body.appendChild(script);
        script.onload = resolve;
        script.onerror = reject;
        script.async = true;
        script.src = configPath;
    });


    // Abwarten bis Config.js geladen ist, dann layer list laden
    loadConfigJs.then(() => {
        initLanguage(Config.portalLanguage);
        fetch(Config.layerConf);
    });

    // Show error message without Alerting
    loadConfigJs.catch((e) => {
        console.warn("loadConfigJs.catch e:", e);
        if (document.getElementById("loader")) {
            document.getElementById("loader").style.display = "none";
        }
        if (document.getElementById("map")) {
            document.getElementById("map").appendChild(document.createTextNode("Die Portalkonfiguration konnte nicht vom Pfad '" + configPath + "'' geladen werden. Bitte wenden sie sich an den Administrator."));
        }
    });
}
else {
    fetch(Config.layerConf);
}
/**
 * initialization of the language with i18next
 * @pre i18next is not initialized
 * @post i18next is initialized, i18next is bound to Backbone.i18next for control over the console
 * @param {Object} portalLanguageConfig the configuration red from config.js
 * @param {Boolean} config.enabled activates the GUI for language switching
 * @param {Boolean} config.debug if true i18next show debugging for developing
 * @param {Object} config.languages the languages to be used as {krz: full} where krz is "en" and full is "english"
 * @param {String} config.fallbackLanguage the language to use on startup
 * @param {Array} config.changeLanguageOnStartWhen the incidents that changes the language on startup as Array where the order is important
 * @returns {Void}  -
 */
function initLanguage (portalLanguageConfig) {
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
        .on("languageChanged", function (lng) {
            Radio.trigger("i18next", "languageChanged", lng);
        }, this)
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

    // bind i18next to backbone to enable use of command line with  > Backbone.i18next...
    Backbone.i18next = i18next;
}


// SCSS-Handling: Importieren von allen scss-Files im modules-Ordner
context = require.context("../modules/", true, /.+\.scss?$/);

context.keys().forEach(context);

export default context;
