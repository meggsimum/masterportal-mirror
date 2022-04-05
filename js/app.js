import Vue from "vue";
import App from "../src/App.vue";
import store from "../src/app-store";
import loadAddons from "../src/addons";
import "../modules/restReader/RadioBridge";
import Autostarter from "../modules/core/autostarter";
import Util from "../modules/core/util";
import StyleList from "../modules/vectorStyle/list";
import Preparser from "../modules/core/configLoader/preparser";
import RemoteInterface from "../modules/remoteInterface/model";
import RadioMasterportalAPI from "../modules/remoteInterface/radioMasterportalAPI";
import WFSTransactionModel from "../modules/wfsTransaction/model";
import MenuLoader from "../modules/menu/menuLoader";
import ZoomToGeometry from "../modules/zoomToGeometry/model";
import ZoomToFeature from "../modules/zoomToFeature/model";
import FeatureViaURL from "../modules/featureViaURL/model";
import SliderView from "../modules/snippets/slider/view";
import SliderRangeView from "../modules/snippets/slider/range/view";
import DropdownView from "../modules/snippets/dropdown/view";
import MouseHoverPopupView from "../modules/mouseHover/view";
import WindowView from "../modules/window/view";
import SidebarView from "../modules/sidebar/view";
import ShadowView from "../modules/tools/shadow/view";
import ParcelSearchView from "../modules/tools/parcelSearch/view";
import FilterView from "../modules/tools/filter/view";
import StyleWMSView from "../modules/tools/styleWMS/view";
import RemoteInterfaceVue from "../src/plugins/remoteInterface/RemoteInterface";
import {initiateVueI18Next} from "./vueI18Next";
import {handleUrlParamsBeforeVueMount, readUrlParamEarly} from "../src/utils/parametricUrl/ParametricUrlBridge";
import {createMaps} from "../src/core/maps/maps.js";

/**
 * Vuetify
 * @description Test vuetify as main UI framework
 * @external
 */
import {instantiateVuetify} from "../src/plugins/vuetify/vuetify";

/**
 * WFSFeatureFilterView
 * @deprecated in 3.0.0
 */
import WFSFeatureFilterView from "../modules/wfsFeatureFilter/view";
/**
 * ExtendedFilterView
 * @deprecated in 3.0.0
 */
import ExtendedFilterView from "../modules/tools/extendedFilter/view";
import TreeFilterView from "../modules/treeFilter/view";
import WfstView from "../modules/tools/wfst/view";
// controls
import ControlsView from "../modules/controls/view";
import SearchbarView from "../modules/searchbar/view";
import Button3DView from "../modules/controls/button3d/view";
import ButtonObliqueView from "../modules/controls/buttonOblique/view";
import Orientation3DView from "../modules/controls/orientation3d/view";
import VirtualcityModel from "../modules/tools/virtualCity/model";
import LoaderOverlay from "../src/utils/loaderOverlay";

let sbconfig,
    controls,
    controlsView;

/* eslint-disable no-process-env */
if (process.env.NODE_ENV === "development") {
    Vue.config.devtools = true;
}

Vue.config.productionTip = false;

/**
 * load the configuration of master portal
 * @return {void}.
 */
