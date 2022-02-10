<script>
import WfsSearchField from "./WfsSearchField.vue";
import {mapGetters} from "vuex";
import getters from "../store/gettersWfsSearch";

export default {
    name: "WfsSearchLiteral",
    components: {
        WfsSearchField
    },
    props: {
        literal: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapGetters("Tools/WfsSearch", Object.keys(getters)),
        suggestions () {
            return this.currentInstance?.suggestions;
        }
    }
};
</script>

<template>
    <WfsSearchField
        v-if="literal.field"
        :key="`tool-wfsSearch-clause-literal-field-${literal.field.id}-${literal.field.fieldName}`"
        :dropdown-input-uses-id="literal.field.usesId"
        :field-id="literal.field.id"
        :suggestions-config="suggestions"
        v-bind="literal.field"
    />
    <!-- NOTE: This div can be styled for visual highlighting -->
    <div v-else-if="literal.clause">
        <template
            v-for="(lit, i) of literal.clause.literals"
        >
            <WfsSearchLiteral
                :key="'tool-wfsSearch-clause-literal' + i"
                :literal="lit"
            />
        </template>
    </div>
</template>

<style scoped>

</style>
