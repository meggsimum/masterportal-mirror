import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";

import LayerSliderComponent from "../../../components/LayerSlider.vue";
import LayerSlider from "../../../store/indexLayerSlider";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/layerSlider/components/LayerSlider.vue", () => {
    const mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            layerSlider: {
                                "name": "translate#common:menu.tools.layerSlider",
                                "icon": "bi-film"
                            }
                        }
                    }
                }
            }
        },
        layerSliderPlayerComponentMock = {
            template: "<span />"
        },
        layerSliderHandleComponentMock = {
            template: "<span />"
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
                        LayerSlider
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/LayerSlider/setActive", true);
    });

    it("renders the layerSlider", () => {
        wrapper = shallowMount(LayerSliderComponent, {store, localVue});

        expect(wrapper.find("#tool-layer-slider").exists()).to.be.true;
    });

    it("renders the layerSlider with sliderType LayerSliderPlayer", () => {
        store.commit("Tools/LayerSlider/setSliderType", "player");
        wrapper = shallowMount(LayerSliderComponent, {
            store,
            localVue,
            components: {
                LayerSliderPlayer: layerSliderPlayerComponentMock,
                LayerSliderHandle: layerSliderHandleComponentMock
            }
        });

        expect(wrapper.findComponent(layerSliderPlayerComponentMock).exists()).to.be.true;
        expect(wrapper.findComponent(layerSliderHandleComponentMock).exists()).to.be.false;
    });

    it("renders the layerSlider with sliderType LayerSliderHandle", () => {
        store.commit("Tools/LayerSlider/setSliderType", "handle");
        wrapper = shallowMount(LayerSliderComponent, {
            store,
            localVue,
            components: {
                LayerSliderPlayer: layerSliderPlayerComponentMock,
                LayerSliderHandle: layerSliderHandleComponentMock
            }
        });

        expect(wrapper.findComponent(layerSliderPlayerComponentMock).exists()).to.be.false;
        expect(wrapper.findComponent(layerSliderHandleComponentMock).exists()).to.be.true;
    });

});
