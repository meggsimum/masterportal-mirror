<script>
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck";

export default {
    name: "AccordionItem",
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
        },
        changedSelectedLayers: {
            type: Array,
            required: false,
            default: () => []
        }
    },
    data () {
        return {
            selected: false
        };
    },
    mounted () {
        if (this.changedSelectedLayers.length) {
            this.changedSelectedLayers.forEach(layer => {
                if (layer.filterId === this.layer.filterId) {
                    this.updateSelectedLayers(this.layer.filterId);
                    this.selected = true;
                }
            });
        }

        if (this.layer.active && !this.changedSelectedLayers.length) {
            this.updateSelectedLayers(this.layer.filterId);
        }
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
}
</script>

<template>
    <div class="accordion-item">
        <h2 id="panelsStayOpen-headingOne"
            class="accordion-header"
            @click="updateSelectedLayers(layer.filterId)"
            @keydown.enter="updateSelectedLayers(layer.filterId)"
        >
            <button class="accordion-button" :disabled="disabled"  type="button" data-bs-toggle="collapse" :data-bs-target="'#collapse-' + layer.filterId" aria-expanded="true" :aria-controls="'collapse-' + layer.filterId">
                {{ layer.title ? layer.title : layer.layerId }}
            </button>
        </h2>
        <div
            v-if="layer.shortDescription && !selected"
            class="layerInfoText"
        >
            {{ translateKeyWithPlausibilityCheck(layer.shortDescription, key => $t(key)) }}
        </div>
        <div :id="'collapse-' + layer.filterId" class="accordion-collapse collapse show" aria-labelledby="panelsStayOpen-headingOne">
            <div class="accordion-body">
                <slot
                    :layer="layer"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>
