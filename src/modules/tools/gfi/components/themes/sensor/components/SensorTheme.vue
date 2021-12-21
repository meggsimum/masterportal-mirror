<script>
import * as moment from "moment";
import axios from "axios";

import getComponent from "../../../../../../../utils/getComponent";
import SensorThemeChartsData from "./SensorThemeData.vue";
import SensorThemeChartsBarChart from "./SensorThemeBarChart.vue";
import {processHistoricalDataByWeekdays} from "../utils/processHistoricalDataByWeekdays";

export default {
    name: "SensorTheme",
    components: {
        SensorThemeChartsData,
        SensorThemeChartsBarChart
    },
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data: function () {
        return {
            periodLength: 3,
            periodUnit: "month",
            processedHistoricalDataByWeekday: [],
            activeTab: "data",
            startDate: ""
        };
    },
    computed: {
        /**
         * Get the configured gfiParams.
         * @returns {Object} The gfiParams.
         */
        gfiParams: function () {
            return this.feature.getTheme()?.params;
        },

        /**
         * Gets the configured data name attributes.
         * @returns {Object} The header attributes.
         */
        dataName: function () {
            return this.gfiParams?.data?.name || this.$t("common:modules.tools.gfi.themes.sensor.sensor.dataName");
        },

        /**
         * Gets the configured header attributes.
         * @returns {Object} The header attributes.
         */
        header: function () {
            const header = this.gfiParams?.header || {
                name: this.$t("common:modules.tools.gfi.themes.sensor.sensor.header.name"),
                description: this.$t("common:modules.tools.gfi.themes.sensor.sensor.header.description"),
                ownerThing: this.$t("common:modules.tools.gfi.themes.sensor.sensor.header.ownerThing")
            };

            // "useConfigName" is set in the preparser, should be removed, with the refactoring of the core
            if (header?.useConfigName) {
                delete this.header.useConfigName;
            }

            return header;
        },

        /**
         * Gets the values to draw charts.
         * @returns {Object} The chart values.
         */
        chartvalues: function () {
            return this.gfiParams?.charts?.values;
        }
    },
    watch: {
        feature () {
            this.loadHistoricalData();
        }
    },
    created () {
        this.periodLength = typeof this.gfiParams?.historicalData?.periodLength === "number" ?
            this.gfiParams.historicalData.periodLength : this.periodLength;
        this.periodUnit = this.gfiParams?.historicalData?.periodUnit === ("year" || "month") ?
            this.gfiParams.historicalData.periodUnit : this.periodUnit;

        this.loadHistoricalData();
    },
    methods: {
        /**
         * Builds the requestQuery to request the historical observations
         * and starts the request for the given period.
         * @returns {void}
         */
        loadHistoricalData: function () {
            const model = getComponent(this.feature.getLayerId());

            if (model) {
                const url = model.get("url"),
                    version = model.get("version"),
                    filterDate = this.createFilterDate(this.periodLength, this.periodUnit),
                    filterDataStream = this.createFilterDataStream(this.feature.getProperties()?.dataStreamId),
                    requestQuery = `${url}/v${version}/Datastreams?$select=@iot.id&$expand=Observations`
                        + `($select=result,phenomenonTime;$orderby=phenomenonTime%20desc;$filter=phenomenonTime%20gt%20${filterDate})`
                        + `&$filter=${filterDataStream}`;

                this.fetchObservations(requestQuery);
            }
        },

        /**
         * Searches for a date in the past based on the specified period.
         * To determine the last state, an additional buffer of one week is requested.
         * @param {Number} periodLength Length of the period.
         * @param {String} periodUnit Unit of the period.
         * @returns {String} The searched date.
         */
        createFilterDate: function (periodLength, periodUnit) {
            const startDate = moment().subtract(periodLength, periodUnit);

            this.startDate = startDate;
            return startDate.subtract(1, "week").format("YYYY-MM-DDTHH:mm:ss.sss") + "Z";
        },

        /**
         * Creates a filter to query the passed datastreams.
         * @param {String} dataStreamId The ids of the dataStream separated by " | ".
         * @returns {String} The data stream filter query.
         */
        createFilterDataStream: function (dataStreamId) {
            const dataStreamIds = dataStreamId.split(" | ");
            let dataStreamFilter = "";

            dataStreamIds.forEach((id, index) => {
                if (index === 0) {
                    dataStreamFilter = `@iot.id%20eq%20${id}`;
                }
                else {
                    dataStreamFilter = `${dataStreamFilter}%20or%20@iot.id%20eq%20${id}`;
                }
            });

            return dataStreamFilter;
        },

        /**
         * Sends a request to request the observations.
         * If the result contains a nextLink, it will also be requested.
         * @param {String} requestQuery The query to request Observations
         * @returns {void}
         */
        fetchObservations: function (requestQuery) {
            const loadedDataStreamIndices = [],
                historicalObservations = [];

            axios.get(requestQuery)
                .then(response => {
                    response.data.value.forEach((result, index) => {
                        historicalObservations.push(result);
                        if (Object.prototype.hasOwnProperty.call(result, "Observations@iot.nextLink")) {
                            this.fetchNextLinks(result["Observations@iot.nextLink"], index, historicalObservations, loadedDataStreamIndices, response.data.value.length);
                        }
                    });
                });
        },

        /**
         * Sends recursively the requests for all nextLinks until all observations are loaded.
         * When all observations are loaded, data processing is started.
         * @param {String} requestQuery The nextLink to request Observations.
         * @param {Number} index The position of the Observations in the historicalData.
         * @param {Object[]} historicalObservations Saves the loaded historical observations.
         * @param {String[]} loadedDataStreamIndices The indices of the datastreams whose observations are already completely loaded.
         * @param {Number} numberOfDataStreams Number of datastreams whose observations is requested.
         * @returns {void}
         */
        fetchNextLinks: function (requestQuery, index, historicalObservations, loadedDataStreamIndices, numberOfDataStreams) {
            axios.get(requestQuery)
                .then(response => {
                    if (response?.data?.value) {
                        historicalObservations[index].Observations = historicalObservations[index].Observations.concat(response.data.value);
                    }
                    if (Object.prototype.hasOwnProperty.call(response?.data, "@iot.nextLink")) {
                        this.fetchNextLinks(response.data["@iot.nextLink"], index, historicalObservations, loadedDataStreamIndices, numberOfDataStreams);
                    }
                    else {
                        loadedDataStreamIndices.push(index);

                        if (loadedDataStreamIndices.length === numberOfDataStreams) {
                            this.processedHistoricalDataByWeekday = processHistoricalDataByWeekdays(historicalObservations, this.startDate);
                        }
                    }
                });
        },

        /**
         * Checks if the given tab name is currently active.
         * @param {Object|String} tab The tab name.
         * @returns {Boolean} Is true if the given tab name is active.
         */
        isActiveTab (tab) {
            return this.activeTab === String(tab);
        },

        /**
         * Set the current tab id after clicking if the historicaldata be loaded
         * @param {Object[]} evt The target of current click event.
         * @returns {void}
         */
        setActiveTab (evt) {
            if (evt?.target?.hash && this.processedHistoricalDataByWeekday.length > 0) {
                this.activeTab = String(evt.target.hash.substring(1));
            }
        },

        /**
         * Returns the classnames for the tab.
         * @param {Object|String} tab The name of the tab depending on property activeTab.
         * @returns {String} The classNames of the tab.
         */
        getTabPaneClasses (tab) {
            return {active: this.isActiveTab(tab), show: this.isActiveTab(tab), "tab-pane": true, fade: true};
        },

        /**
         * Creates an href from the given value.
         * @param {String} value The value.
         * @returns {String} The created href
         */
        createHref: function (value) {
            return `#${String(value)}`;
        }
    }
};
</script>

