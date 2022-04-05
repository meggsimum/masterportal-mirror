import {expect} from "chai";
import {
    fetchAllOafPropertiesRecursionHelper,
    getNextLinkFromFeatureCollection,
    getUniqueValuesFromFetchedFeatures,
    getMinMaxFromFetchedFeatures
} from "../../../utils/fetchAllOafProperties.js";

describe("src/modules/tools/filterGeneral/utils/fetchAllOafProperties.js", () => {
    describe("getMinMaxFromFetchedFeatures", () => {
        it("should return false if allFetchedProperties is not an array", () => {
            expect(getMinMaxFromFetchedFeatures(undefined)).to.be.false;
            expect(getMinMaxFromFetchedFeatures(null)).to.be.false;
            expect(getMinMaxFromFetchedFeatures("string")).to.be.false;
            expect(getMinMaxFromFetchedFeatures(1234)).to.be.false;
            expect(getMinMaxFromFetchedFeatures(true)).to.be.false;
            expect(getMinMaxFromFetchedFeatures(false)).to.be.false;
            expect(getMinMaxFromFetchedFeatures({})).to.be.false;
        });
        it("should return an object with min and max false if an empty array is given", () => {
            expect(getMinMaxFromFetchedFeatures([])).to.deep.equal({min: false, max: false});
        });
        it("should return only min if minOnly is set to true and maxOnly is set to false", () => {
            expect(getMinMaxFromFetchedFeatures([], "attrName", true, false)).to.deep.equal({min: false});
        });
        it("should return only max if minOnly is set to false and maxOnly is set to true", () => {
            expect(getMinMaxFromFetchedFeatures([], "attrName", false, true)).to.deep.equal({max: false});
        });
        it("should ignore any properties that are no objects", () => {
            expect(getMinMaxFromFetchedFeatures([undefined, null, "string", 1234, true, false, []], "attrName", false, false)).to.deep.equal({min: false, max: false});
        });
        it("should ignore any properties that are objects without the given attribute name", () => {
            expect(getMinMaxFromFetchedFeatures([{}, {attr: true}], "attrName", false, false)).to.deep.equal({min: false, max: false});
        });
        it("should ignore any properties where attrName is null or undefined", () => {
            expect(getMinMaxFromFetchedFeatures([{attrName: null}, {attrName: undefined}], "attrName", false, false)).to.deep.equal({min: false, max: false});
        });
        it("should return the expected min and max value from the given properties", () => {
            const properties = [
                    {attrName: 0},
                    {attrName: 10},
                    {attrName: -10},
                    {attrName: 20},
                    {attrName: -20},
                    {attrName: 100},
                    {attrName: -100}
                ],
                expected = {
                    min: -100,
                    max: 100
                };

            expect(getMinMaxFromFetchedFeatures(properties, "attrName", false, false)).to.deep.equal(expected);
        });
    });
    describe("getUniqueValuesFromFetchedFeatures", () => {
        it("should return false if allFetchedProperties is not an array", () => {
            expect(getUniqueValuesFromFetchedFeatures(undefined)).to.be.false;
            expect(getUniqueValuesFromFetchedFeatures(null)).to.be.false;
            expect(getUniqueValuesFromFetchedFeatures("string")).to.be.false;
            expect(getUniqueValuesFromFetchedFeatures(1234)).to.be.false;
            expect(getUniqueValuesFromFetchedFeatures(true)).to.be.false;
            expect(getUniqueValuesFromFetchedFeatures(false)).to.be.false;
            expect(getUniqueValuesFromFetchedFeatures({})).to.be.false;
        });
        it("should return an empty array if the given properties are not objects", () => {
            expect(getUniqueValuesFromFetchedFeatures([undefined, null, "string", 1234, true, false, []], "attrName")).to.be.an("array").and.to.be.empty;
        });
        it("should ignore any properties that are objects without the given attribute name", () => {
            expect(getUniqueValuesFromFetchedFeatures([{}, {attr: true}], "attrName")).to.be.an("array").and.to.be.empty;
        });
        it("should return a unique list of the properties where the key is the expected attribute name", () => {
            const properties = [
                    {attrName: "valueB"},
                    {attrName: "valueA"},
                    {attrName: "valueA"},
                    {attrName: "valueA"},
                    {attrName: "valueC"},
                    {attrName: "valueA"},
                    {attrName: "valueB"},
                    {attrName: "valueB"},
                    {attrName: "valueC"},
                    {attrName: "valueA"}
                ],
                expected = [
                    "valueB",
                    "valueA",
                    "valueC"
                ];

            expect(getUniqueValuesFromFetchedFeatures(properties, "attrName")).to.deep.equal(expected);
        });
    });
    describe("getNextLinkFromFeatureCollection", () => {
        it("should return false if featureCollection is not an object", () => {
            expect(getNextLinkFromFeatureCollection(undefined)).to.be.false;
            expect(getNextLinkFromFeatureCollection(null)).to.be.false;
            expect(getNextLinkFromFeatureCollection([])).to.be.false;
            expect(getNextLinkFromFeatureCollection("string")).to.be.false;
            expect(getNextLinkFromFeatureCollection(1234)).to.be.false;
            expect(getNextLinkFromFeatureCollection(true)).to.be.false;
            expect(getNextLinkFromFeatureCollection(false)).to.be.false;
        });
        it("should return false if featureCollection.links is not an array", () => {
            expect(getNextLinkFromFeatureCollection({})).to.be.false;
            expect(getNextLinkFromFeatureCollection({links: null})).to.be.false;
            expect(getNextLinkFromFeatureCollection({links: undefined})).to.be.false;
            expect(getNextLinkFromFeatureCollection({links: ""})).to.be.false;
            expect(getNextLinkFromFeatureCollection({links: "string"})).to.be.false;
            expect(getNextLinkFromFeatureCollection({links: 1234})).to.be.false;
            expect(getNextLinkFromFeatureCollection({links: true})).to.be.false;
            expect(getNextLinkFromFeatureCollection({links: false})).to.be.false;
            expect(getNextLinkFromFeatureCollection({links: {}})).to.be.false;
        });
        it("should return false if featureCollection.links contains no objects", () => {
            expect(getNextLinkFromFeatureCollection({links: [undefined, null, "string", 1234, true, false, []]})).to.be.false;
        });
        it("should return false if featureCollection.links are objects but href is not a string", () => {
            expect(getNextLinkFromFeatureCollection({links: [
                {href: undefined},
                {href: null},
                {href: []},
                {href: {}},
                {href: 1234},
                {href: true},
                {href: false}
            ]})).to.be.false;
        });
        it("should return false if featureCollection.links are objects with href string but title doesn't equal 'next page'", () => {
            expect(getNextLinkFromFeatureCollection({links: [{href: "string", title: "this is not a next page"}]})).to.be.false;
        });
        it("should return href if featureCollection.links are objects with href string and one of the titles equals 'next page'", () => {
            expect(getNextLinkFromFeatureCollection({links: [
                {href: "hrefA", title: "this is not a next page"},
                {href: "hrefB", title: "this is not a next page"},
                {href: "hrefC", title: "this is not a next page"},
                {href: "hrefD", title: "next page"},
                {href: "hrefE", title: "this is not a next page"}
            ]})).to.equal("hrefD");
        });
    });
    describe("fetchAllOafPropertiesRecursionHelper", () => {
        it("should call the given axios object with the expected configuration", async () => {
            let lastConfig = false,
                lastError = false;

            await fetchAllOafPropertiesRecursionHelper("result", "url", "onsuccess", error => {
                lastError = error;
            }, config => {
                lastConfig = config;
                return new Promise(resolve => {
                    resolve();
                });
            });

            expect(lastError).to.be.an.instanceof(Error);
            expect(lastConfig).to.deep.equal({
                method: "get",
                url: "url",
                headers: {
                    accept: "application/geo+json"
                }
            });
        });
    });
});
