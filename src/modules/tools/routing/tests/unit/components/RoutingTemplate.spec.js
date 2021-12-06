import Vuex from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount, createLocalVue, mount} from "@vue/test-utils";
import RoutingComponent from "../../../components/RoutingTemplate.vue";
import Routing from "../../../store/indexRouting";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/routing/components/RoutingTemplate.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        routing:
                            {
                                "name": "translate#common:menu.tools.routing",
                                "icon": "bi-signpost-2",
                                "renderToWindow": true
                            }
                    }
                }
            }
        }
    };
    let store,
        wrapper;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaced: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        Routing
                    }
                },
                Map: {
                    namespaced: true,
                    getters: {
                        map: () => ({
                            addLayer: sinon.spy(),
                            removeLayer: sinon.spy(),
                            addInteraction: sinon.spy(),
                            removeInteraction: sinon.spy()
                        })
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/Routing/setActive", true);
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("renders Routing", () => {
        store.commit("Tools/Routing/setActive", true);
        wrapper = shallowMount(RoutingComponent, {store, localVue});
        expect(wrapper.find("#routing").exists()).to.be.true;
    });

    it("not renders routing", () => {
        store.commit("Tools/Routing/setActive", false);
        wrapper = shallowMount(RoutingComponent, {store, localVue});

        expect(wrapper.find("#routing").exists()).to.be.false;
    });

    it("renders directions", () => {
        store.commit("Tools/Routing/setActive", true);
        store.commit("Tools/Routing/setActiveRoutingToolOption", "DIRECTIONS");
        wrapper = mount(RoutingComponent, {store, localVue});
        expect(wrapper.find("#routing-directions").exists()).to.be.true;
    });

    it("renders isochrones", () => {
        store.commit("Tools/Routing/setActive", true);
        store.commit("Tools/Routing/setActiveRoutingToolOption", "ISOCHRONES");
        wrapper = mount(RoutingComponent, {store, localVue});
        expect(wrapper.find("#routing-isochrones").exists()).to.be.true;
    });

    it("closes routing tool on close", async () => {
        wrapper = shallowMount(RoutingComponent, {store, localVue});
        wrapper.vm.close();
        await wrapper.vm.$nextTick();
        expect(store.state.Tools.Routing.active).to.be.false;
        expect(wrapper.find("#routing").exists()).to.be.false;
    });
});
