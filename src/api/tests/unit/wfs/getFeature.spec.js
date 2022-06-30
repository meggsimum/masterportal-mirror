import {expect} from "chai";
import {getFeatureGET, getFeaturePOST} from "../../../wfs/getFeature.js";

describe("src/api/wfs/js", () => {
    describe("getFeatureGET", () => {
        it("should throw an error if the first parameter is not a string", () => {
            expect(() => getFeatureGET(undefined)).to.throw();
            expect(() => getFeatureGET(null)).to.throw();
            expect(() => getFeatureGET(1234)).to.throw();
            expect(() => getFeatureGET(true)).to.throw();
            expect(() => getFeatureGET(false)).to.throw();
            expect(() => getFeatureGET([])).to.throw();
            expect(() => getFeatureGET({})).to.throw();
        });
        it("should throw an error if the second parameter is not an object", () => {
            expect(() => getFeatureGET("url", undefined)).to.throw();
            expect(() => getFeatureGET("url", null)).to.throw();
            expect(() => getFeatureGET("url", 1234)).to.throw();
            expect(() => getFeatureGET("url", "string")).to.throw();
            expect(() => getFeatureGET("url", 1234)).to.throw();
            expect(() => getFeatureGET("url", false)).to.throw();
            expect(() => getFeatureGET("url", [])).to.throw();
        });
        it("should throw an error if the second parameter is an object without a version as string", () => {
            expect(() => getFeatureGET("url", {})).to.throw();
            expect(() => getFeatureGET("url", {version: undefined})).to.throw();
            expect(() => getFeatureGET("url", {version: null})).to.throw();
            expect(() => getFeatureGET("url", {version: 1234})).to.throw();
            expect(() => getFeatureGET("url", {version: true})).to.throw();
            expect(() => getFeatureGET("url", {version: false})).to.throw();
            expect(() => getFeatureGET("url", {version: []})).to.throw();
            expect(() => getFeatureGET("url", {version: {}})).to.throw();
        });
        it("should throw an error if the second parameter is an object without featureType as string or array", () => {
            expect(() => getFeatureGET("url", {version: "version", featureType: undefined})).to.throw();
            expect(() => getFeatureGET("url", {version: "version", featureType: null})).to.throw();
            expect(() => getFeatureGET("url", {version: "version", featureType: 1234})).to.throw();
            expect(() => getFeatureGET("url", {version: "version", featureType: true})).to.throw();
            expect(() => getFeatureGET("url", {version: "version", featureType: false})).to.throw();
            expect(() => getFeatureGET("url", {version: "version", featureType: {}})).to.throw();
        });
        it("should not throw an error but stick it to the third parameter if third parameter is a function", () => {
            let lastError = null;

            expect(() => getFeatureGET(undefined, undefined, error => {
                lastError = error;
            })).to.not.throw();
            expect(lastError).to.be.an.instanceOf(Error);
        });
    });

    describe("getFeaturePOST", () => {
        it("should throw an error if the first parameter is not a string", () => {
            expect(() => getFeaturePOST(undefined)).to.throw();
            expect(() => getFeaturePOST(null)).to.throw();
            expect(() => getFeaturePOST(1234)).to.throw();
            expect(() => getFeaturePOST(true)).to.throw();
            expect(() => getFeaturePOST(false)).to.throw();
            expect(() => getFeaturePOST([])).to.throw();
            expect(() => getFeaturePOST({})).to.throw();
        });
        it("should throw an error if the second parameter is not an object", () => {
            expect(() => getFeaturePOST("url", undefined)).to.throw();
            expect(() => getFeaturePOST("url", null)).to.throw();
            expect(() => getFeaturePOST("url", 1234)).to.throw();
            expect(() => getFeaturePOST("url", "string")).to.throw();
            expect(() => getFeaturePOST("url", 1234)).to.throw();
            expect(() => getFeaturePOST("url", false)).to.throw();
            expect(() => getFeaturePOST("url", [])).to.throw();
        });
        it("should throw an error if the second parameter is an object without featureType as string or array", () => {
            expect(() => getFeaturePOST("url", {featureTypes: undefined})).to.throw();
            expect(() => getFeaturePOST("url", {featureTypes: null})).to.throw();
            expect(() => getFeaturePOST("url", {featureTypes: 1234})).to.throw();
            expect(() => getFeaturePOST("url", {featureTypes: true})).to.throw();
            expect(() => getFeaturePOST("url", {featureTypes: false})).to.throw();
            expect(() => getFeaturePOST("url", {featureTypes: {}})).to.throw();
        });
        it("should not throw an error but stick it to the third parameter if third parameter is a function", () => {
            let lastError = null;

            expect(() => getFeaturePOST(undefined, undefined, error => {
                lastError = error;
            })).to.not.throw();
            expect(lastError).to.be.an.instanceOf(Error);
        });
    });
});
