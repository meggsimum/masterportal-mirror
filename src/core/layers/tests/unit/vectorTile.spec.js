import VectorTile from "../../vectorTile.js";

import {expect} from "chai";
import sinon from "sinon";
import axios from "axios";

import {crs} from "@masterportal/masterportalapi";

import * as stylefunction from "ol-mapbox-style/dist/stylefunction";

import store from "../../../../app-store";

const vtStyles = [
        {name: "Layer One", id: "l1"},
        {name: "Layer Two", id: "l2"}
    ],
    vtStylesDefaultL2 = [
        {name: "Layer One", id: "l1"},
        {name: "Layer Two", id: "l2", defaultStyle: true}
    ],
    attrs = {
        epsg: "EPSG:3857",
        extent: [902186.6748764697, 7054472.604709217, 1161598.3542590786, 7175683.411718197],
        gfiAttributes: "showAll",
        gfiTheme: "default",
        id: "911",
        name: "InsideJob",
        origin: [-20037508.342787, 20037508.342787],
        resolutions: [78271.51696401172, 305.7481131406708, 152.8740565703354, 76.4370282851677, 2.3886571339114906],
        styleId: "999962",
        tileSize: 512,
        transparency: 0,
        typ: "VectorTile",
        url: "https://doesthisurlexist.de/vt/tiles/esri/Test_VT_3857/p12/tile/{z}/{y}/{x}.pbf",
        vtStyles: [
            {name: "Layer One", id: "l1"},
            {name: "Layer Two", id: "l2"}
        ]
    },
    // minimal VectorLayer config defined in services.json.md
    requiredAttrs = {
        gfiAttributes: "showAll",
        gfiTheme: "default",
        id: "911",
        maxScale: "1000000",
        minScale: "0",
        name: "Foobar",
        typ: "VectorTile",
        url: "https://doesthisurlexist.de/vt/tiles/esri/Test_VT_3857/p12/tile/{z}/{y}/{x}.pbf"

    };

