<script>
import Chart from "chart.js";
import * as moment from "moment";

import {calculateWorkloadForOneWeekday} from "../utils/calculateWorkloadForOneWeekday";
import {calculateArithmeticMean} from "../utils/mathematicalOperations";

export default {
    name: "SensorThemeBarChart",
    props: {
        show: {
            type: Boolean,
            required: true
        },
        chartValue: {
            type: Object,
            required: true
        },
        targetValue: {
            type: String,
            required: true
        },
        chartsParams: {
            type: Object,
            required: true
        },
        periodLength: {
            type: Number,
            required: true
        },
        periodUnit: {
            type: String,
            required: true
        },
        processedHistoricalDataByWeekday: {
            type: Array,
            required: true
        }
    },
    data: () => {
        return {
            momentLocale: moment().locale(i18next.language),
            weekdayIndex: 0,
            chart: null,
            hoverBackgroundColor: "rgba(0, 0, 0, 0.8)",
            chartColor: "rgba(0, 0, 0, 1)",
            barPercentage: 1.0,
            titleText: "",
            noticeText: ""
        };
    },
    computed: {
        /**
         * Gets the weekday using the index, which is between 0 and 6.
         * Today has the index 0.
         * @returns {String} The weekday.
         */
        weekday: function () {
            return this.momentLocale.localeData().weekdays(moment().add(this.weekdayIndex, "days"));
        }
    },
    watch: {
        processedHistoricalDataByWeekday () {
            this.initialize();
        }
    },
    created () {
        this.hoverBackgroundColor = this.chartsParams?.hoverBackgroundColor || this.hoverBackgroundColor;
        this.barPercentage = this.chartsParams?.barPercentage || this.barPercentage;
        this.chartColor = this.chartValue?.color || this.chartColor;
        this.noticeText = this.chartValue?.noticeText || this.noticeText;
    },
    mounted () {
        this.initialize();
    },
    updated () {
        this.initialize();
    },
    methods: {
        /**
         * Starts the calculation of the historical data and the drawing of the chart.
         * @returns {void}
         */
        initialize: function () {
            this.momentLocale.locale(i18next.language);
            if (this.show) {
                this.$nextTick(() => {
                    this.drawChart(this.calculateDataForOneWeekday());
                });
            }
        },

        /**
         * Calculates the data for one weekday and the arithmetic mean of this.
         * @returns {Object} The calculated data for one weekday.
         */
        calculateDataForOneWeekday: function () {
            const processedData = calculateWorkloadForOneWeekday(this.targetValue, this.processedHistoricalDataByWeekday[this.weekdayIndex]);

            this.titleText = [
                this.$t(this.chartValue?.title || ""),
                `${this.$t("common:modules.tools.gfi.themes.sensor.sensorBarChart.chartTitleAverage")} `
                + this.$t(`common:modules.tools.gfi.themes.sensor.sensorBarChart.${this.periodUnit}`, {count: this.periodLength}),
                this.$t(this.noticeText)
            ];

            return calculateArithmeticMean(processedData);
        },

        /**
         * Creates the bar chart with chartsJs.
         * If a chart is already drawn, it will be destroyed.
         * @param {Object} calculatedData The calculated data.
         * @returns {void}
         */
        drawChart: function (calculatedData) {
            const ctx = this.$el.getElementsByTagName("canvas")[0],
                maxValue = 1;

            if (this.chart instanceof Chart) {
                this.chart.destroy();
            }

            Chart.defaults.global.defaultFontFamily = "'MasterPortalFont', 'Arial Narrow', 'Arial', 'sans-serif'";
            Chart.defaults.global.defaultFontColor = "#333333";

            this.chart = new Chart(ctx, {
                type: "bar",
                data: this.createChartData(calculatedData),
                options: {
                    title: this.createChartTitle(),
                    responsive: true,
                    legend: this.createChartLegend(),
                    tooltips: this.createChartTooltip(maxValue),
                    scales: this.createChartScales(maxValue),
                    layout: this.createChartLayout()
                }
            });
        },

        /**
         * Creates the data for the chart.
         * @param {Object} calculatedData The calculated data.
         * @returns {Object} The chart data.
         */
        createChartData: function (calculatedData) {
            return {
                labels: calculatedData.map(data => data.hour),
                datasets: [{
                    backgroundColor: this.chartColor,
                    data: calculatedData.map(data => data.result),
                    barPercentage: this.barPercentage,
                    hoverBackgroundColor: this.hoverBackgroundColor
                }]
            };
        },

        /**
         * Creates the title for the chart.
         * @returns {Object} The chart title.
         */
        createChartTitle: function () {
            return {
                display: true,
                position: "bottom",
                text: this.titleText
            };
        },

        /**
         * Creates the legend for the chart.
         * @returns {Object} The chart legend.
         */
        createChartLegend: function () {
            return {
                display: false
            };
        },

        /**
         * Creates the tooltip for the chart.
         * @param {Number} maxValue The max value for the y-axis.
         * @returns {Object} The chart tooltip.
         */
        createChartTooltip: function (maxValue) {
            return {
                callbacks: {
                    label: (tooltipItem) => (tooltipItem.value / maxValue * 100).toFixed(0) + "%",
                    title: () => false
                }
            };
        },

        /**
         * Creates the scales for the chart.
         * @param {Number} maxValue The max value for the y-axis.
         * @returns {Object} The chart scales.
         */
        createChartScales: function (maxValue) {
            return {
                xAxes: [{
                    ticks: {
                        min: 0,
                        max: 23,
                        callback: value => value % 2 ? "" : this.$t(
                            "common:modules.tools.gfi.themes.sensor.sensorBarChart.clock", {value}
                        )
                    }
                }],
                yAxes: [{
                    ticks: {
                        min: 0,
                        max: maxValue,
                        callback: value => (value / maxValue * 100).toFixed(0) + "%"
                    }

                }]
            };
        },

        /**
         * Creates the layout for the chart.
         * @returns {Object} The chart layout.
         */
        createChartLayout: function () {
            return {
                padding: {
                    left: 10,
                    right: 10,
                    top: 0,
                    bottom: 0
                }
            };
        },

        /**
         * Decrements the weekday index.
         * @returns {void}
         */
        showPreviousWeekDay: function () {
            this.weekdayIndex -= 1;

            if (this.weekdayIndex < 0) {
                this.weekdayIndex = 6;
            }
        },

        /**
         * Increments the weekday index.
         * @returns {void}
         */
        showNextWeekDay: function () {
            this.weekdayIndex += 1;

            if (this.weekdayIndex > 6) {
                this.weekdayIndex = 0;
            }
        }
    }
};
</script>

