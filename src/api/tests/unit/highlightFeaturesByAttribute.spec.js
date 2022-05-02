import highlightFeaturesByAttribute from "../../highlightFeaturesByAttribute.js";
import {expect} from "chai";

describe("api/highlightFeaturesByAttribute", () => {
    describe("getOGCFilterSnippet", () => {
        const expectedOutput = "<ogc:PropertyIsEqualTo matchCase='false' wildCard='*' singleChar='#' escapeChar='!'>" +
                                "<ogc:PropertyName>app:DS_USER_CODE</ogc:PropertyName>" +
                                "<ogc:Literal>X5555X</ogc:Literal>" +
                                "</ogc:PropertyIsEqualTo>";

        it("should return isEqual XML Snippet", function () {
            const wildCard = "%",
                singleChar = "#",
                escapeChar = "!",
                propPrefix = "app:",
                propName = "DS_USER_CODE",
                propValue = "X5555X",
                isEqual = true;

            expect(highlightFeaturesByAttribute.getOGCFilterSnippet(isEqual, wildCard, singleChar, escapeChar, propPrefix, propName, propValue)).to.have.string(expectedOutput);
        });
    });
});
