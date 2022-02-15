<script>
import {mapGetters, mapActions} from "vuex";
import ControlIcon from "../../ControlIcon.vue";
import TableStyleControl from "../../TableStyleControl.vue";

/**
 * TotalView adds a control that lets the user reset the
 * view's state to the initial zoom and center coordinates.
 */
export default {
    name: "TotalView",
    props: {
        /** glyphicon name for the control icon */
        glyphicon: {
            type: String,
            default: "fast-backward"
        },
        /** glyphicon name for the control icon in style table */
        tableGlyphicon: {
            type: String,
            default: "home"
        }
    },
    computed: {
        ...mapGetters("Map", ["initialCenter", "initialZoomLevel", "ol2DMap"]),

        component () {
            return Radio.request("Util", "getUiStyle") === "TABLE" ? TableStyleControl : ControlIcon;
        },
        glyphiconToUse () {
            return Radio.request("Util", "getUiStyle") === "TABLE" ? this.tableGlyphicon : this.glyphicon;
        },

        /**
         * Map was moved.
         * @returns {Boolean} true if map is not in initial zoom/center.
         */
        mapMoved: function () {
            const view = this.ol2DMap.getView(),
                center = view.getCenter();

            return this.initialCenter[0] !== center[0] ||
                this.initialCenter[1] !== center[1] ||
                this.initialZoomLevel !== view.getZoom();
        }
    },
    methods: {
        ...mapActions("Map", ["resetView"]),

        startResetView: function () {
            this.resetView();
        }
    }
};
</script>

<template>
    <div class="back-forward-buttons">
        <component
            :is="component"
            id="start-totalview"
            class="total-view-button"
            :title="$t('common:modules.controls.totalView.titleButton')"
            :disabled="!mapMoved"
            :icon-name="glyphiconToUse"
            :on-click="startResetView"
        />
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";
</style>
