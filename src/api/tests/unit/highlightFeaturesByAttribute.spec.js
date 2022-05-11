import highlightFeaturesByAttribute from "../../highlightFeaturesByAttribute.js";
import {expect} from "chai";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";

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
});
