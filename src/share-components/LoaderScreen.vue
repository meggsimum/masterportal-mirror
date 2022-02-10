<script>
import {mapGetters} from "vuex";

/* TODO Draft Status, currently not in use
 * Idea: control loader visibility via store module
 * Concept:
 *  - Store Module holds an array of keys (= strings)
 *  - Any component/loading procedure/... has a key (its name)
 *  - Anything may add its own key to the array of keys
 *  - When done, they must remove their own key
 * => As long as anything has its key registered, the loader is shown
 */

/*
 * Snippet for config.js.md - loaderText could be defined like this.
 * |loaderText|nein|String|""|Ein hier hinterlegter String wird auf dem initial angezeigten Ladebildschirm des Masterportals unter dem Logo angezeigt. Per default existiert ein solcher Anzeigetext nicht.|
 */

/**
 * Loader Component.
 * Not completely implemented, but partially migrated to vue.
 * Previous methods to show/hide loading screen are still in use
 * and work on the id #loader of this element.
 * @listens Core#RadioTriggerUtilHideLoader
 */
export default {
    name: "LoaderScreen",
    data () {
        return {
            imgUrl: "/img/ajax-loader.gif",
            /** simple mode has no logo - activated after first loading ends */
            simple: false,
            utilChannel: Radio.channel("Util")
        };
    },
    computed: {
        ...mapGetters(["loaderText"])
    },
    created () {
        this.utilChannel.on("hideLoader", this.turnSimple);
    },
    beforeDestroy () {
        this.utilChannel.off("hideLoader", this.turnSimple);
    },
    methods: {
        /**
         * Turns simple mode on.
         * @returns {void}
         */
        turnSimple () {
            this.simple = true;
        }
    }
};
</script>

<template>
    <div
        id="loader"
        :class="simple ? 'simple' : ''"
    >
        <img
            v-if="simple"
            class="simple-loader"
            :src="imgUrl"
            alt="loading"
        >
        <div
            v-else
            class="complex-loader"
        >
            <img
                id="loader-portal-logo"
                src="https://geodienste.hamburg.de/lgv-config/img/Logo_Masterportal.svg"
                alt="Masterportal"
            >
            <div
                v-if="loaderText"
                class="loader-text"
            >
                {{ loaderText }}
            </div>
            <img
                class="loader-icon"
                :src="imgUrl"
                alt="loading-icon"
            >
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";

    #loader {
        position: absolute;
        height: 100%;
        width: 100%;

        /* needed for IE11 */
        top: 0;
        left: 0;

        /* NOTE highest possible value - loader is supposed to be on top;
         * this can be removed after the _complete_ vue migration is done
         * since only then loader will (probably?) be the last item on the stack */
        z-index: 2147483647;

        background-color: $secondary;
        color: $secondary_contrast;

        &.simple {
            background-color: $shadow_overlay;
        }

        .simple-loader {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        .complex-loader {
            position: absolute;

            display: flex;
            flex-direction: column;

            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);

            text-align: center;

            #loader-portal-logo {
                width: 35vw;
            }

            .loader-text {
                font-family: $font_family_accent;
                font-size: 5vmin;
                line-height: 130%;
                margin: 5% 0;
            }

            .loader-icon {
                align-self: center;
            }
        }
    }
</style>
