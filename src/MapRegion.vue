<script>
import AlertingItem from "./modules/alerting/components/AlertingItem.vue";
import ConfirmAction from "./modules/confirmAction/components/ConfirmAction.vue";
import ControlBar from "./modules/controls/ControlBar.vue";
import LayerInformation from "./modules/layerInformation/components/LayerInformation.vue";
import LegendWindow from "./modules/legend/components/LegendWindow.vue";
import MapMarker from "./modules/mapMarker/components/MapMarker.vue";
import QuickHelp from "./modules/quickHelp/components/QuickHelp.vue";
import ToolManager from "./modules/tools/ToolManager.vue";
import WmsTime from "./modules/wmsTime/components/WmsTime.vue";
import {mapState} from "vuex";

export default {
    name: "MapRegion",
    components: {
        AlertingItem,
        ConfirmAction,
        ControlBar,
        LayerInformation,
        LegendWindow,
        MapMarker,
        QuickHelp,
        ToolManager,
        WmsTime
    },
    computed: {
        ...mapState([
            // listen to configJson changes for mounting the tools
            "configJson",
            "i18NextInitialized"
        ])
    },
    methods: {
        /**
         * returns the config from config.js
         * @returns {Object|Boolean} the config object or false on error
         */
        getConfigObject () {
            if (typeof Config === "object" && Config !== null) {
                return Config;
            }
            return false;
        }
    }
};
</script>

<template>
    <main class="anchor">
        <!-- OpenLayers node; control map itself via vuex map module -->

        <div id="sidebar">
            <!-- Alternatively to adding the configJson lifecycle hook to every component, the Main component can wait mounting its children until the config is parsed -->
            <ToolManager
                v-if="configJson"
                :show-in-sidebar="true"
            />
        </div>

        <div id="map-wrapper">
            <div
                id="map"
            />
            <ToolManager
                v-if="configJson"
                :show-in-sidebar="false"
            />
            <div class="menu">
                <LegendWindow />
            </div>
            <div class="elements-positioned-over-map">
                <LayerInformation />
                <ControlBar class="controls" />
                <WmsTime />
                <MapMarker />
            </div>
        </div>

        <!-- elements that are somewhere above the map, but don't have a fixed position or are not always present -->
        <ConfirmAction />
        <AlertingItem />
        <QuickHelp
            v-if="getConfigObject()"
            :quick-help-config-js-object="typeof getConfigObject().quickHelp === 'object' || typeof getConfigObject().quickHelp === 'boolean' ? getConfigObject().quickHelp : false"
        />

        <template v-if="i18NextInitialized">
            <component
                :is="$options.components[addonKey]"
                v-for="addonKey in $toolAddons"
                :key="addonKey"
            />
        </template>
    </main>
</template>

<style lang="scss" scoped>
    #sidebar, .sidebar{
        position: relative;
    }
    #sidebar .tool-manager{
        height:100%;
    }

    .anchor {
        position: relative;
        overflow: hidden;

        #map-wrapper {
            overflow: hidden;
            position: relative;
            flex-grow:1;
            order:1;
        }
        #sidebar {
            order:2;
            flex-grow:0;
            height:100%;
        }

        /* map itself should fill the whole region as "background" */
        #map {
            position: absolute;
            height: 100%;
            width: 100%;
        }

        .elements-positioned-over-map {
            display: flex;
            flex-direction: column;
            align-items: flex-end;

            width: 100%;
            height: 100%;

            .controls {
                flex-grow: 1;
            }
        }

        .menu {
            position: absolute;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            width: 100%;
        }
    }
</style>
