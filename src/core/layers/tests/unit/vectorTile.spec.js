import VectorTile from "../../vectorTile.js";
import {expect} from "chai";
import sinon from "sinon";
import axios from "axios";

import * as stylefunction from "ol-mapbox-style/dist/stylefunction";

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
        format: "image/png",
        gfiAttributes: "showAll",
        gfiTheme: "default",
        id: "911",
        level: 0,
        name: "InsideJob",
        origin: [-20037508.342787, 20037508.342787],
        resolutions: [78271.51696401172, 305.7481131406708, 152.8740565703354, 76.4370282851677, 2.3886571339114906],
        styleId: "999962",
        tileSize: 512,
        transparency: 0,
        typ: "VectorTile",
        type: "layer",
        url: "https://doesthisurlexist.de/vt/tiles/esri/Test_VT_3857/p12/tile/{z}/{y}/{x}.pbf",
        useConfigName: true,
        vtStyles: [
            {name: "Layer One", id: "l1"},
            {name: "Layer Two", id: "l2"}
        ]
    };

describe("core/modelList/layer/vectorTile", function () {
    afterEach(sinon.restore);

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
    /** @returns {object} mock context for setStyleById */
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

            sinon.stub(console, "warn");

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

    describe("createLayerSource", function () {

        /** @returns {object} mock context for setStyleById */
        function makeContext () {
            return {
                get: key => ({
                    useProxy: false,
                    url: "www.unicornsarentreal.com/vt/tiles/esri/Test_VT_3857/p12/tile/{z}/{y}/{x}.pbf",
                    resolutions: [78271.51696401172, 38.21851414258385, 19.109257071291925, 9.554628535645962, 4.777314267822981, 2.3886571339114906],
                    epsg: "EPSG:3857",
                    tileSize: 512,
                    minZoom: -100000,
                    maxZoom: 1000000
                })[key],
                createTileGrid: sinon.spy(VectorTile.prototype, "createTileGrid")
            };
        }

        it("Creates vector tile layer source", function () {
            const context = makeContext();

            VectorTile.prototype.createLayerSource.call(context, attrs);

            expect(context.createTileGrid.calledWith("EPSG:3857", attrs)).to.be.true;
        });
    });

    describe("createTileGrid", function () {

        /** @returns {object} mock context for setStyleById */
        function makeContext () {
            return {
                get: key => ({
                    resolutions: [78271.51696401172, 38.21851414258385, 19.109257071291925, 9.554628535645962, 4.777314267822981, 2.3886571339114906],
                    tileSize: 512,
                    minZoom: -100000,
                    origin: [-20037508.342787, 20037508.342787],
                    extent: [902186.6748764697, 7054472.604709217, 1161598.3542590786, 7175683.411718197]
                })[key]
            };
        }

        it("Creates a tilegrid", function () {
            const context = makeContext(),
                returnedTileGrid = VectorTile.prototype.createTileGrid.call(context, "EPSG:3857", attrs);

            expect(returnedTileGrid).to.be.not.empty;
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
