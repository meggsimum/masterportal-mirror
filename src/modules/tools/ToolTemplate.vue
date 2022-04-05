<script>
import {mapGetters} from "vuex";
import BasicDragHandle from "../../share-components/BasicDragHandle.vue";
import BasicResizeHandle from "../../share-components/BasicResizeHandle.vue";

export default {
    name: "ToolTemplate",
    components: {
        BasicDragHandle,
        BasicResizeHandle
    },
    props: {
        title: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            required: true
        },
        active: {
            type: Boolean,
            default: false,
            required: false
        },
        renderToWindow: {
            type: Boolean,
            default: true,
            required: false
        },
        resizableWindow: {
            type: Boolean,
            default: false,
            required: false
        },
        initialWidth: {
            type: Number,
            default: -1,
            required: false
        },
        initialWidthMobile: {
            type: Number,
            default: -1,
            required: false
        },
        deactivateGFI: {
            type: Boolean,
            default: true,
            required: false
        },
        focusToCloseIcon: {
            type: Boolean,
            default: false,
            required: false
        }
    },
    data () {
        return {
            isMinified: false
        };
    },
    computed: {
        ...mapGetters(["uiStyle"]),
        /**
         * Calculates initial width of sidebar or window for Desktop and Mobile (if props are given).
         * @returns {Array} initialToolWidth and initialToolWidthMobile for CSS
         */
        widths () {
            return {
                "--initialToolWidth": this.getWidth(this.initialWidth),
                "--initialToolWidthMobile": this.getWidth(this.initialWidthMobile)
            };
        }
    },
    watch: {
        /**
         * Shows or hides tool when active props changes. Also triggers map update due to change of available
         * space for map if shown in sidebar.
         * @param {Boolean} newValue Flag if tool is active.
         * @returns {void}
         */
        active: function (newValue) {
            Radio.trigger("ModelList", "toggleDefaultTool");

            this.$nextTick(() => {
                this.updateMap();

                if (newValue && this.focusToCloseIcon) {
                    if (this.$refs["close-icon"]) {
                        this.$refs["close-icon"].focus();
                    }
                }
            });

        }
    },
    methods: {
        /**
         * Calculates initial width of input parameter.
         * @param {String} inputWidth the width setting
         * @returns {String} Width style in px
         */
        getWidth (inputWidth) {
            let pixelWidth = parseFloat(inputWidth);

            if (pixelWidth < 0 || isNaN(pixelWidth)) {
                return "auto";
            }

            if (pixelWidth <= 1) {
                pixelWidth = pixelWidth * window.innerWidth;
            }

            return Math.floor(pixelWidth) + "px";
        },
        /**
         * Minifies tool and emits evnt.
         * @param {Event} event - the dom event
         * @return {void}
         */
        minifyTool: function (event) {
            if (event.type === "click" || event.which === 32 || event.which === 13) {
                this.isMinified = true;
                this.$emit("toolMinified");
            }
        },
        /**
         * Maximizes tool and emits evnt.
         * @param {Event} event - the dom event
         * @return {void}
         */
        maximizeTool: function (event) {
            if (event.type === "click" || event.which === 32 || event.which === 13) {
                this.isMinified = false;
                this.$emit("toolMaximized");
            }
        },
        /**
         * Emits the endResizing event upward
         * @param {Event} event the dom event
         * @returns {void}
         */
        onEndResizing (event) {
            this.$emit("endResizing", event);
        },
        /**
         * Updates the size of the map depending on sidebars visibility
         * @param {Event} event the dom event
         * @return {void}
         */
        updateMap (event) {
            if (this.renderToWindow) {
                return;
            }
            Radio.trigger("Map", "updateSize");
            this.onEndResizing(event);
        },
        /**
         * Updates size of map and emits event to parent.
         * @param {Event} event the dom event
         * @return {void}
         */
        close (event) {
            if (event.type === "click" || event.which === 32 || event.which === 13) {
                // emit event to parent e.g. coordToolKit (which uses the tool as component and is therefor the parent)
                this.$parent.$emit("close", event);
            }
        }
    }
};
</script>

