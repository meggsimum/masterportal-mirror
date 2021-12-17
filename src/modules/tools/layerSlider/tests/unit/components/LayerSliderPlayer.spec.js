import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";

import LayerSliderPlayerComponent from "../../../components/LayerSliderPlayer.vue";
import LayerSlider from "../../../store/indexLayerSlider";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/layerSlider/components/LayerSliderPlayer.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        layerSlider: {
                            "name": "translate#common:menu.tools.layerSlider",
                            "icon": "bi-film",
                            "windowsInterval": null
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

    it("renders the layerSliderPlayer elements", () => {
        wrapper = shallowMount(LayerSliderPlayerComponent, {store, localVue});

        expect(wrapper.find("#tool-layer-slider-player").exists()).to.be.true;
        expect(wrapper.find("#tool-layer-slider-player > div.progress").exists()).to.be.true;
        expect(wrapper.find("#tool-layer-slider-player > div.input-group").exists()).to.be.true;
    });

    it("renders the progress-bar", () => {
        wrapper = shallowMount(LayerSliderPlayerComponent, {store, localVue});

        expect(wrapper.find("#tool-layer-slider-player > div.progress").exists()).to.be.true;
        expect(wrapper.find("#tool-layer-slider-player > div.progress > div.progress-bar").exists()).to.be.true;
        expect(wrapper.find("#tool-layer-slider-player > div.progress > div.progress-bar > span.sr-only").exists()).to.be.true;
        expect(wrapper.find("#tool-layer-slider-player > div.progress > div.progress-bar > span.sr-only").text()).equals("modules.tools.layerSlider.displayLayers");
    });

    it("renders the input-group with buttons", () => {
        const buttonIds = ["play", "stop", "backward", "forward"];

        wrapper = shallowMount(LayerSliderPlayerComponent, {store, localVue});

        expect(wrapper.find("#tool-layer-slider-player > div.input-group").exists()).to.be.true;
        expect(wrapper.findAll("#tool-layer-slider-player > div.input-group > button").length).equals(4);

        wrapper.findAll("#tool-layer-slider-player > div.input-group > button").wrappers.forEach((button, index) => {
            expect(button.attributes("id")).equals(buttonIds[index]);
        });

        expect(wrapper.find("#tool-layer-slider-player > div.input-group > label").exists()).to.be.true;
        expect(wrapper.find("#tool-layer-slider-player > div.input-group > input#title").exists()).to.be.true;
    });

    it("renders the input-group button pause if play is clicked", async () => {
        await store.commit("Tools/LayerSlider/setLayerIds", [
            {
                layerId: 0,
                index: 0
            },
            {
                layerid: 1,
                index: 1
            }
        ]);

        wrapper = shallowMount(LayerSliderPlayerComponent, {store, localVue});

        await wrapper.find("#tool-layer-slider-player > div.input-group > button#play").trigger("click");

        expect(wrapper.find("#tool-layer-slider-player > div.input-group > button#play").exists()).to.be.false;
        expect(wrapper.find("#tool-layer-slider-player > div.input-group > button#pause").exists()).to.be.true;
    });

    it("skip to next layer with forward button", async () => {
        await store.commit("Tools/LayerSlider/setLayerIds", [
            {
                layerId: 0,
                index: 0
            },
            {
                layerid: 1,
                index: 1
            },
            {
                layerid: 2,
                index: 2
            }
        ]);
        wrapper = shallowMount(LayerSliderPlayerComponent, {store, localVue});

        expect(store.getters["Tools/LayerSlider/activeLayer"].index).equals(0);

        await wrapper.find("#tool-layer-slider-player > div.input-group > button#forward").trigger("click");
        expect(store.getters["Tools/LayerSlider/activeLayer"].index).equals(1);

        await wrapper.find("#tool-layer-slider-player > div.input-group > button#forward").trigger("click");
        expect(store.getters["Tools/LayerSlider/activeLayer"].index).equals(2);

        await wrapper.find("#tool-layer-slider-player > div.input-group > button#forward").trigger("click");
        expect(store.getters["Tools/LayerSlider/activeLayer"].index).equals(0);
    });

    it("skip to previous layer with backward button", async () => {
        await store.commit("Tools/LayerSlider/setLayerIds", [
            {
                layerId: 0,
                index: 0
            },
            {
                layerid: 1,
                index: 1
            },
            {
                layerid: 2,
                index: 2
            }
        ]);
        wrapper = shallowMount(LayerSliderPlayerComponent, {store, localVue});

        expect(store.getters["Tools/LayerSlider/activeLayer"].index).equals(0);

        await wrapper.find("#tool-layer-slider-player > div.input-group > button#backward").trigger("click");
        expect(store.getters["Tools/LayerSlider/activeLayer"].index).equals(2);

        await wrapper.find("#tool-layer-slider-player > div.input-group > button#backward").trigger("click");
        expect(store.getters["Tools/LayerSlider/activeLayer"].index).equals(1);

        await wrapper.find("#tool-layer-slider-player > div.input-group > button#backward").trigger("click");
        expect(store.getters["Tools/LayerSlider/activeLayer"].index).equals(0);
    });
});
