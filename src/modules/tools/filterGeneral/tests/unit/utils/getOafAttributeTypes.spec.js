import {expect} from "chai";
import {
    getOafAttributeTypes,
    getAttrTypesFromOafResponse,
    getAttrTypesFromProperties,
    getAttrTypeFromSchema,
    getAttrTypeFromRef,
    isSpecifiedOafKey
} from "../../../utils/getOafAttributeTypes.js";

describe("src/modules/tools/filterGeneral/utils/getOafAttributeTypes.js", () => {
    describe("isSpecifiedOafKey", () => {
        it("should return true if a hard coded key is recognized", () => {
            expect(isSpecifiedOafKey("limit")).to.be.true;
            expect(isSpecifiedOafKey("offset")).to.be.true;
            expect(isSpecifiedOafKey("bbox")).to.be.true;
            expect(isSpecifiedOafKey("bbox-crs")).to.be.true;
            expect(isSpecifiedOafKey("datetime")).to.be.true;
            expect(isSpecifiedOafKey("crs")).to.be.true;
            expect(isSpecifiedOafKey("f")).to.be.true;
        });
        it("should return false if anything but a recognizable key is given", () => {
            expect(isSpecifiedOafKey("unknown oaf key")).to.be.false;
        });
    });
    describe("getAttrTypeFromSchema", () => {
        it("should return an empty object if anything but an oaf schema is given", () => {
            expect(getAttrTypeFromSchema(undefined)).to.be.an("object").and.to.be.empty;
            expect(getAttrTypeFromSchema(null)).to.be.an("object").and.to.be.empty;
            expect(getAttrTypeFromSchema(1234)).to.be.an("object").and.to.be.empty;
            expect(getAttrTypeFromSchema("string")).to.be.an("object").and.to.be.empty;
            expect(getAttrTypeFromSchema(true)).to.be.an("object").and.to.be.empty;
            expect(getAttrTypeFromSchema(false)).to.be.an("object").and.to.be.empty;
            expect(getAttrTypeFromSchema([])).to.be.an("object").and.to.be.empty;
            expect(getAttrTypeFromSchema({})).to.be.an("object").and.to.be.empty;
            expect(getAttrTypeFromSchema({name: true})).to.be.an("object").and.to.be.empty;
            expect(getAttrTypeFromSchema({name: true, schema: true})).to.be.an("object").and.to.be.empty;
            expect(getAttrTypeFromSchema({name: "limit", schema: {type: true}})).to.be.an("object").and.to.be.empty;
        });
        it("should return a key value pair if an oaf schema is given", () => {
            expect(getAttrTypeFromSchema({name: "name", schema: {type: "type"}})).to.deep.equal({name: "type"});
        });
    });
    describe("getAttrTypeFromRef", () => {
        it("should return the oaf schema as key value pair", () => {
            const data = {a: {b: {c: {name: "name", schema: {type: "type"}}}}},
                path = "#/a/b/c";

            expect(getAttrTypeFromRef(data, path)).to.deep.equal({name: "type"});
        });
    });
    describe("getAttrTypesFromProperties", () => {
        it("should return an empty object if anything but an array is given", () => {
            expect(getAttrTypesFromProperties(undefined)).to.be.an("object").and.to.be.empty;
            expect(getAttrTypesFromProperties(null)).to.be.an("object").and.to.be.empty;
            expect(getAttrTypesFromProperties(1234)).to.be.an("object").and.to.be.empty;
            expect(getAttrTypesFromProperties("string")).to.be.an("object").and.to.be.empty;
            expect(getAttrTypesFromProperties(true)).to.be.an("object").and.to.be.empty;
            expect(getAttrTypesFromProperties(false)).to.be.an("object").and.to.be.empty;
            expect(getAttrTypesFromProperties({})).to.be.an("object").and.to.be.empty;
        });
        it("should return a key value list of all given schemas", () => {
            const properties = [
                    {name: "nameA", schema: {type: "typeA"}},
                    {name: "nameB", schema: {type: "typeB"}},
                    {$ref: "#/a/b/c"},
                    {name: "nameD", schema: {type: "typeD"}}
                ],
                data = {a: {b: {c: {name: "nameC", schema: {type: "typeC"}}}}};

            expect(getAttrTypesFromProperties(properties, data)).to.deep.equal({
                nameA: "typeA",
                nameB: "typeB",
                nameC: "typeC",
                nameD: "typeD"
            });
        });
    });
    describe("getAttrTypesFromOafResponse", () => {
        it("should return a key value list of all given schemas found in the response object of the collection", () => {
            let lastError = false;
            const collection = "collection",
                responseData = {
                    a: {b: {c: {name: "nameC", schema: {type: "typeC"}}}},
                    paths: {
                        "/collections/collection/items": {
                            get: {
                                parameters: [
                                    {name: "nameA", schema: {type: "typeA"}},
                                    {name: "nameB", schema: {type: "typeB"}},
                                    {$ref: "#/a/b/c"},
                                    {name: "nameD", schema: {type: "typeD"}}
                                ]
                            }
                        }
                    }
                };

            expect(getAttrTypesFromOafResponse(collection, responseData, () => {
                lastError = true;
            })).to.deep.equal({
                nameA: "typeA",
                nameB: "typeB",
                nameC: "typeC",
                nameD: "typeD"
            });
            expect(lastError).to.be.false;
        });
    });
    describe("getOafAttributeTypes", () => {
        it("should call an error if no url is given", () => {
            let lastError = false;

            getOafAttributeTypes(false, "collection", "onsuccess", error => {
                lastError = error;
            });
            expect(lastError).to.be.instanceof(Error);
        });
        it("should call an error if no collection name is given", () => {
            let lastError = false;

            getOafAttributeTypes("url", false, "onsuccess", error => {
                lastError = error;
            });
            expect(lastError).to.be.instanceof(Error);
        });
        it("should setup axios object with expected attributes", async () => {
            let lastError = false,
                lastConfig = false;

            await getOafAttributeTypes("url", "collection", "onsuccess", error => {
                lastError = error;
            }, "jsonAcceptHeader", config => new Promise(resolve => {
                lastConfig = config;
                resolve();
            }));
            expect(lastError).to.be.false;
            expect(lastConfig).to.deep.equal({
                method: "get",
                url: "url/api",
                headers: {
                    accept: "jsonAcceptHeader"
                }
            });
        });
    });
});
