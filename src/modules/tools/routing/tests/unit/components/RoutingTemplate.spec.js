import Vuex from "vuex";
import {expect} from "chai";
import {config, shallowMount, createLocalVue, mount} from "@vue/test-utils";
import RoutingComponent from "../../../components/RoutingTemplate.vue";
import sinon from "sinon";
import mutations from "../../../store/mutationsRouting";
import actions from "../../../store/actionsRouting";
import getters from "../../../store/gettersRouting";
import state from "../../../store/stateRouting";
import Directions from "../../../store/directions/indexDirections";
import Isochrones from "../../../store/isochrones/indexIsochrones";

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
                                "icon": "bi-signpost-2-fill",
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
        const map = {
            id: "ol",
            mode: "2D",
            addLayer: sinon.spy(),
            removeLayer: sinon.spy(),
            addInteraction: sinon.spy(),
            removeInteraction: sinon.spy()
        };

        mapCollection.clear();
        mapCollection.addMap(map, "2D");

        store = new Vuex.Store({
            namespaced: true,
            modules: {
                Maps: {
                    namespaced: true,
                    actions: {
                        addPointerMoveHandler: sinon.stub(),
                        removePointerMoveHandler: sinon.stub(),
                        removeInteraction: sinon.stub(),
                        addInteraction: sinon.stub(),
                        addLayerOnTop: sinon.stub(),
                        unregisterListener: sinon.stub(),
                        registerListener: sinon.stub()
                    },
                    state: {
                        mode: "2D"
                    }
                },
                Tools: {
                    namespaced: true,
                    modules: {
                        Routing:
                        {
                            namespaced: true,
                            modules: {
                                Directions,
                                Isochrones
                            },
                            state: {...state},
                            mutations,
                            actions,
                            getters
                        }
                    }
                },
                Alerting: {
                    namespaced: true,
                    actions: {
                        addSingleAlert: sinon.stub()
                    }
                }
            },
            getters: {
                uiStyle: () => ""
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/Routing/setActive", true);
    });

    afterEach(() => {
        store.commit("Tools/Routing/setActive", false);
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("renders Routing", () => {
        wrapper = shallowMount(RoutingComponent, {store, localVue});
        expect(wrapper.find("#routing").exists()).to.be.true;
    });


    it("not renders routing", () => {
        store.commit("Tools/Routing/setActive", false);
        wrapper = shallowMount(RoutingComponent, {store, localVue});
        expect(wrapper.find("#routing").exists()).to.be.false;
    });

    it("renders directions", () => {
        store.commit("Tools/Routing/setActiveRoutingToolOption", "DIRECTIONS");
        wrapper = mount(RoutingComponent, {store, localVue});
        expect(wrapper.find("#routing-directions").exists()).to.be.true;
    });

    it("renders isochrones", () => {
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
