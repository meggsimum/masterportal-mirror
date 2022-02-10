import sinon from "sinon";
import {expect} from "chai";

import actions from "../../../store/actionsWmsTime";
import initialState from "../../../store/stateWmsTime";
import mapCollection from "../../../../../core/dataStorage/mapCollection.js";

const layerString = "When I grow up I will be a real layer!";

describe("src/modules/wmsTime/store/actionsWmsTime.js", () => {
    let commit, dispatch, getters, rootGetters, state, trigger;

    before(() => {
        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D",
            removeLayer: sinon.spy()
        };

        mapCollection.addMap(map, "ol", "2D");
    });

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
        getters = {currentTimeSliderObject: {keyboardMovement: 5}};
        trigger = sinon.spy();
    });

    afterEach(sinon.restore);

    describe("toggleSwiper", () => {
        const TIME = 1996,
            transparency = 0;
        let id,
            commitSpy,
            requestSpy;

        /**
         * The mock function for the Radio.request.
         * Knitted for Radio.request("ModelList", "getModelByAttributes").
         *
         * @returns {object} An object containing the needed parameters and function to test the action 'toggleSwiper'.
         */
        function request (...args) {
            requestSpy(...args);
            return {
                attributes: {
                    name: "Layer",
                    layers: "myLayer",
                    level: 0,
                    parentId: "TimeLayer",
                    url: "https://my.layers.com/",
                    time: true,
                    transparency,
                    version: "1.1.0"
                },
                get: prm => {
                    if (prm === "layerSource") {
                        return {
                            params_: {TIME}
                        };
                    }
                    if (prm === "layer") {
                        return layerString;
                    }
                    return {};
                },
                updateTime: () => null
            };
        }

        /**
         * If the mutation 'setLayerSwiperActive' is called, the value needs to be actually changed
         * for the rest of the function to work.
         * Otherwise the function simply calls a spy.
         *
         * @param {String} mutation Name of the mutation that would be called.
         * @param {boolean/number} payload The payload that would be set in the state.
         * @returns {void}
         */
        function commitWithReturn (mutation, payload) {
            if (mutation === "setLayerSwiperActive") {
                state.layerSwiper.active = payload;
            }
            commitSpy(mutation, payload);
        }

        beforeEach(() => {
            commit = commitWithReturn;
            commitSpy = sinon.spy();
            id = "someId";
            requestSpy = sinon.spy();
            rootGetters = {
                "Map/mapId": "ol",
                "Map/mapMode": "2D"
            };
            mapCollection.getMap("ol", "2D").removeLayer = sinon.spy();
            state = Object.assign({}, initialState);
            sinon.stub(Radio, "request").callsFake(request);
            sinon.stub(Radio, "trigger").callsFake(trigger);
        });

        it("should trigger the Parser to add a layer, add said layer to the ModelList and refresh tree if the swiper was activated", () => {
            actions.toggleSwiper({commit, state, rootGetters}, id);

            expect(commitSpy.calledOnce).to.be.true;
            expect(commitSpy.firstCall.args).to.eql(["setLayerSwiperActive", true]);
            expect(requestSpy.calledOnce).to.be.true;
            expect(requestSpy.firstCall.args).to.eql(["ModelList", "getModelByAttributes", {id}]);
            expect(trigger.calledThrice).to.be.true;
            expect(trigger.firstCall.args[0]).to.equal("Parser");
            expect(trigger.firstCall.args[1]).to.equal("addLayer");
            expect(trigger.secondCall.args[0]).to.equal("ModelList");
            expect(trigger.secondCall.args[1]).to.equal("addModelsByAttributes");
            expect(trigger.thirdCall.args).to.eql(["Util", "refreshTree"]);
        });
        it("should call remove the second layer from the Map, remove it from the ModelList and the Parser and refresh the tree if the swiper was deactivated through the button of the second layer", () => {
            id += state.layerAppendix;

            state.layerSwiper.active = true;
            actions.toggleSwiper({commit, state, rootGetters}, id);

            expect(commitSpy.calledOnce).to.be.true;
            expect(commitSpy.firstCall.args).to.eql(["setLayerSwiperActive", false]);
            expect(requestSpy.calledOnce).to.be.true;
            expect(requestSpy.firstCall.args).to.eql(["ModelList", "getModelByAttributes", {id}]);
            expect(mapCollection.getMap("ol", "2D").removeLayer.calledOnce).to.be.true;
            expect(mapCollection.getMap("ol", "2D").removeLayer.firstCall.args).to.eql([layerString]);
            expect(trigger.calledThrice).to.be.true;
            expect(trigger.firstCall.args).to.eql(["ModelList", "removeModelsById", id]);
            expect(trigger.secondCall.args).to.eql(["Parser", "removeItem", id]);
            expect(trigger.thirdCall.args).to.eql(["Util", "refreshTree"]);
        });
        it("should update the time of the original layer and reactivate it, call remove the second layer from the Map, remove it from the ModelList and the Parser and refresh the tree if the swiper was deactivated through the button of the original layer", () => {
            const secondId = id + state.layerAppendix;

            state.layerSwiper.active = true;
            actions.toggleSwiper({commit, state, rootGetters}, id);

            expect(commitSpy.calledTwice).to.be.true;
            expect(commitSpy.firstCall.args).to.eql(["setLayerSwiperActive", false]);
            expect(commitSpy.secondCall.args).to.eql(["setTimeSliderDefaultValue", TIME]);
            expect(requestSpy.calledOnce).to.be.true;
            expect(requestSpy.firstCall.args).to.eql(["ModelList", "getModelByAttributes", {id: secondId}]);
            expect(trigger.callCount).to.equal(4);
            expect(trigger.firstCall.args).to.eql(["ModelList", "setModelAttributesById", id, {transparency}]);
            expect(trigger.secondCall.args).to.eql(["ModelList", "removeModelsById", secondId]);
            expect(trigger.thirdCall.args).to.eql(["Parser", "removeItem", secondId]);
            expect(trigger.lastCall.args).to.eql(["Util", "refreshTree"]);
            expect(mapCollection.getMap("ol", "2D").removeLayer.calledOnce).to.be.true;
            expect(mapCollection.getMap("ol", "2D").removeLayer.firstCall.args).to.eql([layerString]);
        });
    });

    describe("moveSwiper", () => {
        it("should call the functions to set the swiper according to the x-coordinate of the keydown and ArrowRight event", () => {
            const event = {
                type: "keydown",
                key: "ArrowRight",
                clientX: 750
            };

            state.layerSwiper.valueX = 750;
            state.layerSwiper.isMoving = true;

            actions.moveSwiper({state, commit, dispatch, getters}, event);

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args).to.eql(["setLayerSwiperValueX", 755]);
            expect(commit.secondCall.args).to.eql(["setLayerSwiperStyleLeft", 755]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateMap"]);
        });
        it("should call the functions to set the swiper according to the x-coordinate of the mousemove event", () => {
            const event = {
                type: "mousemove",
                clientX: 800
            };

            state.layerSwiper.valueX = 750;
            state.layerSwiper.isMoving = true;

            actions.moveSwiper({state, commit, dispatch, getters}, event);

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args).to.eql(["setLayerSwiperValueX", 800]);
            expect(commit.secondCall.args).to.eql(["setLayerSwiperStyleLeft", 800]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateMap"]);
        });
    });

    describe("windowWidthChanged", () => {
        beforeEach(() => {
            state.timeSlider.currentLayerId = "123";
        });

        it("should call the mutation to set the windowWidth", () => {
            actions.windowWidthChanged({commit, dispatch, state, getters});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setWindowWidth"]);
        });
        it("should set the windowWidth and toggle the swiper if conditional is met", () => {
            state.layerSwiper.active = true;

            actions.windowWidthChanged({commit, dispatch, state, getters});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setWindowWidth"]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["toggleSwiper", "123_secondLayer"]);
        });
    });
});
