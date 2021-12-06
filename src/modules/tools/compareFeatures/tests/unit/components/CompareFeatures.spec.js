import Vuex from "vuex";
import {expect} from "chai";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import CompareFeaturesComponent from "../../../components/CompareFeatures.vue";
import CompareFeatures from "../../../store/indexCompareFeatures";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/compareFeatures/components/CompareFeatures.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        compareFeatures:
                            {
                                "name": "translate#common:menu.tools.compareFeatures",
                                "icon": "bi-record-circle",
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
                        CompareFeatures
                    }
                },
                Map: {
                    namespaced: true
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
    });

    it("renders CompareFeatures modal", () => {
        store.commit("Tools/CompareFeatures/setHasFeatures", true);
        store.commit("Tools/CompareFeatures/setActive", true);
        wrapper = shallowMount(CompareFeaturesComponent, {store, localVue});

        expect(wrapper.find("#tool-compareFeatures-comparisonListSingleLayer").exists()).to.be.true;
    });

    it("renders CompareFeatures when tool is active and has multiple layers", () => {
        store.commit("Tools/CompareFeatures/setActive", true);
        store.commit("Tools/CompareFeatures/setHasMultipleLayers", true);
        wrapper = shallowMount(CompareFeaturesComponent, {store, localVue});

        expect(wrapper.find("#tool-compareFeatures-comparisonListMultipleLayers").exists()).to.be.true;
    });
    describe("CompareFeatures.vue methods", () => {
        it("close sets active to false", async () => {
            wrapper = shallowMount(CompareFeaturesComponent, {store, localVue});

            wrapper.vm.close();
            await wrapper.vm.$nextTick();

            expect(store.state.Tools.CompareFeatures.active).to.be.false;
            expect(wrapper.find("#tool-compareFeatures").exists()).to.be.false;
        });
    });
});
