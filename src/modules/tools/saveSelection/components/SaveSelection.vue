<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import getComponent from "../../../../utils/getComponent";
import ToolTemplate from "../../ToolTemplate.vue";
import constants from "../store/constantsSaveSelection";

export default {
    name: "SaveSelection",
    components: {
        ToolTemplate
    },
    computed: {
        ...mapGetters("Tools/SaveSelection", constants.getters)
    },
    watch: {
        /**
         * Prepares the Url that can be copied and sets focus.
         * @param {Boolean} isActive - if active or not
         * @returns {void}
         */
        active (isActive) {
            this.filterExternalLayer(Radio.request("ModelList", "getModelsByAttributes", {isSelected: true, type: "layer"}));
            if (isActive) {
                this.setFocusToFirstControl();
            }
        }
    },
    created () {
        Backbone.Events.listenTo(Radio.channel("ModelList"), {
            "updatedSelectedLayerList": this.filterExternalLayer
        });

        if (Object.prototype.hasOwnProperty.call(Config, "simpleMap")) {
            console.warn("The Parameter 'simpleMap' in the config.js is deprecated in the next major release. Please use the parameter 'simpleMap' as part of the configuration of the 'saveSelection' tool in the config.json.");
            this.setSimpleMap(Config.simpleMap);
        }

        this.$on("close", this.close);
    },
    methods: {
        ...mapMutations("Tools/SaveSelection", constants.mutations),
        ...mapActions("Tools/SaveSelection", constants.actions),

        /**
         * Sets the focus to the first control
         * @returns {void}
         */
        setFocusToFirstControl () {
            this.$nextTick(() => {
                if (this.$refs["tool-saveSelection-input-url"]) {
                    this.$refs["tool-saveSelection-input-url"].focus();
                }
            });
        },
        close () {
            this.setActive(false);

            // The value "isActive" of the Backbone model is also set to false to change the CSS class in the menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.id);

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};
</script>

<template>
    <ToolTemplate
        :title="$t(name)"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
    >
        <template #toolBody>
            <form id="tool-saveSelection-form">
                <div class="form-group form-group-sm">
                    <label for="tool-saveSelection-input-url">{{ simpleMap ? "Geoportal" : "" }} URL</label>
                    <input
                        id="tool-saveSelection-input-url"
                        ref="tool-saveSelection-input-url"
                        type="text"
                        class="form-control form-control-sm"
                        :value="url"
                        @click="copyToClipboard($event.currentTarget)"
                    >
                </div>
                <div
                    v-if="simpleMap"
                    id="tool-saveSelection-simpleMapUrl"
                    class="form-group form-group-sm"
                >
                    <label for="tool-saveSelection-input-simpleMapUrl">Simplemap URL</label>
                    <input
                        id="tool-saveSelection-input-simpleMapUrl"
                        type="text"
                        class="form-control form-control-sm"
                        :value="url + '&uiStyle=simple'"
                        @click="copyToClipboard($event.currentTarget)"
                    >
                </div>
                <span
                    v-else
                    id="tool-saveSelection-helpBlock"
                    class="info"
                >
                    {{ $t("common:modules.tools.saveSelection.infoText") }}
                </span>
            </form>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
@import "~variables";

@media (min-width: 768px) {
    form {
        width: 450px;
    }
}
span {
    font-size: 11px;
}

</style>