<template>
    <div
        v-if="active"
        :id="renderToWindow ? '' : 'tool-sidebar-vue'"
        :class="{
            'tool-window-vue': renderToWindow,
            'table-tool-win-all-vue': uiStyle === 'TABLE',
            'is-minified': isMinified
        }"
        :style="widths"
    >
        <BasicResizeHandle
            v-if="resizableWindow && !renderToWindow"
            id="basic-resize-handle-sidebar"
            h-pos="l"
            :min-w="200"
            target-sel="#tool-sidebar-vue"
            @endResizing="updateMap"
        >
            <div>&#8942;</div>
        </BasicResizeHandle>

        <div class="win-heading">
            <div class="heading-element">
                <span
                    class="glyphicon win-icon"
                    :class="icon"
                />
            </div>

            <div
                v-if="!renderToWindow"
                class="heading-element flex-grow"
            >
                <p class="title">
                    <span>{{ title }}</span>
                </p>
            </div>

            <BasicDragHandle
                v-if="renderToWindow"
                target-sel=".tool-window-vue"
                :margin-bottom="resizableWindow ? 25 : 0"
                class="heading-element flex-grow"
            >
                <p class="title">
                    <span>{{ title }}</span>
                </p>
            </BasicDragHandle>

            <div
                v-if="renderToWindow"
                class="heading-element"
            >
                <span
                    v-if="!isMinified"
                    class="glyphicon glyphicon-minus"
                    tabindex="0"
                    title="Minimieren"
                    @click="minifyTool($event)"
                    @keydown="minifyTool($event)"
                />
                <span
                    v-else
                    class="glyphicon glyphicon-plus"
                    tabindex="0"
                    title="Maximieren"
                    @click="maximizeTool($event)"
                    @keydown="maximizeTool($event)"
                />
            </div>
            <div class="heading-element">
                <span
                    ref="close-icon"
                    class="glyphicon glyphicon-remove"
                    tabindex="0"
                    @click="close($event)"
                    @keydown="close($event)"
                />
            </div>
        </div>

        <div
            id="vue-tool-content-body"
            class="win-body-vue"
        >
            <slot name="toolBody" />
        </div>
        <div v-if="resizableWindow && renderToWindow">
            <BasicResizeHandle
                v-for="hPos in ['tl', 'tr', 'br', 'bl']"
                :id="'basic-resize-handle-' + hPos"
                :key="hPos"
                :h-pos="hPos"
                target-sel=".tool-window-vue"
                :min-w="200"
                :min-h="100"
                @endResizing="onEndResizing"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    $color: rgb(255, 255, 255);
    $font_family: "MasterPortalFont", sans-serif;
    $background_color_1: rgb(255, 255, 255);
    $background_color_2: #e10019;
    $background_color_4: #646262;

    #vue-tool-content-body {
        display:block;

        &:focus {
            @include primary_action_focus;
        }
    }

    .win-heading{
        border-bottom: 1px solid rgb(229, 229, 229);
        font-family: $font_family_accent;
        display:flex;
        flex-direction:row;
        width:100%;
        height: 35px;
        padding-left: 10px;

        .heading-element {
            white-space: nowrap;
            color: $secondary_contrast;
            font-size: 14px;

            &.flex-grow {
                flex-grow:99;
                overflow: hidden;
            }

            > .title {
                color: $secondary_contrast;
                white-space: nowrap;
                font-size: 14px;
                padding-top: 10px;
            }

            > .glyphicon {
                padding: 8px 8px 8px 8px;
                &:focus {
                    @include primary_action_focus;
                }
            }

            > span {
                &.glyphicon-minus { top: 3px; }
                &:hover {
                    &:not(.win-icon) {
                        @include primary_action_hover;
                    }
                }
            }
        }
    }

    .tool-window-vue {
        background-color: $background_color_1;
        display: block;
        position: absolute;
        padding:0;
        top: 20px;
        left: 20px;
        box-shadow: $tool_box_shadow;
        z-index: 999;
        min-width: 280px;
        width: var(--initialToolWidth);

        @media (max-width: 400px) {
            right: 20px;
        }

        @media (max-width: 767px) {
            width: var(--initialToolWidthMobile);
        }

        .win-body-vue {
            max-height:72vh;
        }

        .basic-resize-handle {
            position:absolute;
            width:6px;
            height:6px;
        }
        #basic-resize-handle-tl { top: 0; left: 0; }
        #basic-resize-handle-tr { top: 0; right: 0;}
        #basic-resize-handle-br { bottom: 0; right: 0;}
        #basic-resize-handle-bl { bottom: 0; left: 0;}

        &.is-minified {
            width:auto !important;
            height:auto !important;

            #vue-tool-content-body { display:none; }
            .win-heading{
                background-color:$background_color_2;
                .glyphicon, .title {
                    color: $color;
                }
                border-bottom:none;
                overflow: hidden;
            }
        }
    }

    .win-body-vue {
        position: relative;
        padding: $padding;
        -webkit-overflow-scrolling: touch;
        background-color: $background_color_1;
        overflow: auto;
        width: 100%;
    }

    .table-tool-win-all-vue {
        font-family: $font_family;
        border-radius: 12px;
        margin-bottom: 30px;
        .win-heading {
            font-family: $font_family;
            font-size: 14px;
            background-color: $background_color_4;
            .heading-element {
                > .title {
                    color: $color;
                    font-size: 14px;
                }
                > .buttons { color: $color; }
                > .glyphicon { color: $color; }
            }
        }
        .win-body-vue {
            border-bottom-left-radius: 12px;
            border-bottom-right-radius: 12px;
            background-color: $secondary_table_style;
            * { border-radius: 12px; }
        }
    }

    #tool-sidebar-vue {
        background-color: $background_color_1;
        padding:0 0 0 12px;
        height:100%;
        width: var(--initialToolWidth);

        @media (max-width: 767px) {
            width: var(--initialToolWidthMobile);
        }

        .win-body-vue {
            height: calc(100% - 35px);
        }
    }

    #basic-resize-handle-sidebar{
        position:absolute;
        top:0;
        left:0;
        bottom:0;
        padding:6px;
        transition:background-color 0.25s;
        background-color:#DDDDDD;

        &:hover { background-color:#BBBBBB; }
        &>div {
            position: absolute;
            top:50%;
            margin-top:-8px;
        }
    }


    @media (max-width: 767px) {
        .tool-window { right: 0; }
        #tool-sidebar-vue {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            z-index: 1050;
            overflow-x: hidden;
            overflow-y: auto;
            margin: 0;
        }
    }
</style>
