<script>
import Tool from "../../Tool.vue";
import getComponent from "../../../../utils/getComponent";
import {mapActions, mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersGeneralFilter";
import mutations from "../store/mutationsGeneralFilter";
import LayerFilterSnippet from "./LayerFilterSnippet.vue";
import {convertToNewConfig} from "../utils/convertToNewConfig";

export default {
    name: "GeneralFilter",
    components: {
        Tool,
        LayerFilterSnippet
    },
    data () {
        return {
            storePath: this.$store.state.Tools.GeneralFilter
        };
    },
    computed: {
        ...mapGetters("Tools/GeneralFilter", Object.keys(getters)),
        console: () => console
    },
    created () {
        this.$on("close", this.close);
    },
    mounted () {
        this.$nextTick(() => {
            this.initialize();
            // console.log("Alte Config", this.configs);
            // console.log("Neue Config", this.convertToNewConfig(this.configs));
        });
    },
    methods: {
        ...mapMutations("Tools/GeneralFilter", Object.keys(mutations)),
        ...mapActions("Tools/GeneralFilter", ["initialize"]),
        convertToNewConfig,
        close () {
            this.setActive(false);
            const model = getComponent(this.storePath.id);

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t(name)"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
        :initial-width="300"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="tool-general-filter"
            />
            <LayerFilterSnippet />
        </template>
    </Tool>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
</style>
