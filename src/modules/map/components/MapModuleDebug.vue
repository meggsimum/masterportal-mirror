<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import getters from "../store/gettersMap";
import mutations from "../store/mutationsMap";
import actions from "../store/actions/actionsMap";

const keyStore = {
    getters: Object.keys(getters),
    mutations: Object.keys(mutations),
    actions: Object.keys(actions)
};

/**
 * Debugging component to view map module store contents.
 * Also provides some basic inputs to check concepts.
 */
export default {
    name: "MapModuleDebug",
    data: () => ({open: false}),
    computed: {
        ...mapGetters("Map", keyStore.getters),
        dataList () {
            return keyStore.getters.map(key => {
                if (key === "layers") {
                    // layers has separate render content to inject inputs
                    return [key, this[key]];
                }

                return [
                    key,
                    // don't try to stringify objects - ol object often have circular references
                    this[key] !== null && typeof this[key] === "object" && !Array.isArray(this[key])
                        ? "Object"
                        : JSON.stringify(this[key], null, 2) // pretty-print
                ];
            });
        }
    },
    mounted () {
        document.getElementsByTagName("body")[0].appendChild(this.$el);
    },
    methods: {
        // actions take preference over mutations (e.g. setMap should always be the action from UI perspective)
        ...mapMutations("Map", keyStore.mutations),
        ...mapActions("Map", keyStore.actions)
    }
};
</script>

<template>
    <div class="position-left contrast">
        <u>DEBUG</u>
        <label for="openCheckBox">
            <input
                id="openCheckBox"
                v-model="open"
                type="checkbox"
            >
            open
        </label>
        <div>This element is only visible in dev mode.</div>
        <ul v-if="open">
            <li
                v-for="([key, value], index) in dataList"
                :key="`state-value-${index}`"
            >
                <!-- Regular data is just being printed -->
                <template v-if="key !== 'layers'">
                    {{ key }}: <span class="wrap-newline">{{ value }}</span>
                </template>
                <!-- Layer Data has some inputs to test actions -->
                <template v-else>
                    {{ key }}
                    <ul v-if="value !== null">
                        <li
                            v-for="layerId in Object.keys(value)"
                            :key="`list-item-layer-${layerId}`"
                        >
                            Id: {{ layerId }},
                            Name: {{ value[layerId].name }}
                            <input
                                :id="`checkbox-layer-${layerId}`"
                                type="checkbox"
                                :value="value[layerId].visibility"
                                :checked="value[layerId].visibility"
                                @click="toggleLayerVisibility({layerId})"
                            >
                            <label :for="`checkbox-layer-${layerId}`">{{ value[layerId].visibility }}</label>
                            <input
                                :id="`opacity-range-${layerId}`"
                                type="range"
                                name="opacity"
                                min="0"
                                max="1"
                                step="0.01"
                                :value="value[layerId].opacity"
                                @input="setLayerOpacity({ layerId, value: $event.target.value })"
                            >
                            <label :for="`opacity-range-${layerId}`">Sichtbarkeit {{ value[layerId].opacity }} / 1.0</label>
                        </li>
                    </ul>
                </template>
            </li>
        </ul>
    </div>
</template>

<style lang="scss" scoped>
    .position-left {
        position: absolute;
        top: 50%;
        left: 10px;
        transform: translateY(-50%);
        max-height: 60%;
        overflow-y: scroll;
    }
    .contrast {
        background: #333;
        color: #DDD;
        padding: 25px;
    }
    .wrap-newline {
        white-space: pre;
    }
</style>
