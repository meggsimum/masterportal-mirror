<script>
import {mapMutations, mapActions} from "vuex";

export default {
    name: "App",
    created () {
        this.setConfigJs(Config);
        this.loadConfigJson();
        this.loadServicesJson();
        this.loadRestServicesJson();
    },
    methods: {
        ...mapMutations([
            "setConfigJs"
        ]),

        ...mapActions([
            "loadConfigJson",
            "loadRestServicesJson",
            "loadServicesJson"
        ])
    }
};
</script>

<template>
    <div
        id="masterportal-container"
        class="masterportal-container"
    >
        <!-- do something -->
    </div>
</template>

<style lang="scss" scoped>

</style>
