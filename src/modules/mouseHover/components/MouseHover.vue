<script>
import {mapActions, mapMutations, mapGetters} from "vuex";
import actions from "../store/actionsMouseHover";
import mutations from "../store/mutationsMouseHover";
import getters from "../store/gettersMouseHover";

export default {
    name: "MouseHover",
    computed: {
        ...mapGetters("Map", ["ol2DMap", "visibleLayerList"]),
        ...mapGetters("MouseHover", Object.keys(getters)),
        ...mapGetters({
            isMobile: "mobile"
        })
    },
    mounted () {
        if (!this.isMobile && Config.mouseHover) {
            this.$nextTick(function () {
                this.setVisibleLayerList(this.visibleLayerList);
                this.initialize(this.ol2DMap);
            });
        }
    },
    methods: {
        ...mapActions("MouseHover", Object.keys(actions)),
        ...mapMutations("MouseHover", Object.keys(mutations))
    }
};
</script>

<template>
    <div
        v-if="active"
        id="mousehover-overlay"
    >
        <div
            v-if="infoBox"
            class="tooltip in mouseHover"
            role="tooltip"
        >
            <div>
                <div
                    v-for="(info, x) in infoBox"
                    :key="x"
                >
                    <span
                        v-for="(text, i) in info"
                        :key="i"
                    >
                        <p
                            v-if="i === 0"
                            class="title"
                        >{{ text }}</p>
                        <p v-else>{{ text }}</p>
                    </span>
                    <br v-if="x !== infoBox.length - 1 || pleaseZoom">
                </div><span
                    v-if="pleaseZoom"
                    class="info"
                >
                    <p>{{ $t(infoText) }}</p>
                </span>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~/css/mixins.scss";
$color_1: #777;
$background_color_1: rgb(255, 255, 255);
.tooltip {
    pointer-events: none;
}
.mouseHover {
    font-size: 12px;
    text-align: left;
    max-width: inherit;
    padding: 8px;
    background-color: $background_color_1;
    color: $color_1;
    white-space: nowrap;
    border: 1px solid rgba(0, 0, 0, 0.2);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
    .title {
        font-size: 14px;
        font-weight: bold;
    }
    .info {
        font-size: 14px;
        font-style: italic;
    }
}
</style>