<template>
    <div class="gfi-theme-sensor">
        <div
            v-if="header"
            class="sensor-text"
        >
            <strong
                v-for="(value, key) in header"
                :key="key"
            >
                {{ value + ": " + feature.getProperties()[key] }}
                <br>
            </strong>
        </div>
        <div>
            <ul class="nav nav-pills">
                <li
                    class="nav-item"
                    :value="dataName"
                >
                    <a
                        data-bs-toggle="tab"
                        href="#data"
                        class="nav-link"
                        :class="{
                            active: isActiveTab('data')
                        }"
                        @click="setActiveTab"
                    >
                        {{ dataName }}
                    </a>
                </li>
                <li
                    v-for="(value, key) in chartvalues"
                    :key="key"
                    value="value?.title || value"
                    class="nav-item"
                    :class="{
                        disabled: processedHistoricalDataByWeekday.length === 0
                    }"
                >
                    <a
                        class="nav-link"
                        :data-bs-toggle="processedHistoricalDataByWeekday.length === 0 ? 'buttons' : 'tab'"
                        :href="processedHistoricalDataByWeekday.length === 0 ? '' : createHref(key)"
                        :class="{
                            active: isActiveTab(key)
                        }"
                        @click="setActiveTab"
                    >
                        {{ $t(value.title || value) }}
                    </a>
                </li>
            </ul>
        </div>
        <div>
            <SensorThemeChartsData
                id="data"
                key="sensorCharts-dataComponent"
                :show="isActiveTab('data')"
                :class="getTabPaneClasses('data')"
                :feature="feature"
            />
            <SensorThemeChartsBarChart
                v-for="(value, key) in chartvalues"
                :key="`sensorCharts-barChartComponent-${key}`"
                :class="getTabPaneClasses(key)"
                :show="isActiveTab(key)"
                :chart-value="typeof value === 'object' ? value : {title: value}"
                :target-value="typeof key === 'number' ? value : key"
                :charts-params="gfiParams.charts"
                :period-length="periodLength"
                :period-unit="periodUnit"
                :processed-historical-data-by-weekday="processedHistoricalDataByWeekday"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";

    .sensor-text {
        text-align: center;
    }
    .gfi-theme-sensor {
        width: 65vh;
        height: 47vh;
        overflow: auto;
        padding: 15px 0 0 0;
    }
</style>
