import Vuex from "vuex";
import {expect} from "chai";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import RoutingDownloadComponent from "../../../components/RoutingDownload.vue";
import Routing from "../../../store/indexRouting";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/routing/components/RoutingDownload.vue", () => {
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
        wrapper,
        props;

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

        props = {
            hideGpx: false
        };
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("renders RoutingDownloadComponent", () => {
        wrapper = shallowMount(RoutingDownloadComponent, {
            store,
            localVue,
            propsData: props
        });
        expect(wrapper.find("#routing-download").exists()).to.be.true;
    });

    it("filters GPX download option", () => {
        props.hideGpx = true;
        wrapper = shallowMount(RoutingDownloadComponent, {
            store,
            localVue,
            propsData: props
        });
        expect(wrapper.vm.downloadFormatOptions.includes("GPS")).to.be.false;
    });

    it("disables input without filename", () => {
        wrapper = shallowMount(RoutingDownloadComponent, {
            store,
            localVue,
            propsData: props
        });
        wrapper.vm.download.fileName = "";
        expect(wrapper.vm.isDisabled).to.be.true;
    });

    it("enables input with filename", () => {
        wrapper = shallowMount(RoutingDownloadComponent, {
            store,
            localVue,
            propsData: props
        });
        wrapper.vm.download.fileName = "testfilename";
        expect(wrapper.vm.isDisabled).to.be.false;
    });

    it("returns features for 'DIRECTIONS'", () => {
        store.commit("Tools/Routing/setActiveRoutingToolOption", "DIRECTIONS");
        wrapper = shallowMount(RoutingDownloadComponent, {
            store,
            localVue,
            propsData: props
        });
        expect("isHighlight" in wrapper.vm.getDownloadFeatures()[0].getProperties()).to.be.true;
    });

    it("returns features for 'ISOCHRONES'", () => {
        store.commit("Tools/Routing/setActiveRoutingToolOption", "ISOCHRONES");
        wrapper = shallowMount(RoutingDownloadComponent, {
            store,
            localVue,
            propsData: props
        });
        expect(wrapper.vm.getDownloadFeatures().length).equal(0);
    });

    it("converts feature to 'GEOJSON'", async () => {
        wrapper = shallowMount(RoutingDownloadComponent, {
            store,
            localVue,
            propsData: props
        });
        wrapper.vm.download.format = "GEOJSON";
        wrapper.vm.transformCoordinatesLocalToWgs84Projection = (coordinates) => coordinates;
        const downloadString = await wrapper.vm.getDownloadStringInFormat([
            new Feature({
                geometry: new LineString([[8, 52], [9, 53]])
            })
        ]);

        expect(downloadString).equal("{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"LineString\",\"coordinates\":[[8,52],[9,53]]},\"properties\":null}]}");
    });

    it("converts feature to 'GPX'", async () => {
        wrapper = shallowMount(RoutingDownloadComponent, {
            store,
            localVue,
            propsData: props
        });
        wrapper.vm.download.format = "GPX";
        wrapper.vm.transformCoordinatesLocalToWgs84Projection = (coordinates) => coordinates;
        const downloadString = await wrapper.vm.getDownloadStringInFormat([
            new Feature({
                geometry: new LineString([[8, 52], [9, 53]])
            })
        ]);

        expect(downloadString).equal("<gpx xmlns=\"http://www.topografix.com/GPX/1/1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd\" version=\"1.1\" creator=\"OpenLayers\"><rte><rtept lat=\"52\" lon=\"8\"/><rtept lat=\"53\" lon=\"9\"/></rte></gpx>");
    });

    it("should add file type to file name", async () => {
        wrapper = shallowMount(RoutingDownloadComponent, {
            store,
            localVue,
            propsData: props
        });
        wrapper.vm.download.format = "GEOJSON";
        wrapper.vm.download.fileName = "test";

        expect(wrapper.vm.getFileName()).equal("test.geojson");
    });
});
