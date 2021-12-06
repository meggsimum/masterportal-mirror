import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import * as moment from "moment";
import {expect} from "chai";
import SensorThemeBartChart from "../../../components/SensorThemeBarChart.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/tools/gfi/components/themes/senor/components/SensorThemeBarChart.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(SensorThemeBartChart, {
            propsData: {
                show: true,
                chartValue: {
                    title: "Ein schoener Titel"
                },
                targetValue: "",
                chartsParams: {},
                periodLength: 3,
                periodUnit: "month",
                processedHistoricalDataByWeekday: []
            },
            data: () => {
                return {
                    weekdayIndex: 0,
                    chart: null,
                    hoverBackgroundColor: "rgba(0, 0, 0, 0.8)",
                    chartColor: "rgba(0, 0, 0, 1)",
                    barPercentage: 1.0,
                    titleText: ""
                };
            },
            localVue,
            mocks: {
                $t: (msg) => msg
            }
        });
    });

    it("should render a canvas if show is true", () => {
        expect(wrapper.find("canvas").exists()).to.be.true;
    });

    it("should not render a canvas if show is false", () => {
        const wrapper1 = shallowMount(SensorThemeBartChart, {
            propsData: {
                show: false,
                chartValue: {},
                targetValue: "",
                chartsParams: {},
                periodLength: 3,
                periodUnit: "month",
                processedHistoricalDataByWeekday: []
            },
            localVue,
            mocks: {
                $t: (msg) => msg
            }
        });

        expect(wrapper1.find("canvas").exists()).to.be.false;
        expect(wrapper1.findAll("button").wrappers.length).equals(0);
    });

    it("should render a two buttons with two span for left and right side if show is true", () => {
        expect(wrapper.findAll("button").wrappers.length).equals(2);
        expect(wrapper.findAll("button").wrappers[0].classes()).includes("leftButton", "kat", "btn");
        expect(wrapper.findAll("button > span > i").wrappers[0].classes().includes("bi-chevron-left"));
        expect(wrapper.findAll("button").wrappers[1].classes()).includes("rightButton", "kat", "btn");
        expect(wrapper.findAll("button > span > i").wrappers[1].classes().includes("bi-chevron-right"));
    });

    it("should returns an object with data for the charts ", () => {
        const calculatedData = [
            {
                hour: 0,
                result: 1
            },
            {
                hour: 1,
                result: 2
            },
            {
                hour: 2,
                result: 3
            }
        ];

        expect(wrapper.vm.createChartData(calculatedData)).to.deep.equals(
            {
                labels: [0, 1, 2],
                datasets:
                [{backgroundColor: "rgba(0, 0, 0, 1)",
                    data: [1, 2, 3],
                    barPercentage: 1,
                    hoverBackgroundColor: "rgba(0, 0, 0, 0.8)"
                }]
            }
        );
    });

    it("should returns an object with title for the charts ", async () => {
        await wrapper.setData({titleText: ["Ein schoener Titel"]});

        expect(wrapper.vm.createChartTitle()).to.deep.equals(
            {
                display: true,
                position: "bottom",
                text: ["Ein schoener Titel",
                    "common:modules.tools.gfi.themes.sensor.sensorBarChart.chartTitleAverage common:modules.tools.gfi.themes.sensor.sensorBarChart.month",
                    ""]
            }
        );
    });

    it("should returns an object with legend for the charts ", () => {
        expect(wrapper.vm.createChartLegend()).to.deep.equals(
            {
                display: false
            }
        );
    });

    it("should returns an object with tooltip for the charts ", () => {
        const maxValue = 1,
            result = wrapper.vm.createChartTooltip(maxValue);

        expect(result.callbacks.label).to.be.a("function");
        expect(result.callbacks.label({value: 1})).equals("100%");
        expect(result.callbacks.title).to.be.a("function");
        expect(result.callbacks.title()).to.be.false;
    });

    it("should returns an object with scales for the charts ", () => {
        const maxValue = 1,
            result = wrapper.vm.createChartScales(maxValue);

        expect(result.xAxes[0].ticks.min).equals(0);
        expect(result.xAxes[0].ticks.max).equals(23);
        expect(result.xAxes[0].ticks.callback).to.be.a("function");
        expect(result.xAxes[0].ticks.callback()).equals("common:modules.tools.gfi.themes.sensor.sensorBarChart.clock");

        expect(result.yAxes[0].ticks.min).equals(0);
        expect(result.yAxes[0].ticks.max).equals(maxValue);
        expect(result.yAxes[0].ticks.callback).to.be.a("function");
        expect(result.yAxes[0].ticks.callback(2)).equals("200%");
    });

    it("should returns an object with layout for the charts ", () => {
        expect(wrapper.vm.createChartLayout()).to.deep.equals(
            {
                padding: {
                    left: 10,
                    right: 10,
                    top: 0,
                    bottom: 0
                }
            }
        );
    });

    it("should show today by initial loading ", () => {
        expect(wrapper.find("div > div > span").text()).equals(moment().format("dddd"));
    });

    it("should show the day before yesterday after two clicks on left button ", async () => {
        await wrapper.findAll("button").wrappers[0].trigger("click");
        await wrapper.findAll("button").wrappers[0].trigger("click");

        expect(wrapper.find("div > div > span").text()).equals(moment().subtract(2, "days").format("dddd"));
    });

    it("should show the day after tomorrow after two clicks on right button ", async () => {
        await wrapper.findAll("button").wrappers[1].trigger("click");
        await wrapper.findAll("button").wrappers[1].trigger("click");

        expect(wrapper.find("div > div > span").text()).equals(moment().add(2, "days").format("dddd"));
    });
});
