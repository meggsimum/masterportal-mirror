<script>
import {mapGetters} from "vuex";
import ControlIcon from "../../ControlIcon.vue";
import TableStyleControl from "../../TableStyleControl.vue";
import scaleLayerStyle from "../utils/scaleLayerStyle";

/**
 * Easy Read Mode control that scales line width and texts in the map by a configurable factor
 * Uses scaleLayerStyle method from utils
 */
export default {
    name: "EasyReadMode",
    components: {
        ControlIcon
    },
    props: {
        layerIds: {
            type: Array,
            required: true
        },
        scaleFactor: {
            type: Number,
            required: false,
            default: 2
        },
        scaleText: {
            type: Boolean,
            required: false,
            default: false
        },
        attributes: {
            type: Array,
            required: false,
            default: () => ["polygonStrokeWidth", "circleRadius", "clusterCircleRadius", "imageScale", "clusterImageScale"]
        }
    },
    data: () => ({
        // the attributes list to alter on easy read mode
        attrs: null
    }),
    computed: {
        ...mapGetters("Map", ["map", "layerById"]),
        component () {
            return Radio.request("Util", "getUiStyle") === "TABLE" ? TableStyleControl : ControlIcon;
        },
        /**
         * Gets and Sets the global easyReadMode state
         */
        easyReadMode: {
            get () {
                return this.$store.state.easyReadMode;
            },
            set (v) {
                this.$store.commit("setEasyReadMode", v);
            }
        }
    },
    /**
     * Triggers on programm start
     * @returns {void}
     */
    created () {
        // Check if text should be scaled and sets the attributes list accordingly
        this.attrs = this.scaleText ? [...this.attributes, "textScale", "clusterTextScale"] : this.attributes;
    },
    methods: {
        /**
         * Toggles the state boolean and triggers the styling method
         * @returns {void}
         */
        toggleEasyReadMode () {
            this.easyReadMode = !this.easyReadMode;

            this.scaleLayerStyles();
        },
        /**
         * Scales WFS styles according to configured scale factors
         * @returns {void}
         */
        scaleLayerStyles () {
            const scaleFactor = this.easyReadMode ? this.scaleFactor : 1 / this.scaleFactor;
            let layerId;

            for (layerId of this.layerIds) {
                scaleLayerStyle(layerId, scaleFactor, this.attrs);
            }
        }
    }
};
</script>

<template>
    <div
        id="easy-read-mode-wrapper"
    >
        <component
            :is="component"
            class="easy-read-mode-button"
            :title="$t(`common:modules.controls.easyReadMode.${easyReadMode ? 'disable' : 'enable'}`)"
            :icon-name="easyReadMode ? 'eye-close' : 'eye-open'"
            :on-click="toggleEasyReadMode"
        />
    </div>
</template>

<style lang="scss">
    /* ⚠️ unscoped css, extend with care;
     * control (.ol-overviewmap) is out of scope;
     * overriding with global rule that avoids leaks
     * by using local id #overviewmap-wrapper */

    @import "~variables";
    $box-shadow: 0 6px 12px $shadow;

    #easy-read-mode-wrapper {
        position: relative;
    }
</style>
