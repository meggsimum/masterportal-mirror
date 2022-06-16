import loadAddons from "../src/addons";
import "../modules/restReader/RadioBridge";
import Autostarter from "../modules/core/autostarter";
import Util from "../modules/core/util";
import StyleList from "../modules/vectorStyle/list";
import Preparser from "../modules/core/configLoader/preparser";
import WFSTransactionModel from "../modules/wfsTransaction/model";
import MenuLoader from "../modules/menu/menuLoader";
import featureViaURL from "../src/utils/featureViaURL";
import SliderView from "../modules/snippets/slider/view";
import SliderRangeView from "../modules/snippets/slider/range/view";
import WindowView from "../modules/window/view";
import SidebarView from "../modules/sidebar/view";
import ShadowView from "../modules/tools/shadow/view";
import ParcelSearchView from "../modules/tools/parcelSearch/view";
import StyleWMSView from "../modules/tools/styleWMS/view";

import {handleUrlParamsBeforeVueMount, readUrlParamEarly} from "../src/utils/parametricUrl/ParametricUrlBridge";
import {createMaps} from "../src/core/maps/maps.js";
import mapCollection from "../src/core/maps/mapCollection.js";


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

global.mapCollection = mapCollection;

/**
 * load the configuration of master portal
 * @return {void}.
 */
async function loadApp () {
    /* eslint-disable no-undef */
    const utilConfig = {},
        style = Radio.request("Util", "getUiStyle");

    /* eslint-disable no-undef */
    let searchbarAttributes = {};

    if (Object.prototype.hasOwnProperty.call(Config, "uiStyle")) {
        utilConfig.uiStyle = Config.uiStyle.toUpperCase();
    }
    if (Object.prototype.hasOwnProperty.call(Config, "proxyHost")) {
        utilConfig.proxyHost = Config.proxyHost;
    }
    if (Object.prototype.hasOwnProperty.call(Config, "proxy")) {
        utilConfig.proxy = Config.proxy;
    }

    // import and register Vue addons according the config.js
    await loadAddons(Config.addons);

    await store.dispatch("loadConfigJs", Config);

    // must be done here, else it is done too late
    readUrlParamEarly();


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

    if (Object.prototype.hasOwnProperty.call(Config, "featureViaURL")) {
        featureViaURL(Config.featureViaURL);
    }

    if (Object.prototype.hasOwnProperty.call(Config, "zoomTo")) {
        store.commit("ZoomTo/setConfig", Config.zoomTo);
    }
    // NOTE: When using these deprecated parameters, the two url parameters can't be used in conjunction
    if (Object.prototype.hasOwnProperty.call(Config, "zoomToFeature")) {
        console.warn("The configuration parameter 'zoomToFeature' is deprecated in v3.0.0. Please use 'zoomTo' instead.");
        store.commit("ZoomTo/setConfig", {zoomToFeature: Config.zoomToFeature});
        store.commit("ZoomTo/setDeprecatedParameters", true);
    }
    if (Object.prototype.hasOwnProperty.call(Config, "zoomToGeometry")) {
        console.warn("The configuration parameter 'zoomToGeometry' is deprecated in v3.0.0. Please use 'zoomTo' instead.");
        store.commit("ZoomTo/setConfig", {zoomToGeometry: Config.zoomToGeometry});
        store.commit("ZoomTo/setDeprecatedParameters", true);
    }

    new SliderView();
    new SliderRangeView();

    // Module laden
    // Tools
    new SidebarView();

    Radio.request("ModelList", "getModelsByAttributes", {type: "tool"}).forEach(tool => {
        switch (tool.id) {
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
    sbconfig = Object.assign({}, {quickHelp: store.getters.portalConfig?.quickHelp} || {});
    sbconfig = Object.assign(sbconfig, searchbarAttributes);

    if (searchbarAttributes !== undefined && sbconfig) {
        new SearchbarView(sbconfig);
    }

    LoaderOverlay.hide();
}

export {loadApp};
