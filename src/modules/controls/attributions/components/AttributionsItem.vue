
<script>
import {mapGetters, mapMutations, mapActions} from "vuex";

import ControlIcon from "../../ControlIcon.vue";

/**
 * TODO
 * OL provides ol/control/Attribution that could be used like OverviewMap in
 * branch MPR-102-Overview-Map; however, for it to work, all sources would have
 * to be supplied with the correct attribution, and the attribution element would
 * have probably to be restyled.
 * Alternatively, the VueX Map Module may learn to collect attributions-to-show
 * when it starts controlling layers, and this element purely gets and shows them.
 *
 * For a first iteration, Radio is used as before.
 * @listens Core.ModelList#RadioTriggerModelListUpdateVisibleInMapList
 * @listens Controls.Attributions#RadioTriggerAttributionsCreateAttribution
 * @listens Controls.Attributions#RadioTriggerAttributionsRemoveAttribution
 */
export default {
    name: "AttributionsItem",
    components: {
        ControlIcon
    },
    props: {
        /** whether the attributions flyout is open initially in desktop resolutions */
        isInitOpenDesktop: {
            type: Boolean,
            default: true
        },
        /** whether the attributions flyout is open initially in mobile resolutions */
        isInitOpenMobile: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            attributionsChannel: Radio.channel("Attributions"),
            modelListChannel: Radio.channel("ModelList")
        };
    },
    computed: {
        ...mapGetters("controls/attributions", ["attributionList", "open", "openable"]),
        ...mapGetters(["mobile"])
    },
    created () {
        this.attributionsChannel.on("createAttribution", this.addAttribution);
        this.attributionsChannel.on("removeAttribution", this.removeAttribution);
        this.modelListChannel.on("updateVisibleInMapList", this.updateAttributions);
        this.updateAttributions();
        this.setOpen(this.mobile ? this.isInitOpenMobile : this.isInitOpenDesktop);
    },
    beforeDestroy () {
        this.attributionsChannel.off("createAttribution", this.addAttribution);
        this.attributionsChannel.off("removeAttribution", this.removeAttribution);
        this.modelListChannel.off("updateVisibleInMapList", this.updateAttributions);
    },
    methods: {
        ...mapMutations("controls/attributions", ["setOpen"]),
        ...mapActions("controls/attributions", ["addAttribution", "removeAttribution", "updateAttributions"]),
        /**
         * Toggles whether attributions flyout is visible.
         * @returns {void}
         */
        toggleAttributionsFlyout: function () {
            this.setOpen(!this.open);
        }
    }
};
</script>

<template>
    <div class="attributions-wrapper">
        <ControlIcon
            class="attributions-button"
            :disabled="!openable"
            :title="$t(`common:modules.controls.attributions.${open ? 'hideAttributions' : 'showAttributions'}`)"
            :icon-name="open ? 'forward-fill' : 'info-circle-fill'"
            :on-click="toggleAttributionsFlyout"
        />
        <div
            v-if="open && attributionList.length > 0"
            class="attributions-view"
        >
            <dl>
                <template v-for="(attribution, index) in attributionList">
                    <dt :key="'attributions-' + index + '-dt'">
                        {{ attribution.name }}:
                    </dt>
                    <dd
                        :key="'attributions-' + index + '-dd'"
                        v-html="attribution.text"
                    />
                </template>
            </dl>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";

    .attributions-wrapper {
        position: relative;

        .attributions-view {
            color: $secondary_contrast;
            background-color: $secondary;

            max-width: 40vw;
            width: max-content;
            min-width: min-content;

            border: 1px solid $secondary_border;
            box-shadow: 0 6px 12px $shadow;

            cursor: initial;
            text-align: initial;

            position: absolute;
            padding: 5px;
            bottom: 0;
            right: 100%;

            dl {
                margin-bottom: 0;
            }
            dt {
                color: $primary;
                font-size: $font_size_big;
                font-family: $font_family_narrow;
                font-weight: 400;
                /* required for ie11, else text will break asap */
                display: flex;
            }
            dd {
                margin-bottom: 8px;
                /* required for ie11, else text will break asap */
                display: flex;
            }
            img {
                max-height: 2em;
            }
        }
    }
</style>
