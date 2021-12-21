<script>
export default {
    name: "DropdownSimple",
    props: {
        // The current value.
        value: {
            type: null,
            required: true
        },
        // The keys corresponds to the values of the option elements
        // and the values to the elements text content.
        options: {
            type: Object,
            required: true
        },
        // if focus should be set to this component when it is created
        focusOnCreation: {
            type: Boolean,
            default: false,
            required: false
        }
    },
    data () {
        return {
            selectedOption: null
        };
    },
    watch: {
        value: function (newValue) {
            this.selectedOption = newValue;
        }
    },
    mounted () {
        this.selectedOption = this.value;
    },
    created () {
        if (this.focusOnCreation) {
            this.$nextTick(() => {
                if (this.$refs["select-option"]) {
                    this.$refs["select-option"].focus();
                }
            });
        }
    },
    methods: {
        changedValue (event) {
            this.$emit("input", event.target.value);
        }
    }
};
</script>

<template>
    <select
        ref="select-option"
        v-model="selectedOption"
        class="form-select"
        @input="changedValue"
    >
        <option
            v-for="(val, key) in options"
            :key="key"
            :value="key"
        >
            {{ val }}
        </option>
    </select>
</template>
