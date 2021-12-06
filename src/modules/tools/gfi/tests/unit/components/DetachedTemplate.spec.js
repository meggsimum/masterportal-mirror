import Vuex from "vuex";
import {config, mount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import DetachedTemplate from "../../../components/templates/DetachedTemplate.vue";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";

const localVue = createLocalVue();

config.mocks.$t = key => key;
localVue.use(Vuex);

describe("src/modules/tools/gfi/components/templates/DetachedTemplate.vue", () => {
    const highlightVectorRules = {
            image: {
                scale: 10
            },
            fill: sinon.stub(),
            stroke: sinon.stub()
        },
        mockMutations = {
            setCurrentFeature: () => sinon.stub(),
            setShowMarker: () => SVGTextPositioningElement.stub()
        },
        mockGetters = {
            centerMapToClickPoint: () => sinon.stub(),
            showMarker: () => sinon.stub(),
            highlightVectorRules: () => highlightVectorRules,
            currentFeature: () => sinon.stub()
        },
        olFeature = new Feature({
            name: "feature123"
        });

    olFeature.setId("feature1");
    olFeature.setGeometry(new Point([10, 10]));

    let store;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaced: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        Gfi: {
                            namespaced: true,
                            mutations: mockMutations,
                            getters: mockGetters
                        }
                    }
                },
                Map: {
                    namespaced: true,
                    actions: {
                        removeHighlightFeature: sinon.stub(),
                        highlightFeature: sinon.stub()
                    },
                    mutations: {
                        setCenter: sinon.stub()
                    },
                    getters: {
                        clickCoord: sinon.stub()
                    }
                },
                MapMarker: {
                    namespaced: true,
                    actions: {
                        removePointMarker: sinon.stub(),
                        placingPointMarker: sinon.stub()
                    }
                }
            }
        });
    });

    it("should have a title", () => {
        const wrapper = mount(DetachedTemplate, {
            propsData: {
                feature: {
                    getTheme: () => "Default",
                    getTitle: () => "Hallo",
                    getMimeType: () => "text/xml",
                    getGfiUrl: () => "",
                    getLayerId: () => sinon.stub(),
                    getOlFeature: () => olFeature
                }
            },
            components: {
                DefaultTheme: {
                    name: "DefaultTheme",
                    template: "<span />"
                }
            },
            computed: {
                styleAll: () => [{
                    "right": ""
                }],
                styleContent: () => [{
                    "max-width": "",
                    "max-height": ""
                }]
            },
            store: store,
            localVue
        });

        expect(wrapper.find("span").text()).to.be.equal("Hallo");
    });

    it("should have the child component default (-Theme)", () => {
        const wrapper = mount(DetachedTemplate, {
            propsData: {
                feature: {
                    getTheme: () => "default",
                    getTitle: () => "Hallo",
                    getMimeType: () => "text/xml",
                    getGfiUrl: () => "",
                    getLayerId: () => sinon.stub(),
                    getOlFeature: () => olFeature
                }
            },
            components: {
                DefaultTheme: {
                    name: "DefaultTheme",
                    template: "<span />"
                }
            },
            computed: {
                styleAll: () => [{
                    "right": ""
                }],
                styleContent: () => [{
                    "max-width": "",
                    "max-height": ""
                }]
            },
            store: store,
            localVue
        });

        expect(wrapper.findComponent({name: "DefaultTheme"}).exists()).to.be.true;
    });

    it("should have a close button", async () => {
        const wrapper = mount(DetachedTemplate, {
            propsData: {
                feature: {
                    getTheme: () => "default",
                    getTitle: () => "Hallo",
                    getMimeType: () => "text/xml",
                    getGfiUrl: () => "",
                    getLayerId: () => sinon.stub(),
                    getOlFeature: () => olFeature
                }
            },
            components: {
                DefaultTheme: {
                    name: "DefaultTheme",
                    template: "<span />"
                }
            },
            store: store,
            localVue
        });

        expect(wrapper.find("span.bootstrap-icon > .bi-x-lg").exists()).to.be.true;
    });


    it("should emitted close event if button is clicked", async () => {
        const wrapper = mount(DetachedTemplate, {
                propsData: {
                    feature: {
                        getTheme: () => "default",
                        getTitle: () => "Hallo",
                        getMimeType: () => "text/xml",
                        getGfiUrl: () => "",
                        getLayerId: () => sinon.stub(),
                        getOlFeature: () => olFeature
                    }
                },
                components: {
                    DefaultTheme: {
                        name: "DefaultTheme",
                        template: "<span />"
                    }
                },
                store: store,
                localVue
            }),
            button = wrapper.find("span.bootstrap-icon > .bi-x-lg");

        await button.trigger("click");
        expect(wrapper.emitted()).to.have.property("close");
        expect(wrapper.emitted().close).to.have.lengthOf(1);
    });

    it("should not emitted close event if clicked inside the content", async () => {
        const wrapper = mount(DetachedTemplate, {
                propsData: {
                    feature: {
                        getTheme: () => "default",
                        getTitle: () => "Hallo",
                        getMimeType: () => "text/xml",
                        getGfiUrl: () => "",
                        getLayerId: () => sinon.stub(),
                        getOlFeature: () => olFeature
                    }
                },
                components: {
                    DefaultTheme: {
                        name: "DefaultTheme",
                        template: "<span />"
                    }
                },
                store: store,
                localVue
            }),
            modal = wrapper.find(".vue-tool-content-body");

        await modal.trigger("click");
        expect(wrapper.emitted()).to.not.have.property("close");
        expect(wrapper.emitted()).to.be.empty;
    });

    it("should render the footer slot within .gfi-footer", () => {
        const wrapper = mount(DetachedTemplate, {
                propsData: {
                    feature: {
                        getTheme: () => "default",
                        getTitle: () => "Hallo",
                        getMimeType: () => "text/xml",
                        getGfiUrl: () => "",
                        getLayerId: () => sinon.stub(),
                        getOlFeature: () => olFeature
                    }
                },
                components: {
                    DefaultTheme: {
                        name: "DefaultTheme",
                        template: "<span />"
                    }
                },
                slots: {
                    footer: "<div class=\"gfi-footer\">Footer</div>"
                },
                store: store,
                localVue
            }),
            footer = wrapper.find(".gfi-footer");

        expect(footer.text()).to.be.equal("Footer");
    });

    it("should set 'isContentHtml' to true", async () => {
        const wrapper = mount(DetachedTemplate, {
            propsData: {
                feature: {
                    getTheme: () => "default",
                    getTitle: () => "Hallo",
                    getMimeType: () => "text/html",
                    getGfiUrl: () => "http",
                    getLayerId: () => sinon.stub(),
                    getOlFeature: () => olFeature
                }
            },
            components: {
                DefaultTheme: {
                    name: "DefaultTheme",
                    template: "<span />"
                }
            },
            store: store,
            localVue
        });

        expect(wrapper.vm.isContentHtml).to.be.true;
    });

    it("should not set 'isContentHtml' to true", async () => {
        const wrapper = mount(DetachedTemplate, {
            propsData: {
                feature: {
                    getTheme: () => "DefaultTheme",
                    getTitle: () => "Hallo",
                    getMimeType: () => "text/xml",
                    getGfiUrl: () => "",
                    getLayerId: () => sinon.stub(),
                    getOlFeature: () => olFeature
                }
            },
            components: {
                DefaultTheme: {
                    name: "DefaultTheme",
                    template: "<span />"
                }
            },
            store: store,
            localVue
        });

        expect(wrapper.vm.isContentHtml).to.be.false;
    });

});
