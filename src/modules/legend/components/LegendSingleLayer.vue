<script>
export default {
    name: "LegendSingleLayer",
    components: {},
    props: {
        id: {
            type: String && undefined,
            required: false,
            default: ""
        },
        legendObj: {
            type: Object && undefined,
            required: true
        },
        renderToId: {
            type: String,
            required: true
        }
    },
    watch: {
        legendObj () {
            this.$nextTick(() => {
                const renderToElement = document.getElementById(this.renderToId);

                if (this.renderToId !== "" && renderToElement !== null) {
                    this.$el.style.display = "block";

                    while (renderToElement.lastElementChild) {
                        renderToElement.removeChild(renderToElement.lastElementChild);
                    }

                    renderToElement.appendChild(new DOMParser().parseFromString(this.$el.outerHTML, "text/html").firstChild);
                    this.$el.style.display = "none";
                }
            });
        }
    }
};
</script>

<template>
    <div
        :id="id"
        class="card-body layer-legend collapse show"
    >
        <template
            v-if="legendObj !== undefined"
        >
            <div
                v-for="(legendPart, index) in legendObj.legend"
                :key="JSON.stringify(legendPart) + '_' + index"
                class="layer-legend-container"
            >
                <!-- String -->
                <template
                    v-if="typeof legendPart === 'string'"
                >
                    <!--Legend as Image-->
                    <img
                        v-if="!legendPart.endsWith('.pdf') && !legendPart.endsWith('</svg>')"
                        :alt="legendPart.name ? legendPart.name : legendObj.name"
                        :src="legendPart"
                    >
                    <!--Legend as SVG-->
                    <div
                        v-if="legendPart.endsWith('</svg>')"
                    >
                        {{ legendPart }}
                    </div>
                    <!--Legend PDF as Link-->
                    <a
                        v-if="legendPart.endsWith('.pdf')"
                        :href="legendPart"
                        target="_blank"
                        :title="legendPart"
                    >
                        {{ $t("common:modules.legend.linkToPdf") }}
                    </a>
                </template>

                <!-- Object -->
                <template
                    v-if="typeof legendPart === 'object'"
                >
                    <div v-if="Array.isArray(legendPart.graphic)">
                        <!--Legend as Image or SVG -->
                        <img
                            :alt="legendPart.name ? legendPart.name : legendObj.name"
                            :src="legendPart.graphic[1]"
                            :style="{
                                width: legendPart.iconSize[0] + 'px',
                                height: legendPart.iconSize[1] + 'px',
                                margin: legendPart.iconSizeDifferenz + 'px'
                            }"
                            class="first-image"
                        >
                        <img
                            :alt="legendPart.name ? legendPart.name : legendObj.name"
                            :src="Array.isArray(legendPart.graphic) ? legendPart.graphic[0] : legendPart.graphic"
                        >
                        <span>
                            {{ legendPart.name }}
                        </span>
                    </div>
                    <div v-else>
                        <!--Legend as Image or SVG -->
                        <img
                            v-if="!legendPart.graphic.endsWith('.pdf')"
                            :alt="legendPart.name ? legendPart.name : legendObj.name"
                            :src="legendPart.graphic"
                            class="left"
                        >
                        <!--Legend PDF as Link-->
                        <a
                            v-if="legendPart.graphic.endsWith('.pdf')"
                            :href="legendPart.graphic"
                            target="_blank"
                            :title="legendPart.graphic"
                        >
                            {{ $t("common:modules.legend.linkToPdf") }}
                        </a>
                        <span>
                            {{ legendPart.name }}
                        </span>
                    </div>
                </template>
            </div>
        </template>
        <template
            v-else
        >
            <span>
                {{ $t("common:menu.legend.noLegendForLayerInfo") }}
            </span>
        </template>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";

    .layer-legend {
        padding-top: 5px;
        padding-bottom: 5px;
        img {
            &.left {
                max-width: 50px;
                padding: 5px 0;
            }
        }
    }
    .layer-legend-container {
        position: relative;
    }
    .layer-legend.collapsing {
        -webkit-transition: none;
        transition: none;
        display: none;
    }
    .first-image {
        position: absolute;
    }
</style>
