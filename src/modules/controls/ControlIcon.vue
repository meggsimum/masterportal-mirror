<script>
/**
 * ControlIcon component to be used by controls to display
 * clickable control buttons.
 */
export default {
    name: "ControlIcon",
    props: {
        /** Name of the bootstrap icon, with or without prefix 'bi-' */
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
         * @returns {String} icon name with added prefix 'bi-' if it was missing
         */
        iconClass () {
            return this.iconName.startsWith("bi-") ? this.iconName : `bi-${this.iconName}`;
        }
    }
};
</script>

<template>
    <button
        type="button"
        :tabindex="disabled ? '-1' : '0'"
        :class="['control-icon', 'bootstrap-icon', inline ? 'inline' : 'standalone']"
        :title="title"
        :disabled="disabled"
        @click.stop="onClick"
        @keyup.space.stop.prevent="onClick"
    >
        <!-- children should usually be placed absolutely in relation to ControlIcon -->
        <i
            :class="iconClass"
        />
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

        font-size: calc(#{$icon_length} - 0.35 * #{$icon_length});
        height: $icon_length;
        width: $icon_length;

        box-shadow: 0 6px 12px $shadow;
    }

    .inline {
        display: inline-block;
        text-align: center;
        top: auto;

        font-size: calc(#{$icon_length_small} - 0.35 * #{$icon_length_small});
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
        > i {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            // adjust line-height to use same height as ::before Element
            line-height: 0;
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
    /* TODO: Since every bootstrap-icon is supported via config, rules for every bootstrap-icon should exist here */
</style>
