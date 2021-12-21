import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import * as moment from "moment";
import {expect} from "chai";
import SensorTheme from "../../../components/SensorTheme.vue";
import SensorChartsData from "../../../components/SensorThemeData.vue";
import SensorChartsBarChart from "../../../components/SensorThemeBarChart.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/tools/gfi/components/themes/senor/components/SensorTheme.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(SensorTheme, {
            propsData: {
                feature: {
                    getMappedProperties: function () {
                        return {
                        };
                    },
                    getProperties: function () {
                        return {
                            dataStreamId: "123",
                            name: "Name",
                            description: "Beschreibung",
                            ownerThing: "Eigentümer"
                        };
                    },
                    getTheme: function () {
                        return {
                            name: "sensor",
                            params: {
                                charts: {
                                    values: ["available", "charging", "outoforder"]
                                }
                            }
                        };
                    },
                    getMimeType: () => "text/xml",
                    getLayerId: function () {
                        return 456;
                    }
                }
            },
            localVue,
            mocks: {
                $t: (msg) => msg
            }
        });
    });

    it("should return a date before 3 month + 1  week as buffer", () => {
        const periodLength = 3,
            periodUnit = "month";

        expect(wrapper.vm.createFilterDate(periodLength, periodUnit)).equals(
            moment().subtract(periodLength, periodUnit).subtract(1, "week").format("YYYY-MM-DDTHH:mm:ss.sss") + "Z"
        );
    });

    it("should return a filter for the dataStreamId", () => {
        expect(wrapper.vm.createFilterDataStream("1234")).equals("@iot.id%20eq%201234");
        expect(wrapper.vm.createFilterDataStream("1111 | 9999")).equals("@iot.id%20eq%201111%20or%20@iot.id%20eq%209999");
    });

    it("should return periodLength 3 and periodUnit 'month' by default", () => {
        expect(wrapper.vm.periodLength).equals(3);
        expect(wrapper.vm.periodUnit).equals("month");
    });

    it("should return periodLength 3 and periodUnit 'month' for incorrect input data", () => {
        const wrapper1 = shallowMount(SensorTheme, {
            propsData: {
                feature: {
                    getMappedProperties: function () {
                        return {
                        };
                    },
                    getProperties: function () {
                        return {
                            dataStreamId: "123",
                            name: "Name",
                            description: "Beschreibung",
                            ownerThing: "Eigentümer"
                        };
                    },
                    getMimeType: () => "text/xml",
                    getTheme: function () {
                        return {
                            name: "sensor",
                            params: {
                                historicalData: {
                                    periodLength: "10",
                                    periodUnit: "abc"
                                },
                                charts: {
                                    values: ["available", "charging", "outoforder"]
                                }
                            }
                        };
                    },
                    getLayerId: function () {
                        return 456;
                    }
                }
            },
            localVue,
            mocks: {
                $t: (msg) => msg
            }
        });

        expect(wrapper1.vm.periodLength).equals(3);
        expect(wrapper1.vm.periodUnit).equals("month");
    });

    it("should return periodLength 10 and periodUnit 'year' for these configured data", () => {
        const wrapper2 = shallowMount(SensorTheme, {
            propsData: {
                feature: {
                    getMappedProperties: function () {
                        return {
                        };
                    },
                    getProperties: function () {
                        return {
                            dataStreamId: "123",
                            name: "Name",
                            description: "Beschreibung",
                            ownerThing: "Eigentümer"
                        };
                    },
                    getMimeType: () => "text/xml",
                    getTheme: function () {
                        return {
                            name: "sensor",
                            params: {
                                historicalData: {
                                    periodLength: 10,
                                    periodUnit: "year"
                                },
                                charts: {
                                    values: ["available", "charging", "outoforder"]
                                }
                            }
                        };
                    },
                    getLayerId: function () {
                        return 456;
                    }
                }
            },
            localVue,
            mocks: {
                $t: (msg) => msg
            }
        });

        expect(wrapper2.vm.periodLength).equals(10);
        expect(wrapper2.vm.periodUnit).equals("year");
    });

    it("should render div with class 'gfi-theme-sensor'", () => {
        expect(wrapper.find("div").exists()).to.be.true;
        expect(wrapper.find("div").classes("gfi-theme-sensor")).to.be.true;
    });

    it("should render div > div with class 'sensor-text' if header is exists", () => {
        expect(wrapper.find("div > div").exists()).to.be.true;
        expect(wrapper.find("div > div").classes("sensor-text")).to.be.true;
    });

    it("should render the header", () => {
        expect(wrapper.findAll("div > div > strong").wrappers[0].text()).equals("common:modules.tools.gfi.themes.sensor.sensor.header.name: Name");
        expect(wrapper.findAll("div > div > strong").wrappers[1].text()).equals("common:modules.tools.gfi.themes.sensor.sensor.header.description: Beschreibung");
        expect(wrapper.findAll("div > div > strong").wrappers[2].text()).equals("common:modules.tools.gfi.themes.sensor.sensor.header.ownerThing: Eigentümer");
    });

    it("should render a menulist (div > div > ul) with class 'nav nav-pills'", () => {
        expect(wrapper.find("div > div > ul").exists()).to.be.true;
        expect(wrapper.find("div > div > ul").classes()).to.includes("nav", "nav-pills");
    });

    it("should render the data tab in menulist with class active by start", () => {
        expect(wrapper.find("div > div > ul > li").exists()).to.be.true;
        expect(wrapper.find("div > div > ul > li > a").classes("active")).to.be.true;
        expect(wrapper.find("div > div > ul > li > a").text()).equals("common:modules.tools.gfi.themes.sensor.sensor.dataName");
    });

    it("should render the four tabs in menulist for chart values configured as array", () => {
        expect(wrapper.findAll("div > div > ul > li > a").wrappers.length).equals(4);
        expect(wrapper.findAll("div > div > ul > li > a").wrappers[0].text()).equals("common:modules.tools.gfi.themes.sensor.sensor.dataName");
        expect(wrapper.findAll("div > div > ul > li > a").wrappers[1].text()).equals("available");
        expect(wrapper.findAll("div > div > ul > li > a").wrappers[2].text()).equals("charging");
        expect(wrapper.findAll("div > div > ul > li > a").wrappers[3].text()).equals("outoforder");
    });

    it("should render the 4 tabs in menulist for chart values and data configured as object", () => {
        const wrapper1 = shallowMount(SensorTheme, {
            propsData: {
                feature: {
                    getMappedProperties: function () {
                        return {
                        };
                    },
                    getProperties: function () {
                        return {
                            dataStreamId: "123",
                            name: "Name",
                            description: "Beschreibung",
                            ownerThing: "Eigentümer"
                        };
                    },
                    getMimeType: () => "text/xml",
                    getTheme: function () {
                        return {
                            name: "sensor",
                            params: {
                                data: {
                                    name: "Daten"
                                },
                                charts: {
                                    values: {
                                        available: {
                                            title: "Verfügbar",
                                            color: "rgba(0, 220, 0, 1)"
                                        },
                                        charging: {
                                            title: "Auslastung",
                                            color: "rgba(220, 0, 0, 1)"
                                        },
                                        outoforder: {
                                            title: "Außer Betrieb",
                                            color: "rgba(175, 175, 175, 1)"
                                        }
                                    }
                                }
                            }
                        };
                    },
                    getLayerId: function () {
                        return 456;
                    }
                }
            },
            localVue,
            mocks: {
                $t: (msg) => msg
            }
        });

        expect(wrapper1.findAll("div > div > ul > li > a").wrappers.length).equals(4);
        expect(wrapper1.findAll("div > div > ul > li > a").wrappers[0].text()).equals("Daten");
        expect(wrapper1.findAll("div > div > ul > li > a").wrappers[1].text()).equals("Verfügbar");
        expect(wrapper1.findAll("div > div > ul > li > a").wrappers[2].text()).equals("Auslastung");
        expect(wrapper1.findAll("div > div > ul > li > a").wrappers[3].text()).equals("Außer Betrieb");
    });

    it("should render 4 components => 1 SensorChartsData and 3 SensorChartsBarChart", () => {
        expect(wrapper.findAllComponents(SensorChartsData).wrappers.length).equals(1);
        expect(wrapper.findAllComponents(SensorChartsBarChart).wrappers.length).equals(3);
    });

    it("should only data tab is active and the other tabs disabled by default", () => {
        expect(wrapper.findAll("div > div > ul > li").wrappers[0].find("a").classes("active")).to.be.true;
        expect(wrapper.findAll("div > div > ul > li").wrappers[0].classes("disabled")).to.be.false;
        expect(wrapper.findAll("div > div > ul > li").wrappers[1].find("a").classes("active")).to.be.false;
        expect(wrapper.findAll("div > div > ul > li").wrappers[1].classes("disabled")).to.be.true;
        expect(wrapper.findAll("div > div > ul > li").wrappers[2].find("a").classes("active")).to.be.false;
        expect(wrapper.findAll("div > div > ul > li").wrappers[2].classes("disabled")).to.be.true;
        expect(wrapper.findAll("div > div > ul > li").wrappers[3].find("a").classes("active")).to.be.false;
        expect(wrapper.findAll("div > div > ul > li").wrappers[3].classes("disabled")).to.be.true;
    });

    it("should only data tab is active and the other tabs are not disabled if processedHistoricalDataByWeekday is not empty", async () => {
        await wrapper.setData({processedHistoricalDataByWeekday: [1, 2, 3]});

        expect(wrapper.findAll("div > div > ul > li").wrappers[0].find("a").classes("active")).to.be.true;
        expect(wrapper.findAll("div > div > ul > li").wrappers[0].classes("disabled")).to.be.false;
        expect(wrapper.findAll("div > div > ul > li").wrappers[1].find("a").classes("active")).to.be.false;
        expect(wrapper.findAll("div > div > ul > li").wrappers[1].classes("disabled")).to.be.false;
        expect(wrapper.findAll("div > div > ul > li").wrappers[2].find("a").classes("active")).to.be.false;
        expect(wrapper.findAll("div > div > ul > li").wrappers[2].classes("disabled")).to.be.false;
        expect(wrapper.findAll("div > div > ul > li").wrappers[3].find("a").classes("active")).to.be.false;
        expect(wrapper.findAll("div > div > ul > li").wrappers[3].classes("disabled")).to.be.false;
    });

    it("should activate charging tab by click it", async () => {
        await wrapper.setData({processedHistoricalDataByWeekday: [1, 2, 3]});
        await wrapper.findAll("div > div > ul > li > a").wrappers[2].trigger("click");

        expect(wrapper.findAll("div > div > ul > li").wrappers[0].find("a").classes("active")).to.be.false;
        expect(wrapper.findAll("div > div > ul > li").wrappers[1].find("a").classes("active")).to.be.false;
        expect(wrapper.findAll("div > div > ul > li").wrappers[2].find("a").classes("active")).to.be.true;
        expect(wrapper.findAll("div > div > ul > li").wrappers[3].find("a").classes("active")).to.be.false;
    });
});
