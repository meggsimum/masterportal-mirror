<script>
import {
    getQueryLink,
    getObservations,
    convertObservationsToLinechart
} from "../../../../utils/staTools.js";
import LinechartItem from "../../../../../../../share-components/charts/components/LinechartItem.vue";
import ExportButtonCSV from "../../../../../../../share-components/exportButton/components/ExportButtonCSV.vue";

export default {
    name: "DefaultThemeSensorChart",
    components: {
        LinechartItem,
        ExportButtonCSV
    },
    props: {
        type: {
            type: String,
            required: false,
            default: ""
        },
        label: {
            type: String,
            required: false,
            default: ""
        },
        query: {
            type: String,
            required: false,
            default: ""
        },
        format: {
            type: String,
            required: false,
            default: ""
        },
        staObject: {
            type: Object,
            required: false,
            default: null
        },
        options: {
            type: Object,
            required: false,
            default: null
        },
        chartOptions: {
            type: Object,
            required: false,
            default: null
        },
        download: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    data: () => {
        return {
            linechartData: null,
            linechartDataOptions: {},
            downloadUrl: false,
            downloadFilename: false
        };
    },
    watch: {
        staObject (newVal) {
            if (newVal) {
                this.linechartData = null;
                this.initChart();
                this.initDownloadUrl();
            }
        }
    },
    mounted () {
        if (this.staObject) {
            this.linechartData = null;
            this.initChart();
            this.initDownloadUrl();
        }
    },
    methods: {
        initChart () {
            const url = getQueryLink(this.staObject["@iot.selfLink"], this.query);

            this.linechartDataOptions = Object.assign({
                legend: {
                    display: false
                }
            }, this.chartOptions);

            getObservations(url, observations => {
                // onsuccess
                const label = this.label ? this.label : this.staObject.name;

                this.downloadFilename = label;
                this.linechartData = convertObservationsToLinechart(observations, label, this.format, this.options);
            }, () => {
                // onstart
            }, () => {
                // oncomplete
            }, error => {
                // onerror
                console.error(error);
            });
        },

        initDownloadUrl () {
            if (typeof this.download === "boolean" && this.download) {
                this.downloadUrl = getQueryLink(this.staObject["@iot.selfLink"], this.query) + "&$resultFormat=CSV";
            }
        }
    }
};
</script>

<template>
    <div>
        <div>
            <LinechartItem
                v-if="linechartData"
                :given-options="linechartDataOptions"
                :data="linechartData"
            />
        </div>
        <div
            v-if="typeof downloadUrl === 'string'"
            class="link"
        >
            <ExportButtonCSV
                :url="downloadUrl"
                :filename="downloadFilename"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
    .link {
        margin-top: 5px;
        text-align: right;
    }
</style>
