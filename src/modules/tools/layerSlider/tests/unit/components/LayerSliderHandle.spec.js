import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import LayerSliderHandleComponent from "../../../components/LayerSliderHandle.vue";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/layerSlider/components/LayerSliderHandle.vue", () => {
    const mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            layerSlider: {
                                "name": "translate#common:menu.tools.layerSlider",
                                "glyphicon": "glyphicon-film",
                                "sliderType": "handle"
                            }
                        }
                    }
                }
            }
        },
        layerIds = [
            {
                layerId: 0,
                index: 0
            },
            {
                layerId: 1,
                index: 1
            },
            {
                layerId: 2,
                index: 2
            }
        ];

    let store,
        wrapper;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaced: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        LayerSlider: {
                            namespaced: true,
                            getters: {
                                id: () => "layerSlider",
                                name: () => "common:menu.tools.layerSlider",
                                glyphicon: () => "glyphicon-film",
                                renderToWindow: () => true,
                                resizableWindow: () => true,
                                isVisibleInMenu: () => true,
                                deactivateGFI: () => false,
                                title: () => "common:modules.tools.layerSlider.title",
                                active: () => false,
                                layerIds: () => layerIds,
                                activeLayer: () => {
                                    return {
                                        layerId: "",
                                        index: -1
                                    };
                                },
                                dataSliderMin: () => "0",
                                dataSliderMax: () => "",
                                dataSliderTicks: () => ""
                            },
                            actions: {
                                setActiveIndex: sinon.stub(),
                                sendModification: sinon.stub()
                            },
                            mutations: {
                                setActive: sinon.stub(),
                                setLayerIds: sinon.stub(),
                                setDataSliderMax: sinon.stub(),
                                setDataSliderTicks: sinon.stub()
                            }
                        }
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
        store.commit("Tools/LayerSlider/setLayerIds", layerIds);

        wrapper = shallowMount(LayerSliderHandleComponent, {store, localVue});

        expect(wrapper.find("#tool-layer-slider-handle").exists()).to.be.true;
        expect(wrapper.find("#tool-layer-slider-handle > label#label-slider").exists()).to.be.true;
        expect(wrapper.find("#tool-layer-slider-handle > input#slider").exists()).to.be.true;
    });

    it("prepareSliderTicks - returns the slider ticks", () => {
        wrapper = shallowMount(LayerSliderHandleComponent, {store, localVue});

        expect(wrapper.vm.prepareSliderTicks(layerIds)).to.includes(0, 10, 20);
    });

    describe("getLayerIdFromIndex", () => {
        it("should return first layerId", () => {
            wrapper = shallowMount(LayerSliderHandleComponent, {store, localVue});

            expect(wrapper.vm.getLayerIdFromIndex(0)).equals(0);
        });
        it("should return second layerId based on the \"next\" mode", () => {
            wrapper = shallowMount(LayerSliderHandleComponent, {store, localVue});

            expect(wrapper.vm.getLayerIdFromIndex(0, "next")).equals(1);
        });
        it("should return third layerId", () => {
            wrapper = shallowMount(LayerSliderHandleComponent, {store, localVue});

            expect(wrapper.vm.getLayerIdFromIndex(14)).to.equal(1);
        });
        it("should return fourth layerId based on the \"next\" mode", () => {
            wrapper = shallowMount(LayerSliderHandleComponent, {store, localVue});

            expect(wrapper.vm.getLayerIdFromIndex(14, "next")).to.equal(2);
        });
    });

    describe("getPositionFromValue", () => {
        it("should return position based on \"value\"", () => {
            wrapper = shallowMount(LayerSliderHandleComponent, {store, localVue});

            expect(wrapper.vm.getPositionFromValue(0)).to.equal(0);
        });
        it("should return position based on \"value\" and the \"next\" mode", () => {
            wrapper = shallowMount(LayerSliderHandleComponent, {store, localVue});

            expect(wrapper.vm.getPositionFromValue(0, "next")).to.equal(1);
        });
        it("should return position based on \"value\"", () => {
            wrapper = shallowMount(LayerSliderHandleComponent, {store, localVue});

            expect(wrapper.vm.getPositionFromValue(14)).to.equal(1);
        });
        it("should return position based on \"value\" and the \"next\" mode", () => {
            wrapper = shallowMount(LayerSliderHandleComponent, {store, localVue});

            expect(wrapper.vm.getPositionFromValue(14, "next")).to.equal(2);
        });
    });

    describe("showLayer", () => {
        it("show layer with status true, if transparency is 100", async () => {
            wrapper = shallowMount(LayerSliderHandleComponent, {store, localVue});

            const spySendModification = sinon.spy(wrapper.vm, "sendModification");

            await wrapper.vm.showLayer("100", 100, ["100", "200", "300"]);

            expect(spySendModification.calledOnce).to.be.true;
            expect(spySendModification.args[0]).to.deep.includes({
                layerId: "100",
                status: true,
                transparency: 0
            });
        });
        it("show layer with status true, if transparency is 0", async () => {
            wrapper = shallowMount(LayerSliderHandleComponent, {store, localVue});

            const spySendModification = sinon.spy(wrapper.vm, "sendModification");

            await wrapper.vm.showLayer("100", 0, ["100", "200", "300"]);

            expect(spySendModification.calledOnce).to.be.true;
            expect(spySendModification.args[0]).to.deep.includes({
                layerId: "100",
                status: true,
                transparency: 0
            });
        });
        it("show layer with status true, if transparency is 37", async () => {
            wrapper = shallowMount(LayerSliderHandleComponent, {store, localVue});

            const spySendModification = sinon.spy(wrapper.vm, "sendModification");

            await wrapper.vm.showLayer("100", 37, ["100", "200", "300"]);

            expect(spySendModification.calledOnce).to.be.true;
            expect(spySendModification.args[0]).to.deep.includes({
                layerId: "100",
                status: true,
                transparency: 37
            });
        });
        it("show layer with status false, if transparency is 110", async () => {
            wrapper = shallowMount(LayerSliderHandleComponent, {store, localVue});

            const spySendModification = sinon.spy(wrapper.vm, "sendModification");

            await wrapper.vm.showLayer("100", 110, ["100", "200", "300"]);

            expect(spySendModification.calledOnce).to.be.true;
            expect(spySendModification.args[0]).to.deep.includes({
                layerId: "100",
                status: false,
                transparency: 110
            });
        });
    });
});
