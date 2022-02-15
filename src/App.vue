<script>
import {mapMutations} from "vuex";
import MainNav from "./MainNav.vue";
import MapRegion from "./MapRegion.vue";
import isDevMode from "./utils/isDevMode";
import PortalFooter from "./modules/portalFooter/components/PortalFooter.vue";
import {checkIsURLQueryValid} from "./utils/parametricUrl/stateModifier";

export default {
    name: "App",
    components: {
        MainNav,
        MapRegion,
        PortalFooter
        // ,MapModuleDebug
    },
    data: () => ({isDevMode}),
    created () {
        this.$nextTick(() => {
            if (this.readFromUrlParams() && checkIsURLQueryValid(window.location.search)) {
                this.setUrlParams(new URLSearchParams(window.location.search));
            }
        });
    },
    methods: {
        ...mapMutations(["setUrlParams"]),
        /**
        * Checks the Config for 'allowParametricURL'.
        * @return {boolean} true, if allowParametricURL is true or if it is missing
        */
        readFromUrlParams: function () {
            return !Object.prototype.hasOwnProperty.call(Config, "allowParametricURL") || Config.allowParametricURL === true;
        }
    }
};
</script>

<template>
    <div
        id="masterportal-container"
        class="masterportal-container"
    >
        <MainNav />
        <MapRegion class="map-region" />
        <PortalFooter />
        <!-- <MapModuleDebug v-if="isDevMode" /> -->
        <!-- keep loader last so it's above it all

            NOTE currently doesn't work in all browser since vue renders too late;
            after everything goes through vue, this should be usable again
            <Loader />
        -->
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";

    #masterportal-container {
        display: flex;
        flex-direction: column;
        flex-flow: column;

        position: relative;

        height: 100%;
        width: 100%;

        font-family: $font_family_default;
        font-size: $font_size_default;

        .map-region {
            display: flex;
            flex-grow: 1;
            height:calc(100% - 50px);
        }
    }
</style>
