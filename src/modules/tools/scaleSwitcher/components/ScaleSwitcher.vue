<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import getComponent from "../../../../utils/getComponent";
import ToolTemplate from "../../ToolTemplate.vue";
import getters from "../store/gettersScaleSwitcher";
import mutations from "../store/mutationsScaleSwitcher";

/**
 * Tool to switch the scale of the map. Listens to changes of the map's scale and sets the scale to this value.
 */
export default {
    name: "ScaleSwitcher",
    components: {
        ToolTemplate
    },
    computed: {
        ...mapGetters("Tools/ScaleSwitcher", Object.keys(getters)),
        ...mapGetters("Map", ["scales"]),
        scale: {
            get () {
                return this.$store.state.Map.scale;
            },
            set (value) {
                this.$store.commit("Map/setScale", value);
            }
        }
    },
    watch: {
        /**
         * Listens to the active property change.
         * @param {Boolean} isActive Value deciding whether the tool gets activated or deactivated.
         * @returns {void}
         */
        active (isActive) {
            if (isActive) {
                this.setFocusToFirstControl();
            }
        }
    },
    /**
     * Lifecycle hook: adds a "close"-Listener to close the tool.
     * @returns {void}
     */
    created () {
        this.$on("close", this.close);
    },
    methods: {
        ...mapActions("Map", ["setResolutionByIndex"]),
        ...mapMutations("Tools/ScaleSwitcher", Object.keys(mutations)),

        /**
         * Sets active to false.
         * @returns {void}
         */
        close () {
            this.setActive(false);

            // TODO replace trigger when ModelList is migrated
            // set the backbone model to active false in modellist for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.$store.state.Tools.ScaleSwitcher.id);

            if (model) {
                model.set("isActive", false);
            }
        },
        /**
         * Sets the focus to the first control
         * @returns {void}
         */
        setFocusToFirstControl () {
            this.$nextTick(() => {
                if (this.$refs["scale-switcher-select"]) {
                    this.$refs["scale-switcher-select"].focus();
                }
            });
        }
    }
};
</script>

<template lang="html">
    <ToolTemplate
        :title="$t(name)"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="scale-switcher"
                class="row"
            >
                <label
                    for="scale-switcher-select"
                    class="col-md-5 col-form-label"
                >{{ $t("modules.tools.scaleSwitcher.label") }}</label>
                <div class="col-md-7">
                    <select
                        id="scale-switcher-select"
                        ref="scale-switcher-select"
                        v-model="scale"
                        class="font-arial form-select form-select-sm float-start"
                        @change="setResolutionByIndex($event.target.selectedIndex)"
                    >
                        <option
                            v-for="(scaleValue, i) in scales"
                            :key="i"
                            :value="scaleValue"
                        >
                            1 : {{ scaleValue }}
                        </option>
                    </select>
                </div>
            </div>
        </template>
    </ToolTemplate>
</template>
