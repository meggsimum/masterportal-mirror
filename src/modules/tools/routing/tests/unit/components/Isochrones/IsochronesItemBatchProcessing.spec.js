import Vuex from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import IsochronesItemBatchProcessingComponent from "../../../../components/Isochrones/IsochronesItemBatchProcessing.vue";
import Routing from "../../../../store/indexRouting";
import {RoutingIsochrones} from "../../../../utils/classes/routing-isochrones";
import {RoutingIsochronesArea} from "../../../../utils/classes/routing-isochrones-area";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/routing/components/Isochrones/IsochronesItemBatchProcessing.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        routing: {
                            name: "translate#common:menu.tools.routing",
                            icon: "bi-signpost-2",
                            renderToWindow: true
                        }
                    }
                }
            }
        }
    };
    let store, wrapper, props;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaced: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        Routing
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/Routing/setActive", true);
        props = {
            settings: {
                batchProcessing: {
                    limit: 1000,
                    maximumConcurrentRequests: 1
                }
            }
        };
        sinon.stub(i18next, "t").callsFake((...args) => args);
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
        sinon.restore();
    });

    it("renders IsochronesBatchProcessingComponent", () => {
        wrapper = shallowMount(IsochronesItemBatchProcessingComponent, {
            store,
            localVue,
            propsData: props
        });
        expect(
            wrapper.findComponent(IsochronesItemBatchProcessingComponent).exists()
        ).to.be.true;
    });

    it("should create CSV download filename", () => {
        wrapper = shallowMount(IsochronesItemBatchProcessingComponent, {
            store,
            localVue,
            propsData: props
        });
        const filenameGeojson = "testgeo.geojson",
            filenameCsv = "testcsv.csv";

        expect(wrapper.vm.createDownloadFilename(filenameGeojson)).equal(
            "testgeo.geojson"
        );
        expect(wrapper.vm.createDownloadFilename(filenameCsv)).equal(
            "testcsv.geojson"
        );
    });

    describe("test csv parsing", () => {
        it("should process csv without errors", async () => {
            wrapper = shallowMount(IsochronesItemBatchProcessingComponent, {
                store,
                localVue,
                propsData: props
            });
            wrapper.vm.fetchIsochrones = () => {
                const iso1 = new RoutingIsochrones([
                    13.654976,
                    51.394561,
                    14.610472,
                    52.038351
                ]);

                iso1.addArea(
                    new RoutingIsochronesArea(
                        [
                            [13.654976, 51.716036],
                            [13.974829, 51.564453],
                            [14.595649, 51.711114],
                            [13.93262, 51.882296],
                            [13.714232, 51.85033],
                            [13.654976, 51.716036]
                        ],
                        0,
                        1800,
                        1800,
                        900,
                        "CAR",
                        "TIME",
                        [],
                        30
                    )
                );
                iso1.addArea(
                    new RoutingIsochronesArea(
                        [
                            [13.826935, 51.802841],
                            [13.947338, 51.685157],
                            [14.033771, 51.652093],
                            [14.067815, 51.736324],
                            [14.073216, 51.788426],
                            [13.826935, 51.802841]
                        ],
                        0,
                        1800,
                        1800,
                        900,
                        "CAR",
                        "TIME",
                        [],
                        15
                    )
                );

                return iso1;
            };

            const csv = `DEBBAL540001ChiF;13.05518;52.39465
DEBBAL660000sAIN;13.95471;51.74632
DEGAC00000007133;13.0285;52.30963`,
                result = await wrapper.vm.parseCsv(csv),
                expectedResult = JSON.stringify({
                    type: "FeatureCollection",
                    features: [
                        {
                            type: "Feature",
                            geometry: {
                                type: "Polygon",
                                coordinates: [
                                    [13.654976, 51.716036],
                                    [13.974829, 51.564453],
                                    [14.595649, 51.711114],
                                    [13.93262, 51.882296],
                                    [13.714232, 51.85033],
                                    [13.654976, 51.716036]
                                ]
                            },
                            properties: {
                                value: 1800,
                                interval: 900,
                                maximum: 1800,
                                color: [245, 66, 66],
                                groupIndex: 0,
                                optimization: "TIME",
                                speedProfile: "CAR",
                                avoidSpeedProfileOptions: [],
                                ID: "DEBBAL540001ChiF",
                                [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.xStart")]: 13.05518,
                                [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.yStart")]: 52.39465
                            }
                        },
                        {
                            type: "Feature",
                            geometry: {
                                type: "Polygon",
                                coordinates: [
                                    [13.826935, 51.802841],
                                    [13.947338, 51.685157],
                                    [14.033771, 51.652093],
                                    [14.067815, 51.736324],
                                    [14.073216, 51.788426],
                                    [13.826935, 51.802841]
                                ]
                            },
                            properties: {
                                value: 1800,
                                interval: 900,
                                maximum: 1800,
                                color: [245, 66, 66],
                                groupIndex: 0,
                                optimization: "TIME",
                                speedProfile: "CAR",
                                avoidSpeedProfileOptions: [],
                                ID: "DEBBAL540001ChiF",
                                [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.xStart")]: 13.05518,
                                [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.yStart")]: 52.39465
                            }
                        },
                        {
                            type: "Feature",
                            geometry: {
                                type: "Polygon",
                                coordinates: [
                                    [13.654976, 51.716036],
                                    [13.974829, 51.564453],
                                    [14.595649, 51.711114],
                                    [13.93262, 51.882296],
                                    [13.714232, 51.85033],
                                    [13.654976, 51.716036]
                                ]
                            },
                            properties: {
                                value: 1800,
                                interval: 900,
                                maximum: 1800,
                                color: [245, 66, 66],
                                groupIndex: 0,
                                optimization: "TIME",
                                speedProfile: "CAR",
                                avoidSpeedProfileOptions: [],
                                ID: "DEBBAL660000sAIN",
                                [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.xStart")]: 13.95471,
                                [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.yStart")]: 51.74632
                            }
                        },
                        {
                            type: "Feature",
                            geometry: {
                                type: "Polygon",
                                coordinates: [
                                    [13.826935, 51.802841],
                                    [13.947338, 51.685157],
                                    [14.033771, 51.652093],
                                    [14.067815, 51.736324],
                                    [14.073216, 51.788426],
                                    [13.826935, 51.802841]
                                ]
                            },
                            properties: {
                                value: 1800,
                                interval: 900,
                                maximum: 1800,
                                color: [245, 66, 66],
                                groupIndex: 0,
                                optimization: "TIME",
                                speedProfile: "CAR",
                                avoidSpeedProfileOptions: [],
                                ID: "DEBBAL660000sAIN",
                                [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.xStart")]: 13.95471,
                                [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.yStart")]: 51.74632
                            }
                        },
                        {
                            type: "Feature",
                            geometry: {
                                type: "Polygon",
                                coordinates: [
                                    [13.654976, 51.716036],
                                    [13.974829, 51.564453],
                                    [14.595649, 51.711114],
                                    [13.93262, 51.882296],
                                    [13.714232, 51.85033],
                                    [13.654976, 51.716036]
                                ]
                            },
                            properties: {
                                value: 1800,
                                interval: 900,
                                maximum: 1800,
                                color: [245, 66, 66],
                                groupIndex: 0,
                                optimization: "TIME",
                                speedProfile: "CAR",
                                avoidSpeedProfileOptions: [],
                                ID: "DEGAC00000007133",
                                [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.xStart")]: 13.0285,
                                [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.yStart")]: 52.30963
                            }
                        },
                        {
                            type: "Feature",
                            geometry: {
                                type: "Polygon",
                                coordinates: [
                                    [13.826935, 51.802841],
                                    [13.947338, 51.685157],
                                    [14.033771, 51.652093],
                                    [14.067815, 51.736324],
                                    [14.073216, 51.788426],
                                    [13.826935, 51.802841]
                                ]
                            },
                            properties: {
                                value: 1800,
                                interval: 900,
                                maximum: 1800,
                                color: [245, 66, 66],
                                groupIndex: 0,
                                optimization: "TIME",
                                speedProfile: "CAR",
                                avoidSpeedProfileOptions: [],
                                ID: "DEGAC00000007133",
                                [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.xStart")]: 13.0285,
                                [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.yStart")]: 52.30963
                            }
                        }
                    ]
                });

            expect(JSON.stringify(result)).equal(expectedResult);
        });

        it("should throw error with empty csv", async () => {
            wrapper = shallowMount(IsochronesItemBatchProcessingComponent, {
                store,
                localVue,
                propsData: props
            });

            try {
                await wrapper.vm.parseCsv("");
                // Should not reach here
                expect(true).to.be.false;
            }
            catch (e) {
                expect(e.message).equal(
                    "common:modules.tools.routing.isochrones.batchProcessing.errorNoEntries"
                );
            }
        });

        it("should throw error with csv too large", async () => {
            props.settings.batchProcessing.limit = 1;
            wrapper = shallowMount(IsochronesItemBatchProcessingComponent, {
                store,
                localVue,
                propsData: props
            });

            try {
                await wrapper.vm.parseCsv(`DEBBAL540001ChiF;13.05518;52.39465
DEBBAL660000sAIN;13.95471;51.74632
DEGAC00000007133;13.0285;52.30963`);
                // Should not reach here
                expect(true).to.be.false;
            }
            catch (e) {
                expect(e.message).equal(
                    "common:modules.tools.routing.isochrones.batchProcessing.errorToManyEntriesInFile"
                );
            }
        });

        it("should throw error with csv row with too many columns", async () => {
            wrapper = shallowMount(IsochronesItemBatchProcessingComponent, {
                store,
                localVue,
                propsData: props
            });

            try {
                await wrapper.vm.parseCsv(`DEBBAL540001ChiF;13.05518;52.39465;1
DEBBAL660000sAIN;13.95471;51.74632;1
DEGAC00000007133;13.0285;52.30963;1`);
                // Should not reach here
                expect(true).to.be.false;
            }
            catch (e) {
                expect(e.message).equal(
                    "common:modules.tools.routing.isochrones.batchProcessing.errorToManyEntriesInRow"
                );
            }
        });

        it("should throw error with coordinate not being a number", async () => {
            wrapper = shallowMount(IsochronesItemBatchProcessingComponent, {
                store,
                localVue,
                propsData: props
            });

            try {
                await wrapper.vm.parseCsv(`DEBBAL540001ChiF;a;b
DEBBAL660000sAIN;13.95471;51.74632
DEGAC00000007133;13.0285;52.30963`);
                // Should not reach here
                expect(true).to.be.false;
            }
            catch (e) {
                expect(e.message).equal(
                    "common:modules.tools.routing.isochrones.batchProcessing.errorRowContainsEntriesNoNumber"
                );
            }
        });
    });
});
