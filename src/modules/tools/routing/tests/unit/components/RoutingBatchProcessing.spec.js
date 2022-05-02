import Vuex from "vuex";
import {expect} from "chai";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import RoutingBatchProcessingComponent from "../../../components/RoutingBatchProcessing.vue";
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

describe("src/modules/tools/routing/components/RoutingBatchProcessing.vue", () => {
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
        wrapper,
        props;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaced: true,
            modules: {
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
            state: {
                configJson: mockConfigJson
            }
        });

        props = {
            settings: {},
            progress: 0,
            isProcessing: false,
            structureText: "",
            exampleText: ""
        };
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("renders RoutingBatchProcessingComponent", () => {
        wrapper = shallowMount(RoutingBatchProcessingComponent, {
            store,
            localVue,
            propsData: props
        });
        expect(wrapper.find("#routing-batch-processing").exists()).to.be.true;
    });

    it("renders processing", () => {
        props.isProcessing = true;
        props.progress = 10.00;
        wrapper = shallowMount(RoutingBatchProcessingComponent, {
            store,
            localVue,
            propsData: props
        });
        expect(wrapper.find("#routing-batch-processing-isprocessing").exists()).to.be.true;
        expect(wrapper.find("progress").element.value).to.equal(10);
        expect(wrapper.find("#routing-batch-processing-isprocessing-progresstext").element.innerHTML).to.equal("10 %");
    });

    it("renders emits cancelProcess while processing", async () => {
        props.isProcessing = true;
        props.progress = 10.00;
        wrapper = shallowMount(RoutingBatchProcessingComponent, {
            store,
            localVue,
            propsData: props
        });
        const input = wrapper.find(".bi-x-lg");

        input.trigger("click");
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted().cancelProcess.length).equal(1);
    });
});
