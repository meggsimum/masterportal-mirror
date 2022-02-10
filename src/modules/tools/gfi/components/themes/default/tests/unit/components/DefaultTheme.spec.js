import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import DefaultTheme from "../../../components/DefaultTheme.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/tools/gfi/components/themes/default/components/DefaultTheme.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(DefaultTheme, {
            propsData: {
                feature: {
                    getMappedProperties: function () {
                        return {
                            phone_number: "+49123 456-789",
                            phonenumber_2: "040/123456",
                            phonenumber3: "+040gg/123456",
                            phonenumber4: "49 123456",
                            phonenumber5: "+43123456",
                            url: "https",
                            url2: "file",
                            Test_String: "Hallo Welt",
                            emptyValue: "",
                            undefinedValue: undefined,
                            testBrTag: "moinA<br>123",
                            testArray: ["moinB", "123"]
                        };
                    },
                    getProperties: function () {
                        return {
                            bildlink: "https://test.png"
                        };
                    },
                    getTheme: function () {
                        return "images";
                    },
                    getGfiUrl: () => "http",
                    getMimeType: () => "text/xml"
                }
            },
            localVue,
            mocks: {
                $t: (msg) => msg
            }
        });
    });
    describe("template", () => {

        it("should render a table with class 'table", () => {
            expect(wrapper.find("table").exists()).to.be.true;
            expect(wrapper.find("table").classes("table")).to.be.true;
        });

        it("should render table headers without underscore", () => {
            wrapper.findAll("th").wrappers.forEach(function (th) {
                expect(th.text().search("_")).to.be.equal(-1);
            });
        });

        it("should always upper case the first letter in the table headers", () => {
            wrapper.findAll("th").wrappers.forEach(function (th) {
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

        it("should the value as html if the value includes the tag <br>", () => {
            const countTdTags = wrapper.findAll("td").wrappers.length;

            expect(wrapper.findAll("td").wrappers[countTdTags - 4].text()).equals("TestBrTag");
            expect(wrapper.findAll("td").wrappers[countTdTags - 3].text()).equals("moinA123");
        });
        it("should render as string with <br> tags for each part of an array if value is an array", () => {
            const countTdTags = wrapper.findAll("td").wrappers.length;

            expect(wrapper.findAll("td").wrappers[countTdTags - 2].text()).equals("TestArray");
            expect(wrapper.findAll("td").wrappers[countTdTags - 1].text()).equals("moinB123");
        });

        it("should render an a and img if imageAttribute is existst in feature.properties", () => {
            expect(wrapper.find(".gfi-theme-images > div:nth-child(2) > a").exists()).to.be.true;
            expect(wrapper.find(".gfi-theme-images > div:nth-child(2) > a > img").exists()).to.be.true;
        });

        it("should the img have the source of feature properties", () => {
            expect(wrapper.find(".gfi-theme-images > div:nth-child(2) > a > img").classes()).includes("gfi-theme-images-image");
            expect(wrapper.find(".gfi-theme-images > div:nth-child(2) > a > img").attributes().src).equals("https://test.png");
        });

        it("should the img have the source of gfiTheme params as string", () => {
            const wrapper1 = shallowMount(DefaultTheme, {
                propsData: {
                    feature: {
                        getProperties: function () {
                            return {
                                bildlink: "https://test.png",
                                abc: "https://abc.jpeg"
                            };
                        },
                        getTheme: function () {
                            return {
                                name: "images",
                                params: {
                                    imageLinks: "abc"
                                }
                            };
                        },
                        getGfiUrl: () => "",
                        getMimeType: () => "text/xml"
                    }
                },
                localVue,
                mocks: {
                    $t: (msg) => msg
                }
            });

            expect(wrapper1.find(".gfi-theme-images > div:nth-child(2) > a > img").attributes().src).equals("https://abc.jpeg");
        });

        it("should the img have the source of first found element gfiTheme params as array, the order is specified by imageLinks", () => {
            const wrapper2 = shallowMount(DefaultTheme, {
                propsData: {
                    feature: {
                        getProperties: function () {
                            return {
                                xyz: "https://test.png",
                                abc: "https://abc.jpeg"
                            };
                        },
                        getTheme: function () {
                            return {
                                name: "images",
                                params: {
                                    imageLinks: ["abc", "xyz"]
                                }
                            };
                        },
                        getMimeType: () => "text/xml",
                        getGfiUrl: () => ""
                    }
                },
                localVue,
                mocks: {
                    $t: (msg) => msg
                }
            });

            expect(wrapper2.find(".gfi-theme-images > div:nth-child(2) > a > img").attributes().src).equals("https://abc.jpeg");
        });

        it("should show no attribute is available message if getMappedProperties is empty", () => {
            const wrapper1 = shallowMount(DefaultTheme, {
                propsData: {
                    feature: {
                        getProperties: () => {
                            return {};
                        },
                        getMappedProperties: () => {
                            return {};
                        },
                        getTheme: () => {
                            return {
                                name: "images",
                                params: {
                                    imageLinks: "abc"
                                }
                            };
                        },
                        getGfiUrl: () => "",
                        getMimeType: () => "text/xml"
                    }
                },
                localVue,
                mocks: {
                    $t: (msg) => msg
                }
            });

            expect(wrapper1.find("td").text()).equals("modules.tools.gfi.themes.default.noAttributeAvailable");
        });

        it("should show an iframe if the mimeType is text/html", () => {
            const wrapperHtml = shallowMount(DefaultTheme, {
                propsData: {
                    feature: {
                        getTheme: () => sinon.stub(),
                        getDocument: () => "lalala",
                        getMimeType: () => "text/html"
                    }
                },
                localVue,
                mocks: {
                    $t: (msg) => msg
                }
            });

            expect(wrapperHtml.find("iframe").exists()).to.be.true;
            expect(wrapperHtml.find("iframe").classes()).includes("gfi-iFrame");
        });

        it("should show an iframe after click trough the features", async () => {
            await wrapper.setProps({
                feature: {
                    getTheme: () => sinon.stub(),
                    getDocument: () => "abc",
                    getMimeType: () => "text/html"
                }
            });

            expect(wrapper.find("iframe").exists()).to.be.true;
            expect(wrapper.find("iframe").classes()).includes("gfi-iFrame");
        });

        it("should disable beautifyKeys if beautifyKeys is set to false by params", async () => {
            await wrapper.setProps({
                feature: {
                    getProperties: function () {
                        return {
                            test: "test"
                        };
                    },
                    getMappedProperties: function () {
                        return {
                            test: "test"
                        };
                    },
                    getTheme: function () {
                        return {
                            name: "default",
                            params: {
                                beautifyKeys: false
                            }
                        };
                    },
                    getGfiUrl: () => "",
                    getMimeType: () => "text/xml"
                }
            });

            expect(wrapper.vm.beautifyKeysParam).equals(false);
        });

        it("should have beautifyKeys enabled by default", async () => {
            await wrapper.setProps({
                feature: {
                    getProperties: function () {
                        return {
                            test: "test"
                        };
                    },
                    getMappedProperties: function () {
                        return {
                            test: "test"
                        };
                    },
                    getTheme: function () {
                        return {
                            name: "default",
                            params: {}
                        };
                    },
                    getGfiUrl: () => "",
                    getMimeType: () => "text/xml"
                }
            });

            expect(wrapper.find(".table-hover .firstCol > span").text()).equals("Test");
        });

        it("should have full path disabled by default (if showObjectKeys is set to false)", async () => {
            await wrapper.setProps({
                feature: {
                    getProperties: function () {
                        return {
                            a: {
                                a: {
                                    a: 1
                                }
                            }
                        };
                    },
                    getMappedProperties: function () {
                        return {
                            a: {
                                a: {
                                    a: 1
                                }
                            }
                        };
                    },
                    getTheme: function () {
                        return {
                            name: "default",
                            params: {}
                        };
                    },
                    getGfiUrl: () => "",
                    getMimeType: () => "text/xml"
                }
            });

            expect(wrapper.find(".table-hover .firstCol > span").text()).equals("A");
        });
    });

    describe("isSensorChart", () => {
        it("should return false if the given value is not an object", () => {
            expect(wrapper.vm.isSensorChart(undefined)).to.be.false;
            expect(wrapper.vm.isSensorChart(null)).to.be.false;
            expect(wrapper.vm.isSensorChart("string")).to.be.false;
            expect(wrapper.vm.isSensorChart(1234)).to.be.false;
            expect(wrapper.vm.isSensorChart(true)).to.be.false;
            expect(wrapper.vm.isSensorChart(false)).to.be.false;
        });
        it("should return false if the given value has no property type that equals linechart, barchart or cakechart", () => {
            expect(wrapper.vm.isSensorChart({
                type: "nochart"
            })).to.be.false;
        });
        it("should return false if the given value has no string property query", () => {
            expect(wrapper.vm.isSensorChart({
                type: "linechart",
                query: false
            })).to.be.false;
        });
        it("should return false if the given value has no property staObject that is no object", () => {
            expect(wrapper.vm.isSensorChart({
                type: "linechart",
                query: "",
                staObject: null
            })).to.be.false;
        });
        it("should return false if the given value has a property staObject that has no property @iot.selfLink", () => {
            expect(wrapper.vm.isSensorChart({
                type: "linechart",
                query: "",
                staObject: {}
            })).to.be.false;
        });
        it("should return false if the given value has a property staObject that has a property @iot.selfLink that is no string", () => {
            expect(wrapper.vm.isSensorChart({
                type: "linechart",
                query: "",
                staObject: {
                    "@iot.selfLink": false
                }
            })).to.be.false;
        });
        it("should return true if the given value has the expected structure", () => {
            expect(wrapper.vm.isSensorChart({
                type: "linechart",
                query: "",
                staObject: {
                    "@iot.selfLink": ""
                }
            })).to.be.true;
        });
    });

    describe("mappedPropertiesExists", () => {
        it("should return false if the given feature is not an object", () => {
            expect(wrapper.vm.mappedPropertiesExists(undefined)).to.be.false;
            expect(wrapper.vm.mappedPropertiesExists(null)).to.be.false;
            expect(wrapper.vm.mappedPropertiesExists("string")).to.be.false;
            expect(wrapper.vm.mappedPropertiesExists(1234)).to.be.false;
            expect(wrapper.vm.mappedPropertiesExists(true)).to.be.false;
            expect(wrapper.vm.mappedPropertiesExists(false)).to.be.false;
        });
        it("should return false if the given feature is an object but has no function mappedProperties", () => {
            expect(wrapper.vm.mappedPropertiesExists([])).to.be.false;
            expect(wrapper.vm.mappedPropertiesExists({})).to.be.false;
        });
        it("should return true if the given feature is an object an has a function mappedProperties", () => {
            expect(wrapper.vm.mappedPropertiesExists({
                getMappedProperties: () => {
                    return true;
                }
            })).to.be.true;
        });
    });

    describe("hasMappedProperties", () => {
        it("should return false if feature has no mapped properties", () => {
            expect(wrapper.vm.hasMappedProperties({
                getMappedProperties: () => {
                    return {};
                }
            })).to.be.false;
        });
        it("should return true if feature has mapped properties", () => {
            expect(wrapper.vm.hasMappedProperties({
                getMappedProperties: () => {
                    return {
                        test: "test"
                    };
                }
            })).to.be.true;
        });
    });

    describe("getMappedPropertiesOfFeature", () => {
        it("should return the properties of the given feature", () =>{
            expect(wrapper.vm.getMappedPropertiesOfFeature({
                getMappedProperties: () => {
                    return "test";
                }
            })).to.equal("test");
        });
        it("should return empty object if feature has no properties when showObjectKeysParam is true", () => {
            expect(wrapper.vm.getMappedPropertiesOfFeature({
                getMappedProperties: () => {
                    return false;
                }
            }, true)).to.be.an("object").and.to.be.empty;
        });
        it("should return properties if feature has properties and when showObjectKeysParam is true", () => {
            expect(wrapper.vm.getMappedPropertiesOfFeature({
                getMappedProperties: () => {
                    return {
                        a: "a"
                    };
                }
            }, true)).to.be.an("object").and.not.to.be.empty;
        });
    });
});
