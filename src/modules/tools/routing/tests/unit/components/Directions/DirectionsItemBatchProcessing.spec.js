import Vuex from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import DirectionsItemBatchProcessingComponent from "../../../../components/Directions/DirectionsItemBatchProcessing.vue";
import RoutingBatchProcessingComponent from "../../../../components/RoutingBatchProcessing.vue";
import Routing from "../../../../store/indexRouting";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/routing/components/Directions/DirectionsItemBatchProcessing.vue", () => {
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
                speedProfile: "CAR",
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

    it("renders DirectionsBatchProcessingComponent", () => {
        wrapper = shallowMount(DirectionsItemBatchProcessingComponent, {
            store,
            localVue,
            propsData: props
        });
        expect(wrapper.findComponent(RoutingBatchProcessingComponent).exists())
            .to.be.true;
    });

    it("should create CSV download filename", () => {
        wrapper = shallowMount(DirectionsItemBatchProcessingComponent, {
            store,
            localVue,
            propsData: props
        });
        const filenameGeojson = "testgeo.geojson",
            filenameCsv = "testcsv.csv";

        expect(wrapper.vm.createDownloadFilename(filenameGeojson)).equal(
            "testgeo.csv"
        );
        expect(wrapper.vm.createDownloadFilename(filenameCsv)).equal(
            "testcsv.csv"
        );
    });

    it("should create csv string", () => {
        wrapper = shallowMount(DirectionsItemBatchProcessingComponent, {
            store,
            localVue,
            propsData: props
        });
        const downloadObjects = [
                {
                    ID: "DEBBAL540001ChiF",
                    [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.xStart")]: 13.05518,
                    [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.yStart")]: 52.39465,
                    [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.xEnd")]: 9.37832,
                    [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.yEnd")]: 49.40167,
                    [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.time")]: "1020.57",
                    [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.distance")]: "12.34",
                    [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.profile")]: "CAR"
                },
                {
                    ID: "DEBBAL660000sAIN",
                    [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.xStart")]: 13.95471,
                    [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.yStart")]: 51.74632,
                    [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.xEnd")]: 9.21956,
                    [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.yEnd")]: 49.07882,
                    [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.time")]: "1020.57",
                    [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.distance")]: "12.34",
                    [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.profile")]: "CAR"
                },
                {
                    ID: "DEGAC00000007133",
                    [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.xStart")]: 13.0285,
                    [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.yStart")]: 52.30963,
                    [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.xEnd")]: 8.8615,
                    [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.yEnd")]: 48.82629,
                    [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.time")]: "1020.57",
                    [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.distance")]: "12.34",
                    [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.profile")]: "CAR"
                }
            ],
            csv = wrapper.vm.createCsvToDownload(downloadObjects),
            expectedResult = `ID;${i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.xStart")};${i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.yStart")};${i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.xEnd")};${i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.yEnd")};${i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.time")};${i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.distance")};${i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.profile")}
DEBBAL540001ChiF;13.05518;52.39465;9.37832;49.40167;1020.57;12.34;CAR
DEBBAL660000sAIN;13.95471;51.74632;9.21956;49.07882;1020.57;12.34;CAR
DEGAC00000007133;13.0285;52.30963;8.8615;48.82629;1020.57;12.34;CAR`;

        expect(csv).equal(expectedResult);
    });

    describe("test csv parsing", () => {
        it("should process csv without errors", async () => {
            wrapper = shallowMount(DirectionsItemBatchProcessingComponent, {
                store,
                localVue,
                propsData: props
            });
            wrapper.vm.fetchDirections = () => ({
                distance: 12.34,
                duration: 61234
            });

            const csv = `DEBBAL540001ChiF;13.05518;52.39465;9.37832;49.40167
DEBBAL660000sAIN;13.95471;51.74632;9.21956;49.07882
DEGAC00000007133;13.0285;52.30963;8.8615;48.82629`,
                result = await wrapper.vm.parseCsv(csv),
                expectedResult = JSON.stringify([
                    {
                        ID: "DEBBAL540001ChiF",
                        [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.xStart")]: 13.05518,
                        [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.yStart")]: 52.39465,
                        [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.xEnd")]: 9.37832,
                        [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.yEnd")]: 49.40167,
                        [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.time")]: "1020.57",
                        [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.distance")]: "12.34",
                        [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.profile")]: "CAR"
                    },
                    {
                        ID: "DEBBAL660000sAIN",
                        [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.xStart")]: 13.95471,
                        [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.yStart")]: 51.74632,
                        [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.xEnd")]: 9.21956,
                        [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.yEnd")]: 49.07882,
                        [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.time")]: "1020.57",
                        [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.distance")]: "12.34",
                        [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.profile")]: "CAR"
                    },
                    {
                        ID: "DEGAC00000007133",
                        [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.xStart")]: 13.0285,
                        [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.yStart")]: 52.30963,
                        [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.xEnd")]: 8.8615,
                        [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.yEnd")]: 48.82629,
                        [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.time")]: "1020.57",
                        [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.distance")]: "12.34",
                        [i18next.t("common:modules.tools.routing.directions.batchProcessing.downloadHeader.profile")]: "CAR"
                    }
                ]);

            expect(JSON.stringify(result)).equal(expectedResult);
        });


        it("should throw error with empty csv", async () => {
            wrapper = shallowMount(DirectionsItemBatchProcessingComponent, {
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
                expect(e.message).equal("common:modules.tools.routing.directions.batchProcessing.errorNoEntries");
            }
        });

        it("should throw error with csv too large", async () => {
            props.settings.batchProcessing.limit = 1;
            wrapper = shallowMount(DirectionsItemBatchProcessingComponent, {
                store,
                localVue,
                propsData: props
            });

            try {
                await wrapper.vm.parseCsv(`DEBBAL540001ChiF;13.05518;52.39465;9.37832;49.40167
DEBBAL660000sAIN;13.95471;51.74632;9.21956;49.07882
DEGAC00000007133;13.0285;52.30963;8.8615;48.82629`);
                // Should not reach here
                expect(true).to.be.false;
            }
            catch (e) {
                expect(e.message).equal("common:modules.tools.routing.directions.batchProcessing.errorToManyEntriesInFile");
            }
        });

        it("should throw error with csv row with too many columns", async () => {
            wrapper = shallowMount(DirectionsItemBatchProcessingComponent, {
                store,
                localVue,
                propsData: props
            });

            try {
                await wrapper.vm.parseCsv(`DEBBAL540001ChiF;13.05518;52.39465;9.37832;49.40167;1
DEBBAL660000sAIN;13.95471;51.74632;9.21956;49.07882;1
DEGAC00000007133;13.0285;52.30963;8.8615;48.82629;1`);
                // Should not reach here
                expect(true).to.be.false;
            }
            catch (e) {
                expect(e.message).equal("common:modules.tools.routing.directions.batchProcessing.errorToManyEntriesInRow");
            }
        });

        it("should throw error with coordinate not being a number", async () => {
            wrapper = shallowMount(DirectionsItemBatchProcessingComponent, {
                store,
                localVue,
                propsData: props
            });

            try {
                await wrapper.vm.parseCsv(`DEBBAL540001ChiF;a;b;c;d
DEBBAL660000sAIN;13.95471;51.74632;9.21956;49.07882
DEGAC00000007133;13.0285;52.30963;8.8615;48.82629`);
                // Should not reach here
                expect(true).to.be.false;
            }
            catch (e) {
                expect(e.message).equal("common:modules.tools.routing.directions.batchProcessing.errorRowContainsEntriesNoNumber");
            }
        });
    });
});
