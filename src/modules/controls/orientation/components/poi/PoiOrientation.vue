<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../../store/gettersOrientation";
import mutations from "../../store/mutationsOrientation";
import {extractEventCoordinates} from "../../../../../../src/utils/extractEventCoordinates";

export default {
    name: "PoiOrientation",
    props: {
        /** id of layer to show in mini-map */
        poiDistances: {
            type: Array,
            required: false,
            default: null
        },

        getFeaturesInCircle: {
            type: Function,
            required: true,
            default: () => {
                console.warn("No function was defined for this getFeaturesInCircle.");
            }
        }
    },
    data () {
        return {
            poiFeatures: []
        };
    },
    computed: {
        ...mapGetters("controls/orientation", Object.keys(getters))
    },
    watch: {
        position () {
            this.getFeatures();
        }
    },
    mounted () {
        Radio.trigger("Util", "hideLoader");
        this.show();
        this.getFeatures();
        this.initActiveCategory();
        this.$nextTick(() => {
            if (this.$refs["close-icon"]) {
                this.$refs["close-icon"].focus();
            }
        });
    },
    methods: {
        ...mapMutations("controls/orientation", Object.keys(mutations)),

        /**
         * Callback when close icon has been clicked.
         * @param {Event} event the dom event
         * @returns {void}
         */
        closeIconTriggered (event) {
            if (event.type === "click" || event.which === 32 || event.which === 13) {
                this.hidePoi();
            }
        },

        /**
         * Show the modal.
         * @returns {void}
         */
        show () {
            this.$el.style.display = "block";
        },

        /**
         * Hides the modal.
         * @returns {void}
         */
        hidePoi () {
            this.$emit("hide");
            this.poiFeatures = [];
        },

        /**
         * Getting the features within the distances
         * @returns {void}
         */
        getFeatures () {
            const poiDistances = this.poiDistances,
                poiFeatures = [],
                centerPosition = this.position;
            let featInCircle = [];

            poiDistances.forEach(distance => {
                featInCircle = this.getFeaturesInCircle(distance, centerPosition);

                featInCircle.sort((featureA, featureB) => featureA.dist2Pos - featureB.dist2Pos);

                poiFeatures.push({
                    "category": distance,
                    "features": featInCircle
                });
            });

            poiFeatures.forEach(category => {
                category.features.forEach(feat => {
                    feat.imgPath = this.getImgPath(feat);
                    feat.nearbyTitleText = this.getFeatureTitle(feat);
                });
            });

            this.poiFeatures = poiFeatures;
        },

        /**
         * Initial the active category
         * @returns {void}
         */
        initActiveCategory () {
            let poi,
                first;


            if (typeof this.activeCategory !== "number") {
                poi = this.poiFeatures;
                first = poi.find(function (dist) {
                    return dist.features.length > 0;
                });

                this.setActiveCategory(first ? first.category : poi[0].category);
            }
        },

        /**
         * Getting the feature title
         * @param  {ol/Feature} feature the vector feature
         * @return {string[]} the nearbyTitle Text
         */
        getFeatureTitle (feature) {
            if (!Array.isArray(feature.nearbyTitleText) || !feature.nearbyTitleText.length) {
                if (feature.get("name")) {
                    return [feature.get("name")];
                }
                else if (feature.layerName) {
                    return [feature.layerName];
                }
            }

            return feature.nearbyTitleText;

        },

        /**
         * Getting the image path from feature
         * @param  {ol/feature} feat Feature
         * @return {string} imgPath the image path
         */
        getImgPath (feat) {
            let imagePath = "";
            const style = Radio.request("StyleList", "returnModelById", feat.styleId);

            if (style) {
                style.getLegendInfos().forEach(legendInfo => {
                    if (legendInfo.geometryType === "Point") {
                        const type = legendInfo.styleObject.get("type");

                        if (type === "icon") {
                            const featureStyle = style.createStyle(feat, false);

                            imagePath = featureStyle?.getImage()?.getSrc() ? featureStyle?.getImage()?.getSrc() : "";
                        }
                        else if (type === "circle") {
                            imagePath = this.createCircleSVG(style);
                        }
                    }
                    else if (legendInfo.geometryType === "LineString") {
                        imagePath = this.createLineSVG(legendInfo.styleObject);
                    }
                    else if (legendInfo.geometryType === "Polygon") {
                        imagePath = this.createPolygonSVG(legendInfo.styleObject);
                    }
                });
            }

            return imagePath;
        },

        /**
         * Zooming to the feature point
         * @param {Event} evt click event
         * @returns {void}
         */
        zoomFeature (evt) {
            const id = evt.currentTarget.id,
                poiFeatures = this.poiFeatures,
                activeCategory = this.activeCategory,
                selectedPoiFeatures = poiFeatures.find(poi => {
                    return poi.category === activeCategory;
                }),
                feature = selectedPoiFeatures.features.find(feat => {
                    return feat.getId() === id;
                }),
                extent = feature.getGeometry().getExtent(),
                coordinate = extractEventCoordinates(extent),
                resolutions = Radio.request("MapView", "getResolutions"),
                index = resolutions.indexOf(0.2645831904584105) === -1 ? resolutions.length : resolutions.indexOf(0.2645831904584105);

            Radio.trigger("Map", "zoomToExtent", coordinate, {maxZoom: index});
            this.$emit("hide");
        },

        /**
         * Creating the circle svg
         * @param  {ol/style} style ol style
         * @return {string} SVG
         */
        createCircleSVG (style) {
            let svg = "";
            const circleStrokeColor = style.returnColor(style.get("circleStrokeColor"), "hex"),
                circleStrokeOpacity = style.get("circleStrokeColor")[3].toString() || 0,
                circleStrokeWidth = style.get("circleStrokeWidth"),
                circleFillColor = style.returnColor(style.get("circleFillColor"), "hex"),
                circleFillOpacity = style.get("circleFillColor")[3].toString() || 0;

            svg += "<svg height='35' width='35'>";
            svg += "<circle cx='17.5' cy='17.5' r='15' stroke='";
            svg += circleStrokeColor;
            svg += "' stroke-opacity='";
            svg += circleStrokeOpacity;
            svg += "' stroke-width='";
            svg += circleStrokeWidth;
            svg += "' fill='";
            svg += circleFillColor;
            svg += "' fill-opacity='";
            svg += circleFillOpacity;
            svg += "'/>";
            svg += "</svg>";

            return svg;
        },

        /**
         * Creating the line svg
         * @param  {ol/style} style ol style
         * @return {string} SVG
         */
        createLineSVG (style) {
            let svg = "";
            const strokeColor = style.returnColor(style.get("lineStrokeColor"), "hex"),
                strokeWidth = parseInt(style.get("lineStrokeWidth"), 10),
                strokeOpacity = style.get("lineStrokeColor")[3].toString() || 0;

            svg += "<svg height='35' width='35'>";
            svg += "<path d='M 05 30 L 30 05' stroke='";
            svg += strokeColor;
            svg += "' stroke-opacity='";
            svg += strokeOpacity;
            svg += "' stroke-width='";
            svg += strokeWidth;
            svg += "' fill='none'/>";
            svg += "</svg>";

            return svg;
        },

        /**
         * Creating the polygon svg
         * @param  {ol/style} style ol style
         * @return {string} SVG
         */
        createPolygonSVG (style) {
            let svg = "";
            const fillColor = style.returnColor(style.get("polygonFillColor"), "hex"),
                strokeColor = style.returnColor(style.get("polygonStrokeColor"), "hex"),
                strokeWidth = parseInt(style.get("polygonStrokeWidth"), 10),
                fillOpacity = style.get("polygonFillColor")[3].toString() || 0,
                strokeOpacity = style.get("polygonStrokeColor")[3].toString() || 0;

            svg += "<svg height='35' width='35'>";
            svg += "<polygon points='5,5 30,5 30,30 5,30' style='fill:";
            svg += fillColor;
            svg += ";fill-opacity:";
            svg += fillOpacity;
            svg += ";stroke:";
            svg += strokeColor;
            svg += ";stroke-opacity:";
            svg += strokeOpacity;
            svg += ";stroke-width:";
            svg += strokeWidth;
            svg += ";'/>";
            svg += "</svg>";

            return svg;
        },

        /**
         * Changing default category
         * @param {Event} evt click event
         * @return {string} SVG
         */
        changedCategory (evt) {
            const currentTabId = evt.target.getAttribute("aria-controls");

            this.setActiveCategory(parseFloat(currentTabId));
        }
    }
};
</script>

