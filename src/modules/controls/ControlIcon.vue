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
        },
        /** error message for an inactive control */
        errorMessage: {
            type: String,
            default: ""
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
        <span v-if="errorMessage !== ''">
            {{ errorMessage }}
        </span>
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
        color: $white;

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
        >span {
            display: none;
        }

        /* pseudo-class state effects */
        &:hover {
            background-color: lighten($primary, 10%);
            > span {
                display: block;
                background-color: lighten($primary, 10%);
                position: absolute;
                color: $white;
                font-size: $font_size_small_custom;
                right: 40px;
                width: 300px;
                top: -5px;
                padding: 10px;
            }
        }
        &:focus {
            background-color: lighten($primary, 15%);
            outline: 1px solid lighten($primary, 15%);
        }
        &:active {
            background-color: lighten($primary, 5%);
        }

        &:disabled {
            background-color: $light-grey;
            color: $dark_grey;
            cursor: default;
        }
    }
    .bi-plus-icon {
        content: url("data:image/svg+xml, %3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-plus-lg' viewBox='0 0 16 16'%3e%3cpath fill-rule='evenodd' d='M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z' stroke='white'/%3e%3c/svg%3e");
        height: 28px;
    }
    .bi-minus-icon {
        content: url("data:image/svg+xml, %3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-dash-lg' viewBox='0 0 16 16'%3e%3cpath fill-rule='evenodd' d='M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8Z' stroke='white' stroke-width='1'/%3e%3c/svg%3e");
        height: 28px;
    }
    /* TODO: Since every bootstrap-icon is supported via config, rules for every bootstrap-icon should exist here */
</style>
