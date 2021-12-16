
<script>
import {mapGetters} from "vuex";
import ControlIcon from "../../ControlIcon.vue";

/**
 * While MousePosition is a control (that is, 1. historically, 2. in the sense of ol.controls, 3. regarding configJSON),
 * it is placed differently and has a diverging look to it. While placed in the controls/ folder, it's actually
 * used within the Footer to avoid footer and control from ever overlapping, no matter how high the footer may grow.
 */
export default {
    name: "MousePosition",
    components: {
        ControlIcon
    },
    data () {
        return {
            open: true
        };
    },
    computed: {
        ...mapGetters(["controlsConfig", "mobile", "uiStyle"]),
        ...mapGetters("Map", ["prettyMouseCoord"]),
        // MousePosition is the only control that needs to do this itself since it's not a ControlBar child
        show () {
            return !this.mobile && this.controlsConfig?.mousePosition && this.uiStyle !== "SIMPLE";
        }
    },
    methods: {
        /**
         * Toggle function that shows/hides the mousePosition control.
         * @returns {void}
         */
        toggleOpen () {
            this.open = !this.open;
        }
    }
};
</script>

<template>
    <div
        v-if="show"
        :class="['mouse-position', open ? 'open' : 'closed']"
        tabindex="0"
        :title="$t('modules.footer.mouse')"
        :aria-label="$t('modules.footer.mouse')"
    >
        <span
            tabindex="0"
            :title="$t('modules.footer.mouse')"
            :aria-label="$t('modules.footer.mouse')"
            :class="['mouse-position-span', open ? 'open' : 'closed']"
        >
            {{ prettyMouseCoord || $t(`common:modules.controls.mousePosition.hint`) }}
        </span>
        <ControlIcon
            id="hide-mouse-position"
            :icon-name="`chevron-${open ? 'left' : 'right'}`"
            :title="$t(`common:modules.controls.mousePosition.${open ? 'hide' : 'show'}MousePosition`)"
            :on-click="toggleOpen"
            inline
        />
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";

    .mouse-position {
        display: flex;
        flex-direction: row;

        background-color: $primary;
        color: $primary_contrast;
        font-size: $font_size_small_custom;
        line-height: $icon_length_small;
        min-height: $icon_length_small;

        transition: 1s ease-out;
        /* hack to prevent text from jumping during animation */
        transform: translateZ(0);

        &.closed {
            /* using translateX to prevent multiline flicker on width transformation */
            transform: translateX(calc(-100% + #{$icon_length_small}));
        }

        .mouse-position-span {
            padding: 0 8px;
            border-right: 1px solid $primary_contrast;
            color: #FFFFFF;
            min-width: 150px;
        }

        #hide-mouse-position{
            color: #FFFFFF;
        }
    }
</style>
