<script>
import {mapGetters, mapActions} from "vuex";
import * as constants from "./../store/constantsRouting";
import {GeoJSON, GPX} from "ol/format.js";
import convertFeaturesToKml from "../../../../utils/convertFeaturesToKml";
import directionsRouteStyle from "../utils/map/directions/route/directionsRouteStyle";
import Feature from "ol/Feature";

export default {
    name: "RoutingDownload",
    props: {
        hideGpx: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            constants
        };
    },
    computed: {
        ...mapGetters("Tools/Routing", ["download", "activeRoutingToolOption"]),
        ...mapGetters("Tools/Routing/Directions", ["directionsRouteSource"]),
        ...mapGetters("Tools/Routing/Isochrones", ["isochronesAreaSource"]),
        /**
         * Checks if the download button should be disabled.
         * @returns {Boolean} true if no file name was entered.
         */
        isDisabled () {
            return !this.download?.fileName?.length;
        },
        /**
         * Computed value for the format options to hide the GPX format
         * @returns {String[]} download format options
         */
        downloadFormatOptions () {
            let downloadFormatOptions = constants.downloadFormatOptions;

            if (this.hideGpx) {
                downloadFormatOptions = downloadFormatOptions.filter(d => d !== "GPX");
            }

            return downloadFormatOptions;
        }
    },
    methods: {
        ...mapActions("Tools/Routing", ["transformCoordinatesLocalToWgs84Projection"]),
        /**
         * Retrieves the features from openlayers source to be downloaded
         * @returns {module:ol/Feature[]} openlayers features
         */
        getDownloadFeatures () {
            if (this.activeRoutingToolOption === "DIRECTIONS") {
                return [this.directionsRouteSource.getFeatures().find(feature => !feature.get("isHighlight"))];
            }

            return this.isochronesAreaSource.getFeatures();
        },
        /**
         * Retrieves the features and styles them for export with default route style
         *
         * @param {module:ol/Feature[]} features which are to be converted.
         * @returns {module:ol/Feature[]} openlayers features
         */
        styleFeatures (features) {
            for (const feature of features) {
                const routeStyle = directionsRouteStyle(feature);

                if (routeStyle[1]) {
                    feature.setStyle(routeStyle[1]);
                }
            }
            return features;
        },
        /**
         * Converts the features from OpenLayers Features to features in the chosen format.
         *
         * @param {module:ol/Feature[]} features which are to be converted.
         * @param {module:ol/format} format Format in which the features should be saved.
         * @returns {String} The features written in the chosen format as a String.
         */
        async convertFeatures (features, format) {
            if (!(format instanceof GeoJSON) && !(format instanceof GPX) || !Array.isArray(features)) {
                return "";
            }
            const convertedFeatures = [];

            for (const feature of features) {
                if (!(feature instanceof Feature)) {
                    continue;
                }
                const clone = feature.clone(),
                    geometry = clone.getGeometry(),
                    type = geometry.getType(),
                    coords = geometry.getCoordinates();

                let coordinates = [];

                if (type === "Point") {
                    coordinates = await this.transformCoordinatesLocalToWgs84Projection(coords);
                }
                else if (type === "LineString") {
                    coordinates = await Promise.all(coords.map(coord => this.transformCoordinatesLocalToWgs84Projection(coord)));
                }
                else if (type === "Polygon") {
                    for (const coord of coords) {
                        coordinates.push(await Promise.all(coord.map(c => this.transformCoordinatesLocalToWgs84Projection(c))));
                    }
                }
                geometry.setCoordinates(coordinates);
                convertedFeatures.push(clone);
            }
            return format.writeFeatures(convertedFeatures);
        },
        /**
         * Converts the features to be downloaded into the desired download format
         * @param {module:ol/Feature[]} features to be converted
         * @returns {String} string to be downloaded
         */
        async getDownloadStringInFormat (features) {
            switch (this.download?.format) {
                case "GEOJSON":
                    return this.convertFeatures(features, new GeoJSON());
                case "GPX":
                    return this.convertFeatures(features, new GPX());
                case "KML":
                    return convertFeaturesToKml(features);
                default:
                    return undefined;
            }
        },
        /**
         * Creates the filename with the extension if not provided in the uploaded file
         * @returns {String} the filename to be used when downloading
         */
        getFileName () {
            if (typeof this.download?.fileName !== "string" || typeof this.download?.format !== "string") {
                return "unknown";
            }
            return this.download.fileName.includes(".") ? this.download.fileName : `${this.download.fileName}.${this.download.format.toLowerCase()}`;
        },
        /**
         * Executed by the user when clicking the download button.
         * Retrieves the features, converts them and provides them to the browser to download.
         * @returns {void}
         */
        async downloadResult () {
            if (this.isDisabled) {
                return;
            }
            const downloadString = await this.getDownloadStringInFormat(this.styleFeatures(this.getDownloadFeatures())),
                fileName = this.getFileName();

            if (typeof navigator.msSaveOrOpenBlob === "function") {
                window.navigator.msSaveOrOpenBlob(new Blob([downloadString], {
                    type: "text/plain;charset=utf-8"
                }), fileName);
            }
            else {
                const url = `data:text/plain;charset=utf-8,${encodeURIComponent(downloadString)}`,
                    a = document.createElement("a");

                a.href = url;
                a.download = fileName;
                a.style.visibility = "hidden";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        }
    }
};
</script>

<template>
    <div
        id="routing-download"
        class="form-group-sm"
    >
        <h6>{{ $t('common:modules.tools.routing.download.header') }}</h6>

        <div class="d-flex mb-2">
            <label
                for="routing-DownloadFormatOptions"
                class="col-md-4 col-form-label d-flex align-self-center"
            >{{ $t('common:modules.tools.routing.download.format') }}</label>

            <div class="col-md-8">
                <select
                    id="routing-DownloadFormatOptions"
                    class="form-select form-select-sm mt-4"
                    @change="download.format = $event.target.value"
                >
                    <option
                        v-for="option in downloadFormatOptions"
                        :id="option"
                        :key="'routing-DownloadFormatOptions-' + option"
                        :value="option"
                        :selected="option === download.format"
                    >
                        {{ option }}
                    </option>
                </select>
            </div>
        </div>

        <div class="d-flex mb-2">
            <label
                for="routing-download-filename"
                class="col-md-4 col-form-label d-flex align-self-center"
            >{{ $t('common:modules.tools.routing.download.filename') }}</label>

            <div class="col-md-8">
                <input
                    id="routing-download-filename"
                    v-model="download.fileName"
                    type="text"
                    class="form-control"
                    :placeholder="$t('common:modules.tools.routing.download.filenamePlaceholder')"
                >
            </div>
        </div>

        <div class="form-group form-group-sm">
            <div class="col-12 d-grid gap-2">
                <button
                    class="btn btn-sm"
                    type="button"
                    :disabled="isDisabled"
                    @click="downloadResult()"
                >
                    <span class="bootstrap-icon pointer">
                        <i class="bi-save-fill" />
                    </span>
                    {{ $t('common:modules.tools.routing.download.saveResult') }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.d-flex {
    display: flex;
}
.flex-column {
    flex-direction: column;
}
.justify-content-between {
    justify-content: space-between;
}
.align-self-center {
    align-self: center;
}

.mb-2 {
    margin-bottom: 0.5rem;
}
</style>
