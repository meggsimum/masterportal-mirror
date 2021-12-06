<script>

import BasicDragHandle from "./BasicDragHandle.vue";
import BasicResizeHandle from "./BasicResizeHandle.vue";

export default {
    name: "ToolWindow",
    components: {
        BasicDragHandle,
        BasicResizeHandle
    },
    props: {
        initialWidth: {
            type: Number,
            default: -1,
            required: false
        },
        focusToCloseIcon: {
            type: Boolean,
            default: false,
            required: false
        }
    },
    computed: {
        /**
         * Calculates initial width of sidebar or window.
         * Returns nothing if no number is set so that it can be overwritten
         * @returns {String}    Width style in px
         */
        initialToolWidth () {
            let pixelWidth = parseFloat(this.initialWidth, 10);

            if (pixelWidth < 0 || isNaN(pixelWidth)) {
                return "";
            }

            if (pixelWidth <= 1) {
                pixelWidth = this.width * window.innerWidth;
            }

            return "width: " + Math.floor(pixelWidth) + "px";
        }
    },
    created () {
        if (this.focusToCloseIcon) {
            this.$nextTick(() => {
                if (this.$refs["close-icon"]) {
                    this.$refs["close-icon"].focus();
                }
            });
        }
    },
    methods: {
        close (event) {
            if (event.type === "click" || event.which === 32 || event.which === 13) {
                this.$emit("close");
            }
        }
    }
};
</script>

<template>
    <div
        class="tool-window-vue"
        :style="{initialToolWidth}"
    >
        <div class="tool-window-heading">
            <slot name="leftOfTitle" />

            <BasicDragHandle
                target-sel=".tool-window-vue"
                class="heading-element flex-grow"
            >
                <p class="tool-window-heading-title">
                    <slot name="title" />
                </p>
            </BasicDragHandle>

            <slot name="rightOfTitle" />

            <div class="heading-element">
                <span
                    ref="close-icon"
                    tabindex="0"
                    class="bootstrap-icon"
                    @click="close($event)"
                    @keydown="close($event)"
                >
                    <i class="bi-x-lg" />
                </span>
            </div>
        </div>

        <div class="vue-tool-content-body">
            <slot name="body" />
        </div>

        <BasicResizeHandle
            v-for="hPos in ['tl', 'tr', 'br', 'bl']"
            :id="'basic-resize-handle-' + hPos"
            :key="hPos"
            :h-pos="hPos"
            target-sel=".tool-window-vue"
            :min-w="200"
            :min-h="100"
        />
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";

    $color_1: rgb(85, 85, 85);
    $font_family_1: "MasterPortalFont Bold","Arial Narrow",Arial,sans-serif;
    $background_color_1: rgb(255, 255, 255);

    .tool-window-vue {
        background-color: $background_color_1;
        display: block;
        position: absolute;
        padding:0;
        top: 20px;
        right: 20px;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.176);
        z-index: 999;
        min-width: 280px;

        .basic-resize-handle {
            position:absolute;
            width:6px;
            height:6px;
        }
        #basic-resize-handle-tl { top: 0; left: 0; }
        #basic-resize-handle-tr { top: 0; right: 0;}
        #basic-resize-handle-br { bottom: 0; right: 0;}
        #basic-resize-handle-bl { bottom: 0; left: 0;}
    }

    .tool-window-heading{
        padding: 5px 5px 5px 5px;
        border-bottom: 1px solid rgb(229, 229, 229);
        font-family: $font_family_1;
        display:flex;
        flex-direction:row;
        width:100%;
        .heading-element {
            white-space: nowrap;
            color: $color_1;
            font-size: 14px;
            padding: 6px;

            &.flex-grow {
                flex-grow:99;
                overflow: hidden;
            }
            .bootstrap-icon {
                padding: 5px;
                &:focus {
                    @include primary_action_focus;
                }
                &:hover {
                    @include primary_action_hover;
                }
            }

            > span {
                > .bi-dash-lg { top: 3px; }
                &:hover {
                    &:not(.win-icon) {
                        @include primary_action_hover;
                    }
                }
            }
        }
    }

    .tool-window-heading-title {
        padding-top: 7px;
        margin:0;
        overflow:hidden;
        white-space: nowrap;
    }

    .vue-tool-content-body {
        position: relative;
        height: calc(100% - 58px);
        width: 100%;
        max-height:72vh;
        -webkit-overflow-scrolling: touch;
        background-color: $background_color_1;
        overflow: auto;
    }
</style>
