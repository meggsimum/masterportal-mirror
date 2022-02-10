<script>
export default {
    name: "ModalItem",

    props: {
        showModal: {
            type: Boolean,
            default: false
        },
        forceClickToClose: {
            type: Boolean,
            default: false
        },
        modalInnerWrapperStyle: {
            type: String,
            default: ""
        },
        modalContentContainerStyle: {
            type: String,
            default: ""
        }
    },

    data: function () {
        return {
            showing: false
        };
    },

    computed: {
        showingClass () {
            return this.showing ? "showing" : "";
        }
    },

    watch: {
        // Mapping prop to data
        showModal: function (newShowing) {
            if (newShowing !== this.showing) {
                this.showing = newShowing;
            }
        },

        // Trigger modalHid to parent component
        showing: function (newShowing) {
            if (!newShowing) {
                this.$emit("modalHid");
            }
            else {
                this.$nextTick(() => {
                    if (this.$refs.discard) {
                        this.$refs.discard.focus();
                    }
                });
            }
        }
    },

    mounted () {
        document.getElementsByTagName("body")[0].appendChild(this.$el);
    },

    methods: {
        discardByClickX: function () {
            this.$emit("clickedOnX");
            this.showing = false;
        },
        discardByClickOutside: function (event) {
            if (this.forceClickToClose) {
                return;
            }

            // Ignore bubbled events
            if (event.target !== this.$el.querySelector("#modal-1-outer-wrapper")) {
                return;
            }

            this.$emit("clickedOutside");
            this.showing = false;
        }
    }
};
</script>

<template lang="html">
    <div
        id="modal-1-container"
        :class="[showingClass]"
        role="alert"
    >
        <div id="modal-1-overlay" />
        <div
            id="modal-1-outer-wrapper"
            @mousedown="discardByClickOutside"
            @dragenter.prevent="discardByClickOutside"
        >
            <div
                id="modal-1-inner-wrapper"
                :style="modalInnerWrapperStyle"
            >
                <span
                    ref="discard"
                    class="glyphicon glyphicon-remove"
                    title="Discard"
                    tabindex="0"
                    @click="discardByClickX"
                    @keydown.enter="discardByClickX"
                />
                <div
                    id="modal-1-header-container"
                >
                    <slot name="header" />
                </div>
                <div
                    id="modal-1-content-container"
                    :style="modalContentContainerStyle"
                >
                    <slot />
                </div>
                <div
                    id="modal-1-footer-container"
                >
                    <slot name="footer" />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";

    #modal-1-container{
        display:none;

        &.showing{
            display:block;
        }
        .glyphicon {
            font-size: 14px;
            padding: 5px;
            color:#555555;
            &:focus {
                @include primary_action_focus;
            }
            &:hover {
                @include primary_action_hover;
            }
        }
    }
    #modal-1-overlay{
        background-color:rgba(0, 0, 0, 0.4);
        position:absolute;
        top:0;
        left:0;
        right:0;
        bottom:0;
        z-index:1000;
    }
    #modal-1-outer-wrapper {
        position:absolute;
        top:0;
        left:0;
        right:0;
        bottom:0;
        text-align:center;
        z-index:10000;

        &:before {
            content:'';
            display:inline-block;
            height:100%;
            vertical-align:middle;
            margin-right:-0.25em;
        }
    }
    #modal-1-inner-wrapper {
        text-align:left;
        background-color:#FFFFFF;
        display:inline-block;
        vertical-align:middle;
        max-width:90%;
        position:relative;
        padding: 5px;

        .glyphicon.glyphicon-remove {
            position:absolute;
            right:2px;
            top:4px;
            z-index:4;

            &:hover {
                cursor:pointer;
            }
        }
    }
    #modal-1-container #modal-1-inner-wrapper #modal-1-content-container {
        padding:12px 24px 12px 24px;
    }
</style>
