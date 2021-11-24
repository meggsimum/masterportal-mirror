<script>
export default {
    name: "ToggleCheckbox",
    props: {
        defaultState: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: "Switch off filter"
        },
        textOn: {
            type: String,
            default: "on"
        },
        textOff: {
            type: String,
            default: "off"
        }
    },

    data () {
        return {
            currentState: false
        };
    },

    computed: {
        isActive () {
            return this.currentState;
        },
        checkedValue: {
            get () {
                return this.currentState;
            },
            set (newValue) {
                this.currentState = newValue;
                this.$emit("change", newValue);
            }
        }
    },

    beforeMount () {
        this.currentState = this.defaultState;
    },

    methods: {
        /**
         * Toggles the state
         * @param {Event} event - dom event
         * @returns {void} emits change with currentState as payload
         */
        toggle: function (event) {
            if (event.type === "click" || event.which === 32 || event.which === 13) {
                this.currentState = !this.currentState;

                this.$emit("change", this.currentState);
            }
        },
        /**
         * Sets the current State. Required to Undo a change if e.g. a Layer couldn't be loaded.
         * @param {boolean} newValue the new Value
         * @returns {void}
         */
        setActive: function (newValue) {
            this.currentState = newValue;
        }
    }
};
</script>

<template>
    <div
        class="toggleCheckboxComponent toggle btn btn-default btn-sm"
        :class="{'off': !isActive}"
        tabindex="0"
        @keydown="toggle($event)"
    >
        <input
            v-model="checkedValue"
            aria-label="checkbox"
            type="checkbox"
            :title="title"
            data-bs-toggle="toggle"
            :checked="isActive"
            @click="toggle($event)"
            @keydown="toggle($event)"
        >
        <div class="toggle-group">
            <div
                class="btn btn-primary btn-sm toggle-on"
                :class="{'active': isActive}"
                @click="toggle($event)"
                @keydown="toggle($event)"
            >
                {{ textOn }}
            </div>
            <div
                class="btn btn-default btn-sm toggle-off"
                :class="{'active': !isActive}"
                @click="toggle($event)"
                @keydown="toggle($event)"
            >
                {{ textOff }}
            </div>
            <span
                class="toggle-handle btn btn-default btn-sm"
                @click="toggle($event)"
                @keydown="toggle($event)"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";

    div.toggleCheckboxComponent {
        width:63px;

        &:hover {
            @include primary_action_hover;
        }
        &:focus {
            @include primary_action_focus;
        }
    }
</style>
