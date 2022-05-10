<script>
import {mapActions, mapGetters} from "vuex";
import ControlIcon from "../../ControlIcon.vue";
import TableStyleControl from "../../TableStyleControl.vue";
import store from "../../../../app-store/index";
import getComponent from "../../../../utils/getComponent";

export default {
    name: "StartTool",
    components: {
        ControlIcon
    },
    props: {
        tools: {
            type: Array,
            required: true
        }
    },
    data () {
        return {
            toolStates: []
        };
    },
    computed: {
        ...mapGetters(["uiStyle"]),
        ...mapGetters("Tools", ["configuredTools"]),

        component () {
            return this.uiStyle === "TABLE" ? TableStyleControl : ControlIcon;
        }
    },
    mounted () {
        this.toolStates = this.getValidToolStates(this.tools, this.configuredTools);
    },
    methods: {
        ...mapActions("Tools", ["activateToolInModelList", "setToolActive"]),

        /**
         * Checks if the configured tools are valid. Valid tool vuex states are returned.
         * @param {String[]} tools The tools for which a control is to be created.
         * @param {Object[]} configuredTools The configured tools under portalconfigs.
         * @returns {Object[]} The vuex states of valid tools.
         */
        getValidToolStates (tools, configuredTools) {
            const toolStates = [];

            tools.forEach(tool => {
                const toolId = tool.charAt(0).toUpperCase() + tool.slice(1);

                if (store.state.Tools[toolId]) {
                    if (configuredTools.map(configuredTool => configuredTool.key).includes(tool)) {
                        toolStates.push(store.state.Tools[toolId]);
                    }
                    else {
                        console.error(`The tool: "${tool}" is not configured under "Portalconfigs". Please check your configuration.`);
                    }
                }
                else {
                    console.error(`The tool: "${tool}" does not exist. Please check your configuration.`);
                }
            });

            return toolStates;
        },

        /**
         * Activates or deactivates the associated tool of the clicked control.
         * @param {Object} tool The vuex states the clicked tool-control.
         * @returns {void}
         */
        onClick (tool) {
            const model = getComponent(tool.id);

            if (model) {
                if (!tool.active) {
                    model.collection.setActiveToolsToFalse(model);
                }

                model.set("isActive", !tool.active);
                this.setToolActive({id: tool.id, active: !tool.active});
            }
        }
    }
};
</script>

<template>
    <div id="start-tool-control">
        <template v-for="tool in toolStates">
            <component
                :is="component"
                :key="'control-tool-' + tool.id"
                :icon-name="tool.icon"
                :class="[component ? 'control' : 'Table']"
                :title="$t(tool.name)"
                :disabled="false"
                :on-click="() => onClick(tool)"
            />
        </template>
    </div>
</template>

<style lang="scss" scoped>
</style>
