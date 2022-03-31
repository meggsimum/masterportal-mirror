import getters from "./gettersControls";
import mutations from "./mutationsControls";
import attributions from "./attributions/store/indexAttributions";
import backForward from "./backForward/store/indexBackForward";
import orientation from "./orientation/store/indexOrientation";
import AttributionsItem from "./attributions/components/AttributionsItem.vue";
import BackForward from "./backForward/components/BackForward.vue";
import FullScreen from "./fullScreen/components/FullScreen.vue";
import OrientationItem from "./orientation/components/OrientationItem.vue";
import OverviewMap from "./overviewMap/components/OverviewMap.vue";
import TotalView from "./totalView/components/TotalView.vue";
import ZoomInAndOut from "./zoom/components/ZoomInAndOut.vue";
import FreezeScreen from "./freeze/components/FreezeScreen.vue";

/**
 * controls-Module is required to be able to nest controls
 * in the store as ["controls", controlName].
 * Also holds information on control components and allows
 * addons to register themselves via mutation.
 */
export default {
    namespaced: true,
    modules: {
        attributions,
        backForward,
        orientation
    },
    // initial state - information on all controls that are not addons.
    state: {
        // maps config.json.md control key to component
        componentMap: {
            attributions: AttributionsItem,
            backForward: BackForward,
            fullScreen: FullScreen,
            orientation: OrientationItem,
            overviewMap: OverviewMap,
            totalView: TotalView,
            zoom: ZoomInAndOut,
            freeze: FreezeScreen
        },
        // config.json.md control keys where the matching element is to be hidden in mobile mode
        mobileHiddenControls: [
            "backForward",
            "fullScreen",
            // NOTE "mousePosition" is not rendered as a child here
            "overviewMap",
            "totalView",
            "freeze"
        ],
        bottomControls: ["attributions", "overviewMap"]
    },
    mutations,
    getters
};
