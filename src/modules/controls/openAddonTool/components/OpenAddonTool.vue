
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
    name: "OpenAddonTool",
    components: {
        ControlIcon
    },
    props: {},
    data () {
        return {
            // mapChannel: Radio.channel("Map"),
            visibleInMapMode: true // set in .created
        };
    },
    computed: {
        // ...mapGetters( "Map", ["maximumZoomLevelActive", "minimumZoomLevelActive"] )
    },
    created () {
        // this.checkModeVisibility();
        // this.mapChannel.on("change", this.checkModeVisibility);
    },
    beforeDestroy () {
        // this.mapChannel.off("change", this.checkModeVisibility);
    },
    methods: {
        // ...mapActions("Map", ["increaseZoomLevel", "decreaseZoomLevel"]),
      
        onClick (e) {
           console.log("click");
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
            icon-name="plus"
            :title="'openAddonTool'"
            :disabled="false"
            :on-click="onClick"
        />
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";
</style>
