<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersWmsTime";
import mutations from "../store/mutationsWmsTime";
import actions from "../store/actionsWmsTime";
import mapCollection from "../../../core/dataStorage/mapCollection.js";

export default {
    name: "LayerSwiper",
    computed: {
        ...mapGetters("Map", ["visibleLayerList", "mapMode", "mapId"]),
        ...mapGetters("WmsTime", Object.keys(getters))
    },
    mounted () {
        const target = document.getElementById("wmsTime-layerSwiper-button");

        this.setLayerSwiperTargetLayer(this.visibleLayerList.find(element => element.values_.id === this.currentTimeSliderObject.layerId + this.layerAppendix));
        this.setLayerSwiperValueX(mapCollection.getMap(this.mapId, this.mapMode).getSize()[0] / 2);
        mapCollection.getMap(this.mapId, this.mapMode).on("postcompose", this.updateMap);

        target.focus();
        this.setLayerSwiperDomSwiper(target);
    },
    beforeDestroy: function () {
        mapCollection.getMap(this.mapId, this.mapMode).un("postcompose", this.updateMap);
    },
    methods: {
        ...mapMutations("WmsTime", Object.keys(mutations)),
        ...mapActions("WmsTime", Object.keys(actions)),
        mouseMovement () {
            window.addEventListener("mousemove", this.moveSwiper);
            window.addEventListener("mouseup", this.mouseMovementStopped);
        },
        mouseMovementStopped () {
            window.removeEventListener("mousemove", this.moveSwiper);
            window.removeEventListener("mouseup", this.mouseMovementStopped);
        }
    }
};
</script>

<template>
    <button
        id="wmsTime-layerSwiper-button"
        class="btn"
        :title="$t('common:modules.wmsTime.layerSwiper.title')"
        :aria-describedby="$t('common:modules.wmsTime.layerSwiper.description', {amount: currentTimeSliderObject.keyboardMovement})"
        @keydown.left="moveSwiper"
        @keydown.right="moveSwiper"
        @mousedown="mouseMovement"
    />
</template>

<style lang="scss" scoped>
@import "~variables";

button {
    width: 50px;
    background-color: $primary;
    height: 30px;
    max-height: 100px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    -webkit-transform: translate(-50%, -50%);
    cursor: ew-resize;

    &:before {
        content: "";
        position: absolute;
        top: -5000px;
        bottom: -5000px;
        left: 50%;
        width: 4px;
        background: $primary_contrast;
        z-index: -1;
        transform: translate(-2px, 0);
        -webkit-transform: translate(-2px, 0);
    }
}
</style>
