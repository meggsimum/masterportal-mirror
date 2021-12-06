<script>
/**
 * Component that renders an entry to the table style tool box.
 * In table style mode, some controls are put in the tool box.
 *
 * As this component is currently used exchangeably with ControlIcon,
 * the props used here should be a subset of the props used in
 * Control Icon.
 *
 * This component does render itself to the spot where toolbox
 * children are, #table-tools-menu.
 */
export default {
    name: "TableStyleControl",
    props: {
        /** Name of the bootstrap, with or without prefix "bi-". */
        iconName: {
            type: String,
            required: true
        },
        /** Whether the control is currently clickable. */
        disabled: {
            type: Boolean,
            default: false
        },
        /** For TableStyle Control, title text is used as display text. */
        title: {
            type: String,
            required: true
        },
        /** Click function. */
        onClick: {
            type: Function,
            default: () => {
                console.warn("No function was defined for this TableStyleControl.");
            }
        }
    },
    computed: {
        /**
         * @returns {String} string with prefixed "bi-" if it was missing
         */
        iconClass () {
            return this.iconName.startsWith("bi-") ? this.iconName : `bi-${this.iconName}`;
        }
    },
    mounted () {
        /* NOTE As soon as the toolbox itself is written in vue, this component should be used as a child
         * of it instead of this current cross-rendering. Another mechanism is then needed to make the
         * ControlBar not render the affected controls.
         */
        document.querySelector("#table-tools-menu").appendChild(this.$el);
    }
};
</script>

<template>
    <button
        type="button"
        class="control-icon-table-style"
        tabindex="-1"
        :disabled="disabled"
        @click="onClick"
        @keyup.space.stop.prevent="onClick"
    >
        <a
            role="button"
            href="#"
            :tabindex="disabled ? '-1' : '0'"
        >
            <span class="bootstrap-icon">
                <i :class="iconClass" />
            </span>
            {{ title }}
        </a>
    </button>
</template>

<style lang="scss" scoped>
    @import "~variables";

    .control-icon-table-style {
        display: flex;
        flex-direction: row;
        pointer-events: all;
        cursor: pointer;

        width: 100%;
        margin: 0 0 6px;
        padding: 6px 0 0;

        color: #808080;
        font-size: 17px;

        border-style: solid;
        border-color: #C0C0C0;
        border-width: 1px 0 0 0;

        > a {
            color: #808080;
        }

        /* position icon in center of button */
        &::before {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        /* pseudo-class state effects */
        /* NOTE these do not yet exist; when all table style controls are
                done with this component, they should be decided on for all
                elements. Right now, this would lead to inconsistencies
                regarding the not yet migrated entries.
        &:hover {}
        &:focus {}
        &:active {}
        &:disabled {}
        */
    }
</style>
