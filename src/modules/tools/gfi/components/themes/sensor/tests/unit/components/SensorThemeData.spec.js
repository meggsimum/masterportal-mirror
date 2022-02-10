import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import SensorThemeData from "../../../components/SensorThemeData.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/tools/gfi/components/themes/senor/components/SensorThemeData.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(SensorThemeData, {
            propsData: {
                feature: {
                    getMappedProperties: function () {
                        return {
                            phone_number: "+49123 456-789 | +49789 222-577",
                            phonenumber_2: "040/123456",
                            phonenumber3: "+040gg/123456",
                            phonenumber4: "49 123456",
                            phonenumber5: "+43123456",
                            url: "https",
                            url2: "file",
                            Test_String: "Hallo Welt",
                            abc: ["123", "456"]
                        };
                    },
                    getProperties: function () {
                        return {
                            dataStreamName: "available | charging",
                            layerName: "abc | xyz"
                        };
                    },
                    getMimeType: () => "text/xml",
                    getTheme: function () {
                        return {
                            name: "sensor",
                            params: {}
                        };
                    }
                },
                show: true
            },
            localVue,
            mocks: {
                $t: (msg) => msg
            }
        });
    });

    it("should render a table with class 'table", () => {
        expect(wrapper.find("table").exists()).to.be.true;
        expect(wrapper.find("table").classes("table")).to.be.true;
    });

    it("should render a table with header informations ", () => {
        const results = ["common:modules.tools.gfi.themes.sensor.sensorData.firstColumnHeaderName", "available", "charging"];

        expect(wrapper.find("table > thead > tr").exists()).to.be.true;
        wrapper.findAll("table > thead > tr > th").wrappers.forEach((th, index) => {
            expect(th.text()).equals(results[index]);
        });
    });

    it("should render a table with body informations ", () => {
        const results = ["+49123 456-789", "+49789 222-577", "040/123456", "+040gg/123456", "49 123456", "+43123456", "https", "file", "Hallo Welt", "123", "456"];

        expect(wrapper.find("table > tbody > tr").exists()).to.be.true;
        wrapper.findAll("table > tbody > tr > td > span").wrappers.forEach((span, index) => {
            expect(span.text()).equals(results[index]);
        });
    });

    it("should always upper case the first letter in the table headers", () => {
        wrapper.findAll("table > tbody > tr > th").wrappers.forEach(th => {
            expect(th.text().charAt(0) === th.text().charAt(0).toUpperCase()).to.be.true;
        });
    });

    it("should link all properties as phone number if the property starts with '+[xx]' (x = any Number)", () => {
        wrapper.findAll("a[href^='tel']").wrappers.forEach(function (a) {
            expect(a.attributes("href")).to.have.string("tel:");
        });
    });

    it("should remove minus in all linked phone numbers", () => {
        wrapper.findAll("a[href^='tel']").wrappers.forEach(function (a) {
            expect(a.attributes("href").search("-")).to.be.equal(-1);
        });
    });

    it("should remove blanks in all linked phone numbers", () => {
        wrapper.findAll("a[href^='tel']").wrappers.forEach(function (a) {
            expect(a.attributes("href").search(" ")).to.be.equal(-1);
        });
    });

    it("should render all urls as 'Link'", () => {
        wrapper.find("table").findAll("a[target='_blank']").wrappers.forEach(function (a) {
            expect(a.text()).to.be.equal("Link");
        });
    });

    it("should render all properties as email if the property contains an @", () => {
        wrapper.findAll("a[href^=mailto]").wrappers.forEach(a => {
            expect(a.attributes("href")).to.have.string("@");
        });
    });

    it("should render a table with header informations from attribute layerName if data are configured", () => {
        const results = ["Daten123", "abc", "xyz"],
            wrapper1 = shallowMount(SensorThemeData, {
                propsData: {
                    feature: {
                        getMappedProperties: function () {
                            return {};
                        },
                        getProperties: function () {
                            return {
                                dataStreamName: "available | charging",
                                layerName: "abc | xyz"
                            };
                        },
                        getMimeType: () => "text/xml",
                        getTheme: function () {
                            return {
                                name: "sensor",
                                params: {
                                    data: {
                                        name: "Daten",
                                        firstColumnHeaderName: "Daten123",
                                        columnHeaderAttribute: "layerName"
                                    }
                                }
                            };
                        }
                    },
                    show: true
                },
                localVue,
                mocks: {
                    $t: (msg) => msg
                }
            });

        expect(wrapper1.find("table > thead > tr").exists()).to.be.true;
        wrapper1.findAll("table > thead > tr > th").wrappers.forEach((th, index) => {
            expect(th.text()).equals(results[index]);
        });
    });
});
