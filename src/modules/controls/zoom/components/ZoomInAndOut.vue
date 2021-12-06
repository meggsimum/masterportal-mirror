
<script>
import {mapGetters, mapActions} from "vuex";
import ControlIcon from "../../ControlIcon.vue";

/**
 * Zoom Component.
 * NOTE This should eventually listen to the VueX map module
 * as soon as 3D/OB mode are implemented in it. The flag
 * "mapMode" is already prepared in it, but not used yet.
 * Hence it's currently listening to the radio.
 * @listens Map#RadioTriggerMapChange
 */
export default {
    name: "ZoomInAndOut",
    components: {
        ControlIcon
    },
    props: {},
    data () {
        return {
            mapChannel: Radio.channel("Map"),
            visibleInMapMode: null // set in .created
        };
    },
    computed: {
        ...mapGetters(
            "Map",
            ["maximumZoomLevelActive", "minimumZoomLevelActive"]
        )
    },
    created () {
        this.checkModeVisibility();
        this.mapChannel.on("change", this.checkModeVisibility);
    },
    beforeDestroy () {
        this.mapChannel.off("change", this.checkModeVisibility);
    },
    methods: {
        ...mapActions("Map", ["increaseZoomLevel", "decreaseZoomLevel"]),
        /**
         * Checks the map mode to note whether the zoom control is supposed to be
         * visible, which is only the case in 2D mode. In all other modes, more
         * complex navigation elements provide this element's function.
         * @returns {void}
         */
        checkModeVisibility () {
            this.visibleInMapMode = Radio.request("Map", "getMapMode") === "2D";
        }
    }
};
</script>

<template>
    <div
        v-if="visibleInMapMode"
        class="zoom-buttons"
    >
        <ControlIcon
            icon-name="plus-lg"
            :title="$t(`common:modules.controls.zoom.zoomIn`)"
            :disabled="maximumZoomLevelActive"
            :on-click="increaseZoomLevel"
        />
        <ControlIcon
            icon-name="dash-lg"
            :title="$t(`common:modules.controls.zoom.zoomOut`)"
            :disabled="minimumZoomLevelActive"
            :on-click="decreaseZoomLevel"
        />
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";
</style>
