import Vuex from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import RoutingBatchProcessingCheckboxComponent from "../../../components/RoutingBatchProcessingCheckbox.vue";
import mutations from "../../../store/mutationsRouting";
import actions from "../../../store/actionsRouting";
import getters from "../../../store/gettersRouting";
import state from "../../../store/stateRouting";
import Directions from "../../../store/directions/indexDirections";
import Isochrones from "../../../store/isochrones/indexIsochrones";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/routing/components/RoutingBatchProcessingCheckbox.vue", () => {
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
            batchProcessing: {
                active: false
            }
        };
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("renders RoutingBatchProcessingCheckboxComponent", () => {
        wrapper = shallowMount(RoutingBatchProcessingCheckboxComponent, {
            store,
            localVue,
            propsData: props
        });
        expect(wrapper.find("#routing-batch-processing-checkbox").exists()).to.be.true;
        expect(wrapper.find("input").element.checked).to.be.false;
    });

    it("changes checked input", () => {
        props.batchProcessing.active = true;
        wrapper = shallowMount(RoutingBatchProcessingCheckboxComponent, {
            store,
            localVue,
            propsData: props
        });
        expect(wrapper.find("input").element.checked).to.be.true;
    });


    it("emits input on change", async () => {
        wrapper = shallowMount(RoutingBatchProcessingCheckboxComponent, {
            store,
            localVue,
            propsData: props
        });
        const input = wrapper.find("input");

        input.element.checked = true;
        input.trigger("input");
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted().input.length).equal(1);
        expect(wrapper.emitted().input[0]).deep.to.equal([true]);
    });
});
