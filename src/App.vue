<script>
import {mapMutations} from "vuex";
import MainNav from "./MainNav.vue";
import MapRegion from "./MapRegion.vue";
import isDevMode from "./utils/isDevMode";
import PortalFooter from "./modules/portalFooter/components/PortalFooter.vue";
import LayerSelector from "./modules/layerSelector/components/LayerSelector.vue";
import {checkIsURLQueryValid} from "./utils/parametricUrl/stateModifier";

export default {
    name: "App",
    components: {
        MainNav,
        MapRegion,
        PortalFooter,
        LayerSelector
        // ,MapModuleDebug
    },
    data: () => ({isDevMode}),
    created () {
        this.$nextTick(() => {
            if (this.readFromUrlParams() && checkIsURLQueryValid(window.location.search)) {
                this.setUrlParams(new URLSearchParams(window.location.search));
            }
            this.checkVueObservation();
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
        },
        /**
        * Logs an error, if map3D is observed by vue. Only in mode 'development'.
        * NOTICE: this only works when 3D is enabled once!
        *
        * If the map3D is observed, and more information is needed:
        * Log of the observables in vue:
        * node_modules\vue\dist\vue.runtime.esm.js
        * function defineReactive$$1
        * line 1012: console.log(obj, key, val);
        * @returns {void}
        */
        checkVueObservation () {
            /* eslint-disable no-process-env */
            if (process.env.NODE_ENV === "development") {
                setInterval(() => {
                    const map3D = mapCollection.getMap("3D");

                    if (map3D?.__ob__) {
                        console.error("map3d is observed by vue:", map3D, " This leads to extreme performance problems, and the cause must be eliminated. This can have several causes: the map3D is in vuex-state or is available via getter. Layers are in the state or in the getters and reference the map3D.");
                    }
                }, 5000);
            }
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
        <LayerSelector />
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
