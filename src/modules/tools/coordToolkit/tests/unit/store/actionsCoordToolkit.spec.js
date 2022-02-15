import testAction from "../../../../../../../test/unittests/VueTestUtils";
import actions from "../../../store/actionsCoordToolkit";
import sinon from "sinon";
import {expect} from "chai";
import * as proj4 from "proj4";

describe("src/modules/tools/coord/store/actionsCoordToolkit.js", () => {
    afterEach(sinon.restore);

    describe("supplyCoord actions", () => {
        it("positionClicked without height", done => {
            const payload = {
                    coordinate: [1000, 2000]
                },
                state = {
                    updatePosition: true,
                    positionMapProjection: [300, 300]
                };

            testAction(actions.positionClicked, payload, state, {}, [
                {type: "setPositionMapProjection", payload: payload.coordinate},
                {type: "changedPosition", payload: undefined, dispatch: true},
                {type: "setUpdatePosition", payload: false},
                {type: "MapMarker/placingPointMarker", payload: payload.coordinate, dispatch: true}
            ], {}, done);
        });
        it("positionClicked with height and update position is true", done => {
            const payload = {
                    coordinate: [1000, 2000]
                },
                state = {
                    updatePosition: true,
                    heightLayer: {
                        id: "19173",
                        name: "Digitales Höhenmodell Hamburg (DGM1)"
                    },
                    positionMapProjection: [300, 300]
                };

            testAction(actions.positionClicked, payload, state, {}, [
                {type: "setPositionMapProjection", payload: payload.coordinate},
                {type: "changedPosition", payload: undefined, dispatch: true},
                {type: "setUpdatePosition", payload: false},
                {type: "MapMarker/placingPointMarker", payload: payload.coordinate, dispatch: true},
                {type: "getHeight", payload: payload.coordinate, dispatch: true}
            ], {}, done);
        });
        it("positionClicked with height and update position is false", done => {
            const payload = {
                    coordinate: [1000, 2000]
                },
                state = {
                    updatePosition: false,
                    heightLayer: {
                        id: "19173",
                        name: "Digitales Höhenmodell Hamburg (DGM1)"
                    },
                    positionMapProjection: [300, 300]
                };

            testAction(actions.positionClicked, payload, state, {}, [
                {type: "setPositionMapProjection", payload: payload.coordinate},
                {type: "changedPosition", payload: undefined, dispatch: true},
                {type: "setUpdatePosition", payload: true},
                {type: "MapMarker/placingPointMarker", payload: payload.coordinate, dispatch: true},
                {type: "setHeight", payload: ""}
            ], {}, done);
        });
        it("retrieveHeightFromGfiResponse - real height", done => {
            const heightElementName = "value_0",
                heightFromLayer = "1.100",
                payload = [
                    {
                        get: (attr) => {
                            if (attr === heightElementName) {
                                return heightFromLayer;
                            }
                            return null;
                        }
                    }
                ],
                expectedHeight = Number.parseFloat(heightFromLayer).toFixed(1),
                state = {
                    heightElementName: heightElementName
                };

            testAction(actions.retrieveHeightFromGfiResponse, payload, state, {}, [
                {type: "setHeight", payload: expectedHeight}
            ], {}, done);
        });
        it("retrieveHeightFromGfiResponse - height on water area", done => {
            const heightElementName = "value_0",
                heightValueWater = "-20",
                payload = [
                    {
                        get: (attr) => {
                            if (attr === heightElementName) {
                                return heightValueWater;
                            }
                            return null;
                        }
                    }
                ],
                expectedHeight = "common:modules.tools.coordToolkit.noHeightWater",
                state = {
                    heightElementName: heightElementName,
                    heightValueWater: heightValueWater
                };

            testAction(actions.retrieveHeightFromGfiResponse, payload, state, {}, [
                {type: "setHeight", payload: expectedHeight}
            ], {}, done);
        });
        it("retrieveHeightFromGfiResponse - height on building area", done => {
            const heightElementName = "value_0",
                heightValueBuilding = "200",
                payload = [
                    {
                        get: (attr) => {
                            if (attr === heightElementName) {
                                return heightValueBuilding;
                            }
                            return null;
                        }
                    }
                ],
                expectedHeight = "common:modules.tools.coordToolkit.noHeightBuilding",
                state = {
                    heightElementName: heightElementName,
                    heightValueBuilding: heightValueBuilding
                };

            testAction(actions.retrieveHeightFromGfiResponse, payload, state, {}, [
                {type: "setHeight", payload: expectedHeight}
            ], {}, done);
        });
        it("retrieveHeightFromGfiResponse - height on water area, heightValueWater not translated", done => {
            const heightElementName = "value_0",
                heightValueWater = "-20",
                payload = [
                    {
                        get: (attr) => {
                            if (attr === heightElementName) {
                                return heightValueWater;
                            }
                            return null;
                        }
                    }
                ],
                expectedHeight = Number.parseFloat(heightValueWater).toFixed(1),
                state = {
                    heightElementName: heightElementName
                };

            testAction(actions.retrieveHeightFromGfiResponse, payload, state, {}, [
                {type: "setHeight", payload: expectedHeight}
            ], {}, done);
        });
        it("retrieveHeightFromGfiResponse - height on building area, heightValueBuilding not translated", done => {
            const heightElementName = "value_0",
                heightValueBuilding = "200",
                payload = [
                    {
                        get: (attr) => {
                            if (attr === heightElementName) {
                                return heightValueBuilding;
                            }
                            return null;
                        }
                    }
                ],
                expectedHeight = Number.parseFloat(heightValueBuilding).toFixed(1),
                state = {
                    heightElementName: heightElementName
                };

            testAction(actions.retrieveHeightFromGfiResponse, payload, state, {}, [
                {type: "setHeight", payload: expectedHeight}
            ], {}, done);
        });
        it("retrieveHeightFromGfiResponse - height on water area, heightValueWater not translated and is no number", done => {
            const heightElementName = "value_0",
                heightValueWater = "water",
                payload = [
                    {
                        get: (attr) => {
                            if (attr === heightElementName) {
                                return heightValueWater;
                            }
                            return null;
                        }
                    }
                ],
                expectedHeight = heightValueWater,
                state = {
                    heightElementName: heightElementName
                };

            testAction(actions.retrieveHeightFromGfiResponse, payload, state, {}, [
                {type: "setHeight", payload: expectedHeight}
            ], {}, done);
        });
        it("retrieveHeightFromGfiResponse - height on building area, heightValueBuilding not translated and is no number", done => {
            const heightElementName = "value_0",
                heightValueBuilding = "building",
                payload = [
                    {
                        get: (attr) => {
                            if (attr === heightElementName) {
                                return heightValueBuilding;
                            }
                            return null;
                        }
                    }
                ],
                expectedHeight = heightValueBuilding,
                state = {
                    heightElementName: heightElementName
                };

            testAction(actions.retrieveHeightFromGfiResponse, payload, state, {}, [
                {type: "setHeight", payload: expectedHeight}
            ], {}, done);
        });
        it("newProjectionSelected", done => {
            const
                pos = [123, 456],
                proj1 = {id: "projection 1", name: "projection 1", projName: "longlat"},
                proj2 = {id: "projection 2", name: "projection 2", projName: "longlat"},
                state = {
                    projections: [
                        proj1,
                        proj2
                    ],
                    coordinatesEasting: pos[0],
                    coordinatesNorthing: pos[1]
                };

            testAction(actions.newProjectionSelected, proj2.id, state, {}, [
                {type: "formatInput", payload: pos, dispatch: true},
                {type: "transformCoordinatesFromTo", payload: proj2, dispatch: true},
                {type: "setCurrentProjection", payload: proj2},
                {type: "changedPosition", payload: undefined, dispatch: true},
                {type: "setExample"}
            ], {getProjectionById: () => {
                return proj2;
            }}, done);
        });
        describe("changedPosition", () => {
            const rootState = {
                    Map: {
                        map: {}
                    }
                },
                proj1 = {id: "projection 1", name: "projection 1", projName: "longlat"},
                proj2 = {id: "projection 2", name: "projection 2", projName: "longlat"},
                state = {
                    mode: "supply",
                    projections: [proj1, proj2],
                    currentProjection: proj2,
                    positionMapProjection: [300, 400]
                };

            it("changedPosition will call adjustPosition in mode 'supply'", done => {
                const payload = {
                        position: [100, 200],
                        targetProjection: proj2
                    },
                    rootGetters = {
                        "Map/ol2DMap": {
                            removeLayer: sinon.spy(),
                            addLayer: sinon.spy()
                        }
                    };

                testAction(actions.changedPosition, null, state, rootState, [
                    {type: "adjustPosition", payload: payload, dispatch: true}
                ], {getTransformedPosition: () => {
                    return [100, 200];
                }}, done, rootGetters);
            });
            it("changedPosition will not call adjustPosition in mode 'serach'", done => {
                state.mode = "search";

                testAction(actions.changedPosition, null, state, rootState, [
                ], {getTransformedPosition: () => {
                    return [100, 200];
                }}, done);
            });
            it("changedPosition will not call adjustPosition if position is null", done => {
                testAction(actions.changedPosition, null, state, rootState, [],
                    {getTransformedPosition: () => {
                        return null;
                    }}, done);
            });
        });
        describe("setFirstSearchPosition", () => {
            const center = [1000, 2000],
                rootState = {
                    Map: {

                        center: center

                    }
                },
                proj1 = {id: "projection 1", name: "projection 1", projName: "longlat"},
                proj2 = {id: "projection 2", name: "projection 2", projName: "longlat"},
                state = {
                    active: true,
                    mode: "search",
                    projections: [proj1, proj2],
                    currentProjection: proj2,
                    positionMapProjection: [300, 400]
                };

            it("setFirstSearchPosition will call setCoordinatesEasting and others if position is not set", done => {
                const payloadEasting = {id: "easting", value: String(center[0])},
                    payloadNorthing = {id: "northing", value: String(center[1])},
                    rootGetters = {
                        "Map/ol2DMap": {
                            removeLayer: sinon.spy(),
                            addLayer: sinon.spy()
                        }
                    };

                testAction(actions.setFirstSearchPosition, null, state, rootState, [
                    {type: "setCoordinatesEasting", payload: payloadEasting},
                    {type: "setCoordinatesNorthing", payload: payloadNorthing},
                    {type: "moveToCoordinates", payload: center, dispatch: true}
                ], {getTransformedPosition: () => {
                    return [0, 0];
                }}, done, rootGetters);
            });
            it("setFirstSearchPosition will do nothing if position is set", done => {
                const rootGetters = {
                    "Map/ol2DMap": {
                        removeLayer: sinon.spy(),
                        addLayer: sinon.spy()
                    }
                };

                state.mode = "search";

                testAction(actions.setFirstSearchPosition, null, state, rootState, [
                ], {getTransformedPosition: () => {
                    return [100, 200];
                }}, done, rootGetters);
            });
            it("setFirstSearchPosition will do nothing if mode is not 'search'", done => {
                state.mode = "supply";

                testAction(actions.setFirstSearchPosition, null, state, rootState, [],
                    {getTransformedPosition: () => {
                        return [0, 0];
                    }}, done);
            });
            it("setFirstSearchPosition will do nothing if not active", done => {
                state.mode = "search";
                state.active = false;

                testAction(actions.setFirstSearchPosition, null, state, rootState, [],
                    {getTransformedPosition: () => {
                        return [0, 0];
                    }}, done);
            });
        });
        describe("adjustPosition", () => {
            const rootState = {
                    Map: {
                        map: {}
                    }
                },
                proj1 = {id: "projection 1", name: "projection 1", projName: "utm"},
                proj2 = {id: "projection 2", name: "projection 2", projName: "longlat"},
                proj3 = {id: "EPSG:4326-DG", name: "EPSG:4326", projName: "longlat"};

            it("adjustPosition sets coordinate fields - longlat", done => {
                const payload = {
                    position: [100, 200],
                    targetProjection: proj2
                };

                testAction(actions.adjustPosition, payload, {}, rootState, [
                    {type: "setCoordinatesEasting", payload: {id: "easting", value: "160° 00′ 00″"}},
                    {type: "setCoordinatesNorthing", payload: {id: "northing", value: "100° 00′ 00″"}}
                ], {}, done);
            });
            it("adjustPosition sets coordinate fields - longlat - decimal degree", done => {
                const payload = {
                    position: [100, 200],
                    targetProjection: proj3
                };

                testAction(actions.adjustPosition, payload, {}, rootState, [
                    {type: "setCoordinatesEasting", payload: {id: "easting", value: "160.0000°"}},
                    {type: "setCoordinatesNorthing", payload: {id: "northing", value: "100.0000°"}}
                ], {}, done);
            });
            it("adjustPosition sets coordinate fields - utm", done => {
                const payload = {
                    position: [100, 200],
                    targetProjection: proj1
                };

                testAction(actions.adjustPosition, payload, {}, rootState, [
                    {type: "setCoordinatesEasting", payload: {id: "easting", value: "100.00"}},
                    {type: "setCoordinatesNorthing", payload: {id: "northing", value: "200.00"}}
                ], {}, done);
            });
            it("adjustPosition sets coordinate fields - no projection and position does nothing", done => {
                const payload = {
                    position: [],
                    targetProjection: null
                };

                testAction(actions.adjustPosition, payload, {}, rootState, [], {}, done);
            });
            it("adjustPosition sets coordinate fields - no position does not fail", done => {
                const payload = {
                    position: null,
                    targetProjection: proj1
                };

                testAction(actions.adjustPosition, payload, {}, rootState, [], {}, done);
            });
            it("adjustPosition sets coordinate fields - empty position does not fail", done => {
                const payload = {
                    position: [],
                    targetProjection: proj1
                };

                testAction(actions.adjustPosition, payload, {}, rootState, [], {}, done);
            });
        });
        describe("setCoordinates", () => {
            it("setCoordinates updates position", done => {
                const state = {
                        updatePosition: true
                    },
                    position = [100, 200],
                    payload = {
                        coordinate: position
                    };

                testAction(actions.setCoordinates, payload, state, {}, [
                    {type: "setPositionMapProjection", payload: position},
                    {type: "changedPosition", payload: undefined, dispatch: true}
                ], {}, done);
            });
            it("setCoordinates not updates position", done => {
                const state = {
                        updatePosition: false
                    },
                    position = [100, 200],
                    payload = {
                        coordinate: position
                    };

                testAction(actions.setCoordinates, payload, state, {}, [], {}, done);
            });
        });
        describe("checkPosition", () => {
            it("checkPosition sets positionMapProjection", done => {
                const state = {
                        updatePosition: true
                    },
                    position = [100, 200];

                testAction(actions.checkPosition, position, state, {}, [
                    {type: "setPositionMapProjection", payload: position}
                ], {}, done);
            });
            it("checkPosition not sets positionMapProjection", done => {
                const state = {
                        updatePosition: false
                    },
                    position = [100, 200];

                testAction(actions.checkPosition, position, state, {}, [], {}, done);
            });
        });
    });
    describe("searchByCoord actions", () => {
        let commit, dispatch, getters;

        beforeEach(() => {
            commit = sinon.spy();
            dispatch = sinon.spy();
            getters = sinon.spy();
        });

        afterEach(sinon.restore);

        describe("validateInput", () => {
            it("Validates the coordinates according to the ETRS89 coordinate system", () => {
                const state = {
                    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#25832"},
                    coordinatesEasting: {id: "easting", name: "", value: "564459.13", errorMessage: ""}
                };

                actions.validateInput({state, commit, dispatch, getters}, state.coordinatesEasting);

                expect(commit.firstCall.args[0]).to.equal("resetErrorMessages");
            });
            it("Throws an Error for missing coordinates - ETRS89", () => {
                const state = {
                    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#25832"},
                    coordinatesEasting: {id: "easting", name: "", value: "", errorMessage: ""}
                };

                actions.validateInput({state, commit, dispatch}, state.coordinatesEasting);

                expect(commit.firstCall.args[0]).to.equal("resetErrorMessages");
                expect(commit.secondCall.args[0]).to.equal("setEastingNoCoord");
            });
            it("Throws an Error for wrong coordinates - ETRS89", () => {
                const state = {
                    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#25832"},
                    coordinatesNorthing: {id: "northing", name: "", value: "falsche Eingabe", errorMessage: ""}
                };

                actions.validateInput({state, commit, dispatch}, state.coordinatesNorthing);

                expect(commit.firstCall.args[0]).to.equal("resetErrorMessages");
                expect(commit.secondCall.args[0]).to.equal("setNorthingNoMatch");
            });
            it("Validates the coordinates according to the WGS84 coordinate system", () => {
                const state = {
                    currentProjection: {id: "EPSG:4326"},
                    coordinatesEasting: {id: "easting", name: "", value: "53° 33′ 25", errorMessage: ""}
                };

                actions.validateInput({state, commit, dispatch, getters}, state.coordinatesEasting);

                expect(commit.firstCall.args[0]).to.equal("resetErrorMessages");
            });
            it("Throws an Error for missing coordinates - WGS84", () => {
                const state = {
                    currentProjection: {id: "EPSG:4326"},
                    coordinatesEasting: {id: "easting", name: "", value: "", errorMessage: ""}
                };

                actions.validateInput({state, commit, dispatch}, state.coordinatesEasting);

                expect(commit.firstCall.args[0]).to.equal("resetErrorMessages");
                expect(commit.secondCall.args[0]).to.equal("setEastingNoCoord");
            });
            it("Throws an Error for wrong coordinates - WGS84", () => {
                const state = {
                    currentProjection: {id: "EPSG:4326"},
                    coordinatesNorthing: {id: "northing", name: "", value: "falsche Eingabe", errorMessage: ""}
                };

                actions.validateInput({state, commit, dispatch}, state.coordinatesNorthing);

                expect(commit.firstCall.args[0]).to.equal("resetErrorMessages");
                expect(commit.secondCall.args[0]).to.equal("setNorthingNoMatch");
            });
            it("Validates the coordinates according to the WGS84(Dezimalgrad) coordinate system", () => {
                const state = {
                    currentProjection: {id: "EPSG:4326-DG"},
                    coordinatesEasting: {id: "easting", name: "", value: "53.55555°", errorMessage: ""}
                };

                actions.validateInput({state, commit, dispatch, getters}, state.coordinatesEasting);

                expect(commit.firstCall.args[0]).to.equal("resetErrorMessages");
            });
            it("Validates the coordinates without degree symbol according to the WGS84(Dezimalgrad) coordinate system", () => {
                const state = {
                    currentProjection: {id: "EPSG:4326-DG"},
                    coordinatesEasting: {id: "easting", name: "", value: "9.983193111035327", errorMessage: ""}
                };

                actions.validateInput({state, commit, dispatch, getters}, state.coordinatesEasting);

                expect(commit.firstCall.args[0]).to.equal("resetErrorMessages");
            });
            it("Throws an Error for missing coordinates - WGS84(Dezimalgrad)", () => {
                const state = {
                    currentProjection: {id: "EPSG:4326-DG"},
                    coordinatesEasting: {id: "easting", name: "", value: "", errorMessage: ""}
                };

                actions.validateInput({state, commit, dispatch}, state.coordinatesEasting);

                expect(commit.firstCall.args[0]).to.equal("resetErrorMessages");
                expect(commit.secondCall.args[0]).to.equal("setEastingNoCoord");
            });
            it("Throws an Error for wrong coordinates - WGS84(Dezimalgrad)", () => {
                const state = {
                    currentProjection: {id: "EPSG:4326-DG"},
                    coordinatesNorthing: {id: "northing", name: "", value: "falsche Eingabe", errorMessage: ""}
                };

                actions.validateInput({state, commit, dispatch}, state.coordinatesNorthing);

                expect(commit.firstCall.args[0]).to.equal("resetErrorMessages");
                expect(commit.secondCall.args[0]).to.equal("setNorthingNoMatch");
            });
        });
        describe("formatInput", () => {
            it("Does not format coordinates of the ETRS89 format and moves to coordinates", () => {
                const state = {
                    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#25832"},
                    coordinatesEasting: {id: "easting", name: "", value: "564459.13", errorMessage: ""},
                    coordinatesNorthing: {id: "northing", name: "", value: "5935103.67", errorMessage: ""}
                };

                actions.formatInput({state, commit, getters}, [state.coordinatesEasting, state.coordinatesNorthing]);

                expect(commit.firstCall.args[0]).to.equal("setSelectedCoordinates");
                expect(commit.secondCall.args[0]).to.equal("resetErrorMessages");
                expect(commit.thirdCall.args[0]).to.equal("pushCoordinates");
                expect(commit.thirdCall.args[1]).to.equal("564459.13");
            });
        });
        describe("transformCoordinates", () => {
            it("Does not transform coordinates of the ETRS89 format and moves to coordinates", () => {
                const state = {
                    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#25832"},
                    selectedCoordinates: ["564459.13", "5935103.67"]
                };

                sinon.stub(Radio, "request").callsFake((...args) => {
                    let ret = null;

                    args.forEach(arg => {
                        if (arg === "getProjection") {
                            ret = {
                                getCode: () => "http://www.opengis.net/gml/srs/epsg.xml#25832"
                            };
                        }
                    });
                    return ret;
                });


                actions.transformCoordinates({state, dispatch});

                expect(dispatch.firstCall.args[0]).to.equal("setZoom");
                expect(dispatch.secondCall.args[0]).to.equal("moveToCoordinates");
                expect(dispatch.secondCall.args[1]).to.eql(["564459.13", "5935103.67"]);
            });
            it("Transforms coordinates of the WGS84 format and moves to coordinates", () => {
                const state = {
                        currentProjection: {id: "EPSG:4326"},
                        selectedCoordinates: [["53", "33", "25"], ["9", "59", "50"]]
                    },
                    proj4Result = Symbol(),
                    proj4Spy = sinon.spy(() => {
                        return proj4Result;
                    });

                sinon.stub(Radio, "request").callsFake((...args) => {
                    let ret = null;

                    args.forEach(arg => {
                        if (arg === "getProjection") {
                            ret = {
                                getCode: () => "EPSG:25832"
                            };
                        }
                    });
                    return ret;
                });


                sinon.stub(proj4, "default").callsFake(proj4Spy);
                actions.transformCoordinates({state, dispatch});

                expect(proj4Spy.firstCall.args[0]).to.equal("EPSG:4326");
                expect(proj4Spy.secondCall.args[0]).to.equal("EPSG:25832");
                expect(dispatch.firstCall.args[0]).to.equal("setZoom");
                expect(dispatch.secondCall.args[0]).to.equal("moveToCoordinates");
                expect(dispatch.secondCall.args[1]).to.eql(proj4Result);
            });
            it("Transforms coordinates of the WGS84(Dezimalgrad) format and moves to coordinates", () => {
                const state = {
                        currentProjection: {id: "EPSG:4326-DG"},
                        selectedCoordinates: [["53.55555", ""], ["10.01234", ""]]
                    },
                    proj4Result = Symbol(),
                    proj4Spy = sinon.spy(() => {
                        return proj4Result;
                    });

                sinon.stub(Radio, "request").callsFake((...args) => {
                    let ret = null;

                    args.forEach(arg => {
                        if (arg === "getProjection") {
                            ret = {
                                getCode: () => "EPSG:25832"
                            };
                        }
                    });
                    return ret;
                });


                sinon.stub(proj4, "default").callsFake(proj4Spy);
                actions.transformCoordinates({state, dispatch});

                expect(proj4Spy.firstCall.args[0]).to.equal("EPSG:4326");
                expect(proj4Spy.secondCall.args[0]).to.equal("EPSG:25832");
                expect(dispatch.firstCall.args[0]).to.equal("setZoom");
                expect(dispatch.secondCall.args[0]).to.equal("moveToCoordinates");
                expect(dispatch.secondCall.args[1]).to.eql(proj4Result);
            });
            it("Transforms coordinates of the EPSG:31467 format and moves to coordinates", () => {
                const state = {
                        currentProjection: {id: "EPSG:31467"},
                        selectedCoordinates: [["53.55555", ""], ["10.01234", ""]]
                    },
                    proj4Result = Symbol(),
                    proj4Spy = sinon.spy(() => {
                        return proj4Result;
                    });

                sinon.stub(Radio, "request").callsFake((...args) => {
                    let ret = null;

                    args.forEach(arg => {
                        if (arg === "getProjection") {
                            ret = {
                                getCode: () => "EPSG:25832"
                            };
                        }
                    });
                    return ret;
                });


                sinon.stub(proj4, "default").callsFake(proj4Spy);
                actions.transformCoordinates({state, dispatch});

                expect(proj4Spy.firstCall.args[0]).to.equal("EPSG:31467");
                expect(proj4Spy.secondCall.args[0]).to.equal("EPSG:25832");
                expect(dispatch.firstCall.args[0]).to.equal("setZoom");
                expect(dispatch.secondCall.args[0]).to.equal("moveToCoordinates");
                expect(dispatch.secondCall.args[1]).to.eql(proj4Result);
            });
            it("Transforms coordinates of the EPSG:8395 format and moves to coordinates", () => {
                const state = {
                        currentProjection: {id: "EPSG:8395"},
                        selectedCoordinates: [["53.55555", ""], ["10.01234", ""]]
                    },
                    proj4Result = Symbol(),
                    proj4Spy = sinon.spy(() => {
                        return proj4Result;
                    });

                sinon.stub(Radio, "request").callsFake((...args) => {
                    let ret = null;

                    args.forEach(arg => {
                        if (arg === "getProjection") {
                            ret = {
                                getCode: () => "EPSG:25832"
                            };
                        }
                    });
                    return ret;
                });


                sinon.stub(proj4, "default").callsFake(proj4Spy);
                actions.transformCoordinates({state, dispatch});

                expect(proj4Spy.firstCall.args[0]).to.equal("EPSG:8395");
                expect(proj4Spy.secondCall.args[0]).to.equal("EPSG:25832");
                expect(dispatch.firstCall.args[0]).to.equal("setZoom");
                expect(dispatch.secondCall.args[0]).to.equal("moveToCoordinates");
                expect(dispatch.secondCall.args[1]).to.eql(proj4Result);
            });
            it("Transforms coordinates of the http://www.opengis.net/gml/srs/epsg.xml#25832 format and moves to coordinates", () => {
                const state = {
                    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#25832"},
                    selectedCoordinates: [["53.55555", ""], ["10.01234", ""]]
                };

                sinon.stub(Radio, "request").callsFake((...args) => {
                    let ret = null;

                    args.forEach(arg => {
                        if (arg === "getProjection") {
                            ret = {
                                getCode: () => "http://www.opengis.net/gml/srs/epsg.xml#25832"
                            };
                        }
                    });
                    return ret;
                });

                actions.transformCoordinates({state, dispatch});

                expect(dispatch.firstCall.args[0]).to.equal("setZoom");
                expect(dispatch.secondCall.args[0]).to.equal("moveToCoordinates");
            });
            it("Respect mapViews projection is not 'EPSG:25832' - Transforms coordinates of the EPSG:8395 format and moves to coordinates", () => {
                const state = {
                        currentProjection: {id: "EPSG:8395"},
                        selectedCoordinates: [["53.55555", ""], ["10.01234", ""]]
                    },
                    proj4Result = Symbol(),
                    proj4Spy = sinon.spy(() => {
                        return proj4Result;
                    });

                sinon.stub(Radio, "request").callsFake((...args) => {
                    let ret = null;

                    args.forEach(arg => {
                        if (arg === "getProjection") {
                            ret = {
                                getCode: () => "EPSG:25833"
                            };
                        }
                    });
                    return ret;
                });

                sinon.stub(proj4, "default").callsFake(proj4Spy);
                actions.transformCoordinates({state, dispatch});

                expect(proj4Spy.firstCall.args[0]).to.equal("EPSG:8395");
                expect(proj4Spy.secondCall.args[0]).to.equal("EPSG:25833");
                expect(dispatch.firstCall.args[0]).to.equal("setZoom");
                expect(dispatch.secondCall.args[0]).to.equal("moveToCoordinates");
                expect(dispatch.secondCall.args[1]).to.eql(proj4Result);
            });
            describe("copyCoordinates", () => {
                it("copyCoordinates one value", () => {
                    navigator.clipboard = {
                        writeText: (aText) => {
                            text = aText;
                        }
                    };
                    let text = "";
                    const state = {
                            delimiter: "&"
                        },
                        coords = ["123456"],
                        stub = sinon.stub(navigator.clipboard, "writeText").resolves(text);

                    actions.copyCoordinates({state, dispatch}, coords);
                    expect(stub.calledOnce).to.be.true;
                    expect(stub.firstCall.args[0]).to.equal("123456");
                });
                it("copyCoordinates 2 values, use default delimiter", () => {
                    navigator.clipboard = {
                        writeText: (aText) => {
                            text = aText;
                        }
                    };
                    let text = "";
                    const state = {delimiter: "|"},
                        coords = ["123456", "789123"],
                        stub = sinon.stub(navigator.clipboard, "writeText").resolves(text);

                    actions.copyCoordinates({state, dispatch}, coords);
                    expect(stub.calledOnce).to.be.true;
                    expect(stub.firstCall.args[0]).to.equal("123456|789123");
                });
                it("copyCoordinates 2 values delimiter change", () => {
                    navigator.clipboard = {
                        writeText: (aText) => {
                            text = aText;
                        }
                    };
                    let text = "";
                    const state = {
                            delimiter: "&"
                        },
                        coords = ["123456", "789123"],
                        stub = sinon.stub(navigator.clipboard, "writeText").resolves(text);

                    actions.copyCoordinates({state, dispatch}, coords);
                    expect(stub.calledOnce).to.be.true;
                    expect(stub.firstCall.args[0]).to.equal("123456&789123");
                });
            });
        });
    });
});

