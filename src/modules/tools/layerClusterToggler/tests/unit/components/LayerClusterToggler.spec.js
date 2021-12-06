import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import LayerClusterTogglerComponent from "../../../components/LayerClusterToggler.vue";
import LayerClusterToggler from "../../../store/indexLayerClusterToggler";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/layerClusterToggler/components/LayerClusterToggler.vue", () => {
    const
        mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            layerClusterToggler:
                                {
                                    "name": "translate#common:menu.tools.layerClusterToggler",
                                    "icon": "bi-easel3",
                                    "renderToWindow": true
                                }
                        }
                    }
                }
            }
        };

    let store, wrapper;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        LayerClusterToggler
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/LayerClusterToggler/setActive", true);
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });


    it("should find the component LayerClusterToggler", () => {
        wrapper = shallowMount(LayerClusterTogglerComponent, {store, localVue});

        expect(wrapper.findComponent({name: "LayerClusterToggler"}).exists()).to.be.true;
    });

    it("The cluster layers will be toggled with the changed value of parameter isToggled ", () => {
        wrapper = shallowMount(LayerClusterTogglerComponent, {store, localVue});

        wrapper.setData({storePath: {
            "clusterList": [
                {
                    "layerId": "8712",
                    "suffix": "90000"
                },
                {
                    "layerId": "8712",
                    "suffix": "90001"
                },
                {
                    "layerId": "8712",
                    "suffix": "90002"
                }
            ]
        }});
        wrapper.setData({isToggled: true});
        wrapper.vm.toggleLayers();
        expect(wrapper.vm.isToggled).to.be.false;

        wrapper.setData({storePath: {
            "clusterList": ["9001", "9002", "9003"]
        }});
        wrapper.setData({isToggled: true});
        wrapper.vm.toggleLayers();
        expect(wrapper.vm.isToggled).to.be.false;
    });

    it("The cluster layers will not be toggled and the value of parameter isToggled is not changed", () => {
        wrapper = shallowMount(LayerClusterTogglerComponent, {store, localVue});

        wrapper.setData({storePath: {
            "clusterList": []
        }});
        wrapper.setData({isToggled: true});
        wrapper.vm.toggleLayers();
        expect(wrapper.vm.isToggled).to.be.true;

        wrapper.setData({storePath: {
            "clusterList": "test"
        }});
        wrapper.setData({isToggled: true});
        wrapper.vm.toggleLayers();
        expect(wrapper.vm.isToggled).to.be.true;
    });
});
