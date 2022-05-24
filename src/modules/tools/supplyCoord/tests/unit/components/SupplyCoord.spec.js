import Vuex from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import * as crs from "@masterportal/masterportalapi/src/crs";
import SupplyCoordComponent from "../../../components/SupplyCoord.vue";
import SupplyCoord from "../../../store/indexSupplyCoord";

const localVue = createLocalVue(),
    namedProjections = [
        ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
        ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
        ["EPSG:8395", "+title=ETRS89/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
        ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
    ];

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/supplyCoord/components/SupplyCoord.vue", () => {
    const mockMapGetters = {
            map: () => sinon.stub(),
            projection: () => sinon.stub(),
            mouseCoordinate: () => sinon.stub()
        },
        mockMapMarkerActions = {
            removePointMarker: sinon.stub()
        },
        mockMapActions = {
            addPointerMoveHandler: sinon.stub(),
            removePointerMoveHandler: sinon.stub(),
            removeInteraction: sinon.stub(),
            addInteraction: sinon.stub(),
            unregisterListener: sinon.stub(),
            registerListener: sinon.stub()
        },
        mockMapMutations = {
        },
        mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            coord:
                            {
                                "name": "translate#common:menu.tools.supplyCoord",
                                "icon": "bi-bullseye"
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
                        SupplyCoord
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: mockMapGetters,
                    mutations: mockMapMutations,
                    actions: mockMapActions
                },
                MapMarker: {
                    namespaced: true,
                    actions: mockMapMarkerActions
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        crs.registerProjections(namedProjections);
    });

    it("renders SupplyCoord", () => {
        store.commit("Tools/SupplyCoord/setActive", true);
        wrapper = shallowMount(SupplyCoordComponent, {store, localVue});

        expect(wrapper.find("#supply-coord").exists()).to.be.true;
    });

    it("not renders SupplyCoord", () => {
        store.commit("Tools/SupplyCoord/setActive", false);
        wrapper = shallowMount(SupplyCoordComponent, {store, localVue});

        expect(wrapper.find("#supply-coord").exists()).to.be.false;
    });

    it("has initially selected projection \"EPSG:25832\"", async () => {
        let options = null,
            selected = null;

        store.commit("Tools/SupplyCoord/setActive", true);
        wrapper = shallowMount(SupplyCoordComponent, {store, localVue});

        await wrapper.vm.$nextTick();

        options = wrapper.findAll("option");
        expect(options.length).to.equal(namedProjections.length);

        selected = options.filter(o => o.attributes().selected === "true");
        expect(selected.length).to.equal(1);
        expect(selected.at(0).attributes().value).to.equal("http://www.opengis.net/gml/srs/epsg.xml#25832");
    });
    describe("SupplyCoord.vue methods", () => {
        it("close sets active to false", async () => {
            wrapper = shallowMount(SupplyCoordComponent, {store, localVue});

            wrapper.vm.close();
            await wrapper.vm.$nextTick();

            expect(store.state.Tools.SupplyCoord.active).to.be.false;
            expect(wrapper.find("#supply-coord").exists()).to.be.false;
        });
        it("method selectionChanged sets currentSelection", () => {
            const value = "http://www.opengis.net/gml/srs/epsg.xml#25832",
                event = {
                    target: {
                        value: value
                    }
                };

            wrapper = shallowMount(SupplyCoordComponent, {store, localVue});
            wrapper.vm.selectionChanged(event);
            expect(store.state.Tools.SupplyCoord.currentSelection).to.be.equals(value);
            expect(store.state.Tools.SupplyCoord.currentProjectionName).to.be.equals(value);
            expect(store.state.Tools.SupplyCoord.currentProjection.name).to.be.equals(value);
            expect(store.state.Tools.SupplyCoord.coordinatesEastingField).to.be.equals("0.00");
            expect(store.state.Tools.SupplyCoord.coordinatesNorthingField).to.be.equals("0.00");

        });
        it("createInteraction sets projections and adds interaction", () => {
            wrapper = shallowMount(SupplyCoordComponent, {store, localVue});
            expect(store.state.Tools.SupplyCoord.selectPointerMove).to.be.null;
            wrapper.vm.createInteraction();
            expect(typeof store.state.Tools.SupplyCoord.selectPointerMove).to.be.equals("object");
            expect(typeof store.state.Tools.SupplyCoord.selectPointerMove.handleMoveEvent).to.be.equals("function");
        });
        it("removeInteraction removes interaction", () => {
            wrapper = shallowMount(SupplyCoordComponent, {store, localVue});
            expect(typeof store.state.Tools.SupplyCoord.selectPointerMove).to.be.equals("object");
            wrapper.vm.removeInteraction();
            expect(store.state.Tools.SupplyCoord.selectPointerMove).to.be.null;
        });
        it("label returns correct path", () => {
            const key = "key";
            let ret = "";

            wrapper = shallowMount(SupplyCoordComponent, {store, localVue});
            store.commit("Tools/SupplyCoord/setActive", true);
            store.commit("Tools/SupplyCoord/setCurrentProjectionName", "EPSG:4326");
            ret = wrapper.vm.label(key);
            expect(ret).to.be.equals("modules.tools.supplyCoord.hdms.key");

            store.commit("Tools/SupplyCoord/setCurrentProjectionName", "EPSG:31467");
            ret = wrapper.vm.label(key);
            expect(ret).to.be.equals("modules.tools.supplyCoord.cartesian.key");

            store.commit("Tools/SupplyCoord/setCurrentProjectionName", null);
            ret = wrapper.vm.label(key);
            expect(ret).to.be.equals("modules.tools.supplyCoord.cartesian.key");
        });
    });

    it("sets focus to first input control", async () => {
        const elem = document.createElement("div");

        if (document.body) {
            document.body.appendChild(elem);
        }
        wrapper = shallowMount(SupplyCoordComponent, {store, localVue, attachTo: elem});

        wrapper.vm.setFocusToFirstControl();

        await wrapper.vm.$nextTick();
        expect(wrapper.find("#coordSystemField").element).to.equal(document.activeElement);
    });

    describe("SupplyCoord.vue watcher", () => {
        it("watch to active shall create/remove PointerMove interaction", async () => {
            wrapper = shallowMount(SupplyCoordComponent, {store, localVue});

            store.commit("Tools/SupplyCoord/setActive", true);
            await wrapper.vm.$nextTick();
            expect(typeof store.state.Tools.SupplyCoord.selectPointerMove).to.be.equals("object");
            expect(typeof store.state.Tools.SupplyCoord.selectPointerMove.handleMoveEvent).to.be.equals("function");

            store.commit("Tools/SupplyCoord/setActive", false);
            await wrapper.vm.$nextTick();

            expect(store.state.Tools.SupplyCoord.updatePosition).to.be.true;
            expect(store.state.Tools.SupplyCoord.selectPointerMove).to.be.null;
        });
    });
});
