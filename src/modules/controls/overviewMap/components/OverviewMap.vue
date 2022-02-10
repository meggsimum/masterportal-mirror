<script>
import {OverviewMap} from "ol/control.js";
import {mapGetters} from "vuex";
import {getOverviewMapLayer, getOverviewMapView} from "./utils";
import ControlIcon from "../../ControlIcon.vue";
import TableStyleControl from "../../TableStyleControl.vue";

/**
 * Overview control that shows a mini-map to support a user's
 * sense of orientation within the map.
 *
 * TODO Currently using radio to detect 3D mode. Should eventually
 * listen to the vuex map module as soon as modes are modeled
 * there.
 * @listens Map#RadioTriggerMapChange
 */
export default {
    name: "OverviewMap",
    components: {
        ControlIcon
    },
    props: {
        /** resolution of mini-map view */
        startResolution: {
            type: Number,
            required: false,
            default: null
        },
        /** id of layer to show in mini-map */
        layerId: {
            type: String,
            required: false,
            default: null
        },
        /** whether the mini-map is visible initially */
        isInitOpen: {
            type: Boolean,
            default: true
        }
    },
    data: function () {
        return {
            open: this.isInitOpen,
            overviewMap: null,
            mapChannel: Radio.channel("Map"),
            visibleInMapMode: null // set in .created
        };
    },
    computed: {
        ...mapGetters(["uiStyle"]),
        ...mapGetters("Map", ["ol2DMap"]),

        component () {
            return Radio.request("Util", "getUiStyle") === "TABLE" ? TableStyleControl : ControlIcon;
        },
        localeSuffix () {
            return Radio.request("Util", "getUiStyle") === "TABLE" ? "Table" : "Control";
        }
    },
    created () {
        this.checkModeVisibility();
        this.mapChannel.on("change", this.checkModeVisibility);
    },
    beforeDestroy () {
        this.mapChannel.off("change", this.checkModeVisibility);
    },
    mounted () {
        const id = this.layerId || this.baselayer,
            layer = getOverviewMapLayer(id),
            map = this.ol2DMap,
            view = getOverviewMapView(map, this.resolution);

        if (layer) {
            this.overviewMap = new OverviewMap({
                layers: [layer],
                view,
                collapsible: false,
                // OverviewMap can only be produced in "mounted" when "target" is available already
                target: "overviewmap-wrapper"
            });
        }

        // if initially open, add control now that available
        if (this.open && this.overviewMap !== null) {
            map.addControl(this.overviewMap);
        }
    },
    methods: {
        /**
         * Toggles the visibility of the mini-map.
         * @returns {void}
         */
        toggleOverviewMapFlyout () {
            this.open = !this.open;
            if (this.overviewMap !== null) {
                this.ol2DMap[`${this.open ? "add" : "remove"}Control`](this.overviewMap);
            }
        },
        /**
         * Sets visibility flag depending on map mode; OverviewMap is not available in 3D mode.
         * @returns {void}
         */
        checkModeVisibility () {
            this.visibleInMapMode = Radio.request("Map", "getMapMode") !== "3D";
        }
    }
};
</script>

<template>
    <div
        v-if="visibleInMapMode"
        id="overviewmap-wrapper"
    >
        <component
            :is="component"
            :class="['overviewmap-button', (open && uiStyle !== 'TABLE') ? 'space-above' : '']"
            :title="$t(`common:modules.controls.overviewMap.${open ? 'hide' : 'show'}Overview${localeSuffix}`)"
            icon-name="globe"
            :on-click="toggleOverviewMapFlyout"
        />
    </div>
    <div
        v-else
        :class="{hideButton: 'overviewmap-button'}"
    />
</template>

<style lang="scss" scoped>
    /* .ol-overviewmap has fixed height in openlayers css;
     * measured this value for 12px space between control contents */
    .space-above {
        margin-top: 136px;
    }
</style>

<style lang="scss">
    /* ⚠️ unscoped css, extend with care;
     * control (.ol-overviewmap) is out of scope;
     * overriding with global rule that avoids leaks
     * by using local id #overviewmap-wrapper */

    @import "~variables";
    $box-shadow: 0 6px 12px $shadow;

    #overviewmap-wrapper {
        position: relative;

        .ol-overviewmap {
            left: auto;
            right: 100%;
            box-shadow: $box-shadow;
            border: 0;

            .ol-overviewmap-box {
                border: 2px solid $primary;
            }

            .ol-overviewmap-map {
                box-shadow: $box-shadow;
                width: 200px;
            }
        }
    }
    .hideButton {
        display: none;
    }
</style>
