<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersPortalFooter";
import mutations from "../store/mutationsPortalFooter";
import ScaleLine from "../../scaleLine/components/ScaleLine.vue";
import LanguageItem from "../../language/components/LanguageItem.vue";
import MousePosition from "../../controls/mousePosition/components/MousePosition.vue";
import store from "../../../app-store/index";
import getComponent from "../../../utils/getComponent";

/**
 * Footer that is displayed below the map. The version of the masterportal and links can be displayed here.
 */
export default {
    name: "PortalFooter",
    components: {
        LanguageItem,
        ScaleLine,
        MousePosition
    },
    computed: {
        ...mapGetters(["footerConfig", "mobile", "masterPortalVersionNumber"]),
        ...mapGetters("Map", ["is3d"]),
        ...mapGetters("PortalFooter", Object.keys(getters)),
        showLanguageSwitcher () {
            return this.$i18n.i18next.options.isEnabled() && Object.keys(this.$i18n.i18next.options.getLanguages()).length > 1;
        }
    },
    mounted () {
        this.initialize();

        if (this.footerConfig) {
            this.setShowFooter(true);
        }
    },
    methods: {
        ...mapActions("PortalFooter", [
            "initialize"
        ]),
        ...mapMutations("PortalFooter", Object.keys(mutations)),

        /**
         * Toggles the given Tool
         * @param {string} toolModelId The Model ID of the tool to activate/deactivate. ID may be empty.
         * @param {object} event The Click event
         * @returns {void}
         */
        toggleTool (toolModelId, event) {
            let model;

            if (toolModelId) {
                if (store.state.Tools[toolModelId]) {
                    model = getComponent(store.state.Tools[toolModelId].id);
                    Radio.trigger("ModelList", "setActiveToolsToFalse", store.getters["Tools/getActiveToolNames"]);
                    store.dispatch("Tools/setToolActive", {id: toolModelId, active: !model.attributes.isActive});
                }
                else {
                    model = Radio.request("ModelList", "getModelByAttributes", {id: toolModelId});
                }
                if (model) {
                    if (event) {
                        event.preventDefault();
                    }
                    model.setIsActive(!model.attributes.isActive);
                }
            }
        },
        supportedIn3D (toolModelId) {
            if (!toolModelId) {
                return true;
            }
            if (this.is3d) {
                const toolsSupportedIn3d = Radio.request("Tool", "getSupportedIn3d");

                return toolsSupportedIn3d.find(name => name.toLowerCase() === toolModelId.toLowerCase());
            }
            return true;
        }
    }
};
</script>

<template>
    <footer
        id="portal-footer"
        :class="!showFooter && 'hide-portal-footer'"
    >
        <MousePosition class="portal-footer-mouse-position" />
        <!-- keep div#footer as anchor for mouse position even if no footer is to be rendered -->
        <template v-if="showFooter">
            <template v-for="(url, index) in urls">
                <span
                    v-if="supportedIn3D(url.toolModelId)"
                    :key="`portal-footer-url-${index}`"
                >
                    {{ $t(url.bezeichnung) }}
                    <a
                        :href="url.url"
                        target="_blank"
                        @click="toggleTool(url.toolModelId, $event)"
                    >
                        {{ $t(mobile ? $t(url.alias_mobil) : $t(url.alias)) }}
                    </a>
                    <span
                        v-if="index < Object.keys(urls).length - 1 || showVersion"
                        class="bootstrap-icon d-none d-md-inline-block"
                    >
                        <i class="bi-three-dots-vertical" />
                    </span>
                </span>
            </template>
            <template v-if="showVersion">
                <span class="d-none d-md-block">
                    {{ $t("masterPortalVersion", {masterPortalVersionNumber}) }}
                </span>
            </template>
            <span class="spacer" />
            <ScaleLine />
            <LanguageItem v-if="showLanguageSwitcher" />
        </template>
        <ScaleLine
            v-else
            class="portal-footer-scaleLine"
        />
    </footer>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";

    #portal-footer {
        width: 100%;

        background: fade($secondary, 90%);

        font-family: $font_family_narrow;
        color: $secondary_contrast;
        font-size: $font_size_tiny;

        box-shadow: 0px -6px 12px $shadow;
        padding: 4px 10px;

        z-index: 2;

        display: flex;
        position: relative;

        a {
            color: darken($secondary_focus, 10%);
            &:hover{
                @include primary_action_hover;
            }
        }

        &.hide-portal-footer {
            padding: 0;
        }

        .spacer {
            flex-grow: 1;
        }

        .bootstrap-icon {
            padding: 0 8px;
        }

        .portal-footer-mouse-position {
            position: absolute;
            left: 0;
            bottom: 100%;
            /* should share bottom-line last control element */
            margin-bottom: 15px;
        }

        a[target=_blank]{
            color: #1F4B70;
        }

        .portal-footer-scaleLine {
            position: absolute;
            right: 0;
            bottom: 100%;
        }
    }
</style>
