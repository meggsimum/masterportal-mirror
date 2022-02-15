<script>
import {mapGetters, mapMutations} from "vuex";
import getComponent from "../../../../utils/getComponent";
import getters from "../store/gettersLayerClusterToggler";
import mutations from "../store/mutationsLayerClusterToggler";
import isObject from "../../../../utils/isObject";

export default {
    name: "LayerClusterToggler",
    data () {
        return {
            storePath: this.$store.state.Tools.LayerClusterToggler,
            isToggled: true
        };
    },
    computed: {
        ...mapGetters("Tools/LayerClusterToggler", Object.keys(getters))
    },
    watch: {
        /**
         * Listens to the active property change.
         * @param {Boolean} isActive Value deciding whether the tool gets activated or deactivated.
         * @returns {void}
         */
        active (isActive) {
            if (isActive) {
                this.toggleLayers();
            }
        }
    },
    created () {
        this.$on("close", this.close);
    },
    methods: {
        ...mapMutations("Tools/LayerClusterToggler", Object.keys(mutations)),

        /**
         * closes the tool
         * @returns {void}
         */
        close () {
            this.setActive(false);
            const model = getComponent(this.storePath.id);

            if (model) {
                model.set("isActive", false);
            }
        },

        /**
         * Toggles and untoggles the layers from configuration
         * @returns {void}
         */
        toggleLayers () {
            if (Array.isArray(this.storePath.clusterList) && this.storePath.clusterList.length) {
                this.storePath.clusterList.forEach(id => {
                    let layerId = id;

                    if (isObject(id) && id !== null && typeof id.layerId === "string" && typeof id.suffix === "string") {
                        layerId = id.layerId + "-" + id.suffix;
                    }
                    else if (typeof layerId !== "string") {
                        console.warn(this.$t("common:modules.tools.layerClusterToggler.idFormatError"));
                        return;
                    }

                    Radio.trigger("ModelList", "addModelsByAttributes", {"id": layerId});
                    const layer = Radio.request("ModelList", "getModelByAttributes", {"id": layerId});

                    if (typeof layer === "undefined") {
                        console.warn(this.$t("common:modules.tools.layerClusterToggler.idError", {layerId}));
                    }
                    else {
                        layer.set("isSelected", this.isToggled);
                    }
                });

                this.isToggled = !this.isToggled;
            }
            this.close();
        }
    }
};
</script>

<template lang="html">
    <div />
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
</style>
