import Vuex from "vuex";
import {config, shallowMount, mount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import GfiComponent from "../../../components/GetFeatureInfo.vue";

const localVue = createLocalVue(),
    mockMutations = {
        setCurrentFeature: () => sinon.stub()
    },
    mockGetters = {
        desktopType: () => "",
        centerMapToClickPoint: () => sinon.stub(),
        active: () => true
    };

localVue.use(Vuex);
config.mocks.$t = key => key;

/**
 * Returns the store.
 * @returns {object} the store
 */
function getGfiStore () {
    return new Vuex.Store({
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
                getters: {
                    gfiFeaturesReverse: () => [{
                        getTheme: () => "default",
                        getTitle: () => "Feature 1",
                        getMimeType: () => "text/html",
                        getGfiUrl: () => null,
                        getMappedProperties: () => null,
                        getAttributesToShow: () => sinon.stub(),
                        getProperties: () => {
                            return {};
                        },
                        getlayerId: () => null,
                        getFeatures: () => []
                    }, {}],
                    size: sinon.stub(),
                    visibleLayerListWithChildrenFromGroupLayers: sinon.stub()
                }
            }
        },
        getters: {
            mobile: () => sinon.stub(),
            gfiWindow: () => "",
            uiStyle: () => sinon.stub(),
            ignoredKeys: () => sinon.stub()
        }
    });
}


