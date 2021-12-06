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
        /** icon name for the control icon */
        icon: {
            type: String,
            default: "skip-backward-fill"
        },
        /** icon name for the control icon in style table */
        tableIcon: {
            type: String,
            default: "house-door-fill"
        }
    },
    computed: {
        ...mapGetters("Map", ["initialCenter", "initialZoomLevel", "ol2DMap"]),

        component () {
            return Radio.request("Util", "getUiStyle") === "TABLE" ? TableStyleControl : ControlIcon;
        },
        iconToUse () {
            return Radio.request("Util", "getUiStyle") === "TABLE" ? this.tableIcon : this.icon;
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
            :icon-name="iconToUse"
            :on-click="startResetView"
        />
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";
</style>
