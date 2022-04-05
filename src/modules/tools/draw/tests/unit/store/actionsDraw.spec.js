import sinon from "sinon";
import {expect} from "chai";
import actions from "../../../store/actionsDraw";
import stateDraw from "../../../store/stateDraw";
import Draw from "ol/interaction/Draw";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
import LineString from "ol/geom/LineString";
import mapCollection from "../../../../../../core/dataStorage/mapCollection.js";


describe("src/modules/tools/draw/store/actionsDraw.js", () => {
    let commit, dispatch, state, addInteraction;

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
        mapCollection.clear();
        addInteraction = sinon.spy();
        const map = {
            id: "ol",
            mode: "2D",
            addInteraction: addInteraction,
            getView: () => ({
                getProjection: () => ({
                    getCode: () => "EPSG:25832"
                })
            })
        };

        mapCollection.addMap(map, "ol", "2D");
    });
    afterEach(sinon.restore);

    describe("addInteraction", () => {
        it("calls map's addInteraction function with a given interaction", () => {
            const rootState = {
                    Map: {
                        mapId: "ol",
                        mapMode: "2D"
                    }
                },
                interactionSymbol = Symbol();

            actions.addInteraction({
                rootState: rootState
            }, interactionSymbol);

            expect(addInteraction.calledOnce).to.be.true;
            expect(addInteraction.args[0][0]).to.equal(interactionSymbol);
        });
    });
    describe("clearLayer", () => {
        it("calls the clear function of the state's layer", () => {
            const clear = sinon.spy();

            state = {layer: {
                getSource: () => ({clear})
            }};

            actions.clearLayer({state, dispatch});

            expect(clear.calledOnce).to.be.true;
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.getCall(0).args).to.eql(["setDownloadFeatures"]);
        });
    });
    describe("createCenterPoint", () => {
        const lineFeat = new Feature({geometry: new LineString([[565647.1112172041, 5935140.711690446], [566028.1110114643, 5934812.628534278], [566546.6940647627, 5934770.295223804]])}),
            polygonFeat = new Feature({geometry: new Polygon([[[565086.1948534324, 5934664.461947621], [565657.6945448224, 5934738.54524095], [565625.9445619675, 5934357.545446689], [565234.3614400891, 5934346.962119071], [565086.1948534324, 5934664.461947621]]])}),
            targetProjection = "EPSG:4326";
        let centerPoint,
            rootState;

        beforeEach(() => {
            rootState = {
                Map: {
                    mapId: "ol",
                    mapMode: "2D"
                }
            };
        });

        it("should return the center point of a polygon with the projection EPSG:4326", () => {
            centerPoint = actions.createCenterPoint({rootState}, {feature: polygonFeat, targetProjection});

            expect(centerPoint).to.eql([9.987132463729269, 53.55569205016286]);
        });
        it("should return the center point of a line with the projection EPSG:4326", () => {
            centerPoint = actions.createCenterPoint({rootState}, {feature: lineFeat, targetProjection});

            expect(centerPoint).to.eql([9.996919156243193, 53.55803037141494]);
        });
        it("should return the center point of a polygon in the map's projection", () => {
            centerPoint = actions.createCenterPoint({rootState}, {feature: polygonFeat});

            expect(centerPoint).to.eql([565392.1853131973, 5934542.75368001]);
        });
        it("should return center point of line in the map's projection", () => {
            centerPoint = actions.createCenterPoint({rootState}, {feature: lineFeat});

            expect(centerPoint).to.eql([566036.8402080259, 5934811.915946803]);
        });
    });
    describe("createDrawInteractionAndAddToMap", () => {
        /**
         * @param {String} id id to use for drawType
         * @returns {Object}  a mocked state for this test
         */
        function getState (id) {
            const result = {
                layer: {
                    getSource: () => ({})
                },
                drawType: {
                    id,
                    geometry: "Point"
                },
                symbol: {},
                freehand: false
            };

            result[id + "Options"] = {};
            return result;
        }

        const activeSymbol = Symbol(),
            maxFeaturesSymbol = Symbol(),
            getters = {
                styleSettings: sinon.stub()
            };

        it("commits and dispatches as expected", () => {
            actions.createDrawInteractionAndAddToMap({
                state: getState("drawCircle"),
                commit,
                dispatch,
                getters
            },
            {
                active: activeSymbol,
                maxFeatures: maxFeaturesSymbol
            });

            // commits setDrawInteraction
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.eql("setDrawInteraction");
            expect(typeof commit.firstCall.args[1]).to.eql("object");

            // dispatches interaction-related actions
            expect(dispatch.calledThrice).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["manipulateInteraction", {interaction: "draw", active: activeSymbol}]);
            expect(dispatch.secondCall.args).to.eql(["createDrawInteractionListener", {isOuterCircle: false, drawInteraction: "", maxFeatures: maxFeaturesSymbol}]);
            expect(dispatch.thirdCall.args[0]).to.eql("addInteraction");
            expect(typeof dispatch.thirdCall.args[1]).to.eql("object");
        });

        it("commits and dispatches a second set of information for drawDoubleCircle", () => {
            actions.createDrawInteractionAndAddToMap({state: getState("drawDoubleCircle"), commit, dispatch, getters}, {active: activeSymbol, maxFeatures: maxFeaturesSymbol});

            // commits setDrawInteraction
            expect(commit.calledTwice).to.be.true;
            expect(commit.args[0][0]).to.eql("setDrawInteraction");
            expect(typeof commit.args[0][1]).to.eql("object");
            expect(commit.args[1][0]).to.eql("setDrawInteractionTwo");
            expect(typeof commit.args[1][1]).to.eql("object");

            // dispatches interaction-related actions
            expect(dispatch.callCount).to.equal(6);
            expect(dispatch.args[0]).to.eql(["manipulateInteraction", {interaction: "draw", active: activeSymbol}]);
            expect(dispatch.args[1]).to.eql(["createDrawInteractionListener", {isOuterCircle: false, drawInteraction: "", maxFeatures: maxFeaturesSymbol}]);
            expect(dispatch.args[2][0]).to.eql("addInteraction");
            expect(typeof dispatch.args[2][1]).to.eql("object");
            expect(dispatch.args[3]).to.eql(["manipulateInteraction", {interaction: "draw", active: activeSymbol}]);
            expect(dispatch.args[4]).to.eql(["createDrawInteractionListener", {isOuterCircle: true, drawInteraction: "Two", maxFeatures: maxFeaturesSymbol}]);
            expect(dispatch.args[5][0]).to.eql("addInteraction");
            expect(typeof dispatch.args[5][1]).to.eql("object");
        });
    });
    describe("createDrawInteractionListener", () => {
        let definedFunctions;

        beforeEach(() => {
            definedFunctions = {
                drawstart: [],
                drawend: []
            };
            state = {
                drawInteraction: {
                    on: (key, f) => {
                        definedFunctions[key].push(f);
                    }
                }
            };
        });

        it("defines a drawstart and drawend function on the interaction", () => {
            actions.createDrawInteractionListener({state, dispatch}, {
                isOuterCircle: false,
                drawInteraction: ""
            });

            expect(definedFunctions.drawstart).to.have.length(1);
            expect(definedFunctions.drawend).to.have.length(1);
        });

        it("defines a second drawstart function when maxFeatures is set", () => {
            actions.createDrawInteractionListener({state, dispatch}, {
                isOuterCircle: false,
                drawInteraction: "",
                maxFeatures: 5
            });

            expect(definedFunctions.drawstart).to.have.length(2);
            expect(definedFunctions.drawend).to.have.length(1);
        });

        /* NOTE: Somehow the global object "Config" can't be found, even though it is set beforehand
        it("enables the drawend to dispatch and uses the correct parameters", () => {
            const doubleCircleSymbol = Symbol(),
                geoJSONSymbol = Symbol(),
                set = sinon.spy();

            // always return this; it's grabbed once and forwarded to Radio later
            dispatch = sinon.spy(() => geoJSONSymbol);

            actions.createDrawInteractionListener({state, dispatch}, {
                doubleCircle: doubleCircleSymbol,
                drawInteraction: ""
            });

            sinon.stub(Radio, "trigger").callsFake(sinon.fake());

            Config.inputMap = {targetprojection: "mock"};
            definedFunctions.drawend[0]({feature: {set}});
            delete Config.inputMap;

            expect(set.calledWith("styleId")).to.be.true;
            expect(dispatch.calledWith("cancelDrawWithoutGUI")).to.be.true;
            expect(dispatch.calledWith("editFeaturesWithoutGUI")).to.be.true;
            expect(dispatch.calledWithMatch(
                "downloadFeaturesWithoutGUI",
                {
                    prmObject: {"targetProjection": "mock"},
                    currentFeature: {set}
                }
            )).to.be.true;
            expect(Radio.trigger.calledWith(
                "RemoteInterface", "postMessage", {"drawEnd": geoJSONSymbol})
            ).to.be.true;
        });
*/
        it("enables the drawstart to dispatch and uses the correct parameters", () => {
            const isOuterCircleSymbol = Symbol(),
                event = {
                    feature: {
                        set: () => {
                            return false;
                        }
                    }
                };

            actions.createDrawInteractionListener({state, dispatch}, {
                isOuterCircle: isOuterCircleSymbol,
                drawInteraction: ""
            });

            definedFunctions.drawstart[0](event);

            expect(dispatch.calledWithMatch("drawInteractionOnDrawEvent", "")).to.be.true;
        });

        it("enables the maxFeatures drawstart to dispatch, does so on maxFeatures reached", () => {
            let featureArray = [];

            state.layer = {
                getSource: () => ({
                    getFeatures: () => featureArray
                })
            };

            actions.createDrawInteractionListener({state, dispatch}, {
                isOuterCircle: Symbol(),
                drawInteraction: "",
                maxFeatures: 5
            });

            // nothing happens if array has okay length
            definedFunctions.drawstart[1]();
            expect(dispatch.notCalled).to.be.true;

            // make array surpass maxFeatures length to test calls
            featureArray = [0, 1, 2, 3, 4];

            definedFunctions.drawstart[1]();
            expect(dispatch.called).to.be.true;
            /* NOTE: i18next isn't actually working in tests yet, so here undefined
             * is compared with undefined - works, but has limited meaning */
            expect(dispatch.calledWith("Alerting/addSingleAlert", i18next.t("common:modules.tools.draw.limitReached", {count: 5}), {root: true}));
            expect(dispatch.calledWith("deactivateDrawInteractions")).to.be.true;
        });
    });
    describe("createModifyInteractionAndAddToMap", () => {
        it("commits and dispatches as expected", () => {
            const activeSymbol = Symbol();

            state = {
                layer: {getSource: () => ({
                    getFeatures: () => [],
                    addEventListener: () => ({})
                })}
            };

            actions.createModifyInteractionAndAddToMap(
                {state, commit, dispatch},
                activeSymbol
            );

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setModifyInteraction");
            expect(commit.secondCall.args[0]).to.equal("setSelectInteractionModify");
            expect(typeof commit.firstCall.args[1]).to.equal("object");
            expect(typeof commit.secondCall.args[1]).to.equal("object");

            expect(dispatch.callCount).to.equal(5);
            expect(dispatch.args[0]).to.eql(["manipulateInteraction", {interaction: "modify", active: activeSymbol}]);
            expect(dispatch.args[1]).to.eql(["createModifyInteractionListener"]);
            expect(dispatch.args[2][0]).to.eql("addInteraction");
            expect(typeof dispatch.args[2][1]).to.eql("object");

            expect(dispatch.args[3]).to.eql(["createSelectInteractionModifyListener"]);
            expect(dispatch.args[4][0]).to.eql("addInteraction");
            expect(typeof dispatch.args[4][1]).to.eql("object");
        });
    });
    describe("createModifyInteractionListener", () => {
        let definedFunctions, trigger;

        beforeEach(() => {
            trigger = sinon.spy();
            definedFunctions = {
                modifystart: [],
                modifyend: []
            };
            state = {
                modifyInteraction: {
                    on: (key, f) => {
                        definedFunctions[key].push(f);
                    }
                }
            };
            sinon.stub(Radio, "trigger").callsFake(trigger);
        });

        it("should define a modifyend function on the interaction", () => {
            actions.createModifyInteractionListener({state, dispatch, commit});

            expect(definedFunctions.modifyend).to.have.length(1);
        });
        /* NOTE: Somehow the global object "Config" can't be found, even though it is set beforehand
        it("should enable the modifyend to trigger to the RemoteInterface if Config.inputMap is defined", () => {
            const featureSymbol = Symbol(),
                geoJSONSymbol = Symbol();

            dispatch = sinon.spy(() => geoJSONSymbol);
            actions.createModifyInteractionListener({state, dispatch});

            Config.inputMap = {targetProjection: "mock"};
            definedFunctions.modifyend[0]({feature: {featureSymbol}});
            delete Config.inputMap;

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["downloadFeaturesWithoutGUI", {prmObject: {"targetProjection": "mock"}, currentFeature: {featureSymbol}}]);
            expect(trigger.calledOnce).to.be.true;
            expect(trigger.firstCall.args).to.eql(["RemoteInterface", "postMessage", {"drawEnd": geoJSONSymbol}]);
        });*/
    });
    describe("createSelectInteractionModifyListener", () => {
        let definedFunctions, trigger;

        beforeEach(() => {
            trigger = sinon.spy();
            definedFunctions = {
                select: []
            };
            state = {
                selectInteractionModify: {
                    on: (key, f) => {
                        definedFunctions[key].push(f);
                    }
                }
            };
            sinon.stub(Radio, "trigger").callsFake(trigger);
        });

        it("should define a select function on the interaction", () => {
            actions.createSelectInteractionModifyListener({state, dispatch});

            expect(definedFunctions.select).to.have.length(1);
        });
    });
    describe("createSelectInteractionAndAddToMap", () => {
        it("commits and dispatches as expected", () => {
            const activeSymbol = Symbol();

            state = {
                layer: {getSource: () => ({
                    getFeatures: () => [],
                    addEventListener: () => ({})
                })}
            };

            actions.createSelectInteractionAndAddToMap(
                {state, commit, dispatch},
                activeSymbol
            );

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setSelectInteraction");
            expect(typeof commit.firstCall.args[1]).to.equal("object");
            expect(dispatch.calledThrice).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["manipulateInteraction", {interaction: "delete", active: activeSymbol}]);
            expect(dispatch.secondCall.args).to.eql(["createSelectInteractionListener"]);
            expect(dispatch.thirdCall.args[0]).to.eql("addInteraction");
            expect(typeof dispatch.thirdCall.args[1]).to.eql("object");
        });
    });
    describe("createSelectionInteractionListener", () => {
        let clear, definedFunctions, removeFeature;

        beforeEach(() => {
            clear = sinon.spy();
            removeFeature = sinon.spy();
            definedFunctions = {
                select: []
            };
            state = {
                selectInteraction: {
                    on: (key, f) => {
                        definedFunctions[key].push(f);
                    },
                    getFeatures: () => ({clear})
                },
                layer: {
                    getSource: () => ({removeFeature})
                }
            };
        });

        it("should define a select function on the interaction", () => {
            actions.createSelectInteractionListener({state, dispatch});

            expect(definedFunctions.select).to.have.length(1);
        });
        it("should enable the select to call the functions removeFeature from the layerSource and clear from the features", () => {
            const selectedSymbol = Symbol();

            actions.createSelectInteractionListener({state, dispatch});
            definedFunctions.select[0]({selected: [selectedSymbol]});

            expect(removeFeature.calledOnce).to.be.true;
            expect(removeFeature.firstCall.args).to.eql([selectedSymbol]);
            expect(clear.calledOnce).to.be.true;
            expect(clear.firstCall.args).to.eql([]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.getCall(0).args).to.eql(["setDownloadFeatures"]);
        });
    });
    describe("deactivateDrawInteractions", () => {
        const settings = {
                source: () => ({}),
                type: "Point",
                freehand: false
            },
            drawOne = new Draw(settings),
            drawTwo = new Draw(settings),
            noDraw = Symbol();
        let rootState;

        beforeEach(() => {
            mapCollection.clear();
            addInteraction = sinon.spy();
            const map = {
                id: "ol",
                mode: "2D",
                getInteractions: () => [drawOne, drawTwo, noDraw]
            };

            mapCollection.addMap(map, "ol", "2D");
            rootState = {
                Map: {
                    mapId: "ol",
                    mapMode: "2D"
                }};
            state = {deactivatedDrawInteractions: []};
        });

        it("should deactivate the interactions if they are an instance of Draw", () => {
            actions.deactivateDrawInteractions({state, rootState});

            expect(drawOne.getActive()).to.be.false;
            expect(drawTwo.getActive()).to.be.false;
        });
        it("should push the interactions to an array if they are an instance of Draw and are not yet added", () => {
            actions.deactivateDrawInteractions({state, rootState});

            expect(state.deactivatedDrawInteractions.indexOf(drawOne)).to.be.greaterThan(-1);
            expect(state.deactivatedDrawInteractions.indexOf(drawTwo)).to.be.greaterThan(-1);
            expect(state.deactivatedDrawInteractions.indexOf(noDraw)).to.be.equal(-1);
        });
    });
    describe("manipulateInteraction", () => {
        const active = true;
        let interaction, setActive;

        beforeEach(() => {
            setActive = sinon.spy();
            state = {
                drawInteraction: {
                    setActive
                },
                drawInteractionTwo: {
                    setActive
                },
                modifyInteraction: {
                    setActive
                },
                selectInteraction: {
                    setActive
                }
            };
        });

        it("should call the 'setActive' method of the first draw interaction with the given 'active' value if it is not null and the given interaction equals 'draw'", () => {
            delete state.drawInteractionTwo;

            interaction = "draw";
            actions.manipulateInteraction({state}, {interaction, active});

            expect(setActive.calledOnce).to.be.true;
            expect(setActive.firstCall.args).to.eql([active]);
        });
        it("should call the 'setActive' method of both draw interactions with the given 'active' value if it is not null and the given interaction equals 'draw'", () => {
            actions.manipulateInteraction({state}, {interaction, active});

            expect(setActive.calledTwice).to.be.true;
            expect(setActive.firstCall.args).to.eql([active]);
            expect(setActive.secondCall.args).to.eql([active]);
        });
        it("should call the 'setActive' method of the modify interaction with the given 'active' value if it is not null and the given interaction equals 'modify'", () => {
            interaction = "modify";
            actions.manipulateInteraction({state}, {interaction, active});

            expect(setActive.calledOnce).to.be.true;
            expect(setActive.firstCall.args).to.eql([active]);
        });
        it("should call the 'setActive' method of the select interaction with the given 'active' value if it is not null and the given interaction equals 'delete'", () => {
            interaction = "delete";
            actions.manipulateInteraction({state}, {interaction, active});

            expect(setActive.calledOnce).to.be.true;
            expect(setActive.firstCall.args).to.eql([active]);
        });
    });
    describe("redoLastStep", () => {
        const styleSymbol = Symbol();
        let addFeature, getStyle, setId, setStyle;

        beforeEach(() => {
            addFeature = sinon.spy();
            getStyle = sinon.spy(() => styleSymbol);
            setId = sinon.spy();
            setStyle = sinon.spy();
            state = {
                fId: 0,
                layer: {
                    getSource: () => ({
                        addFeature,
                        getFeatureById: () => ({setStyle})
                    })
                },
                redoArray: [],
                undoArray: []
            };
        });

        it("should commit and dispatch if the redoArray contains a value", () => {
            const featureToRestore = {getStyle, setId};

            state.redoArray.push(featureToRestore);

            actions.redoLastStep({state, commit, dispatch});

            expect(setId.calledOnce).to.be.true;
            expect(setId.firstCall.args).to.eql([0]);
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setFId", 1]);
            expect(addFeature.calledOnce).to.be.true;
            expect(addFeature.firstCall.args).to.eql([featureToRestore]);
            expect(setStyle.calledOnce).to.be.true;
            expect(setStyle.firstCall.args).to.eql([styleSymbol]);
            expect(getStyle.calledOnce).to.be.true;
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateRedoArray", {remove: true}]);
            expect(dispatch.secondCall.args).to.eql(["updateUndoArray", {remove: false, feature: featureToRestore}]);
        });
        it("should not commit and dispatch if the redoArray doesn't contain a value", () => {
            expect(setId.notCalled).to.be.true;
            expect(commit.notCalled).to.be.true;
            expect(addFeature.notCalled).to.be.true;
            expect(setStyle.notCalled).to.be.true;
            expect(getStyle.notCalled).to.be.true;
            expect(dispatch.notCalled).to.be.true;
        });
    });
    describe("removeInteraction", () => {
        let interactionSymbol, removeInteraction, rootState;

        beforeEach(() => {
            interactionSymbol = Symbol();
            removeInteraction = sinon.spy();
            rootState = {
                Map: {
                    mapId: "ol",
                    mapMode: "2D"
                }};
            mapCollection.clear();
            const map = {
                id: "ol",
                mode: "2D",
                removeInteraction: removeInteraction
            };

            mapCollection.addMap(map, "ol", "2D");
        });

        it("should call the 'removeInteration' method of the map of the rootState", () => {
            actions.removeInteraction({rootState}, interactionSymbol);

            expect(removeInteraction.calledOnce).to.be.true;
            expect(removeInteraction.firstCall.args).to.eql([interactionSymbol]);
        });
    });
    describe("resetModule", () => {
        const drawInteraction = Symbol(),
            drawInteractionTwo = Symbol(),
            iconSymbol = Symbol(),
            getters = {
                iconList: [iconSymbol]
            },
            listener = Symbol(),
            initialState = Object.assign({}, stateDraw),
            modifyInteraction = Symbol(),
            selectInteractionModify = Symbol(),
            selectInteraction = Symbol(),
            un = sinon.spy();

        it("should commit and dispatch as intended", () => {
            state = {
                addFeatureListener: {listener},
                drawInteraction,
                drawInteractionTwo,
                layer: {getSource: () => ({un})},
                modifyInteraction,
                selectInteractionModify,
                selectInteraction
            };
            actions.resetModule({state, commit, dispatch, getters});

            expect(un.calledOnce).to.be.true;
            expect(un.firstCall.args).to.eql(["addFeature", listener]);

            expect(commit.callCount).to.equal(11);
            expect(commit.getCall(0).args).to.eql(["setActive", false]);
            expect(commit.getCall(1).args).to.eql(["setSelectedFeature", null]);
            expect(commit.getCall(2).args).to.eql(["setDrawType", initialState.drawType]);
            expect(commit.getCall(3).args).to.eql(["setFreeHand", initialState.freeHand]);
            expect(commit.getCall(4).args).to.eql(["setPointSize", initialState.pointSize]);
            expect(commit.getCall(5).args).to.eql(["setSymbol", iconSymbol]);
            expect(commit.getCall(6).args).to.eql(["setWithoutGUI", initialState.withoutGUI]);
            expect(commit.getCall(7).args).to.eql(["setDownloadDataString", initialState.download.dataString]);
            expect(commit.getCall(8).args).to.eql(["setDownloadFeatures", initialState.download.features]);
            expect(commit.getCall(9).args).to.eql(["setDownloadFileName", initialState.download.fileName]);
            expect(commit.getCall(10).args).to.eql(["setDownloadSelectedFormat", initialState.download.selectedFormat]);

            expect(dispatch.callCount).to.equal(7);
            expect(dispatch.getCall(0).args).to.eql(["toggleInteraction", "draw"]);
            expect(dispatch.getCall(1).args).to.eql(["manipulateInteraction", {interaction: "draw", active: false}]);
            expect(dispatch.getCall(2).args).to.eql(["removeInteraction", drawInteraction]);
            expect(dispatch.getCall(3).args).to.eql(["removeInteraction", drawInteractionTwo]);
            expect(dispatch.getCall(4).args).to.eql(["removeInteraction", modifyInteraction]);
            expect(dispatch.getCall(5).args).to.eql(["removeInteraction", selectInteractionModify]);
            expect(dispatch.getCall(6).args).to.eql(["removeInteraction", selectInteraction]);
        });
    });
    describe("toggleInteraction", () => {
        let interaction;

        it("should enable the draw interactions and disable the other interactions if the given interaction equals 'draw'", () => {
            interaction = "draw";

            actions.toggleInteraction({commit, dispatch}, interaction);

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args).to.eql(["setCurrentInteraction", "draw"]);
            expect(commit.secondCall.args).to.eql(["setSelectedFeature", null]);
            expect(dispatch.callCount).to.equal(4);
            expect(dispatch.args[0]).to.eql(["manipulateInteraction", {interaction: "draw", active: true}]);
            expect(dispatch.args[1]).to.eql(["manipulateInteraction", {interaction: "modify", active: false}]);
            expect(dispatch.args[2]).to.eql(["manipulateInteraction", {interaction: "delete", active: false}]);
            expect(dispatch.args[3]).to.eql(["updateDrawInteraction"]);
        });
        it("should enable the modify interaction and disable the other interactions if the given interaction equals 'modify'", () => {
            interaction = "modify";

            actions.toggleInteraction({commit, dispatch}, interaction);

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args).to.eql(["setCurrentInteraction", "modify"]);
            expect(commit.secondCall.args).to.eql(["setSelectedFeature", null]);
            expect(dispatch.calledThrice).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["manipulateInteraction", {interaction: "draw", active: false}]);
            expect(dispatch.secondCall.args).to.eql(["manipulateInteraction", {interaction: "modify", active: true}]);
            expect(dispatch.thirdCall.args).to.eql(["manipulateInteraction", {interaction: "delete", active: false}]);
        });
        it("should enable the select interaction and disable the other interactions if the given interaction equals 'delete'", () => {
            interaction = "delete";

            actions.toggleInteraction({commit, dispatch}, interaction);

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args).to.eql(["setCurrentInteraction", "delete"]);
            expect(commit.secondCall.args).to.eql(["setSelectedFeature", null]);
            expect(dispatch.calledThrice).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["manipulateInteraction", {interaction: "draw", active: false}]);
            expect(dispatch.secondCall.args).to.eql(["manipulateInteraction", {interaction: "modify", active: false}]);
            expect(dispatch.thirdCall.args).to.eql(["manipulateInteraction", {interaction: "delete", active: true}]);
        });
    });
    describe("undoLastStep", () => {
        const arr = [],
            feature = Symbol(),
            getFeatures = sinon.fake.returns(arr),
            removeFeature = sinon.spy();

        beforeEach(() => {
            state = {
                layer: {
                    getSource: () => ({getFeatures, removeFeature})
                },
                undoArray: []
            };
        });

        it("should do nothing if the type of featureToRemove is 'undefined'", () => {
            actions.undoLastStep({state, dispatch});

            expect(dispatch.notCalled).to.be.true;
            expect(removeFeature.notCalled).to.be.true;
        });
        it("should dispatch the correct methods and remove the feature if the type of featureToRemove is not 'undefined'", () => {
            state.undoArray.push(feature);
            actions.undoLastStep({state, dispatch});

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateRedoArray", {remove: false, feature}]);
            expect(dispatch.secondCall.args).to.eql(["updateUndoArray", {remove: true}]);
            expect(removeFeature.calledOnce).to.be.true;
            expect(removeFeature.firstCall.args).to.eql([feature]);
        });
    });
    describe("uniqueID", () => {
        let unique;

        beforeEach(() => {
            state = {
                idCounter: 0
            };
        });

        it("should create a uniqueID without a prefix is none is given and commit as intended", () => {
            unique = actions.uniqueID({state, commit});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.be.eql(["setIdCounter", 1]);
            expect(unique).to.equal("1");
        });
        it("should crate a uniqueID with a prefix if it is given and commit as intended", () => {
            const prefix = "id_";

            unique = actions.uniqueID({state, commit}, prefix);

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.be.eql(["setIdCounter", 1]);
            expect(unique).to.equal("id_1");
        });
    });
    describe("updateDrawInteraction", () => {
        const drawInteraction = Symbol(),
            drawInteractionTwo = Symbol(),
            getters = {
                styleSettings: Symbol()
            };

        beforeEach(() => {
            state = {drawInteraction};
        });

        it("should commit and dispatch as intended", () => {
            actions.updateDrawInteraction({state, commit, dispatch, getters});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setDrawInteraction", null]);
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args).to.be.eql(["removeInteraction", drawInteraction]);
            expect(dispatch.secondCall.args).to.be.eql(["createDrawInteractionAndAddToMap", {active: true}]);
        });
        it("should also dispatch and commit for the second drawInteraction if its type is not 'undefined'", () => {
            state.drawInteractionTwo = drawInteractionTwo;

            actions.updateDrawInteraction({state, commit, dispatch, getters});

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args).to.eql(["setDrawInteraction", null]);
            expect(commit.secondCall.args).to.eql(["setDrawInteractionTwo", null]);
            expect(dispatch.calledThrice).to.be.true;
            expect(dispatch.firstCall.args).to.be.eql(["removeInteraction", drawInteraction]);
            expect(dispatch.secondCall.args).to.be.eql(["removeInteraction", drawInteractionTwo]);
            expect(dispatch.thirdCall.args).to.be.eql(["createDrawInteractionAndAddToMap", {active: true}]);
        });
    });
    describe("updateRedoArray", () => {
        const feature = Symbol();
        let remove;

        beforeEach(() => {
            state = {
                redoArray: []
            };
        });

        it("should remove the last element of the redoArray if remove is set to 'true' and commit as intended", () => {
            remove = true;
            state.redoArray.push(feature);

            actions.updateRedoArray({state, commit}, {remove});

            expect(state.redoArray.length).to.equal(0);
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.be.eql(["setRedoArray", []]);
        });
        it("should push the given feature onto the redoArray if remove is set to 'false' and commit as intended", () => {
            remove = false;

            actions.updateRedoArray({state, commit}, {remove, feature});

            expect(state.redoArray.length).to.equal(1);
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.be.eql(["setRedoArray", [feature]]);
        });
    });
});
