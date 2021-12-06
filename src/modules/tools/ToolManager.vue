<script>
import {mapGetters, mapMutations, mapActions} from "vuex";

export default {
    name: "ToolManager",
    props: {
        showInSidebar: {
            type: Boolean,
            default: false,
            required: false
        }
    },
    computed: {
        ...mapGetters(["menuConfig"]),
        ...mapGetters("Tools", ["configuredTools"]),
        toolsInSidebar: function () {
            const toolsInSidebar = {};

            this.configuredTools.forEach(tool => {
                const toolName = tool.key.charAt(0).toUpperCase() + tool.key.slice(1);

                if (typeof this.$store.state.Tools[toolName] !== "undefined") {
                    toolsInSidebar[toolName] = this.$store.state.Tools[toolName].renderToWindow === false;
                }
                else if (typeof this.$store.state[toolName] !== "undefined") {
                    toolsInSidebar[toolName] = this.$store.state[toolName].renderToWindow === false;
                }
                else {
                    toolsInSidebar[toolName] = false;
                }
            });

            return toolsInSidebar;
        }
    },
    created () {
        this.setConfiguredTools(this.menuConfig);
        this.pushAttributes();
    },
    mounted () {
        this.setToolActiveByConfig();

        this.configuredTools.forEach(configuredTool => {
            const toolName = configuredTool?.key.charAt(0).toUpperCase() + configuredTool.key.slice(1);

            this.addToolNameAndIconToModelList(toolName);
        });
    },
    methods: {
        ...mapActions("Tools", [
            "pushAttributesToStoreElements",
            "setToolActiveByConfig",
            "addToolNameAndIconToModelList"
        ]),
        ...mapMutations("Tools", [
            "setConfiguredTools"
        ]),

        /**
         * Push the configured attributes to store from all configured tools.
         * The configurations are done in the created hook,
         * because the ToolManager is instantiated 2 x and otherwise changes in the mounted hook are overwritten again at the tools.
         * @returns {void}
         */
        pushAttributes: function () {
            this.configuredTools.forEach(configuredTool => this.pushAttributesToStoreElements(configuredTool));
        }
    }
};
</script>

<template lang="html">
    <div class="tool-manager">
        <template v-for="tool in configuredTools">
            <component
                :is="tool.component"
                v-if="toolsInSidebar[tool.key.charAt(0).toUpperCase() + tool.key.slice(1)] === showInSidebar"
                :key="'tool-' + tool.key"
            />
        </template>
    </div>
</template>
