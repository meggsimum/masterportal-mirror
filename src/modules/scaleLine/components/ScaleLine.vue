<script>
import {mapGetters} from "vuex";

export default {
    name: "ScaleLine",
    computed: {
        ...mapGetters("Map", ["scaleToOne", "scaleWithUnit", "mapMode"]),
        ...mapGetters(["mobile", "scaleLineConfig"]),
        showScale () {
            return this.scaleLineConfig && !this.mobile && this.mapMode === "2D";
        }
    }

};
</script>

<template>
    <div
        v-if="showScale"
        id="scales"
        :title="$t('modules.footer.scale')"
    >
        <span class="scale-as-a-ratio">
            {{ scaleToOne }}
        </span>
        <span class="scale-line">
            {{ scaleWithUnit }}
        </span>
    </div>
</template>

<style lang="scss">
    @import "~variables";

    #scales {
        background: fade($secondary, 90%);
        display: inline-block;
        color: $secondary_contrast;
        text-align: center;
        font-size: 10px;

        .scale-line {
            color: lighten($secondary_contrast, 10%);
            border-bottom: 1px solid;
            border-left: 1px solid;
            border-right: 1px solid;
            display: inline-block;
            width: 2cm;
        }

        .scale-as-a-ratio {
            padding: 0 16px;
            color: #333333;
        }
    }
</style>
