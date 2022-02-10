<script>
import DefaultTheme from "../themes/default/components/DefaultTheme.vue";
import SensorTheme from "../themes/sensor/components/SensorTheme.vue";
import {mapGetters} from "vuex";
import getTheme from "../../utils/getTheme";
import Overlay from "ol/Overlay.js";
import "bootstrap/js/tooltip";
import "bootstrap/js/popover";

export default {
    name: "AttachedTemplate",
    components: {
        DefaultTheme,
        SensorTheme
    },
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            overlay: new Overlay({element: undefined})
        };
    },
    computed: {
        ...mapGetters("Map", ["clickCoord"]),
        /**
         * Returns the title of the gfi.
         * @returns {String} the title
         */
        title: function () {
            return this.feature?.getTitle();
        },

        /**
         * Returns the theme in which the feature should be displayed.
         * It only works if the theme has the same name as the theme component, otherwise the default theme will be used
         * @returns {String} the name of the theme
         */
        theme: function () {
            return getTheme(this.feature.getTheme(), this.$options.components, this.$gfiThemeAddons);
        }
    },
    watch: {
        /**
         * When the feature changes, the popover is redrawn to keep the position of the click coordinate.
         * Note: Starting from Bootstrap version 4 an update function for the popover is available.
         *       Should be adapted when updating Bootstrap.
         * @returns {void}
         */
        feature () {
            this.$nextTick(() => {
                this.overlay.setPosition(this.clickCoord);
                $(this.overlay.getElement()).popover("show");
            });
        }
    },
    created () {
        this.setFocusToFirstControl();
    },
    mounted () {
        this.createOverlay();
        this.createPopover();
    },
    beforeDestroy () {
        Radio.trigger("Map", "removeOverlay", this.overlay);
    },
    methods: {
        close (event) {
            if (event.type === "click" || event.which === 32 || event.which === 13) {
                this.$emit("close");
            }
        },

        /**
         * It will create an overlay for the attached theme.
         * @returns {void}
         */
        createOverlay () {
            const gfipopup = document.createElement("DIV");

            gfipopup.id = "gfipopup";
            document.body.appendChild(gfipopup);
            this.overlay.setElement(document.getElementById("gfipopup"));
            Radio.trigger("Map", "addOverlay", this.overlay);
            this.overlay.setPosition(this.clickCoord);
        },

        /**
         * It will create the popup window as attached theme.
         * @returns {void}
         */
        createPopover () {
            $(this.overlay.getElement()).popover({
                content: this.$el,
                html: true,
                viewport: ".ol-viewport",
                placement: function () {
                    if (this.getPosition().top > document.getElementById("map").offsetHeight / 2) {
                        return "top";
                    }

                    return "bottom";

                }
            });
            $(this.overlay.getElement()).popover("show");
        },

        /**
         * In case they key exists, returns its translation. In case the key doesn't exist returns the key.
         * @param {String} key the key to translate
         * @param {Object} [options=null] for interpolation, formating and plurals
         * @returns {String} the translation or the key itself
         */
        translate (key, options = null) {
            if (i18next.exists(key)) {
                return this.$t(key, options);
            }

            return key;
        },
        /**
         * Sets the focus to the first control (close-button)
         * @returns {void}
         */
        setFocusToFirstControl () {
            this.$nextTick(() => {
                // otherwise setting the focus was not possible in modal dialog
                setTimeout(() => {
                    if (this.$refs["gfi-close-button"]) {
                        this.$refs["gfi-close-button"].focus();
                    }
                }, 100);
            });
        }
    }
};
</script>

<template>
    <div class="gfi-attached">
        <!-- header -->
        <div class="gfi-header">
            <button
                ref="gfi-close-button"
                type="button"
                class="close"
                aria-label="Close"
                tabindex="0"
                @click="close"
                @keydown="close"
            >
                <span
                    class="glyphicon glyphicon-remove"
                />
            </button>
            <h5>
                {{ translate(title) }}
            </h5>
        </div>
        <!-- theme -->
        <div
            class="gfi-content"
        >
            <component
                :is="theme"
                :feature="feature"
            />
        </div>
        <slot name="footer" />
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";

    button.close {
        &:focus {
            @include primary_action_focus;
        }
        &:hover {
            @include primary_action_hover;
        }
    }
    .gfi-attached {
        background-color: #ffffff;
    }
    .gfi-header {
        font-size: 13px;
        font-weight: normal;
        line-height: 17px;
        color: #646262;
        padding: 0 15px;
        border-bottom: 1px solid #e5e5e5;
        button {
            font-size: 16px;
            opacity: 0.6;
        }
    }
    .gfi-content {
        overflow: auto;
        table {
            margin-bottom: 0;
        }
    }
   @media (min-width: 768px) {
    .gfi-content {
        max-height: 40vh;
        width: 100%;
    }
   }

</style>

<style lang="scss">
    .ol-viewport {
        .popover {
            padding: 0;
            width: max-content;
            max-width: 40vw;
            border: 0;
            z-index: 1;
        }
        .popover-content {
            padding: 0;
        }
    }
</style>
