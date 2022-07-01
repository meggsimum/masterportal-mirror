import axios from "axios";
import {expect} from "chai";
import sinon from "sinon";
import {getLayerList} from "@masterportal/masterportalapi/src/rawLayerList";
import VectorLayer from "ol/layer/Vector";
import actions from "../../../../zoomTo/store/actionsZoomTo";

const fs = require("fs"),
    exampleFeatureCollection = fs.readFileSync("./src/utils/tests/unit/zoomTo/resources/featureCollection.xml", "utf8"),
    districtFeatures = fs.readFileSync("./src/utils/tests/unit/zoomTo/resources/districtFeatures.xml", "utf8"),
    idDistrictLayer = "1692",
    id = "someId";

/**
 * Fakes the return of a successful axios get request.
 *
 * @returns {Promise<{data: string, status: number}>} Status code and a FeatureCollection in XML.
 */
function axiosFake () {
    return new Promise(resolve => resolve({status: 200, statusText: "OK", data: exampleFeatureCollection}));
}
/**
 * Fakes the return of a successful axios district get request.
 *
 * @returns {Promise<{data: string, status: number}>} Status code and a FeatureCollection in XML.
 */
function axiosDistrictFake () {
    return new Promise(resolve => resolve({status: 200, statusText: "OK", data: districtFeatures}));
}

