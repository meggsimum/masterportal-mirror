import highlightFeaturesByAttribute from "../../highlightFeaturesByAttribute.js";
import {expect} from "chai";
import sinon from "sinon";
import {Polygon, LineString} from "ol/geom.js";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import {Style} from "ol/style.js";
import handleAxiosError from "../../utils/handleAxiosError.js";

describe("api/highlightFeaturesByAttribute", () => {
    const expectedEqualToOGC = `<ogc:PropertyIsEqualTo matchCase='false' wildCard='%' singleChar='#' escapeChar='!'>
                <ogc:PropertyName>app:DS_USER_CODE</ogc:PropertyName>
                <ogc:Literal>X5555X</ogc:Literal>
            </ogc:PropertyIsEqualTo>`,
        expectedIsLikeOGC = `<ogc:PropertyIsLike matchCase='false' wildCard='%' singleChar='#' escapeChar='!'>
                <ogc:PropertyName>app:DS_USER_CODE</ogc:PropertyName>
                <ogc:Literal>%X5555X%</ogc:Literal>
            </ogc:PropertyIsLike>`,
        expectedWFSQueryEqualTo = `<?xml version='1.0' encoding='UTF-8'?>
            <wfs:GetFeature service='WFS' xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml' xmlns:app='http://www.deegree.org/app' traverseXlinkDepth='*' version='1.1.0'>
                <wfs:Query typeName='app:AK19G.P_TIERARTEN_INVASIV'>
                    <ogc:Filter>
                        ${expectedEqualToOGC}
                    </ogc:Filter>
                </wfs:Query>
            </wfs:GetFeature>`,
        expectedWFSQueryIsLike = `<?xml version='1.0' encoding='UTF-8'?>
            <wfs:GetFeature service='WFS' xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml' xmlns:app='http://www.deegree.org/app' traverseXlinkDepth='*' version='1.1.0'>
                <wfs:Query typeName='app:AK19G.P_TIERARTEN_INVASIV'>
                    <ogc:Filter>
                        ${expectedIsLikeOGC}
                    </ogc:Filter>
                </wfs:Query>
            </wfs:GetFeature>`;


    describe("getOGCFilterSnippet for isEqual", () => {
        it("should return isEqual XML Snippet", function () {
            const wildCard = "%",
                singleChar = "#",
                escapeChar = "!",
                propPrefix = "app:",
                propName = "DS_USER_CODE",
                propValue = "X5555X",
                isEqual = true;

            expect(highlightFeaturesByAttribute.getOGCFilterSnippet(isEqual, wildCard, singleChar, escapeChar, propPrefix, propName, propValue)).to.have.string(expectedEqualToOGC);
        });
    });

    describe("getOGCFilterSnippet for isLike", () => {
        it("should return isLike XML Snippet", function () {
            const wildCard = "%",
                singleChar = "#",
                escapeChar = "!",
                propPrefix = "app:",
                propName = "DS_USER_CODE",
                propValue = "X5555X",
                isEqual = false;

            expect(highlightFeaturesByAttribute.getOGCFilterSnippet(isEqual, wildCard, singleChar, escapeChar, propPrefix, propName, propValue)).to.have.string(expectedIsLikeOGC);
        });
    });

    describe("getWFSQuery for P_TIERARTEN_INVASIV", () => {
        it("should return full query Snippet for equalTo", function () {
            const featureType = "app:AK19G.P_TIERARTEN_INVASIV",
                version = "1.1.0";

            expect(highlightFeaturesByAttribute.getWFSQuery(featureType, version, expectedEqualToOGC)).to.have.string(expectedWFSQueryEqualTo);
        });

        it("should return full query Snippet for isLike", function () {
            const featureType = "app:AK19G.P_TIERARTEN_INVASIV",
                version = "1.1.0";

            expect(highlightFeaturesByAttribute.getWFSQuery(featureType, version, expectedIsLikeOGC)).to.have.string(expectedWFSQueryIsLike);
        });
    });

    describe("createLayer", () => {
        it("createVectorLayer shall create an ol.VectorLayer with source and style", function () {
            const styleId = "defaultHighlightFeaturesPoint",
                layerId = "highlight_point_layer",
                layerName = "highlight features point layer",
                gfiAttributes = "showAll",
                vectorLayer = highlightFeaturesByAttribute.createVectorLayer(styleId, layerId, layerName, gfiAttributes);

            expect(vectorLayer).to.be.an.instanceof(VectorLayer);
            expect(vectorLayer.getSource()).to.be.an.instanceof(VectorSource);
            expect(vectorLayer.get("id")).to.be.equals(layerId);
            expect(vectorLayer.get("name")).to.be.equals(layerName);
        });
    });

    describe("highlight(Point/Polygon/LineString)Feature", () => {
        let request, highlightVector;

        after(function () {
            sinon.restore();
            sinon.resetHistory();
        });

        beforeEach(function () {
            request = sinon.stub(Radio, "request").callsFake(function (channel, topic) {
                if (channel === "StyleList" && topic === "returnModelById") {
                    return {
                        has () {
                            return true;
                        },
                        get (key) {
                            if (key === "layerSource") {
                                return {
                                    getFeatures () {
                                        return [];
                                    }
                                };
                            }
                            if (key === "typ") {
                                return "WFS";
                            }
                            return false;
                        },
                        createStyle: sinon.stub()
                    };
                }

                return null;
            });
            highlightVector = new VectorLayer({
                source: new VectorSource(),
                style: new Style()
            });
            sinon.stub(highlightFeaturesByAttribute, "createVectorLayer").returns(highlightVector);
        });

        afterEach(function () {
            sinon.restore();
            sinon.stub().resetHistory();
        });

        it("should call returnModelById and return 2 features for Points", async () => {
            const layer = {
                    id: "123",
                    gfiAttributes: "showAll"
                },
                features = [
                    {
                        id: "456",
                        getGeometry: () => sinon.spy({
                            getType: () => "Point",
                            getCoordinates: () => [100, 100]
                        }),
                        getProperties: () => []
                    },
                    {
                        id: "789",
                        getGeometry: () => sinon.spy({
                            getType: () => "Point",
                            getCoordinates: () => [150, 150]
                        }),
                        getProperties: () => []
                    }
                ],
                dispatch = sinon.spy();

            highlightFeaturesByAttribute.highlightPointFeature("defaultHighlightFeaturesPoint", "highlight_point_layer", "highlightPoint", layer.gfiAttributes, features, dispatch);
            expect(request.calledOnce).to.be.true;
            expect(request.firstCall.args).to.deep.equals(["StyleList", "returnModelById", "defaultHighlightFeaturesPoint"]);
            expect(await highlightVector.getSource().getFeatures()).to.be.an("array").with.lengthOf(2);
        });

        it("should call returnModelById and return 2 features for Polygons", async () => {
            const layer = {
                    id: "012",
                    gfiAttributes: "showAll"
                },
                features = [
                    {
                        id: "123",
                        getGeometry: () => new Polygon([[[565086.1948534324, 5934664.461947621], [565657.6945448224, 5934738.54524095], [565625.9445619675, 5934357.545446689], [565234.3614400891, 5934346.962119071], [565086.1948534324, 5934664.461947621]]]),
                        getProperties: () => []
                    },
                    {
                        id: "456",
                        getGeometry: () => new Polygon([[[565086.1948534324, 5934664.461947621], [565657.6945448224, 5934738.54524095], [565625.9445619675, 5934357.545446689], [565234.3614400891, 5934346.962119071], [565086.1948534324, 5934664.461947621]]]),
                        getProperties: () => []
                    }
                ],
                dispatch = sinon.spy();

            highlightFeaturesByAttribute.highlightLineOrPolygonFeature("defaultHighlightFeaturesPolygon", "highlight_polygon_layer", "highlightPolygon", "Polygon", layer.gfiAttributes, features, dispatch);
            expect(request.calledOnce).to.be.true;
            expect(request.firstCall.args).to.deep.equals(["StyleList", "returnModelById", "defaultHighlightFeaturesPolygon"]);
            expect(await highlightVector.getSource().getFeatures()).to.be.an("array").with.lengthOf(2);
        });

        it("should call returnModelById and return 2 features for Lines", async () => {
            const layer = {
                    id: "012",
                    gfiAttributes: "showAll"
                },
                features = [
                    {
                        id: "123",
                        getGeometry: () => new LineString([[0, 0], [1000, 0]]),
                        getProperties: () => []
                    },
                    {
                        id: "456",
                        getGeometry: () => new LineString([[0, 0], [1000, 0]]),
                        getProperties: () => []
                    }
                ],
                dispatch = sinon.spy();

            highlightFeaturesByAttribute.highlightLineOrPolygonFeature("defaultHighlightFeaturesLine", "highlight_line_layer", "highlightLine", "LineString", layer.gfiAttributes, features, dispatch);
            expect(request.calledOnce).to.be.true;
            expect(request.firstCall.args).to.deep.equals(["StyleList", "returnModelById", "defaultHighlightFeaturesLine"]);
            expect(await highlightVector.getSource().getFeatures()).to.be.an("array").with.lengthOf(2);
        });
    });

    describe("configHasErrors", () => {
        let layer = {
                id: "123",
                gfiAttributes: "showAll",
                url: "https://testurl.de",
                wildCard: "%",
                escapeChar: "!",
                singleChar: "#"
            },
            spyErrorHandling,
            error;
        const wfsId = "123";

        beforeEach(function () {
            error = sinon.spy();
            sinon.stub(console, "error").callsFake(error);
            spyErrorHandling = sinon.spy(handleAxiosError, "handleAxiosError");
        });

        afterEach(function () {
            sinon.restore();
            spyErrorHandling.restore();
        });

        it("configHasErrors should return false", () => {
            expect(highlightFeaturesByAttribute.configHasErrors(layer, wfsId)).to.be.false;
        });

        it("configHasErrors should return true when url is not given", () => {
            layer = {
                id: "123",
                gfiAttributes: "showAll",
                wildCard: "%",
                escapeChar: "!",
                singleChar: "#"
            };

            expect(highlightFeaturesByAttribute.configHasErrors(layer, wfsId)).to.be.true;
            expect(console.error.calledOnce).to.be.true;
        });

        it("configHasErrors should return true when wildCard is not given", () => {
            layer = {
                id: "123",
                gfiAttributes: "showAll",
                url: "https://testurl.de",
                escapeChar: "!",
                singleChar: "#"
            };

            expect(highlightFeaturesByAttribute.configHasErrors(layer, wfsId)).to.be.true;
            expect(console.error.calledOnce).to.be.true;
        });

        it("configHasErrors should return true when wildCard is too long", () => {
            layer = {
                id: "123",
                gfiAttributes: "showAll",
                url: "https://testurl.de",
                wildCard: "%%",
                escapeChar: "!",
                singleChar: "#"
            };

            expect(highlightFeaturesByAttribute.configHasErrors(layer, wfsId)).to.be.true;
            expect(console.error.calledOnce).to.be.true;
        });

        it("configHasErrors should return true when escapeChar is not given", () => {
            layer = {
                id: "123",
                gfiAttributes: "showAll",
                url: "https://testurl.de",
                wildCard: "%",
                singleChar: "#"
            };

            expect(highlightFeaturesByAttribute.configHasErrors(layer, wfsId)).to.be.true;
            expect(console.error.calledOnce).to.be.true;
        });

        it("configHasErrors should return true when escapeChar is too long", () => {
            layer = {
                id: "123",
                gfiAttributes: "showAll",
                url: "https://testurl.de",
                wildCard: "%",
                escapeChar: "!!",
                singleChar: "#"
            };

            expect(highlightFeaturesByAttribute.configHasErrors(layer, wfsId)).to.be.true;
            expect(console.error.calledOnce).to.be.true;
        });

        it("configHasErrors should return true when singleChar is not given", () => {
            layer = {
                id: "123",
                gfiAttributes: "showAll",
                url: "https://testurl.de",
                wildCard: "%",
                escapeChar: "!"
            };

            expect(highlightFeaturesByAttribute.configHasErrors(layer, wfsId)).to.be.true;
            expect(console.error.calledOnce).to.be.true;
        });

        it("configHasErrors should return true when singleChar is too long", () => {
            layer = {
                id: "123",
                gfiAttributes: "showAll",
                url: "https://testurl.de",
                wildCard: "%",
                escapeChar: "!",
                singleChar: "##"
            };

            expect(highlightFeaturesByAttribute.configHasErrors(layer, wfsId)).to.be.true;
            expect(console.error.calledOnce).to.be.true;
        });
    });
});