async function loadApp () {
    /* eslint-disable no-undef */
    const legacyAddons = Object.is(ADDONS, {}) ? {} : ADDONS,
        utilConfig = {},
        style = Radio.request("Util", "getUiStyle"),
        vueI18Next = initiateVueI18Next(),
        // instantiate Vue with Vuetify Plugin if the "vuetify" flag is set in the config.js
        // returns undefined if not
        vuetify = await instantiateVuetify();

    /* eslint-disable no-undef */
    let app = {},
        searchbarAttributes = {};

    if (Object.prototype.hasOwnProperty.call(Config, "uiStyle")) {
        utilConfig.uiStyle = Config.uiStyle.toUpperCase();
    }
    if (Object.prototype.hasOwnProperty.call(Config, "proxyHost")) {
        utilConfig.proxyHost = Config.proxyHost;
    }
    if (Object.prototype.hasOwnProperty.call(Config, "proxy")) {
        utilConfig.proxy = Config.proxy;
    }

    // RemoteInterface laden
    if (Object.prototype.hasOwnProperty.call(Config, "remoteInterface")) {
        new RemoteInterface(Config.remoteInterface);
        new RadioMasterportalAPI();
        Vue.use(RemoteInterfaceVue, Config.remoteInterface);
    }

    // import and register Vue addons according the config.js
    await loadAddons(Config.addons);

    await store.dispatch("loadConfigJs", Config);

    // must be done here, else it is done too late
    readUrlParamEarly();

    app = new Vue({
        el: "#masterportal-root",
        name: "VueApp",
        render: h => h(App),
        store,
        i18n: vueI18Next,
        vuetify
    });


    // Core laden
    new Autostarter();
    new Util(utilConfig);
    if (store.state.urlParams?.uiStyle) {
        Radio.trigger("Util", "setUiStyle", store.state.urlParams?.uiStyle);
    }

    // Pass null to create an empty Collection with options
    new Preparser(null, {url: Config.portalConf});
    handleUrlParamsBeforeVueMount(window.location.search);

    new StyleList();
    createMaps(Config, Radio.request("Parser", "getPortalConfig").mapView);
    new WindowView();

    app.$mount();

    new WFSTransactionModel();
    new MenuLoader();

    if (Object.prototype.hasOwnProperty.call(Config, "zoomToGeometry")) {
        new ZoomToGeometry(Config.zoomToGeometry);
    }
    if (Object.prototype.hasOwnProperty.call(Config, "zoomToFeature")) {
        new ZoomToFeature(Config.zoomToFeature);
    }
    if (Object.prototype.hasOwnProperty.call(Config, "featureViaURL")) {
        new FeatureViaURL(Config.featureViaURL);
    }

    new SliderView();
    new SliderRangeView();
    new DropdownView();

    if (Object.prototype.hasOwnProperty.call(Config, "mouseHover")) {
        new MouseHoverPopupView(Config.mouseHover);
    }

    // Module laden
    // Tools
    new SidebarView();

    Radio.request("ModelList", "getModelsByAttributes", {type: "tool"}).forEach(tool => {
        switch (tool.id) {
            case "filter": {
                new FilterView({model: tool});
                break;
            }
            case "shadow": {
                new ShadowView({model: tool});
                break;
            }
            case "parcelSearch": {
                new ParcelSearchView({model: tool});
                break;
            }
            /**
             * wfsFeatureFilter
             * @deprecated in 3.0.0
             */
            case "wfsFeatureFilter": {
                new WFSFeatureFilterView({model: tool});
                break;
            }
            /**
             * extendedFilter
             * @deprecated in 3.0.0
             */
            case "extendedFilter": {
                new ExtendedFilterView({model: tool});
                break;
            }
            case "treeFilter": {
                new TreeFilterView({model: tool});
                break;
            }
            case "styleWMS": {
                new StyleWMSView({model: tool});
                break;
            }
            case "wfst": {
                new WfstView({model: tool});
                break;
            }
            case "virtualCity": {
                new VirtualcityModel(tool.attributes);
                break;
            }
            default: {
                break;
            }
        }
    });

    if (!style || style !== "SIMPLE") {
        controls = Radio.request("Parser", "getItemsByAttributes", {type: "control"});
        controlsView = new ControlsView();

        controls.forEach(control => {
            let element;

            switch (control.id) {
                case "button3d": {
                    if (control.attr === true) {
                        element = controlsView.addRowTR(control.id);
                        new Button3DView({el: element});
                    }
                    break;
                }
                case "buttonOblique": {
                    if (control.attr === true) {
                        element = controlsView.addRowTR(control.id);
                        new ButtonObliqueView({el: element});
                    }
                    break;
                }
                case "orientation3d": {
                    if (control.attr === true) {
                        element = controlsView.addRowTR(control.id);
                        new Orientation3DView({el: element});
                    }
                    break;
                }
                default: {
                    break;
                }
            }
        });
    }

    searchbarAttributes = Radio.request("Parser", "getItemsByAttributes", {type: "searchBar"})[0].attr;
    sbconfig = Object.assign({}, Object.prototype.hasOwnProperty.call(Config, "quickHelp") ? {quickHelp: Config.quickHelp} : {});
    sbconfig = Object.assign(sbconfig, searchbarAttributes);

    if (searchbarAttributes !== undefined && sbconfig) {
        new SearchbarView(sbconfig);
    }

    if (Config.addons !== undefined) {
        Radio.channel("Addons");
        const i18nextLanguages = vueI18Next?.i18next?.options?.getLanguages() ? vueI18Next.i18next.options.getLanguages() : {};
        let initCounter = 0;

        Config.addons.forEach((addonKey) => {
            if (legacyAddons[addonKey] !== undefined) {
                initCounter++;
            }
        });

        initCounter = initCounter * Object.keys(i18nextLanguages).length;

        // loads all language files from addons for backbone- and vue-addons
        Config.addons.forEach((addonKey) => {
            if (legacyAddons[addonKey] !== undefined) {
                Object.keys(i18nextLanguages).forEach((lng) => {
                    import(
                        /* webpackChunkName: "additionalLocales" */
                        /* webpackInclude: /[\\\/]additional.json$/ */
                        `../addons/${addonKey}/locales/${lng}/additional.json`)
                        .then(({default: additionalLocales}) => {
                            vueI18Next.i18next.addResourceBundle(lng, "additional", additionalLocales, true);
                            initCounter--;
                            checkInitCounter(initCounter, legacyAddons);
                        }).catch(error => {
                            initCounter--;
                            console.warn(error);
                            console.warn("Translation files of addon " + addonKey + " could not be loaded or does not exist. Addon is not translated.");
                            checkInitCounter(initCounter, legacyAddons);
                        });
                });
            }
        });
    }
    LoaderOverlay.hide();
}