describe("src/modules/tools/gfi/components/GetFeatureInfo.vue", () => {

    it("should find the child component Mobile", () => {
        const wrapper = shallowMount(GfiComponent, {store: getGfiStore, localVue});

        expect(wrapper.findComponent({name: "MobileTemplate"}).exists()).to.be.true;
    });

    it("should find the child component Attached", () => {
        const wrapper = shallowMount(GfiComponent, {
            computed: {
                isMobile: () => false,
                uiStyle: () => "",
                desktopType: () => "attached",
                active: () => true,
                gfiFeatures: () => [{
                    getGfiUrl: () => null,
                    getProperties: () => {
                        return {};
                    },
                    getFeatures: () => sinon.stub()
                }],
                gfiFeaturesReverse: () => sinon.stub(),
                mapSize: () => []
            },
            store: getGfiStore,
            localVue
        });

        expect(wrapper.findComponent({name: "AttachedTemplate"}).exists()).to.be.true;
    });

    it("should find the child component Detached", () => {
        const wrapper = shallowMount(GfiComponent, {
            computed: {
                isMobile: () => false,
                desktopType: () => "",
                active: () => true,
                uiStyle: () => "",
                gfiFeatures: () => [{
                    getGfiUrl: () => null,
                    getFeatures: () => sinon.stub(),
                    getProperties: () => {
                        return {};
                    }
                }],
                gfiFeaturesReverse: () => sinon.stub(),
                mapSize: () => []
            },
            store: getGfiStore,
            localVue
        });

        expect(wrapper.findComponent({name: "DetachedTemplate"}).exists()).to.be.true;
    });

    it("should find the child component Table", () => {
        const wrapper = shallowMount(GfiComponent, {
            computed: {
                isMobile: () => false,
                desktopType: () => "",
                active: () => true,
                uiStyle: () => "TABLE",
                gfiFeatures: () => [{
                    getGfiUrl: () => null,
                    getFeatures: () => sinon.stub(),
                    getProperties: () => {
                        return {};
                    }
                }],
                gfiFeaturesReverse: () => sinon.stub(),
                mapSize: () => []
            },
            store: getGfiStore,
            localVue
        });

        expect(wrapper.findComponent({name: "TableTemplate"}).exists()).to.be.true;
    });

    it("no child component should be found if gfi is not activated", () => {
        const wrapper = shallowMount(GfiComponent, {
            computed: {
                active: () => false,
                gfiFeatures: () => null,
                gfiFeaturesReverse: () => sinon.stub(),
                mapSize: () => []
            },
            store: getGfiStore,
            localVue
        });

        expect(wrapper.findComponent({name: "MobileTemplate"}).exists()).to.be.false;
        expect(wrapper.findComponent({name: "DetachedTemplate"}).exists()).to.be.false;
    });

    it("no child component should be found if gfi has no features", () => {
        const wrapper = shallowMount(GfiComponent, {
            computed: {
                isMobile: () => true,
                active: () => true,
                gfiFeatures: () => [],
                gfiFeaturesReverse: () => sinon.stub(),
                mapSize: () => []
            },
            store: getGfiStore,
            localVue
        });

        expect(wrapper.findComponent({name: "MobileTemplate"}).exists()).to.be.false;
        expect(wrapper.findComponent({name: "DetachedTemplate"}).exists()).to.be.false;
    });

    it("should set pagerIndex to zero if gfiFeatures change", () => {
        const wrapper = shallowMount(GfiComponent, {
            data () {
                return {
                    pagerIndex: 1
                };
            },
            computed: {
                isMobile: () => false,
                active: () => true,
                mapSize: () => [],
                gfiFeatures: () => [{
                    getGfiUrl: () => null,
                    getFeatures: () => sinon.stub(),
                    getProperties: () => {
                        return {};
                    }
                }],
                gfiFeaturesReverse: () => sinon.stub()
            },
            store: getGfiStore,
            localVue
        });

        wrapper.vm.$options.watch.gfiFeatures.call(wrapper.vm, null);
        expect(wrapper.vm.pagerIndex).to.equal(0);
    });

    it("should display the footer", () => {
        const store = getGfiStore(),
            wrapper = mount(GfiComponent, {
                computed: {
                    isMobile: () => true,
                    active: () => true,
                    gfiFeatures: () => [{
                        getTheme: () => "default",
                        getTitle: () => "Feature 1",
                        getMimeType: () => "text/html",
                        getGfiUrl: () => null,
                        getMappedProperties: () => null,
                        getProperties: () => {
                            return {};
                        },
                        getlayerId: () => null,
                        getFeatures: () => []
                    },
                    {}],
                    gfiFeaturesReverse: () => sinon.stub(),
                    mapSize: () => []
                },
                store,
                localVue
            });

        expect(wrapper.find(".pager-left").exists()).to.be.true;
        expect(wrapper.find(".pager-right").exists()).to.be.true;
    });

    it("should display the next feature if pager-right is clicked", async () => {
        const store = getGfiStore(),
            wrapper = mount(GfiComponent, {
                computed: {
                    isMobile: () => true,
                    desktopType: () => "",
                    active: () => true,
                    gfiFeatures: () => [{
                        getTheme: () => "default",
                        getTitle: () => "Feature 1",
                        getMimeType: () => "text/html",
                        getGfiUrl: () => null,
                        getMappedProperties: () => null,
                        getAttributesToShow: () => sinon.stub(),
                        getProperties: () => {
                            return {};
                        },
                        getlayerId: () => null,
                        getFeatures: () => []
                    },
                    {
                        getTheme: () => "default",
                        getTitle: () => "Feature 2",
                        getMimeType: () => "text/html",
                        getGfiUrl: () => null,
                        getAttributesToShow: () => sinon.stub(),
                        getProperties: () => {
                            return {};
                        },
                        getlayerId: () => null,
                        getFeatures: () => []
                    }],
                    gfiFeaturesReverse: () => sinon.stub(),
                    mapSize: () => []
                },
                store,
                localVue
            });

        await wrapper.find(".pager-right").trigger("click");
        expect(wrapper.find(".modal-title").text()).to.equal("Feature 2");
    });

    it("should display the previous feature if pager-left is clicked", async () => {
        const store = getGfiStore(),
            wrapper = mount(GfiComponent, {
                computed: {
                    isMobile: () => true,
                    desktopType: () => "",
                    active: () => true,
                    gfiFeatures: () => [{
                        getTheme: () => "default",
                        getTitle: () => "Feature 1",
                        getGfiUrl: () => null,
                        getMimeType: () => "text/html",
                        getAttributesToShow: () => sinon.stub(),
                        getMappedProperties: () => null,
                        getProperties: () => {
                            return {};
                        },
                        getFeatures: () => []
                    },
                    {
                        getTheme: () => "default",
                        getTitle: () => "Feature 2",
                        getGfiUrl: () => null,
                        getMimeType: () => "text/html",
                        getAttributesToShow: () => sinon.stub(),
                        getMappedProperties: () => null,
                        getProperties: () => {
                            return {};
                        },
                        getFeatures: () => []
                    }],
                    gfiFeaturesReverse: () => sinon.stub(),
                    mapSize: () => []
                },
                store,
                localVue
            });

        wrapper.setData({pagerIndex: 1});
        await wrapper.find(".pager-left").trigger("click");
        expect(wrapper.find(".modal-title").text()).to.equal("Feature 1");
    });

    it("should disabled left pager if pagerIndex is zero", () => {
        const wrapper = mount(GfiComponent, {
            computed: {
                isMobile: () => true,
                desktopType: () => "",
                active: () => true,
                gfiFeatures: () => [{
                    getTheme: () => "default",
                    getTitle: () => "Feature 1",
                    getGfiUrl: () => null,
                    getMimeType: () => "text/html",
                    getAttributesToShow: () => sinon.stub(),
                    getProperties: () => {
                        return {};
                    },
                    getFeatures: () => [],
                    "attributesToShow": sinon.stub()
                },
                {}],
                gfiFeaturesReverse: () => sinon.stub(),
                mapSize: () => []
            },
            store: getGfiStore(),
            localVue
        });

        expect(wrapper.find(".pager-left").classes("disabled")).to.be.true;
    });

    it("should enabled right pager if pagerIndex is zero", () => {
        const store = getGfiStore(),
            wrapper = mount(GfiComponent, {
                computed: {
                    isMobile: () => true,
                    desktopType: () => "",
                    active: () => true,
                    gfiFeatures: () => [{
                        getTheme: () => "default",
                        getTitle: () => "Feature 1",
                        getGfiUrl: () => null,
                        getMimeType: () => "text/html",
                        getAttributesToShow: () => sinon.stub(),
                        getProperties: () => {
                            return {};
                        },
                        getFeatures: () => []
                    },
                    {}],
                    gfiFeaturesReverse: () => sinon.stub(),
                    mapSize: () => []
                },
                store,
                localVue
            });

        expect(wrapper.find(".pager-right").classes("disabled")).to.be.false;
    });

    it("should disabled right pager if pagerIndex === gfiFeatures.length - 1", () => {
        const wrapper = mount(GfiComponent, {
            data () {
                return {
                    pagerIndex: 1
                };
            },
            computed: {
                isMobile: () => true,
                desktopType: () => "",
                active: () => true,
                gfiFeatures: () => [{}, {
                    getTheme: () => "default",
                    getTitle: () => "Feature 1",
                    getGfiUrl: () => null,
                    getMimeType: () => "text/html",
                    getMappedProperties: () => null,
                    getProperties: () => {
                        return {};
                    },
                    getFeatures: () => []
                }],
                gfiFeaturesReverse: () => sinon.stub(),
                mapSize: () => []
            },
            store: getGfiStore(),
            localVue
        });

        expect(wrapper.find(".pager-right").classes("disabled")).to.be.true;
    });

    it("should enable left pager if pagerIndex === gfiFeatures.length - 1", () => {
        const wrapper = mount(GfiComponent, {
            data () {
                return {
                    pagerIndex: 1
                };
            },
            computed: {
                isMobile: () => true,
                desktopType: () => "",
                active: () => true,
                gfiFeatures: () => [{}, {
                    getTheme: () => "default",
                    getTitle: () => "Feature 1",
                    getGfiUrl: () => null,
                    getMimeType: () => "text/html",
                    getMappedProperties: () => null,
                    getProperties: () => {
                        return {};
                    },
                    getFeatures: () => []
                }],
                gfiFeaturesReverse: () => sinon.stub(),
                mapSize: () => []
            },
            store: getGfiStore,
            localVue
        });

        expect(wrapper.find(".pager-left").classes("disabled")).to.be.false;
    });


    it("should enable left pager and right pager if pagerIndex is between zero and gfiFeature.length - 1", () => {
        const wrapper = mount(GfiComponent, {
            data () {
                return {
                    pagerIndex: 1
                };
            },
            computed: {
                isMobile: () => true,
                desktopType: () => "",
                active: () => true,
                gfiFeatures: () => [{}, {
                    getTheme: () => "default",
                    getTitle: () => "Feature 1",
                    getGfiUrl: () => null,
                    getMimeType: () => "text/html",
                    getMappedProperties: () => null,
                    getProperties: () => sinon.stub(),
                    getFeatures: () => sinon.stub()
                }, {}],
                gfiFeaturesReverse: () => sinon.stub(),
                mapSize: () => []
            },
            store: getGfiStore,
            localVue
        });

        expect(wrapper.find(".pager-left").classes("disabled")).to.be.false;
        expect(wrapper.find(".pager-right").classes("disabled")).to.be.false;
    });

    it("should find a new detached component, if componentKey was changed", async () => {
        const wrapper = shallowMount(GfiComponent, {
            computed: {
                isMobile: () => false,
                desktopType: () => "",
                active: () => true,
                uiStyle: () => "",
                gfiFeatures: () => [{
                    getGfiUrl: () => null,
                    getFeatures: () => sinon.stub(),
                    getProperties: () => sinon.stub()
                }],
                gfiFeaturesReverse: () => sinon.stub(),
                mapSize: () => []
            },
            store: getGfiStore,
            localVue
        });
        let firstDetachedComponent = "",
            secondDetachedComponent = "";

        firstDetachedComponent = wrapper.findComponent({name: "DetachedTemplate"});
        await wrapper.setData({componentKey: true});
        secondDetachedComponent = wrapper.findComponent({name: "DetachedTemplate"});

        expect(firstDetachedComponent.exists()).to.be.false;
        expect(secondDetachedComponent.exists()).to.be.true;
    });
});