<template>
    <div
        id="surrounding_vectorfeatures"
        class="modal fade in poi"
        @keydown.esc="hidePoi"
    >
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <span
                        ref="close-icon"
                        class="glyphicon glyphicon-remove"
                        tabindex="0"
                        aria-hidden="true"
                        data-dismiss="modal"
                        :title="$t('button.close')"
                        @click="closeIconTriggered($event)"
                        @keydown="closeIconTriggered($event)"
                    />
                    <h4 class="modal-title">
                        {{ $t("common:modules.controls.orientation.titleGeolocatePOI") }}
                    </h4>
                </div>
                <div>
                    <ul
                        class="nav nav-pills"
                        role="tablist"
                    >
                        <li
                            v-for="(feature, index) in poiFeatures"
                            :key="index"
                            :class="feature.category === activeCategory ? 'active' : ''"
                            @click="changedCategory"
                            @keydown.enter="changedCategory"
                        >
                            <a
                                :href="'#' + feature.category"
                                :aria-controls="feature.category"
                                role="button"
                                data-toggle="pill"
                            >{{ feature.category + 'm' }}
                                <span
                                    class="badge"
                                    :aria-controls="feature.category"
                                >{{ feature.features.length }}</span>
                            </a>
                        </li>
                    </ul>
                    <div class="tab-content">
                        <div
                            v-for="(feature, index) in poiFeatures"
                            :id="feature.category"
                            :key="'list' + index"
                            role="tabpanel"
                            :class="['tab-pane fade in', feature.category === activeCategory ? 'active' : '']"
                        >
                            <div class="table-responsive">
                                <table class="table table-striped table-hover">
                                    <tbody>
                                        <tr
                                            v-for="(feat, i) in feature.features"
                                            :id="feat.getId()"
                                            :key="'feat' + i"
                                            @click="zoomFeature"
                                        >
                                            <td v-if="feat.imgPath.indexOf('</svg>') !== -1">
                                                <span v-html="feat.imgPath" />
                                            </td>
                                            <td v-else-if="feat.imgPath.length > 0">
                                                <img
                                                    :src="feat.imgPath"
                                                    :alt="$t('common:modules.controls.orientation.imgAlt')"
                                                >
                                            </td>
                                            <td>
                                                <p
                                                    v-for="(featNearbyTitleText, iNearby) in feat.nearbyTitleText"
                                                    :key="'featNearbyTitleText' + iNearby"
                                                >
                                                    <strong>{{ featNearbyTitleText }}</strong>
                                                </p>
                                                <p>{{ feat.dist2Pos + " " + $t('common:modules.controls.orientation.distanceUnit') }}</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events -->
        <div
            class="modal-backdrop fade in"
            @click="hidePoi"
        />
        <!--
            The previous element does not require a key interaction. It is not focusable,
            has no semantic meaning, and other methods exist for keyboard users to leave
            the backdropped modal dialog.
        -->
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";

    .poi {
        color: rgb(85, 85, 85);
        font-size: 14px;
        .modal-header {
            padding: 0;
            border-bottom: 0;
        }
        .modal-title {
            padding: 8px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }
        .glyphicon-remove {
            font-size: 16px;
            float: right;
            padding: 12px;
            cursor: pointer;
            &:focus {
                @include primary_action_focus;
            }
        }
        .modal-dialog {
            z-index: 1041;
        }
        .tab-content{
            max-height: 78vH;
            overflow: auto;
            &:focus {
                @include primary_action_focus;
            }
            tbody {
                >tr {
                    >td {
                        &:nth-child(odd) {
                            width: 50px;
                            height: 50px;
                        }
                        &:nth-child(even) {
                            vertical-align: middle;
                        }
                        img {
                            max-width: 50px;
                        }
                    }
                }
            }
            tr {
                cursor: pointer;
            }
        }
    }
</style>
