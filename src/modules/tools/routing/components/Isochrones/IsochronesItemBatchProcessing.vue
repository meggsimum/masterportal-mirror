<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import mutations from "../../store/isochrones/mutationsIsochrones";
import RoutingBatchProcessing from "../RoutingBatchProcessing.vue";
import {RoutingTaskHandler} from "../../utils/classes/routing-task-handler";

export default {
    name: "IsochronesItemBatchProcessing",
    components: {
        RoutingBatchProcessing
    },
    props: {
        settings: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            isProcessing: false,
            countFailed: 0
        };
    },
    computed: {
        ...mapGetters("Tools/Routing", ["taskHandler"])
    },
    methods: {
        ...mapMutations("Tools/Routing/Isochrones", Object.keys(mutations)),
        ...mapMutations("Tools/Routing", ["setTaskHandler"]),
        ...mapActions("Tools/Routing/Isochrones", ["fetchIsochrones", "resetIsochronesResult"]),
        ...mapActions("Alerting", ["addSingleAlert"]),
        /**
         * Called when files are added by the user to process
         * loading animation is shown while processing and an error is shown to the user if something happens while processing
         * @param {File[]} files to process
         * @returns {void}
         */
        addFiles (files) {
            files.forEach(file => {
                const reader = new FileReader();

                reader.onload = async f => {
                    this.isProcessing = true;
                    this.setTaskHandler(null);
                    this.countFailed = 0;

                    this.resetIsochronesResult();
                    this.setIsLoadingIsochrones(true);

                    try {
                        const result = await this.parseCsv(f.target.result);

                        if (result) {
                            this.downloadResults(file.name, result);
                        }
                        if (this.countFailed !== 0) {
                            this.addSingleAlert({
                                category: this.$t("common:modules.alerting.categories.error"),
                                content: this.$t("common:modules.tools.routing.isochrones.batchProcessing.errorSomeFailed", {countFailed: this.coundFailed})
                            });
                        }
                    }
                    catch (e) {
                        this.addSingleAlert({
                            category: this.$t("common:modules.alerting.categories.error"),
                            content: e.message
                        });
                    }
                    this.setIsLoadingIsochrones(false);

                    this.countFailed = 0;
                    this.isProcessing = false;
                    this.setTaskHandler(null);
                };

                reader.readAsText(file);
            });
        },
        /**
         * Starts a download for the user to get the result from the process
         * @param {String} filename for the resulting file
         * @param {Object[]} downloadObjects resulting objects from the processing per row
         * @returns {void}
         */
        async downloadResults (filename, downloadObjects) {
            const downloadString = JSON.stringify(downloadObjects),
                downloadFilename = this.createDownloadFilename(filename);

            if (typeof navigator.msSaveOrOpenBlob === "function") {
                // TODO übersetzung des Downloadtypes  GEOJSON nach json/geojson?
                window.navigator.msSaveOrOpenBlob(new Blob([downloadString], {
                    type: "application/geo+json;charset=utf-8"
                }), downloadFilename);
            }
            else {
                const url = `data:text/plain;charset=utf-8,${encodeURIComponent(downloadString)}`,
                    a = document.createElement("a");

                a.href = url;
                a.download = downloadFilename;
                a.style.visibility = "hidden";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        },
        /**
         * Converts the input filename to a csv filename
         * @param {String} filename for the resulting file
         * @returns {String} new csv filename
         */
        createDownloadFilename (filename) {
            if (typeof filename !== "string") {
                return ".csv";
            }
            const parts = filename.split("."),
                partsOhneExtension = parts.slice(0, parts.length - 1);

            return partsOhneExtension.join(".") + ".geojson";
        },
        /**
         * Parses the csv content to tasks and checks for input errors
         * @param {String} filecontent to parse
         * @returns {Promise<Object[]>} the results from the tasks per row
         */
        parseCsv (filecontent) {
            return new Promise((resolve, reject) => {
                if (typeof filecontent !== "string") {
                    reject(new Error(this.$t("common:modules.tools.routing.isochrones.batchProcessing.errorNoEntries")));
                    return;
                }
                const content = filecontent.replace(/[\r]/g, "").trim(),
                    lines = content.split("\n"),
                    count = lines.length,
                    tasks = [];

                if (content.length === 0 || count === 0) {
                    reject(new Error(this.$t("common:modules.tools.routing.isochrones.batchProcessing.errorNoEntries")));
                    return;
                }
                if (count > this.settings.batchProcessing.limit) {
                    reject(new Error(this.$t("common:modules.tools.routing.isochrones.batchProcessing.errorToManyEntriesInFile", {limit: this.settings.batchProcessing.limit})));
                    return;
                }

                for (let i = 0; i < count; i++) {
                    const line = lines[i],
                        lineParts = line.split(";");

                    if (lineParts.length === 0) {
                        continue;
                    }

                    if (lineParts.length !== 3) {
                        reject(new Error(this.$t("common:modules.tools.routing.isochrones.batchProcessing.errorToManyEntriesInRow", {row: i})));
                        return;
                    }

                    if (!this.isNumber(Number(lineParts[1])) || !this.isNumber(Number(lineParts[2]))) {
                        reject(new Error(this.$t("common:modules.tools.routing.isochrones.batchProcessing.errorRowContainsEntriesNoNumber", {row: i})));
                        return;
                    }

                    tasks.push(() => this.parseLineParts(lineParts));
                }
                this.setTaskHandler(new RoutingTaskHandler(
                    tasks,
                    this.settings.batchProcessing.maximumConcurrentRequests,
                    (allResults, newResult) => allResults.push(...newResult),
                    (results) => resolve(results ? {
                        type: "FeatureCollection",
                        features: results
                    } : null)
                ));
            });
        },
        /**
         * Parses one csv row and requests the directions to get the time and distance
         * @param {String[]} lineParts to parse
         * @returns {Promise<Object>} the result from the task
         */
        async parseLineParts (lineParts) {
            const id = lineParts[0],
                startLon = Number(lineParts[1]),
                startLat = Number(lineParts[2]);

            try {
                const isochronesResult = await this.fetchIsochrones({
                    wgs84Coords: [startLon, startLat],
                    transformCoordinates: false
                });

                return isochronesResult.getAreas().map(
                    area => area.getGeojsonFeature({
                        ID: id,
                        [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.xStart")]: startLon,
                        [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.yStart")]: startLat
                    })
                );
            }
            catch (error) {
                this.countFailed = this.countFailed + 1;
            }
            return [
                {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [startLon, startLat]
                    },
                    properties: {
                        ID: id,
                        [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.xStart")]: startLon,
                        [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.yStart")]: startLat,
                        error: true
                    }
                }
            ];
        },
        /**
         * Checks if input is a number
         * @param {*} num to check
         * @returns {Boolean} true if number
         */
        isNumber (num) {
            return !isNaN(num) && typeof num === "number";
        }
    }
};
</script>

<template>
    <RoutingBatchProcessing
        :settings="settings"
        :progress="taskHandler ? taskHandler.progress : 0"
        :is-processing="isProcessing"
        :structure-text="$t('common:modules.tools.routing.isochrones.batchProcessing.structure')"
        example-text="1;8.12;50.67"
        @filesadded="addFiles($event)"
        @cancelProcess="taskHandler.cancelRun()"
    />
</template>
