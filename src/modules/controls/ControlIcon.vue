<script>
/**
 * ControlIcon component to be used by controls to display
 * clickable control buttons.
 */
export default {
    name: "ControlIcon",
    props: {
        /** Name of the glyphicon, with or without prefix 'glyphicon-' */
        iconName: {
            type: String,
            required: true
        },
        /** Whether the icon is currently clickable or marked disabled */
        disabled: {
            type: Boolean,
            default: false
        },
        /** Tooltip text */
        title: {
            type: String,
            required: true
        },
        /** onClick function of the button element */
        onClick: {
            type: Function,
            default: () => console.warn("No onClick function was defined on this ControlIcon.")
        },
        /** if true, icon is rendered as smaller inline-block */
        inline: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        /**
         * @returns {String} glyphicon name with added prefix 'glyphicon-' if it was missing
         */
        glyphiconClass () {
            return this.iconName.startsWith("glyphicon-") ? this.iconName : `glyphicon-${this.iconName}`;
        }
    }
};
</script>

<template>
    <button
        type="button"
        :tabindex="disabled ? '-1' : '0'"
        :class="['control-icon', 'glyphicon', glyphiconClass, inline ? 'inline' : 'standalone']"
        :title="title"
        :disabled="disabled"
        @click.stop="onClick"
        @keyup.space.stop.prevent="onClick"
    >
        <!-- children should usually be placed absolutely in relation to ControlIcon -->
        <slot />
    </button>
</template>

<style lang="scss" scoped>
    @import "~variables";

    .standalone {
        display: block;
        text-align: center;
        top: auto;
        margin: 5px;

        font-size: calc($icon_length - 0.35 * $icon_length);
        height: $icon_length;
        width: $icon_length;

        box-shadow: 0 6px 12px $shadow;
    }

    .inline {
        display: inline-block;
        text-align: center;
        top: auto;

        font-size: calc($icon_length_small - 0.35 * $icon_length_small);
        width: $icon_length_small;
        height: $icon_length_small;
    }

    .control-icon {
        background-color: $primary;
        color: $primary_contrast;

        pointer-events: all;
        cursor: pointer;
        border: 0;

        /* position icon in center of button */
        &::before {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        /* pseudo-class state effects */
        &:hover {
            background-color: $primary_hover;
        }
        &:focus {
            background-color: $primary_focus;
            outline: 1px solid $primary_outline;
        }
        &:active {
            background-color: $primary_active;
        }

        &:disabled {
            background-color: $primary_inactive;
            color: $primary_inactive_contrast;
            cursor: default;
        }
    }

    /* corrections for glyphicons that don't exactly center */
    .glyphicon-plus::before {
        margin-top: -1px;
        margin-left: 1px;
    }
    .glyphicon-minus::before {
        margin-left: -1px;
        margin-top: -1px;
    }
    .glyphicon-forward::before {
        margin-left: 2px;
        margin-top: -1px;
    }
    .glyphicon-fast-backward::before {
        margin-top: -1px;
    }
    /* TODO: Since every glyphicon is supported via config, rules for every glyphicon should exist here */
</style>
