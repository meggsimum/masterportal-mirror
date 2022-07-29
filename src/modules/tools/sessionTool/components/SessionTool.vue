<script>
import ToolTemplate from "../../ToolTemplate.vue";
import getComponent from "../../../../utils/getComponent";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersSessionTool";
import mutations from "../store/mutationsSessionTool";
export default {
    name: "SessionTool",
    components: {
        ToolTemplate
    },
    data () {
        return {
            storePath: this.$store.state.Tools.SessionTool
        };
    },
    computed: {
        ...mapGetters("Tools/SessionTool", Object.keys(getters))
    },
    created () {
        this.$on("close", this.close);
    },
    methods: {
        ...mapMutations("Tools/SessionTool", Object.keys(mutations)),
        close () {
            this.setActive(false);
            const model = getComponent(this.storePath.id);

            if (model) {
                model.set("isActive", false);
            }
        },
        downloadFile () {
            // do download stuff here
        }
    }
};
</script>

<template>
    <ToolTemplate
        :title="$t(name)"
        icon="bi-funnel-fill"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
    >
        <template #toolBody>
            <div class="session-tool">
                <div class="card">
                    <div class="card-header">
                        {{ $t('common:modules.tools.sessionTool.uploadHeader') }}
                    </div>
                    <div class="card-body">
                        <input
                            type="button"
                            :aria-label="$t('common:modules.tools.sessionTool.buttonText')"
                            :value="$t('common:modules.tools.sessionTool.buttonText')"
                            @click.prevent="()=> {}"
                        >
                    </div>
                </div>
                <div class="card mt-3">
                    <div class="card-header">
                        {{ $t('common:modules.tools.sessionTool.downloadHeader') }}
                    </div>
                    <div class="card-body">
                        <input
                            type="button"
                            :value="$t('common:modules.tools.sessionTool.buttonText')"
                            @click.prevent="downloadFile"
                        >
                    </div>
                </div>
            </div>
        </template>
    </ToolTemplate>
</template>