/**
 * Checks if all addons are initialized.
 * @param {Number} initCounter init counter
 * @param {Object} legacyAddons all addons from the config.js
 * @returns {void}
 */
function checkInitCounter (initCounter, legacyAddons) {
    if (initCounter === 0) {
        Radio.trigger("Addons", "initialized");
        loadAddOnsAfterLanguageLoaded(legacyAddons);
        store.commit("setI18Nextinitialized", true);
    }
}

/**
 * Loads AddOns after the language is loaded
 * @param {Object} legacyAddons all addons from the config.js
 * @returns {void}
 */
function loadAddOnsAfterLanguageLoaded (legacyAddons) {
    Config.addons.forEach((addonKey) => {
        if (legacyAddons[addonKey] !== undefined) {
            // .js need to be removed so we can specify specifically in the import statement that
            // webpack only searches for .js files
            const entryPoint = legacyAddons[addonKey].replace(/\.js$/, "");

            import(
                /* webpackChunkName: "[request]" */
                /* webpackInclude: /addons[\\\/].*[\\\/]*.js$/ */
                /* webpackExclude: /(node_modules)|(.+unittests.)|(.+test.)+/ */
                "../addons/" + entryPoint + ".js").then(module => {
                /* eslint-disable new-cap */
                let addon;

                try {
                    addon = new module.default();
                }
                catch (err) {
                    // cannot load addon, is maybe a Vue addon
                    return;
                }

                // addons are initialized with 'new Tool(attrs, options);', that produces a rudimental model. Now the model must be replaced in modellist:
                if (addon.model) {
                    // set this special attribute, because it is the only one set before this replacement
                    const model = Radio.request("ModelList", "getModelByAttributes", {"id": addon.model.id});

                    if (!model) {
                        console.warn("wrong configuration: addon " + addonKey + " is not in tools menu or cannot be called from somewhere in the view! Defined this in config.json.");
                    }
                    else {
                        addon.model.set("i18nextTranslate", model.get("i18nextTranslate"));
                    }
                    Radio.trigger("ModelList", "replaceModelById", addon.model.id, addon.model);
                }
            }).catch(error => {
                console.error(error);
                Radio.trigger("Alert", "alert", "Entschuldigung, diese Anwendung konnte nicht vollständig geladen werden. Bitte wenden sie sich an den Administrator.");
            });
        }
    });
}

export {loadApp};
