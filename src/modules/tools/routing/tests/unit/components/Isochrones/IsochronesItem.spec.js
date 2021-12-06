import Vuex from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import IsochronesComponent from "../../../../components/Isochrones/IsochronesItem.vue";
import IsochronesItemBatchProcessingComponent from "../../../../components/Isochrones/IsochronesItemBatchProcessing.vue";
import RoutingBatchProcessingCheckboxComponent from "../../../../components/RoutingBatchProcessingCheckbox.vue";
import RoutingSliderInputComponent from "../../../../components/RoutingSliderInput.vue";
import RoutingDownloadComponent from "../../../../components/RoutingDownload.vue";
import Routing from "../../../../store/indexRouting";
import mapCollection from "../../../../../../../core/dataStorage/mapCollection.js";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/routing/components/Isochrones/IsochronesItem.vue", () => {
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

    before(() => {
        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D",
            addLayer: sinon.spy(),
            removeLayer: sinon.spy(),
            addInteraction: sinon.spy(),
            removeInteraction: sinon.spy()
        };

        mapCollection.addMap(map, "ol", "2D");
    });


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
                    state: {
                        mapId: "ol",
                        mapMode: "2D"
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

    it("renders Isochrones", () => {
        wrapper = shallowMount(IsochronesComponent, {store, localVue});
        expect(wrapper.find("#routing-isochrones").exists()).to.be.true;
    });

    it("renders IsochronesBatchProcessingCheckbox", async () => {
        wrapper = shallowMount(IsochronesComponent, {store, localVue});
        wrapper.vm.settings.batchProcessing.enabled = true;
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(RoutingBatchProcessingCheckboxComponent).exists()).to.be.true;
    });

    it("doesn't render IsochronesBatchProcessingCheckbox", async () => {
        wrapper = shallowMount(IsochronesComponent, {store, localVue});
        wrapper.vm.settings.batchProcessing.enabled = false;
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(RoutingBatchProcessingCheckboxComponent).exists()).to.be.false;
    });

    it("renders IsochronesBatchProcessing", async () => {
        wrapper = shallowMount(IsochronesComponent, {store, localVue});
        wrapper.vm.settings.batchProcessing.enabled = true;
        wrapper.vm.settings.batchProcessing.active = true;
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(IsochronesItemBatchProcessingComponent).exists()).to.be.true;
    });

    it("doesn't render IsochronesBatchProcessing", async () => {
        wrapper = shallowMount(IsochronesComponent, {store, localVue});
        wrapper.vm.settings.batchProcessing.enabled = true;
        wrapper.vm.settings.batchProcessing.active = false;
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(IsochronesItemBatchProcessingComponent).exists()).to.be.false;
    });

    it("renders RoutingCoordinateInput", async () => {
        wrapper = shallowMount(IsochronesComponent, {store, localVue});
        wrapper.vm.settings.batchProcessing.enabled = false;
        await wrapper.vm.$nextTick();
        expect(wrapper.find("#routing-isochrones-coordinate-input-form").exists()).to.be.true;
    });

    it("doesn't render RoutingCoordinateInput", async () => {
        wrapper = shallowMount(IsochronesComponent, {store, localVue});
        wrapper.vm.settings.batchProcessing.enabled = true;
        wrapper.vm.settings.batchProcessing.active = true;
        await wrapper.vm.$nextTick();
        expect(wrapper.find("#routing-isochrones-coordinate-input-form").exists()).to.be.false;
    });

    it("renders RoutingSliderInput - DISTANCE", async () => {
        wrapper = shallowMount(IsochronesComponent, {store, localVue});
        wrapper.vm.settings.isochronesMethodOption = "DISTANCE";
        await wrapper.vm.$nextTick();
        expect(
            wrapper.findAllComponents(RoutingSliderInputComponent)
                .filter(el => el.vm.$props.label === "common:modules.tools.routing.isochrones.maxDistance")
                .length
        ).equal(1);
        expect(
            wrapper.findAllComponents(RoutingSliderInputComponent)
                .filter(el => el.vm.$props.label === "common:modules.tools.routing.isochrones.maxTraveltime")
                .length
        ).equal(0);
    });

    it("renders RoutingSliderInput - TIME", async () => {
        wrapper = shallowMount(IsochronesComponent, {store, localVue});
        wrapper.vm.settings.isochronesMethodOption = "TIME";
        await wrapper.vm.$nextTick();
        expect(
            wrapper.findAllComponents(RoutingSliderInputComponent)
                .filter(el => el.vm.$props.label === "common:modules.tools.routing.isochrones.maxTraveltime")
                .length
        ).equal(1);
        expect(
            wrapper.findAllComponents(RoutingSliderInputComponent)
                .filter(el => el.vm.$props.label === "common:modules.tools.routing.isochrones.maxDistance")
                .length
        ).equal(0);
    });

    it("renders isochrones result", async () => {
        store.commit("Tools/Routing/Isochrones/setRoutingIsochrones", {
            getAreas: () => []
        });
        wrapper = shallowMount(IsochronesComponent, {store, localVue});
        wrapper.vm.settings.batchProcessing.enabled = false;
        await wrapper.vm.$nextTick();
        expect(wrapper.find("#routing-isochrones-result-isochrones").exists()).to.be.true;
        expect(wrapper.findComponent(RoutingDownloadComponent).exists()).to.be.true;
    });

    it("doesn't render isochrones result", async () => {
        store.commit("Tools/Routing/Isochrones/setRoutingIsochrones", null);
        wrapper = shallowMount(IsochronesComponent, {store, localVue});
        wrapper.vm.settings.batchProcessing.enabled = false;
        await wrapper.vm.$nextTick();
        expect(wrapper.find("#routing-isochrones-result-isochrones").exists()).to.be.false;
        expect(wrapper.findComponent(RoutingDownloadComponent).exists()).to.be.false;
    });

    it("computes currentValue depending on method option", () => {
        wrapper = shallowMount(IsochronesComponent, {store, localVue});
        wrapper.vm.settings.distanceValue = 10;
        wrapper.vm.settings.timeValue = 20;
        wrapper.vm.settings.isochronesMethodOption = "TIME";
        expect(wrapper.vm.currentValue).equal(20);
        wrapper.vm.settings.isochronesMethodOption = "DISTANCE";
        expect(wrapper.vm.currentValue).equal(10);
    });

    it("computes maxInterval depending on currentValue", () => {
        wrapper = shallowMount(IsochronesComponent, {store, localVue});
        wrapper.vm.settings.distanceValue = 10;
        wrapper.vm.settings.isochronesMethodOption = "DISTANCE";
        wrapper.vm.settings.maxInterval = 15;
        expect(wrapper.vm.maxIntervalValue).equal(10);
        wrapper.vm.settings.distanceValue = 30;
        expect(wrapper.vm.settings.maxInterval).equal(15);
    });

    it("should setIntervalValue on changeMethodOption if value smaller than intervalValue", () => {
        wrapper = shallowMount(IsochronesComponent, {store, localVue});
        wrapper.vm.settings.distanceValue = 10;
        wrapper.vm.settings.intervalValue = 30;
        wrapper.vm.settings.isochronesMethodOption = "TIME";
        wrapper.vm.changeMethodOption("DISTANCE");
        expect(wrapper.vm.settings.intervalValue).equal(10);
    });

    it("should setIntervalValue on setDistanceValue if value smaller than intervalValue", () => {
        wrapper = shallowMount(IsochronesComponent, {store, localVue});
        wrapper.vm.settings.distanceValue = 30;
        wrapper.vm.settings.intervalValue = 30;
        wrapper.vm.setDistanceValue(20);
        expect(wrapper.vm.settings.intervalValue).equal(20);
    });

    it("should setIntervalValue on setTimeValue if value smaller than intervalValue", () => {
        wrapper = shallowMount(IsochronesComponent, {store, localVue});
        wrapper.vm.settings.timeValue = 30;
        wrapper.vm.settings.intervalValue = 30;
        wrapper.vm.setTimeValue(20);
        expect(wrapper.vm.settings.intervalValue).equal(20);
    });
});