<template>
    <div v-if="show">
        <div class="sensor-button-container">
            <button
                id="left"
                type="button"
                class="leftButton kat btn"
                :title="$t('common:modules.tools.gfi.themes.sensor.sensorBarChart.previousWeekday')"
                @click="showPreviousWeekDay"
            >
                <span class="bootstrap-icon">
                    <i class="bi-chevron-left" />
                </span>
            </button>
            <span class="day">{{ weekday }}</span>
            <button
                id="right"
                type="button"
                class="rightButton kat btn"
                :title="$t('common:modules.tools.gfi.themes.sensor.sensorBarChart.nextWeekday')"
                @click="showNextWeekDay"
            >
                <span class="bootstrap-icon">
                    <i class="bi-chevron-right" />
                </span>
            </button>
        </div>
        <div class="sensor-chart-container">
            <canvas />
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";
    $background_color: #FFFFFF;

    .sensor-button-container {
        text-align: center;
        .leftButton {
            float: left;
            background-color: $background_color;
            padding: 1px 6px;
            outline: none;
            box-shadow: none;
        }
        .rightButton {
            float: right;
            background-color: $background_color;
            padding: 1px 6px;
            outline: none;
            box-shadow: none;
        }
        .day {
            padding-top: 8px;
            font-weight: bold;
        }
    }
    .sensor-chart-container {
        position: relative;
        width: 65vh;
        height: 30vh;
    }
</style>