describe("core/modelList/layer/vectorTile", function () {
    afterEach(sinon.restore);

    beforeEach(() => crs.registerProjections());

    describe("vector tile layer config", function () {

        it("should create a layer with minimal config", function () {
            const mapStub = sinon.stub(store, "getters");

            mapStub.value({"Map/projection": {getCode: () => {
                return "EPSG:25832";
            }}});

            // eslint-disable-next-line one-var
            const vtLayer = new VectorTile(requiredAttrs),
                layer = vtLayer.get("layer"),
                source = layer.getSource();


            expect(vtLayer.get("gfiAttributes")).to.equal("showAll");
            expect(vtLayer.get("gfiTheme")).to.equal("default");
            expect(vtLayer.get("id")).to.equal("911");
            expect(vtLayer.get("minScale")).to.equal("0");
            expect(vtLayer.get("maxScale")).to.equal("1000000");

            expect(layer.get("id")).to.equal("911");
            expect(layer.get("name")).to.equal("Foobar");

            expect(source.getUrls()[0]).to.equal("https://doesthisurlexist.de/vt/tiles/esri/Test_VT_3857/p12/tile/{z}/{y}/{x}.pbf");
        });

        it("should apply in services.json.md defined defaults", function () {
            const mapStub = sinon.stub(store, "getters");

            mapStub.value({"Map/projection": {getCode: () => {
                return "EPSG:25382";
            }}});

            // eslint-disable-next-line one-var
            const defaultValues = { // defaults defined in services.json.md
                    zDirection: 1,
                    epsg: "EPSG:25832", // default value from config.json.md/MapView. Should be the default CRS
                    extent: [ // If not set, the portal's coordinate reference system's extent is used
                        -1877994.66,
                        3932281.56,
                        836715.13,
                        9440581.95
                    ],
                    origin: [ // if not set, the portal's coordinate reference system's top-left corner is used.
                        -1877994.66,
                        836715.13
                    ],
                    resolutions: [ // If not used, the portal's resolutions are used. (Missing default resolution definition? used default resolutions from masterportal-api)
                        66.14579761460263,
                        26.458319045841044,
                        15.874991427504629,
                        10.583327618336419,
                        5.2916638091682096,
                        2.6458319045841048,
                        1.3229159522920524,
                        0.6614579761460262,
                        0.2645831904584105,
                        0.13229159522920522
                    ],
                    tileSize: 512,
                    layerAttribution: "nicht vorhanden",
                    transparency: 0,
                    visibility: false,
                    useProxy: false
                },
                vtLayer = new VectorTile(requiredAttrs),
                layer = vtLayer.get("layer"),
                source = layer.getSource(),
                tileGrid = source.getTileGrid();


            expect(vtLayer.get("useProxy")).to.be.false;
            expect(vtLayer.get("layerAttribution")).to.be.undefined;

            expect(layer.getOpacity()).to.equal(1);
            expect(layer.getVisible()).to.be.false;

            expect(source.zDirection).to.equal(defaultValues.zDirection);
            expect(source.getProjection().getCode()).to.equal(defaultValues.epsg);
            expect(source.getAttributions()).to.be.null;

            // Note: this should be the extent of the projection but is the extent of EPSG:3857
            //       this is because in masterportalAPI is no definition of the extent of the
            //       default projection which is EPSG:25832
            expect(tileGrid.getExtent()).to.deep.equal([
                -20015077.371242613,
                -20015077.371242613,
                20015077.371242613,
                20015077.371242613
            ]);
            // Note: this should be the top left corner of the projection extent but is top left
            //       corner of extent of EPSG:3857 this is because in masterportalAPI is no
            //       definition of the extent of the default projection which is EPSG:25832
            expect(tileGrid.getOrigin()).to.deep.equal([
                -20015077.371242613,
                20015077.371242613
            ]);
            expect(tileGrid.getResolutions()).to.deep.equal(defaultValues.resolutions);
            expect(tileGrid.getTileSize()).to.deep.equal(new Array(2).fill(defaultValues.tileSize));
        });

        it("should apply given attributes correct", function () {
            const mapStub = sinon.stub(store, "getters");

            mapStub.value({"Map/projection": {getCode: () => {
                return "EPSG:3857";
            }}});

            // eslint-disable-next-line one-var
            const vtLayer = new VectorTile(attrs),
                layer = vtLayer.get("layer"),
                source = layer.getSource(),
                tileGrid = source.getTileGrid();

            expect(vtLayer.get("useProxy")).to.be.false;
            expect(vtLayer.get("layerAttribution")).to.be.undefined;
            expect(vtLayer.get("gfiAttributes")).to.equal(attrs.gfiAttributes);
            expect(vtLayer.get("gfiTheme")).to.equal(attrs.gfiTheme);
            expect(vtLayer.get("id")).to.equal(attrs.id);
            expect(vtLayer.get("name")).to.equal(attrs.name);
            expect(vtLayer.get("styleId")).to.equal(attrs.styleId);
            expect(vtLayer.get("selectedStyleID")).to.equal(attrs.styleId);
            expect(vtLayer.get("vtStyles")).to.deep.equal(attrs.vtStyles);

            expect(layer.get("id")).to.equal(attrs.id);
            expect(layer.get("name")).to.equal(attrs.name);
            expect(layer.getOpacity()).to.equal(1);
            expect(layer.getVisible()).to.be.false;

            expect(source.zDirection).to.equal(1);
            expect(source.getProjection().getCode()).to.equal("EPSG:3857");
            expect(source.getAttributions()).to.be.null;

            expect(tileGrid.getExtent()).to.deep.equal([
                902186.6748764697,
                7054472.604709217,
                1161598.3542590786,
                7175683.411718197
            ]);
            expect(tileGrid.getOrigin()).to.deep.equal([
                -20037508.342787,
                20037508.342787
            ]);
            expect(tileGrid.getResolutions()).to.deep.equal([
                78271.51696401172,
                305.7481131406708,
                152.8740565703354,
                76.4370282851677,
                2.3886571339114906
            ]);
            expect(tileGrid.getTileSize()).to.deep.equal([512, 512]);
        });
    });

    describe("isStyleValid", function () {
        it("returns true only if required fields all exist", function () {
            const {isStyleValid} = VectorTile.prototype;

            expect(isStyleValid(undefined)).to.be.false;
            expect(isStyleValid({})).to.be.false;
            expect(isStyleValid({version: 4})).to.be.false;
            expect(isStyleValid({layers: []})).to.be.false;
            expect(isStyleValid({sources: []})).to.be.false;
            expect(isStyleValid({version: 3, layers: [], sources: {}})).to.be.true;
        });
    });

    describe("setStyleById", function () {
        /* eslint-disable-next-line require-jsdoc */
        function makeContext () {
            return {
                get: key => ({vtStyles})[key],
                setStyleByDefinition: sinon.spy(() => Symbol.for("Promise"))
            };
        }

        it("finds a style definition by id and uses setStyleByDefinition with it", function () {
            const {setStyleById} = VectorTile.prototype,
                context = makeContext(),
                returnValue = setStyleById.call(context, "l2");

            expect(context.setStyleByDefinition.calledOnce).to.be.true;
            expect(context.setStyleByDefinition.calledWith(vtStyles[1])).to.be.true;
            expect(returnValue).to.equal(Symbol.for("Promise"));
        });

        it("returns rejecting Promise if key not found", function (done) {
            const {setStyleById} = VectorTile.prototype,
                context = makeContext(),
                returnValue = setStyleById.call(context, "l3");
            let caught = false;

            expect(context.setStyleByDefinition.notCalled).to.be.true;
            returnValue
            // expect rejection
                .catch(() => {
                    caught = true;
                })
                .finally(() => {
                    expect(caught).to.be.true;
                    done();
                })
            // forward if falsely not rejected
                .catch(err => done(err));
        });
    });

    describe("setStyleByDefinition", function () {
    /* in case there ever exists a global fetch during testing,
     * it is swapped here - just in case ... */
        let fetch = null;

        beforeEach(function () {
            fetch = global.fetch;
        });

        afterEach(function () {
            sinon.restore();
            global.fetch = fetch;
        });

        const validStyle = {
                version: 8,
                layers: [],
                sources: {}
            },
            invalidStyle = {
                version: 8,
                sources: {}
            };

        /**
     * @param {function} done mocha callback done
     * @returns {object} mock context for setStyleById
     */
        function makeContext (done) {
            return {
                isStyleValid: VectorTile.prototype.isStyleValid,
                get: key => ({layer: Symbol.for("layer")})[key],
                set: sinon.spy((key, value) => {
                    expect(stylefunction.default.calledOnce).to.be.true;
                    expect(stylefunction.default.calledWith(
                        Symbol.for("layer"), validStyle, undefined
                    )).to.be.true;

                    expect(key).to.equal("selectedStyleID");
                    expect(value).to.equal("l0");

                    done();
                })
            };
        }

        it("retrieves json from url, checks it, and sets id to layer and model", function (done) {
            sinon.stub(stylefunction, "default");
            global.fetch = sinon.spy(() => new Promise(r => r({
                json: () => new Promise(ir => ir(validStyle))
            })));

            const {setStyleByDefinition} = VectorTile.prototype,
                context = makeContext(done);

            setStyleByDefinition.call(context, {id: "l0", url: "example.com/root.json"})
                .catch(() => done());
        });

        it("rejects invalid json", function (done) {
            sinon.stub(stylefunction, "default");
            global.fetch = sinon.spy(() => new Promise(r => r({
                json: () => new Promise(ir => ir(invalidStyle))
            })));

            const {setStyleByDefinition} = VectorTile.prototype,
                context = makeContext(done);

            setStyleByDefinition
                .call(context, {id: "l0", url: "example.com/root.json"})
                .catch(() => done());
        });
    });

    describe("setConfiguredLayerStyle", function () {
    /**
     * @param {object} params parameter object
     * @param {?object} params.styleId style id from config.json
     * @param {?string} params.givenVtStyles style set from services.json to use
     * @param {function} params.done to be called finally
     * @returns {object} mock context for setStyleById
     */
        function makeContext ({styleId, givenVtStyles, done}) {
            return {
                isStyleValid: VectorTile.prototype.isStyleValid,
                get: key => ({
                    styleId,
                    isSelected: Symbol.for("visibility"),
                    vtStyles: givenVtStyles
                })[key],
                set: sinon.spy(),
                setStyleById: sinon.spy(() => new Promise(r => r())),
                setStyleByDefinition: sinon.spy(() => new Promise(r => r())),
                layer: {
                    setVisible: sinon.spy(v => {
                        expect(v).to.equal(Symbol.for("visibility"));
                        done();
                    })
                }
            };
        }

        beforeEach(() => {
            sinon.stub(console, "warn").callsFake(sinon.stub());
        });
    
        afterEach(() => {
            console.warn.restore();
            sinon.restore();
        });

        it("uses config.json style first", function (done) {
            const context = makeContext({styleId: "lConfigJson", givenVtStyles: vtStylesDefaultL2, done}),
                {set} = context;

            VectorTile.prototype.setConfiguredLayerStyle.call(context);

            expect(set.calledOnce).to.be.true;
            expect(set.calledWith("selectedStyleID", "lConfigJson")).to.be.true;
        });

        it("uses services.json default style second", function (done) {
            const context = makeContext({givenVtStyles: vtStylesDefaultL2, done}),
                {set, setStyleByDefinition} = context;

            VectorTile.prototype.setConfiguredLayerStyle.call(context);

            expect(set.calledOnce).to.be.true;
            expect(set.calledWith("selectedStyleID", "l2")).to.be.true;
            expect(setStyleByDefinition.calledOnce).to.be.true;
            expect(setStyleByDefinition.calledWith(vtStylesDefaultL2[1])).to.be.true;
        });

        it("uses services.json first style third", function (done) {
            const context = makeContext({givenVtStyles: vtStyles, done}),
                {set, setStyleByDefinition} = context;

            VectorTile.prototype.setConfiguredLayerStyle.call(context);

            expect(set.calledOnce).to.be.true;
            expect(set.calledWith("selectedStyleID", "l1")).to.be.true;
            expect(setStyleByDefinition.calledOnce).to.be.true;
            expect(setStyleByDefinition.calledWith(vtStyles[0])).to.be.true;
        });

        it("does not apply any style else and warns in console", function () {
            const context = makeContext({givenVtStyles: []}),
                {set, setStyleById, setStyleByDefinition} = context;

            VectorTile.prototype.setConfiguredLayerStyle.call(context);

            expect(set.notCalled).to.be.true;
            expect(setStyleById.notCalled).to.be.true;
            expect(setStyleByDefinition.notCalled).to.be.true;
            expect(console.warn.calledOnce).to.be.true;
        });
    });

    describe("addMpFonts", function () {

        it("returns Masterportal italic font if style is italic", function () {
            const italicFont1 = "Font italic",
                italicFont2 = "Font Italic",
                italicFont3 = "Fontitalic",
                returnedItalicFont1 = VectorTile.prototype.addMpFonts(italicFont1),
                returnedItalicFont2 = VectorTile.prototype.addMpFonts(italicFont2),
                returnedItalicFont3 = VectorTile.prototype.addMpFonts(italicFont3);

            expect(returnedItalicFont1).to.equal("MasterPortalFont Italic");
            expect(returnedItalicFont2).to.equal("MasterPortalFont Italic");
            expect(returnedItalicFont3).to.equal("MasterPortalFont Italic");
        });

        it("returns Masterportal bold font if style is bold", function () {
            const boldFont1 = "Font bold",
                boldFont2 = "Font Bold",
                boldFont3 = "Fontbold",
                returnedBoldFont1 = VectorTile.prototype.addMpFonts(boldFont1),
                returnedBoldFont2 = VectorTile.prototype.addMpFonts(boldFont2),
                returnedBoldFont3 = VectorTile.prototype.addMpFonts(boldFont3);

            expect(returnedBoldFont1).to.equal("MasterPortalFont Bold");
            expect(returnedBoldFont2).to.equal("MasterPortalFont Bold");
            expect(returnedBoldFont3).to.equal("MasterPortalFont Bold");
        });

        it("returns Masterportal font if style is not bold or italic", function () {
            const Font1 = "Font",
                Font2 = "Font Regular",
                Font3 = "Font Extra",
                returnedFont1 = VectorTile.prototype.addMpFonts(Font1),
                returnedFont2 = VectorTile.prototype.addMpFonts(Font2),
                returnedFont3 = VectorTile.prototype.addMpFonts(Font3);

            expect(returnedFont1).to.equal("MasterPortalFont");
            expect(returnedFont2).to.equal("MasterPortalFont");
            expect(returnedFont3).to.equal("MasterPortalFont");
        });
    });

    describe("fetchSpriteData", function () {
        /** @returns {object} mock context for setStyleById */
        function makeContext () {
            return {
                get: key => ({
                    useProxy: false
                })[key]
            };
        }
        it("Creates a VectorTileLayer", async function () {

            const url = "https://testemich.de/vt/tiles/esri/Test_VT_3857/p12/resources/sprites/sprite.json",
                context = makeContext(),
                resp = {
                    config: {transitional: {}, transformRequest: Array(1), transformResponse: Array(1), timeout: 0},
                    data: {},
                    headers: {},
                    request: {onreadystatechange: null, readyState: 4, timeout: 0, withCredentials: false, upload: XMLHttpRequestUpload},
                    status: 200,
                    statusText: "OK"
                },
                axiosMock = sinon.stub(axios, "get").resolves(Promise.resolve(resp));

            await VectorTile.prototype.fetchSpriteData.call(context, url);
            expect(axiosMock.calledOnce).to.be.true;
        });
    });

    describe("createLegendURL", function () {
        /** @returns {object} mock context for setStyleById */
        function makeContext () {
            return {
                setLegendURL: sinon.spy(() => Symbol.for("Promise"))
            };
        }
        it("sets the legend URL", function () {
            const context = makeContext();

            VectorTile.prototype.createLegendURL.call(context);
            expect(context.setLegendURL.calledOnce).to.be.true;
        });
    });
});
