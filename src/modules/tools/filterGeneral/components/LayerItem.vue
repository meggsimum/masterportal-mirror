<script>
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck.js";

export default {
    name: "LayerItem",
    props: {
        layer: {
            type: Object,
            required: true,
            default: () => {
                return {};
            }
        },
        multiLayerSelector: {
            type: Boolean,
            required: false,
            default: true
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    data () {
        return {
            selected: false
        };
    },
    methods: {
        /**
         * Updates selectedLayers array.
         * @param {String} filterId id which should be removed or added to selectedLayers array
         * @returns {void}
         */
        updateSelectedLayers (filterId) {
            this.$emit("updatetoselectedlayers", filterId);
            this.selected = !this.selected;
        },
        translateKeyWithPlausibilityCheck
    }
};
</script>

<template>
    <div
        :class="['panel-heading', disabled ? 'disabled' : '']"
        role="tab"
    >
        <h2
            :class="['panel-title', disabled ? 'disabled' : '']"
            @click="updateSelectedLayers(layer.filterId)"
            @keydown.enter="updateSelectedLayers(layer.filterId)"
        >
            <a
                :disabled="disabled"
                role="button"
                data-toggle="collapse"
                data-parent="#accordion"
            >
                {{ layer.title ? layer.title : layer.layerId }}
                <span
                    v-if="!selected"
                    class="glyphicon glyphicon-chevron-down pull-right"
                />
                <span
                    v-else
                    class="glyphicon glyphicon-chevron-up pull-right"
                />
            </a>
        </h2>
        <div
            v-if="layer.shortDescription && !selected"
            class="layerInfoText"
        >
            {{ translateKeyWithPlausibilityCheck(layer.shortDescription, key => $t(key)) }}
        </div>
        <slot
            :layer="layer"
        />
    </div>
</template>

<style scoped>
    .panel-default > .panel-heading {
        cursor:default;
        background-color: white;
    }
    .panel-default > .panel-heading.disabled {
        background-color: #f5f5f5;
    }
    .panel-title {
        cursor: pointer;
    }
</style>