describe("src/utils/zoomTo/store/actionsZoomTo.js", () => {
    describe("zoomToFeatures", () => {
        let consoleErrorSpy,
            consoleWarnSpy,
            dispatch,
            getters,
            requestSpy,
            state;

        beforeEach(() => {
            consoleErrorSpy = sinon.spy();
            consoleWarnSpy = sinon.spy();
            dispatch = sinon.spy();
            requestSpy = sinon.spy();
            sinon.stub(Radio, "request").callsFake(requestSpy);
            sinon.stub(console, "error").callsFake(consoleErrorSpy);
            sinon.stub(console, "warn").callsFake(consoleWarnSpy);
            getters = {
                config: {},
                deprecatedParameters: false
            };
            state = {};
            getLayerList().push({id, url: "", version: "", featureType: ""});
            getLayerList().push({id: idDistrictLayer, url: "", version: "", featureType: ""});
        });
        afterEach(() => {
            sinon.restore();
            getLayerList().length = 0;
        });
        // NOTE: The following 5 tests should be removed in v3.0.0
        it("should log an error and return if a deprecated configuration parameter is used and a zoomToFeature url parameter is used without valid configuration", () => {
            sinon.stub(axios, "get").callsFake(axiosFake);
            getters.deprecatedParameters = true;
            state.zoomToFeatureId = "something";
            actions.zoomToFeatures({state, getters, dispatch})
                .catch(error => {
                    expect(consoleWarnSpy.calledOnce).to.be.true;
                    expect(consoleWarnSpy.firstCall.args.length).to.equal(1);
                    expect(consoleWarnSpy.firstCall.args[0]).to.equal("zoomTo: A deprecated configuration was found. Using it, until it gets removed...");
                    expect(error).to.equal("zoomTo: A mismatch between url parameters and configuration occurred.");
                });
        });
        it("should log an error and return if a deprecated configuration parameter is used and a zoomToGeometry url parameter is used without valid configuration", () => {
            sinon.stub(axios, "get").callsFake(axiosFake);
            getters.deprecatedParameters = true;
            state.zoomToGeometry = "something";
            actions.zoomToFeatures({state, getters, dispatch})
                .catch(error => {
                    expect(consoleWarnSpy.calledOnce).to.be.true;
                    expect(consoleWarnSpy.firstCall.args.length).to.equal(1);
                    expect(consoleWarnSpy.firstCall.args[0]).to.equal("zoomTo: A deprecated configuration was found. Using it, until it gets removed...");
                    expect(error).to.equal("zoomTo: A mismatch between url parameters and configuration occurred.");
                });
        });
        it("should zoom to district, if zoomToGeometry is a number", async () => {
            sinon.stub(axios, "get").callsFake(axiosDistrictFake);
            getters.config = [{
                id: "zoomToGeometry",
                layerId: "1692",
                property: "bezirk_name",
                allowedValues: [
                    "ALTONA",
                    "HARBURG",
                    "HAMBURG-NORD",
                    "BERGEDORF",
                    "EIMSBÜTTEL",
                    "HAMBURG-MITTE",
                    "WANDSBEK"
                ]
            }];
            state.zoomToGeometry = "1";
            await actions.zoomToFeatures({state, getters, dispatch});

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(3);
            expect(dispatch.firstCall.args[0]).to.equal("Maps/addLayer");
            expect(dispatch.firstCall.args[1] instanceof VectorLayer).to.be.true;
            expect(dispatch.firstCall.args[1].getSource().getFeatures().length).to.equal(1);
            expect(dispatch.firstCall.args[2]).to.eql({root: true});
            expect(dispatch.secondCall.args.length).to.equal(3);
            expect(dispatch.secondCall.args[0]).to.equal("Maps/zoomToExtent");
            expect(dispatch.secondCall.args[1] instanceof Object).to.be.true;
            expect(Object.prototype.hasOwnProperty.call(dispatch.secondCall.args[1], "extent")).to.be.true;
            expect(dispatch.secondCall.args[1].extent.length).to.equal(4);
            expect(dispatch.secondCall.args[1].extent.every(val => typeof val === "number")).to.be.true;
            expect(dispatch.secondCall.args[2]).to.eql({root: true});

        });
        it("should throw and log an error if an error occurs when trying to fetch features from the service", async () => {
            sinon.stub(axios, "get").callsFake(axiosFake);
            getters.deprecatedParameters = true;
            getters.config.zoomToFeature = {
                wfsId: id,
                attribute: "flaechenid",
                styleId: "stylish"
            };
            state.zoomToFeatureId = [18, 26];
            // NOTE: These sinon functions are needed here again to be able to add new behaviour to the axios.get method
            sinon.restore();
            sinon.stub(axios, "get").callsFake(() => new Promise((_, reject) => reject("Custom testing error!")));
            sinon.stub(console, "error").callsFake(consoleErrorSpy);
            sinon.stub(console, "warn").callsFake(consoleWarnSpy);
            await actions.zoomToFeatures({state, getters, dispatch});

            expect(consoleWarnSpy.calledOnce).to.be.true;
            expect(consoleWarnSpy.firstCall.args.length).to.equal(1);
            expect(consoleWarnSpy.firstCall.args[0]).to.equal("zoomTo: A deprecated configuration was found. Using it, until it gets removed...");
            expect(consoleErrorSpy.calledOnce).to.be.true;
            expect(consoleErrorSpy.firstCall.args.length).to.equal(2);
            expect(consoleErrorSpy.firstCall.args).to.eql(["zoomTo: An error occurred while trying to fetch features from the given service.", "Custom testing error!"]);
        });
        it("should fetch features and call respective vuex store functions if a correct (but deprecated) configuration and url parameter match for zoomToFeature is provided", async () => {
            sinon.stub(axios, "get").callsFake(axiosFake);
            getters.deprecatedParameters = true;
            getters.config.zoomToFeature = {
                wfsId: id,
                attribute: "flaechenid",
                styleId: "stylish"
            };
            state.zoomToFeatureId = [18, 26];
            await actions.zoomToFeatures({state, getters, dispatch});

            expect(consoleWarnSpy.calledOnce).to.be.true;
            expect(consoleWarnSpy.firstCall.args.length).to.equal(1);
            expect(consoleWarnSpy.firstCall.args[0]).to.equal("zoomTo: A deprecated configuration was found. Using it, until it gets removed...");
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(3);
            expect(dispatch.firstCall.args[0]).to.equal("Maps/addLayer");
            expect(dispatch.firstCall.args[1] instanceof VectorLayer).to.be.true;
            expect(dispatch.firstCall.args[1].getSource().getFeatures().length).to.equal(2);
            expect(dispatch.firstCall.args[2]).to.eql({root: true});
            expect(dispatch.secondCall.args.length).to.equal(3);
            expect(dispatch.secondCall.args[0]).to.equal("Maps/zoomToExtent");
            expect(dispatch.secondCall.args[1] instanceof Object).to.be.true;
            expect(Object.prototype.hasOwnProperty.call(dispatch.secondCall.args[1], "extent")).to.be.true;
            expect(dispatch.secondCall.args[1].extent.length).to.equal(4);
            expect(dispatch.secondCall.args[1].extent.every(val => typeof val === "number")).to.be.true;
            expect(dispatch.secondCall.args[2]).to.eql({root: true});
        });
        it("should fetch features and call respective vuex store functions if a correct (but deprecated) configuration and url parameter match for zoomToFeature is provided; not adding the features to the map as a new layer through config parameter", async () => {
            sinon.stub(axios, "get").callsFake(axiosFake);
            getters.deprecatedParameters = true;
            getters.config.zoomToFeature = {
                wfsId: id,
                attribute: "flaechenid",
                styleId: "stylish",
                addFeatures: false
            };
            state.zoomToFeatureId = [18, 26];
            await actions.zoomToFeatures({state, getters, dispatch});

            expect(consoleWarnSpy.calledOnce).to.be.true;
            expect(consoleWarnSpy.firstCall.args.length).to.equal(1);
            expect(consoleWarnSpy.firstCall.args[0]).to.equal("zoomTo: A deprecated configuration was found. Using it, until it gets removed...");
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(3);
            expect(dispatch.firstCall.args[0]).to.equal("Maps/zoomToExtent");
            expect(dispatch.firstCall.args[1] instanceof Object).to.be.true;
            expect(Object.prototype.hasOwnProperty.call(dispatch.firstCall.args[1], "extent")).to.be.true;
            expect(dispatch.firstCall.args[1].extent.length).to.equal(4);
            expect(dispatch.firstCall.args[1].extent.every(val => typeof val === "number")).to.be.true;
            expect(dispatch.firstCall.args[2]).to.eql({root: true});
        });
        it("should fetch features and call respective vuex store functions if a correct (but deprecated) configuration and url parameter match for zoomToGeometry is provided", async () => {
            sinon.stub(axios, "get").callsFake(axiosFake);
            getters.deprecatedParameters = true;
            getters.config.zoomToGeometry = {
                layerId: id,
                property: "flaechenid",
                allowedValues: [18, 26, 42]
            };
            state.zoomToGeometry = "18,25";
            await actions.zoomToFeatures({state, getters, dispatch});

            expect(consoleWarnSpy.calledOnce).to.be.true;
            expect(consoleWarnSpy.firstCall.args.length).to.equal(1);
            expect(consoleWarnSpy.firstCall.args[0]).to.equal("zoomTo: A deprecated configuration was found. Using it, until it gets removed...");
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(3);
            expect(dispatch.firstCall.args[0]).to.equal("Maps/addLayer");
            expect(dispatch.firstCall.args[1] instanceof VectorLayer).to.be.true;
            expect(dispatch.firstCall.args[2]).to.eql({root: true});
            expect(dispatch.secondCall.args.length).to.equal(3);
            expect(dispatch.secondCall.args[0]).to.equal("Maps/zoomToExtent");
            expect(dispatch.secondCall.args[1] instanceof Object).to.be.true;
            expect(Object.prototype.hasOwnProperty.call(dispatch.secondCall.args[1], "extent")).to.be.true;
            expect(dispatch.secondCall.args[1].extent.length).to.equal(4);
            expect(dispatch.secondCall.args[1].extent.every(val => typeof val === "number")).to.be.true;
            expect(dispatch.secondCall.args[2]).to.eql({root: true});
        });

        it("should should resolve with a reason if a config is given but no url parameter", () => {
            sinon.stub(axios, "get").callsFake(axiosFake);
            getters.config = [{id: "zoomToFeatureId"}];
            actions.zoomToFeatures({state, getters, dispatch})
                .then(reason => {
                    expect(consoleWarnSpy.notCalled).to.be.true;
                    expect(consoleErrorSpy.notCalled).to.be.true;
                    expect(reason).to.equal("zoomTo: No url parameters were given by the user.");
                });
        });
        it("should throw an error and dispatch an alert if an error occurs while fetching the features", async () => {
            sinon.stub(axios, "get").callsFake(axiosFake);
            getters.config = [{
                id: "zoomToGeometry",
                layerId: id,
                property: "flaechenid",
                allowedValues: [18, 26, 42]
            }];
            state.zoomToGeometry = "18,25";
            // NOTE: These sinon functions are needed here again to be able to add new behaviour to the axios.get method
            sinon.restore();
            sinon.stub(axios, "get").callsFake(() => new Promise((_, reject) => reject("Custom testing error!")));
            sinon.stub(console, "error").callsFake(consoleErrorSpy);
            sinon.stub(console, "warn").callsFake(consoleWarnSpy);
            await actions.zoomToFeatures({state, getters, dispatch});

            expect(consoleErrorSpy.notCalled).to.be.true;
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(3);
            expect(dispatch.firstCall.args).to.eql(["Alerting/addSingleAlert", "Custom testing error!", {root: true}]);
            expect(consoleWarnSpy.calledOnce).to.be.true;
            expect(consoleWarnSpy.firstCall.args.length).to.equal(1);
            expect(consoleWarnSpy.firstCall.args[0]).to.equal("zoomTo: No features were found for the given layer.");
        });
        it("should add features to the map for one working config (zoomToFeatureId) and dispatch an alert for a configuration with an invalid id if both are present", async () => {
            sinon.stub(axios, "get").callsFake(axiosFake);
            getters.config = [{id: "somethingWrong"}, {
                id: "zoomToFeatureId",
                layerId: id,
                property: "flaechenid",
                styleId: "stylish"
            }];
            state.somethingWrong = "values";
            state.zoomToFeatureId = [18, 26];
            await actions.zoomToFeatures({state, getters, dispatch});

            expect(consoleWarnSpy.notCalled).to.be.true;
            expect(consoleErrorSpy.notCalled).to.be.true;
            expect(dispatch.calledThrice).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(3);
            expect(dispatch.firstCall.args[0]).to.equal("Maps/addLayer");
            expect(dispatch.firstCall.args[1] instanceof VectorLayer).to.be.true;
            expect(dispatch.firstCall.args[1].getSource().getFeatures().length).to.equal(2);
            expect(dispatch.firstCall.args[2]).to.eql({root: true});
            expect(dispatch.secondCall.args.length).to.equal(3);
            expect(dispatch.secondCall.args).to.eql(["Alerting/addSingleAlert", "utils.parametricURL.zoomTo", {root: true}]);
            expect(dispatch.thirdCall.args.length).to.equal(3);
            expect(dispatch.thirdCall.args[0]).to.equal("Maps/zoomToExtent");
            expect(dispatch.thirdCall.args[1] instanceof Object).to.be.true;
            expect(Object.prototype.hasOwnProperty.call(dispatch.thirdCall.args[1], "extent")).to.be.true;
            expect(dispatch.thirdCall.args[1].extent.length).to.equal(4);
            expect(dispatch.thirdCall.args[1].extent.every(val => typeof val === "number")).to.be.true;
            expect(dispatch.thirdCall.args[2]).to.eql({root: true});
            expect(requestSpy.calledTwice).to.be.true;
            expect(requestSpy.firstCall.args.length).to.equal(3);
            expect(requestSpy.firstCall.args).to.eql(["StyleList", "returnModelById", "stylish"]);
            expect(requestSpy.secondCall.args.length).to.equal(3);
            expect(requestSpy.secondCall.args).to.eql(["StyleList", "returnModelById", "stylish"]);
        });
        it("should add features to the map for one config of zoomToFeatureId", async () => {
            sinon.stub(axios, "get").callsFake(axiosFake);
            getters.config = [{
                id: "zoomToFeatureId",
                layerId: id,
                property: "flaechenid",
                styleId: "stylish"
            }];
            state.zoomToFeatureId = [18, 26];
            await actions.zoomToFeatures({state, getters, dispatch});

            expect(consoleWarnSpy.notCalled).to.be.true;
            expect(consoleErrorSpy.notCalled).to.be.true;
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(3);
            expect(dispatch.firstCall.args[0]).to.equal("Maps/addLayer");
            expect(dispatch.firstCall.args[1] instanceof VectorLayer).to.be.true;
            expect(dispatch.firstCall.args[1].getSource().getFeatures().length).to.equal(2);
            expect(dispatch.firstCall.args[2]).to.eql({root: true});
            expect(dispatch.secondCall.args.length).to.equal(3);
            expect(dispatch.secondCall.args[0]).to.equal("Maps/zoomToExtent");
            expect(dispatch.secondCall.args[1] instanceof Object).to.be.true;
            expect(Object.prototype.hasOwnProperty.call(dispatch.secondCall.args[1], "extent")).to.be.true;
            expect(dispatch.secondCall.args[1].extent.length).to.equal(4);
            expect(dispatch.secondCall.args[1].extent.every(val => typeof val === "number")).to.be.true;
            expect(dispatch.secondCall.args[2]).to.eql({root: true});
            expect(requestSpy.calledTwice).to.be.true;
            expect(requestSpy.firstCall.args.length).to.equal(3);
            expect(requestSpy.firstCall.args).to.eql(["StyleList", "returnModelById", "stylish"]);
            expect(requestSpy.secondCall.args.length).to.equal(3);
            expect(requestSpy.secondCall.args).to.eql(["StyleList", "returnModelById", "stylish"]);
        });
        it("should zoom to the feature extent but not add the features for one config of zoomToFeatureId with addFeatures set to false", async () => {
            sinon.stub(axios, "get").callsFake(axiosFake);
            getters.config = [{
                id: "zoomToFeatureId",
                layerId: id,
                property: "flaechenid",
                styleId: "stylish",
                addFeatures: false
            }];
            state.zoomToFeatureId = [18, 26];
            await actions.zoomToFeatures({state, getters, dispatch});

            expect(consoleWarnSpy.notCalled).to.be.true;
            expect(consoleErrorSpy.notCalled).to.be.true;
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(3);
            expect(dispatch.firstCall.args[0]).to.equal("Maps/zoomToExtent");
            expect(dispatch.firstCall.args[1] instanceof Object).to.be.true;
            expect(Object.prototype.hasOwnProperty.call(dispatch.firstCall.args[1], "extent")).to.be.true;
            expect(dispatch.firstCall.args[1].extent.length).to.equal(4);
            expect(dispatch.firstCall.args[1].extent.every(val => typeof val === "number")).to.be.true;
            expect(dispatch.firstCall.args[2]).to.eql({root: true});
            expect(requestSpy.calledTwice).to.be.true;
            expect(requestSpy.firstCall.args.length).to.equal(3);
            expect(requestSpy.firstCall.args).to.eql(["StyleList", "returnModelById", "stylish"]);
            expect(requestSpy.secondCall.args.length).to.equal(3);
            expect(requestSpy.secondCall.args).to.eql(["StyleList", "returnModelById", "stylish"]);
        });
        it("should add features to the map for one config of zoomToGeometry", async () => {
            sinon.stub(axios, "get").callsFake(axiosFake);
            getters.config = [{
                id: "zoomToGeometry",
                layerId: id,
                property: "flaechenid",
                allowedValues: [18, 26, 42]
            }];
            state.zoomToGeometry = "18,25";
            await actions.zoomToFeatures({state, getters, dispatch});

            expect(consoleWarnSpy.notCalled).to.be.true;
            expect(consoleErrorSpy.notCalled).to.be.true;
            expect(requestSpy.notCalled).to.be.true;
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(3);
            expect(dispatch.firstCall.args[0]).to.equal("Maps/addLayer");
            expect(dispatch.firstCall.args[1] instanceof VectorLayer).to.be.true;
            expect(dispatch.firstCall.args[1].getSource().getFeatures().length).to.equal(1);
            expect(dispatch.firstCall.args[2]).to.eql({root: true});
            expect(dispatch.secondCall.args.length).to.equal(3);
            expect(dispatch.secondCall.args[0]).to.equal("Maps/zoomToExtent");
            expect(dispatch.secondCall.args[1] instanceof Object).to.be.true;
            expect(Object.prototype.hasOwnProperty.call(dispatch.secondCall.args[1], "extent")).to.be.true;
            expect(dispatch.secondCall.args[1].extent.length).to.equal(4);
            expect(dispatch.secondCall.args[1].extent.every(val => typeof val === "number")).to.be.true;
            expect(dispatch.secondCall.args[2]).to.eql({root: true});
        });
        it("should zoom to the feature extent but not add the features for one config of zoomToGeometry with addFeatures set to false", async () => {
            sinon.stub(axios, "get").callsFake(axiosFake);
            getters.config = [{
                id: "zoomToGeometry",
                layerId: id,
                property: "flaechenid",
                allowedValues: [18, 26, 42],
                addFeatures: false
            }];
            state.zoomToGeometry = "18,25";
            await actions.zoomToFeatures({state, getters, dispatch});

            expect(consoleWarnSpy.notCalled).to.be.true;
            expect(consoleErrorSpy.notCalled).to.be.true;
            expect(requestSpy.notCalled).to.be.true;
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(3);
            expect(dispatch.firstCall.args[0]).to.equal("Maps/zoomToExtent");
            expect(dispatch.firstCall.args[1] instanceof Object).to.be.true;
            expect(Object.prototype.hasOwnProperty.call(dispatch.firstCall.args[1], "extent")).to.be.true;
            expect(dispatch.firstCall.args[1].extent.length).to.equal(4);
            expect(dispatch.firstCall.args[1].extent.every(val => typeof val === "number")).to.be.true;
            expect(dispatch.firstCall.args[2]).to.eql({root: true});
        });
        it("should add features to the map for one config of zoomToFeatureId and one of zoomToGeometry", async () => {
            sinon.stub(axios, "get").callsFake(axiosFake);
            getters.config = [
                {
                    id: "zoomToFeatureId",
                    layerId: id,
                    property: "flaechenid",
                    styleId: "stylish"
                },
                {
                    id: "zoomToGeometry",
                    layerId: id,
                    property: "flaechenid",
                    allowedValues: [18, 26, 42]
                }
            ];
            state.zoomToFeatureId = [18];
            state.zoomToGeometry = "24,42";
            await actions.zoomToFeatures({state, getters, dispatch});

            expect(consoleWarnSpy.notCalled).to.be.true;
            expect(consoleErrorSpy.notCalled).to.be.true;
            expect(dispatch.calledThrice).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(3);
            expect(dispatch.firstCall.args[0]).to.equal("Maps/addLayer");
            expect(dispatch.firstCall.args[1] instanceof VectorLayer).to.be.true;
            expect(dispatch.firstCall.args[1].getSource().getFeatures().length).to.equal(1);
            expect(dispatch.firstCall.args[2]).to.eql({root: true});
            expect(dispatch.secondCall.args.length).to.equal(3);
            expect(dispatch.secondCall.args[0]).to.equal("Maps/addLayer");
            expect(dispatch.secondCall.args[1] instanceof VectorLayer).to.be.true;
            expect(dispatch.secondCall.args[1].getSource().getFeatures().length).to.equal(1);
            expect(dispatch.secondCall.args[2]).to.eql({root: true});
            expect(dispatch.thirdCall.args.length).to.equal(3);
            expect(dispatch.thirdCall.args[0]).to.equal("Maps/zoomToExtent");
            expect(dispatch.thirdCall.args[1] instanceof Object).to.be.true;
            expect(Object.prototype.hasOwnProperty.call(dispatch.thirdCall.args[1], "extent")).to.be.true;
            expect(dispatch.thirdCall.args[1].extent.length).to.equal(4);
            expect(dispatch.thirdCall.args[1].extent.every(val => typeof val === "number")).to.be.true;
            expect(dispatch.thirdCall.args[2]).to.eql({root: true});
            expect(requestSpy.calledTwice).to.be.true;
            expect(requestSpy.firstCall.args.length).to.equal(3);
            expect(requestSpy.firstCall.args).to.eql(["StyleList", "returnModelById", "stylish"]);
            expect(requestSpy.secondCall.args.length).to.equal(3);
            expect(requestSpy.secondCall.args).to.eql(["StyleList", "returnModelById", "stylish"]);
        });
    });
});
