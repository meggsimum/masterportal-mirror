import Vuex from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import * as crs from "masterportalAPI/src/crs";
import CoordToolkitComponent from "../../../components/CoordToolkit.vue";
import CoordToolkit from "../../../store/indexCoordToolkit";

const localVue = createLocalVue(),
    namedProjections = [
        ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
        ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
        ["EPSG:8395", "+title=ETRS89/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
        ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
    ];

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/coordToolkit/components/CoordToolkit.vue", () => {
    const mockMapGetters = {
            map: () => sinon.stub(),
            projection: () => sinon.stub(),
            mouseCoord: () => sinon.stub(),
            mapMode: () => "2D"
        },
        mockMapMarkerActions = {
            removePointMarker: sinon.stub()
        },
        mockAlertingActions = {
            addSingleAlert: sinon.stub()
        },
        mockMapActions = {
            addPointerMoveHandler: sinon.stub(),
            removePointerMoveHandler: sinon.stub(),
            removeInteraction: sinon.stub(),
            addInteraction: sinon.stub()
        },
        mockMapMutations = {
        },
        mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            coordToolkit:
                            {
                                "name": "translate#common:menu.tools.coordToolkit",
                                "glyphicon": "glyphicon-globe",
                                "showCopyButtons": true
                            }
                        }
                    }
                }
            }
        },
        eventProj4326 = {
            target: {
                value: "http://www.opengis.net/gml/srs/epsg.xml#4326"
            }
        },
        eventProj25832 = {
            target: {
                value: "http://www.opengis.net/gml/srs/epsg.xml#25832"
            }
        },
        copyCoordinatesSpy = sinon.spy();
    let store,
        wrapper,
        text = "";

    beforeEach(() => {
        CoordToolkit.actions.validateInput = sinon.spy(CoordToolkit.actions.validateInput);
        CoordToolkit.actions.initHeightLayer = sinon.spy(CoordToolkit.actions.initHeightLayer);
        CoordToolkit.actions.copyCoordinates = sinon.spy(CoordToolkit.actions.copyCoordinates);

        store = new Vuex.Store({
            namespaced: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        CoordToolkit
                    }
                },
                Map: {
                    namespaced: true,
                    getters: mockMapGetters,
                    mutations: mockMapMutations,
                    actions: mockMapActions
                },
                MapMarker: {
                    namespaced: true,
                    actions: mockMapMarkerActions
                },
                Alerting: {
                    namespaced: true,
                    actions: mockAlertingActions
                }
            },
            actions: {
                copyCoordinates: copyCoordinatesSpy
            },
            getters: {
                uiStyle: () => "",
                mobile: () => false
            },
            state: {
                configJson: mockConfigJson
            }
        });
        crs.registerProjections(namedProjections);

        navigator.clipboard = {
            writeText: (aText) => {
                text = aText;
            }
        };
        sinon.stub(navigator.clipboard, "writeText").resolves(text);
    });

    it("renders CoordToolkit without height field", () => {
        store.commit("Tools/CoordToolkit/setActive", true);
        wrapper = shallowMount(CoordToolkitComponent, {store, localVue});

        expect(wrapper.find("#coord-toolkit").exists()).to.be.true;
        expect(wrapper.find("#coordinatesHeightField").exists()).to.be.false;
        expect(CoordToolkit.actions.initHeightLayer.calledOnce).to.be.false;
    });

    it("not renders CoordToolkit", () => {
        store.commit("Tools/CoordToolkit/setActive", false);
        wrapper = shallowMount(CoordToolkitComponent, {store, localVue});

        expect(wrapper.find("#coord-toolkit").exists()).to.be.false;
    });
    it("renders CoordToolkit with height field", () => {
        const layer = {id: "123", get: () => sinon.spy};

        store.commit("Tools/CoordToolkit/setActive", true);
        store.state.configJson.Portalconfig.menu.tools.children.coordToolkit.heightLayerId = "123";
        store.state.Tools.CoordToolkit.heightLayer = layer;
        wrapper = shallowMount(CoordToolkitComponent, {store, localVue});

        expect(wrapper.find("#coord-toolkit").exists()).to.be.true;
        expect(wrapper.find("#coordinatesHeightField").exists()).to.be.true;
    });
    it("renders CoordToolkit without copy-coords buttons", () => {
        store.commit("Tools/CoordToolkit/setShowCopyButtons", false);
        store.commit("Tools/CoordToolkit/setActive", true);
        wrapper = shallowMount(CoordToolkitComponent, {store, localVue});

        expect(wrapper.find("#coord-toolkit").exists()).to.be.true;
        expect(wrapper.find("#copyCoordsPairBtn").exists()).to.be.false;
    });
    it("renders CoordToolkit with copy-coords buttons", () => {
        store.commit("Tools/CoordToolkit/setShowCopyButtons", true);
        store.commit("Tools/CoordToolkit/setActive", true);
        wrapper = shallowMount(CoordToolkitComponent, {store, localVue});

        expect(wrapper.find("#coord-toolkit").exists()).to.be.true;
        expect(wrapper.find("#copyCoordsPairBtn").exists()).to.be.true;
    });
    it("CoordToolkit mounting with heightLayerId shall call initHeightLayer", async () => {
        store.state.configJson.Portalconfig.menu.tools.children.coordToolkit.heightLayerId = "123";
        store.state.Tools.CoordToolkit.heightLayerId = "123";
        wrapper = shallowMount(CoordToolkitComponent, {store, localVue});
        await wrapper.vm.$nextTick();

        expect(CoordToolkit.actions.initHeightLayer.calledOnce).to.be.true;
    });

    it("has initially selected projection \"EPSG:25832\"", async () => {
        let options = null,
            selected = null;

        store.commit("Tools/CoordToolkit/setActive", true);
        wrapper = shallowMount(CoordToolkitComponent, {store, localVue});

        await wrapper.vm.$nextTick();

        options = wrapper.findAll("option");
        expect(options.length).to.equal(namedProjections.length + 1);

        selected = options.filter(o => o.attributes().selected === "true");
        expect(selected.length).to.equal(1);
        expect(selected.at(0).attributes().value).to.equal("http://www.opengis.net/gml/srs/epsg.xml#25832");
    });
    describe("CoordToolkit.vue methods", () => {
        it("close sets active to false", async () => {
            wrapper = shallowMount(CoordToolkitComponent, {store, localVue});
            expect(store.state.Tools.CoordToolkit.active).to.be.true;
            wrapper.vm.close();
            await wrapper.vm.$nextTick();

            expect(store.state.Tools.CoordToolkit.active).to.be.false;
            expect(wrapper.find("#supply-coord").exists()).to.be.false;
        });
        it("method selectionChanged sets currentProjection", () => {
            const value = "http://www.opengis.net/gml/srs/epsg.xml#31467",
                event = {
                    target: {
                        value: value
                    }
                };

            wrapper = shallowMount(CoordToolkitComponent, {store, localVue});
            wrapper.vm.selectionChanged(event);
            expect(store.state.Tools.CoordToolkit.currentProjection.name).to.be.equals(value);
            expect(store.state.Tools.CoordToolkit.currentProjection.projName).to.be.equals("tmerc");
            expect(store.state.Tools.CoordToolkit.coordinatesEasting.value).to.be.equals("0.00");
            expect(store.state.Tools.CoordToolkit.coordinatesNorthing.value).to.be.equals("0.00");
        });
        it("createInteraction sets projections and adds interaction", () => {
            wrapper = shallowMount(CoordToolkitComponent, {store, localVue});
            expect(store.state.Tools.CoordToolkit.selectPointerMove).to.be.null;
            wrapper.vm.createInteraction();
            expect(typeof store.state.Tools.CoordToolkit.selectPointerMove).to.be.equals("object");
            expect(typeof store.state.Tools.CoordToolkit.selectPointerMove.handleMoveEvent).to.be.equals("function");
        });
        it("setSupplyCoordInactive removes interaction", () => {
            wrapper = shallowMount(CoordToolkitComponent, {store, localVue});
            expect(typeof store.state.Tools.CoordToolkit.selectPointerMove).to.be.equals("object");
            wrapper.vm.setSupplyCoordInactive();
            expect(store.state.Tools.CoordToolkit.selectPointerMove).to.be.null;
        });
        it("setSupplyCoordActive adds interaction", () => {
            wrapper = shallowMount(CoordToolkitComponent, {store, localVue});
            expect(store.state.Tools.CoordToolkit.selectPointerMove).to.be.null;
            wrapper.vm.setSupplyCoordActive();
            expect(typeof store.state.Tools.CoordToolkit.selectPointerMove).to.be.equals("object");
        });
        it("initProjections adds WGS84 decimal projection", () => {
            let projections = [];

            wrapper = shallowMount(CoordToolkitComponent, {store, localVue});
            wrapper.vm.initProjections();

            projections = store.state.Tools.CoordToolkit.projections;
            expect(projections.length).to.be.equals(5);
            expect(projections[0].id).to.be.not.null;
            expect(projections.filter(proj => proj.id === "EPSG:4326-DG").length).to.be.equals(1);
        });
        it("label returns correct path", () => {
            const key = "key";
            let value = "http://www.opengis.net/gml/srs/epsg.xml#4326",
                event = {
                    target: {
                        value: value
                    }
                },
                ret = "";

            store.commit("Tools/CoordToolkit/setActive", true);
            wrapper = shallowMount(CoordToolkitComponent, {store, localVue});
            wrapper.vm.selectionChanged(event);

            ret = wrapper.vm.getLabel(key);
            expect(ret).to.be.equals("modules.tools.coordToolkit.hdms.key");

            value = "http://www.opengis.net/gml/srs/epsg.xml#31467";
            event = {
                target: {
                    value: value
                }
            };
            wrapper.vm.selectionChanged(event);
            ret = wrapper.vm.getLabel(key);
            expect(ret).to.be.equals("modules.tools.coordToolkit.cartesian.key");

            value = null;
            event = {
                target: {
                    value: value
                }
            };
            wrapper.vm.selectionChanged(event);
            ret = wrapper.vm.getLabel(key);
            expect(ret).to.be.equals("modules.tools.coordToolkit.cartesian.key");
        });
        it("changeMode changes the mode 'supply' or 'search'", async () => {
            wrapper = shallowMount(CoordToolkitComponent, {store, localVue});
            expect(store.state.Tools.CoordToolkit.mode).to.be.equals("supply");
            expect(wrapper.vm.isEnabled("supply")).to.be.true;
            wrapper.vm.changeMode("search");
            await wrapper.vm.$nextTick();
            expect(store.state.Tools.CoordToolkit.mode).to.be.equals("search");
            expect(wrapper.vm.isEnabled("search")).to.be.true;
        });
        it("onInputEvent should call validateInput if mode is 'search'", async () => {
            wrapper = shallowMount(CoordToolkitComponent, {store, localVue});
            wrapper.vm.changeMode("supply");
            expect(store.state.Tools.CoordToolkit.mode).to.be.equals("supply");
            wrapper.vm.onInputEvent("input");
            expect(CoordToolkit.actions.validateInput.calledOnce).to.be.false;

            wrapper.vm.changeMode("search");
            await wrapper.vm.$nextTick();
            expect(store.state.Tools.CoordToolkit.mode).to.be.equals("search");
            wrapper.vm.onInputEvent("input");
            expect(CoordToolkit.actions.validateInput.calledOnce).to.be.true;
        });
        it("copyCoords copies easting field", async () => {
            let input = null;

            store.commit("Tools/CoordToolkit/setActive", true);
            wrapper = shallowMount(CoordToolkitComponent, {store, localVue});

            wrapper.vm.changeMode("search");
            await wrapper.vm.$nextTick();
            expect(store.state.Tools.CoordToolkit.mode).to.be.equals("search");
            expect(wrapper.find("#coordinatesNorthingField").exists()).to.be.true;

            input = await wrapper.find("#coordinatesNorthingField");
            input.setValue("123456");
            await wrapper.vm.$nextTick();

            wrapper.vm.copyCoords(["coordinatesNorthingField"]);
            await wrapper.vm.$nextTick();
            expect(CoordToolkit.actions.copyCoordinates.calledOnce).to.be.true;
            expect(CoordToolkit.actions.copyCoordinates.firstCall.args[1]).to.be.an("Array");
            expect(CoordToolkit.actions.copyCoordinates.firstCall.args[1]).to.be.deep.equals(["123456"]);
        });
        it("copyCoords copies northing field", async () => {
            let input = null;

            store.commit("Tools/CoordToolkit/setActive", true);
            wrapper = shallowMount(CoordToolkitComponent, {store, localVue});

            wrapper.vm.changeMode("supply");
            await wrapper.vm.$nextTick();
            expect(store.state.Tools.CoordToolkit.mode).to.be.equals("supply");
            expect(wrapper.find("#coordinatesNorthingField").exists()).to.be.true;

            input = await wrapper.find("#coordinatesNorthingField");
            input.setValue("123456");
            await wrapper.vm.$nextTick();

            wrapper.vm.copyCoords(["coordinatesNorthingField"]);
            await wrapper.vm.$nextTick();
            expect(CoordToolkit.actions.copyCoordinates.calledOnce).to.be.true;
            expect(CoordToolkit.actions.copyCoordinates.firstCall.args[1]).to.be.an("Array");
            expect(CoordToolkit.actions.copyCoordinates.firstCall.args[1]).to.be.deep.equals(["123456"]);
        });
        it("copyCoords copies northing and easting field, projection not longlat", async () => {
            let inputEasting = null,
                inputNorthing = null;
            const valueEasting = "123456",
                valueNorthing = "789123";

            store.commit("Tools/CoordToolkit/setActive", true);
            wrapper = shallowMount(CoordToolkitComponent, {store, localVue});

            wrapper.vm.changeMode("supply");
            await wrapper.vm.$nextTick();
            expect(store.state.Tools.CoordToolkit.mode).to.be.equals("supply");
            expect(wrapper.find("#coordinatesNorthingField").exists()).to.be.true;
            expect(wrapper.find("#coordinatesEastingField").exists()).to.be.true;

            inputNorthing = await wrapper.find("#coordinatesNorthingField");
            inputEasting = await wrapper.find("#coordinatesEastingField");
            inputNorthing.setValue(valueNorthing);
            inputEasting.setValue(valueEasting);
            await wrapper.vm.$nextTick();

            wrapper.vm.copyCoords(["coordinatesEastingField", "coordinatesNorthingField"]);
            await wrapper.vm.$nextTick();
            expect(CoordToolkit.actions.copyCoordinates.calledOnce).to.be.true;
            expect(CoordToolkit.actions.copyCoordinates.firstCall.args[1]).to.be.an("Array");
            expect(CoordToolkit.actions.copyCoordinates.firstCall.args[1]).to.be.deep.equals([valueEasting, valueNorthing]);
        });
        it("copyCoords copies northing and easting field, projection is longlat, coordinates shall be reverted", async () => {
            let inputEasting = null,
                inputNorthing = null;
            const valueEasting = "123456",
                valueNorthing = "789123";

            store.commit("Tools/CoordToolkit/setActive", true);
            wrapper = shallowMount(CoordToolkitComponent, {store, localVue});

            wrapper.vm.changeMode("supply");
            wrapper.vm.selectionChanged(eventProj4326);
            await wrapper.vm.$nextTick();
            expect(store.state.Tools.CoordToolkit.mode).to.be.equals("supply");
            expect(wrapper.find("#coordinatesNorthingField").exists()).to.be.true;
            expect(wrapper.find("#coordinatesEastingField").exists()).to.be.true;

            inputNorthing = await wrapper.find("#coordinatesNorthingField");
            inputEasting = await wrapper.find("#coordinatesEastingField");
            inputNorthing.setValue(valueNorthing);
            inputEasting.setValue(valueEasting);
            await wrapper.vm.$nextTick();

            wrapper.vm.copyCoords(["coordinatesEastingField", "coordinatesNorthingField"]);
            await wrapper.vm.$nextTick();
            expect(CoordToolkit.actions.copyCoordinates.calledOnce).to.be.true;
            expect(CoordToolkit.actions.copyCoordinates.firstCall.args[1]).to.be.an("Array");
            expect(CoordToolkit.actions.copyCoordinates.firstCall.args[1]).to.be.deep.equals([valueNorthing, valueEasting]);
        });
        it("getClassForEasting no longlat-projection", async () => {
            store.commit("Tools/CoordToolkit/setActive", true);
            wrapper = shallowMount(CoordToolkitComponent, {store, localVue});
            wrapper.vm.selectionChanged(eventProj25832);
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.getClassForEasting()).to.be.equals(" form-group form-group-sm");
        });
        it("getClassForEasting no error", async () => {
            store.commit("Tools/CoordToolkit/setActive", true);
            wrapper = shallowMount(CoordToolkitComponent, {store, localVue});
            wrapper.vm.selectionChanged(eventProj4326);
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.getClassForEasting()).to.be.equals("eastingToBottomNoError form-group form-group-sm");
        });
        it("getClassForEasting eastingError", async () => {
            store.commit("Tools/CoordToolkit/setActive", true);
            wrapper = shallowMount(CoordToolkitComponent, {store, localVue});
            wrapper.vm.selectionChanged(eventProj4326);
            await wrapper.vm.$nextTick();
            store.commit("Tools/CoordToolkit/setEastingNoCoord", true);
            expect(wrapper.vm.getClassForEasting()).to.be.equals("eastingToBottomNoError form-group form-group-sm");
        });
        it("getClassForEasting northingError", async () => {
            store.commit("Tools/CoordToolkit/setActive", true);
            wrapper = shallowMount(CoordToolkitComponent, {store, localVue});
            wrapper.vm.selectionChanged(eventProj4326);
            await wrapper.vm.$nextTick();
            store.commit("Tools/CoordToolkit/setEastingNoCoord", false);
            store.commit("Tools/CoordToolkit/setNorthingNoCoord", true);
            expect(wrapper.vm.getClassForEasting()).to.be.equals("eastingToBottomOneError form-group form-group-sm");
        });
        it("getClassForEasting northingError and eastingError", async () => {
            store.commit("Tools/CoordToolkit/setActive", true);
            wrapper = shallowMount(CoordToolkitComponent, {store, localVue});
            wrapper.vm.selectionChanged(eventProj4326);
            await wrapper.vm.$nextTick();
            store.commit("Tools/CoordToolkit/setNorthingNoCoord", true);
            store.commit("Tools/CoordToolkit/setEastingNoCoord", true);
            expect(wrapper.vm.getClassForEasting()).to.be.equals("eastingToBottomTwoErrors form-group form-group-sm");
        });
        it("getClassForNorthing no longlat-projection", async () => {
            store.commit("Tools/CoordToolkit/setActive", true);
            wrapper = shallowMount(CoordToolkitComponent, {store, localVue});
            wrapper.vm.selectionChanged(eventProj25832);
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.getClassForNorthing()).to.be.equals(" form-group form-group-sm");
        });
        it("getClassForNorthing no error", async () => {
            store.commit("Tools/CoordToolkit/setActive", true);
            wrapper = shallowMount(CoordToolkitComponent, {store, localVue});
            wrapper.vm.selectionChanged(eventProj4326);
            await wrapper.vm.$nextTick();
            store.commit("Tools/CoordToolkit/setNorthingNoCoord", false);
            store.commit("Tools/CoordToolkit/setEastingNoCoord", false);
            expect(wrapper.vm.getClassForNorthing()).to.be.equals("northingToTopNoError form-group form-group-sm");
        });
        it("getClassForNorthing eastingError", async () => {
            store.commit("Tools/CoordToolkit/setActive", true);
            wrapper = shallowMount(CoordToolkitComponent, {store, localVue});
            wrapper.vm.selectionChanged(eventProj4326);
            await wrapper.vm.$nextTick();
            store.commit("Tools/CoordToolkit/setEastingNoCoord", true);
            expect(wrapper.vm.getClassForNorthing()).to.be.equals("northingToTopEastingError form-group form-group-sm");
        });
        it("getClassForNorthing northingError", async () => {
            store.commit("Tools/CoordToolkit/setActive", true);
            wrapper = shallowMount(CoordToolkitComponent, {store, localVue});
            wrapper.vm.selectionChanged(eventProj4326);
            await wrapper.vm.$nextTick();
            store.commit("Tools/CoordToolkit/setEastingNoCoord", false);
            store.commit("Tools/CoordToolkit/setNorthingNoCoord", true);
            expect(wrapper.vm.getClassForNorthing()).to.be.equals("northingToTopNoError form-group form-group-sm");
        });
        it("getClassForNorthing northingError and eastingError", async () => {
            store.commit("Tools/CoordToolkit/setActive", true);
            wrapper = shallowMount(CoordToolkitComponent, {store, localVue});
            wrapper.vm.selectionChanged(eventProj4326);
            await wrapper.vm.$nextTick();
            store.commit("Tools/CoordToolkit/setNorthingNoCoord", true);
            store.commit("Tools/CoordToolkit/setEastingNoMatch", true);
            expect(wrapper.vm.getClassForNorthing()).to.be.equals("northingToTopTwoErrors form-group form-group-sm");
            store.commit("Tools/CoordToolkit/setEastingNoCoord", true);
            expect(wrapper.vm.getClassForNorthing()).to.be.equals("northingToTopTwoErrorsEastNoValue form-group form-group-sm");
        });
    });
    describe("CoordToolkit.vue watcher", () => {
        it("watch to active shall set mode to 'supply'", async () => {
            store.commit("Tools/CoordToolkit/setActive", false);
            wrapper = shallowMount(CoordToolkitComponent, {store, localVue});

            store.commit("Tools/CoordToolkit/setActive", true);
            await wrapper.vm.$nextTick();
            expect(store.state.Tools.CoordToolkit.mode).to.be.equals("supply");
            expect(typeof store.state.Tools.CoordToolkit.selectPointerMove).to.be.equals("object");
            expect(typeof store.state.Tools.CoordToolkit.selectPointerMove.handleMoveEvent).to.be.equals("function");

            store.commit("Tools/CoordToolkit/setActive", false);
            await wrapper.vm.$nextTick();

            expect(store.state.Tools.CoordToolkit.eastingNoCoord).to.be.false;
            expect(store.state.Tools.CoordToolkit.eastingNoMatch).to.be.false;
            expect(store.state.Tools.CoordToolkit.northingNoCoord).to.be.false;
            expect(store.state.Tools.CoordToolkit.northingNoMatch).to.be.false;
            expect(store.state.Tools.CoordToolkit.coordinatesEasting.value).to.be.equals("");
            expect(store.state.Tools.CoordToolkit.coordinatesNorthing.value).to.be.equals("");
        });
    });
});
