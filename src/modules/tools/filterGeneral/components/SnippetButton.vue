<script>
import ProgressBar from "./ProgressBar.vue";

export default {
    name: "SnippetButton",
    components: {
        ProgressBar
    },
    data () {
        return {
            delay: 100,
            showProgress: false,
            progressBarKey: 0
        };
    },
    methods: {
        runFilter () {
            this.showProgress = true;
            this.progressBarKey += 1;
        }
    }
};
</script>

<template>
    <div>
        <div>
            <input
                type="button"
                :value="$t('button.confirm')"
                @click="runFilter"
            >
        </div>
        <div
            v-if="showProgress"
        >
            <br>
            <ProgressBar
                :key="progressBarKey"
                :delay="delay"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
</style>
