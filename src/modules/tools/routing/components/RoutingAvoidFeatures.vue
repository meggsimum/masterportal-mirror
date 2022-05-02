<script>
import * as constantsRouting from "../store/constantsRouting";
export default {
    name: "RoutingAvoidFeatures",
    props: {
        activeAvoidFeaturesOptions: {
            type: Array,
            required: true
        },
        settings: {
            type: Object,
            required: true
        },
        disabled: {
            type: Boolean,
            required: false
        }
    },
    data () {
        return {
            showAvoidFeatures: false
        };
    },
    computed: {
        /**
         * Computed value for the options to display with the current active speed profile
         * @returns {Object[]} settings
         */
        avoidSpeedProfileOptions ({settings}) {
            return constantsRouting.avoidSpeedProfileOptions.filter(
                (option) => option.availableProfiles.includes(settings.speedProfile)
            );
        }
    },
    methods: {
        /**
         * Checks if the option is checked
         * @param {String} option to check
         * @returns {Boolean} true if option is checked
         */
        getIsRoutingAvoidFeaturesOptionsChecked (option) {
            return this.activeAvoidFeaturesOptions.includes(option.id);
        },
        /**
         * Emits an event on user input
         * @param {String} option to change
         * @param {Boolean} checked to set
         * @returns {void}
         */
        setRoutingAvoidFeaturesOptions (option, checked) {
            if (checked) {
                this.$emit("addAvoidOption", option.id);
            }
            else {
                this.$emit("removeAvoidOption", option.id);
            }
        }
    }

};
</script>

<template>
    <div
        id="routing-avoid-features"
        class="d-flex flex-column"
    >
        <b
            class="pointer"
            @click="showAvoidFeatures = !showAvoidFeatures"
            @keydown.enter="showAvoidFeatures = !showAvoidFeatures"
        >
            <span
                v-if="showAvoidFeatures"
                class="pointer bootstrap-icon"
            >
                <i class="bi-chevron-down" />
            </span>
            <span
                v-else
                class="pointer bootstrap-icon"
            >
                <i class="bi-chevron-right" />
            </span>
            {{ $t('common:modules.tools.routing.avoidOptions.header') }}
        </b>
        <div
            v-if="showAvoidFeatures"
            id="routing-avoid-features-options"
            class="d-flex flex-column ms-3"
        >
            <label
                v-for="option in avoidSpeedProfileOptions"
                :key="option.id"
                class="pointer"
            >
                <input
                    :id="'routing-avoid-features-option-input-' + option.id"
                    type="checkbox"
                    :value="option.id"
                    :checked="getIsRoutingAvoidFeaturesOptionsChecked(option)"
                    :disabled="disabled"
                    @change="setRoutingAvoidFeaturesOptions(option, $event.target.checked)"
                >
                <span class="ms-2">{{ $t('common:modules.tools.routing.avoidOptions.' + option.id) }}</span>
            </label>
        </div>
    </div>
</template>

<style scoped>

.d-flex {
    display: flex;
}
.flex-column {
    flex-direction: column;
}

.pointer {
    cursor: pointer;
}
</style>
