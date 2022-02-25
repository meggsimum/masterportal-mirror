import {expect} from "chai";
import sinon from "sinon";
import {doSpecialBackboneHandling, handleUrlParamsBeforeVueMount, translateToBackbone, updateQueryStringParam} from "../../../parametricUrl/ParametricUrlBridge";
import store from "../../../../app-store";


describe("src/utils/parametricUrl/ParametricUrlBridge.js", () => {
    const originLocation = location,
        originWindow = window;

    before(() => {
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });
    /**
     * Resets global.window and global.location to inital content.
     * @returns {void}
     */
    function afterUpdateQueryStringParam () {
        global.window = originWindow;
        global.location = originLocation;
    }
    /**
     * Sets global variables for test.
     * @returns {void}
     */
    async function beforeUpdateQueryStringParam () {
        let state = {query: "foo"};

        global.window = {navigator: {userAgent: "test"}};
        global.window.top = global.window;
        global.window.history = {
            state: state,
            replaceState: (stateObj, title, url) => {
                state = stateObj;
                if (location.search !== "") {
                    location.search = location.search + "&" + url.substring(url.indexOf("?") + 1);
                }
                else {
                    location.search = url.substring(url.indexOf("?"));
                }

            }};
        global.location = {
            search: "",
            protocol: "https:",
            host: "localhost:8080",
            pathname: "/foo"
        };
        global.window.location = location;
        await updateQueryStringParam("key", "value");
    }
    afterEach(sinon.restore);

    describe("updateQueryStringParam", function () {
        it("should be a string", async function () {
            beforeUpdateQueryStringParam();
            expect(location.search).to.be.a("string");
            afterUpdateQueryStringParam();
        });
        it("should be a string with one key value pair", async function () {
            beforeUpdateQueryStringParam();
            expect(location.search).to.equal("?key=value");
            expect(store.state.urlParams.key).to.equal("value");
            afterUpdateQueryStringParam();
        });
        it("should be a string with two key value pairs", async function () {
            beforeUpdateQueryStringParam();
            await updateQueryStringParam("newKey", "newValue");
            expect(location.search).to.equal("?key=value&newKey=newValue");
            expect(store.state.urlParams.key).to.equal("value");
            expect(store.state.urlParams.newKey).to.equal("newValue");
            afterUpdateQueryStringParam();
        });
        it("should be updated the first key value pair", async function () {
            beforeUpdateQueryStringParam();
            await updateQueryStringParam("key", "der_beste_String_aller_Zeiten");
            expect(location.search).to.include("key=der_beste_String_aller_Zeiten");
            expect(store.state.urlParams.key).to.equal("der_beste_String_aller_Zeiten");
            expect(store.state.urlParams.newKey).to.equal("newValue");
            afterUpdateQueryStringParam();
        });

    });

    describe("handleUrlParamsBeforeVueMount", function () {
        it("test url param key query", () => {
            const value = "Neuenfelder Straße,19";
            let query = "?query=Neuenfelder%20Stra%C3%9Fe,19";

            handleUrlParamsBeforeVueMount(query);
            expect(store.state.urlParams["Search/query"]).to.be.equals(value);

            store.state.urlParams["Search/query"] = null;
            query = "?Search/query=Neuenfelder%20Stra%C3%9Fe,19";
            handleUrlParamsBeforeVueMount(query);
            expect(store.state.urlParams["Search/query"]).to.be.equals(value);
        });
        it("test url param key map/layerids", () => {
            let query = "?layerids=123,456";
            const value = [{
                "id": "123",
                "transparency": 0,
                "visibility": true
            },
            {
                "id": "456",
                "transparency": 0,
                "visibility": true
            }];

            handleUrlParamsBeforeVueMount(query);
            expect(store.state.urlParams["Map/layerIds"]).to.be.deep.equals(value);

            store.state.urlParams["Map/layerIds"] = null;
            query = "?layerids=123,456";
            handleUrlParamsBeforeVueMount(query);
            expect(store.state.urlParams["Map/layerIds"]).to.be.deep.equals(value);
        });
    });
    describe("translateToBackbone", function () {
        it("test url param key containing tools", () => {
            const value = "true";
            let key = "tools/draw/active",
                result = translateToBackbone(key, value);

            expect(result).to.be.deep.equals({key: "isinitopen", value: "draw"});

            key = "tools/draw";
            result = translateToBackbone(key, value);
            expect(result).to.be.deep.equals({key: "isinitopen", value: "draw"});

            key = "draw/active";
            result = translateToBackbone(key, value);
            expect(result).to.be.deep.equals({key: "isinitopen", value: "draw"});
        });
    });
    describe("doSpecialBackboneHandling", function () {
        it("test url param key 'Map/mapMode'", () => {
            const radioTrigger = sinon.spy(Radio, "trigger"),
                key = "Map/mapMode";

            doSpecialBackboneHandling(key, "3D");
            expect(radioTrigger.calledOnceWithExactly("Map", "mapChangeTo3d")).to.be.true;
        });
        it("test url param key 'Map/mdId'", () => {
            const radioTrigger = sinon.stub(Radio, "trigger").callsFake(),
                baseLayer = {
                    id: "idBaseLayer",
                    setIsSelected: sinon.stub()
                },
                layer = {
                    id: "idLayer",
                    setIsSelected: sinon.stub()
                },
                key = "Map/mdId",
                value = "6E28E698-F4FA-4231-A8C5-CC44441FF2A7";
            let getItemsByMetaIDCallCount = 0,
                metaIdAsParam = false;

            sinon.stub(Radio, "request").callsFake((...args) => {
                let ret = null;

                args.forEach(arg => {
                    if (arg === value) {
                        metaIdAsParam = true;
                    }
                    if (arg === "getItemsByAttributes") {
                        ret = [baseLayer];
                    }
                    else if (arg === "getModelByAttributes") {
                        ret = layer;
                    }
                    else if (arg === "getItemsByMetaID") {
                        getItemsByMetaIDCallCount++;
                        ret = [layer];
                    }
                });
                return ret;
            });
            doSpecialBackboneHandling(key, value);
            expect(radioTrigger.calledWithExactly("Util", "refreshTree")).to.be.true;
            expect(getItemsByMetaIDCallCount).to.be.equals(1);
            expect(metaIdAsParam).to.be.true;
        });
        it("test url param key 'Map/zoomToExtent'", () => {
            store.state.urlParams.projection = undefined;
            store.state.Map.projection = undefined;
            const radioTrigger = sinon.spy(Radio, "trigger"),
                key = "Map/zoomToExtent",
                value = [510000, 5850000, 625000, 6000000],
                valueAsString = value.join(",");

            doSpecialBackboneHandling(key, valueAsString);
            expect(radioTrigger.calledOnceWithExactly("Map", "zoomToProjExtent", {
                extent: value,
                options: {duration: 0},
                projection: undefined
            })).to.be.true;
        });
        it("test url param key 'Map/zoomToGeometry'", () => {
            const radioTrigger = sinon.spy(Radio, "trigger"),
                key = "Map/zoomToGeometry",
                value = "bergedorf";

            doSpecialBackboneHandling(key, value);
            expect(radioTrigger.calledOnceWithExactly("ZoomToGeometry", "zoomToGeometry", "BERGEDORF", Config.zoomToGeometry.layerId, Config.zoomToGeometry.attribute)).to.be.true;
        });
        it("test url param key 'style'", () => {
            const radioTrigger = sinon.spy(Radio, "trigger"),
                key = "style",
                value = "simple";

            doSpecialBackboneHandling(key, value);
            expect(radioTrigger.calledOnceWithExactly("Util", "setUiStyle", value.toUpperCase())).to.be.true;
        });
    });
});
