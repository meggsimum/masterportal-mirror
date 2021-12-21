<script>
import {minMessageLength} from "../store/constantsContact";

export default {
    name: "ContactFormularInput",
    props: {
        changeFunction: {
            type: Function,
            required: true
        },
        htmlElement: {
            type: String,
            default: "input",
            validator: function (value) {
                // only these are explicitly supported
                return ["input", "textarea"].indexOf(value) !== -1;
            }
        },
        inputName: {
            type: String,
            required: true
        },
        inputType: {
            type: String,
            default: "text"
        },
        inputValue: {
            type: String,
            required: true
        },
        labelText: {
            type: String,
            required: true
        },
        rows: {
            type: Number,
            default: 5
        },
        validInput: {
            type: Boolean,
            required: true
        },
        focusOnCreation: {
            type: Boolean,
            default: false,
            required: false
        },
        autocomplete: {
            type: String,
            default: "off"
        }
    },
    data: function () {
        return {minMessageLength};
    },
    created () {
        if (this.focusOnCreation) {
            this.$nextTick(() => {
                if (this.$refs[`tool-contact-${this.inputName}-input`]) {
                    this.$refs[`tool-contact-${this.inputName}-input`].focus();
                }
            });
        }
    }
};
</script>

<template>
    <div
        :class="[
            'form-group',
            'has-feedback',
            validInput ? 'has-success' : '',
            !validInput && inputValue ? 'has-error' : ''
        ]"
    >
        <div :class="htmlElement === 'input' ? 'input-group' : ''">
            <label
                :class="[
                    'input-group-text',
                    htmlElement === 'textarea' ? 'force-border' : ''
                ]"
                :for="`tool-contact-${inputName}-input`"
            >{{ labelText }}</label>
            <component
                :is="htmlElement"
                :id="`tool-contact-${inputName}-input`"
                :ref="`tool-contact-${inputName}-input`"
                :value="inputValue"
                :autocomplete="autocomplete"
                :type="htmlElement === 'input' ? inputType : ''"
                :class="htmlElement === 'select' ? 'form-select' : 'form-control'"
                :aria-describedby="`tool-contact-${inputName}-help`"
                :placeholder="$t(`common:modules.tools.contact.placeholder.${inputName}`)"
                :rows="htmlElement === 'textarea' ? rows : ''"
                @keyup="changeFunction($event.currentTarget.value)"
            />
        </div>
        <span
            v-if="validInput"
            :class="[
                'bootstrap-icon',
                'form-control-feedback',
                htmlElement === 'textarea' ? 'lift-tick' : ''
            ]"
            aria-hidden="true"
        >
            <i class="bi-check-lg" />
        </span>
        <span
            v-else
            :id="`tool-contact-${inputName}-help`"
            class="help-block"
        >
            {{ $t(
                `common:modules.tools.contact.error.${inputName + (inputName === "message" ? "Input" : "")}`,
                {length: minMessageLength}
            ) }}
        </span>
    </div>
</template>

<style lang="scss" scoped>
.input-group-text:first-child.force-border {
    border-right: 1px solid #ccc;
}

.has-error .input-group-text:first-child.force-border {
    border-right: 1px solid #a94442;
}

.has-success .input-group-text:first-child.force-border {
    border-right: 1px solid #3c763d;
}

.lift-tick {
    margin-top: -4px;
}

.form-control {
    resize: none;
}

.input-group-text {
    min-width: 65px;
}

.help-block {
    display: block;
    margin-top: 5px;
    margin-bottom: 10px;
    color: #737373;
}

</style>
