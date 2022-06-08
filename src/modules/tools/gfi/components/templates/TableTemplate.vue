<script>
import DefaultTheme from "../themes/default/components/DefaultTheme.vue";
import SensorTheme from "../themes/sensor/components/SensorTheme.vue";
import getTheme from "../../utils/getTheme";
import {mapActions, mapGetters, mapMutations} from "vuex";

import getters from "../../store/gettersGfi";
import ToolWindow from "../../../../../share-components/ToolWindow.vue";

export default {
    name: "TableTemplate",
    components: {
        DefaultTheme,
        SensorTheme,
        ToolWindow
    },
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            rotateAngle: 0
        };
    },
    computed: {
        ...mapGetters("Maps", ["clickCoordinate"]),
        ...mapGetters("Tools/Gfi", Object.keys(getters)),
        /**
         * Returns the title of the gfi.
         * @returns {String} the title
         */
        title: function () {
            return this.feature.getTitle();
        },

        /**
         * Returns the theme in which the feature should be displayed.
         * It only works if the theme has the same name as the theme component, otherwise the default theme will be used
         * @returns {String} the name of the theme
         */
        theme: function () {
            return getTheme(this.feature.getTheme(), this.$options.components, this.$gfiThemeAddons);
        }
    },
    mounted: function () {
        this.placingPointMarker(this.clickCoordinate);
        if (typeof this.currentRotation === "number") {
            this.rotateAngle = this.currentRotation;
            this.rotate();
        }
        if (this.currentPosition) {
            this.$el.style.cssText = this.currentPosition;
        }
    },
    beforeDestroy: function () {
        if (this.$el.style.cssText) {
            this.setCurrentPosition(this.$el.style.cssText);
        }

        this.removePointMarker();
    },
    methods: {
        ...mapActions("MapMarker", ["removePointMarker", "placingPointMarker"]),
        ...mapMutations("Tools/Gfi", ["setCurrentRotation", "setCurrentPosition"]),

        close () {
            this.$emit("close");
        },

        /**
         * Rotates the gfi window in the table mode.
         * The position is set so that the turntable always stays at the same position.
         * @returns {void}
         */
        rotate () {
            const headerwidth = this.$el.getElementsByClassName("tool-window-heading")[0].offsetWidth,
                headerHeight = this.$el.getElementsByClassName("tool-window-heading")[0].offsetHeight,
                className = this.$el.className.substring(0, this.$el.className.indexOf("rotate")).trim(),
                transformOrigin = `${headerwidth - 47}px ${headerHeight - 17}px`;

            this.setCurrentRotation(this.rotateAngle);
            this.rotateAngle = this.rotateAngle - 90;
            if (this.rotateAngle === -360) {
                this.rotateAngle = 0;
            }

            this.$el.className = className + " rotate" + this.rotateAngle;
            this.$el.style.transformOrigin = transformOrigin;
            this.$el.style.webkitTransformOrigin = transformOrigin;
            this.$el.style.msTransformOrigin = transformOrigin;
            this.$el.style.mozTransformOrigin = transformOrigin;
        },

        /**
         * In case they key exists, returns its translation. In case the key doesn't exist returns the key.
         * @param {String} key the key to translate
         * @param {Object} [options=null] for interpolation, formating and plurals
         * @returns {String} the translation or the key itself
         */
        translate (key, options = null) {
            if (i18next.exists(key)) {
                return this.$t(key, options);
            }

            return key;
        }
    }
};
</script>

<template>
    <ToolWindow
        class="gfi-detached-table rotate0"
        :focus-to-close-icon="true"
        :initial-width="360"
        @close="close"
    >
        <template #rightOfTitle>
            <span
                tabindex="0"
                class="icon-turnarticle bootstrap-icon"
                @click="rotate"
                @keydown.enter="rotate"
            />
        </template>
        <template #title>
            <span>{{ translate(title) }}</span>
        </template>
        <template #body>
            <div class="body">
                <component
                    :is="theme"
                    :feature="feature"
                />
            </div>
            <div class="footer">
                <slot name="footer" />
            </div>
        </template>
    </ToolWindow>
</template>

<style lang="scss">
@import "~/css/mixins.scss";
@import "~variables";

.gfi-detached-table {
    box-shadow: 8px 8px 12px rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    background-color:  $dark_grey;
    color: $dark_grey;
    touch-action: pan-x pan-y;
    .tool-window-heading{
        padding: 0;
        border-bottom: 1px solid $dark_grey;
        border-radius: 11px 11px 0 0;
        background-color: $dark_grey;
        color: $light_grey;
        padding-top: 8px;
        padding-left: 8px;
        .tool-window-heading-title {
            color: $light_grey;
            margin-right: 50px;
            text-overflow: ellipsis;
        }
    }
    .vue-tool-content-body {
        border-radius: 12px;
    }
    .vue-tool-content-body .body {
        max-height: 175px;
        overflow-x: hidden;
        overflow: auto;
    }
    .vue-tool-content-body .body::-webkit-scrollbar {
        width: 20px;
    }
    .vue-tool-content-body .body::-webkit-scrollbar-track {
        border: 5px solid transparent;
        border-radius: 12px;
        background-clip: content-box;
        background-color: $light_grey;
    }

    .vue-tool-content-body .body::-webkit-scrollbar-thumb {
        background-color: $primary;
        border: 6px solid transparent;
        border-radius: 12px;
        background-clip: content-box;
    }
    .icon-turnarticle {
        color: $light_grey;
        position: relative;
        display: inline-block;
        right: 25px;
        margin: 6px 0 0 10px;
        cursor: pointer;
        font-size: 16px;
        &:focus {
            @include primary_action_focus;
        }
        &:hover {
            @include primary_action_hover;
        }
    }
    .icon-turnarticle::before {
        color: $light_grey;
    }
    span.bootstrap-icon > .bi-x-lg::before {
        color: $light_grey;
    }
}
.rotate0{
    transform: rotate(0deg);
}
.rotate-90{
    transform: rotate(-90deg);
}
.rotate-180{
    transform: rotate(-180deg);
}
.rotate-270{
    transform: rotate(-270deg);
}

</style>
