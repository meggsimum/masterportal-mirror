import {expect} from "chai";
import FilterConfigConverter from "../../../utils/filterConfigConverter.js";

describe("src/module/tools/filterGeneral/utils/filterConfigConverter.js", () => {
    let converter = null;

    beforeEach(() => {
        converter = new FilterConfigConverter();
    });

    describe("constructor", () => {
        it("should be constructed with the given config", () => {
            const dummy = new FilterConfigConverter("config");

            expect(dummy.config).to.equal("config");
        });
        it("should create a clone of the given config on construction", () => {
            const config = {
                    foo: 1
                },
                dummy = new FilterConfigConverter(config),
                dummyConfig = dummy.getConfig();

            dummyConfig.foo = 2;
            expect(config.foo).to.equal(1);
            expect(dummyConfig.foo).to.equal(2);
        });
        it("should set config as empty object if the given config is recursive", () => {
            let dummy = null;
            const config = {};

            config.foo = config;
            dummy = new FilterConfigConverter(config);

            expect(dummy.getConfig()).to.be.an("object").and.to.be.empty;
        });
    });
    describe("createSnippetHidden", () => {
        it("should return false if first param is not a string", () => {
            expect(converter.createSnippetHidden(undefined)).to.be.false;
            expect(converter.createSnippetHidden(null)).to.be.false;
            expect(converter.createSnippetHidden(false)).to.be.false;
            expect(converter.createSnippetHidden(1234)).to.be.false;
            expect(converter.createSnippetHidden([])).to.be.false;
            expect(converter.createSnippetHidden({})).to.be.false;
        });
        it("should return false if first param is a string and second is not an array", () => {
            expect(converter.createSnippetHidden("string", undefined)).to.be.false;
            expect(converter.createSnippetHidden("string", null)).to.be.false;
            expect(converter.createSnippetHidden("string", false)).to.be.false;
            expect(converter.createSnippetHidden("string", 1234)).to.be.false;
            expect(converter.createSnippetHidden("string", "string")).to.be.false;
            expect(converter.createSnippetHidden("string", {})).to.be.false;
        });
        it("should return a specific object if first param is string and second is array", () => {
            const expected = {
                attrName: "attrName",
                prechecked: ["foo", "bar"],
                visible: false,
                type: "dropdown",
                matchingMode: "OR",
                operator: "EQ",
                multiselect: true
            };

            expect(converter.createSnippetHidden("attrName", ["foo", "bar"])).to.deep.equal(expected);
        });
    });
    describe("createSnippetCheckboxClassic", () => {
        it("should return a specific object", () => {
            const expected = {
                attrName: "attrName",
                title: false,
                type: "dropdown",
                display: "list",
                renderIcons: "fromLegend",
                operator: "EQ",
                prechecked: [],
                multiselect: true
            };

            expect(converter.createSnippetCheckboxClassic("attrName")).to.deep.equal(expected);
        });
    });
    describe("createSnippetRange", () => {
        it("should create a specific object", () => {
            const expected = {
                attrName: ["name", "attrNameUntil"],
                title: "displayName",
                matchingMode: "matchingMode",
                operator: "BETWEEN",
                format: "format",
                type: "typeRange"
            };

            expect(converter.createSnippetRange("name", "attrNameUntil", "displayName", "matchingMode", "format", "type")).to.deep.equal(expected);
        });
    });
    describe("createSnippetDateRange", () => {
        it("should create a specific object", () => {
            const expected = {
                attrName: ["name", "attrNameUntil"],
                title: "displayName",
                matchingMode: "matchingMode",
                operator: "INTERSECTS",
                format: "format",
                type: "dateRange"
            };

            expect(converter.createSnippetDateRange("name", "attrNameUntil", "displayName", "matchingMode", "format")).to.deep.equal(expected);
        });
    });
    describe("createSnippetStandard", () => {
        it("should return a specific object", () => {
            const expected = {
                attrName: "name",
                title: "displayName",
                matchingMode: "matchingMode",
                operator: "EQ",
                format: "format",
                type: "type",
                delimitor: "|"
            };

            expect(converter.createSnippetStandard("name", "displayName", "matchingMode", "format", "type")).to.deep.equal(expected);
        });
    });
    describe("createSnippetByAttribute", () => {
        it("should return a string if the first parameter is a string and the second parameter is not set", () => {
            const expected = {
                attrName: "attribute",
                matchingMode: "OR",
                operator: "EQ",
                format: undefined,
                type: "dropdown",
                delimitor: "|"
            };

            expect(converter.createSnippetByAttribute("attribute")).to.deep.equal(expected);
        });
        it("should return an object if the first parameter is a string and the second parameter is true", () => {
            expect(converter.createSnippetByAttribute("attribute", true)).to.be.an("object").and.not.to.be.empty;
        });
        it("should return false if the first parameter is not a string and not an object", () => {
            expect(converter.createSnippetByAttribute(undefined)).to.be.false;
            expect(converter.createSnippetByAttribute(null)).to.be.false;
            expect(converter.createSnippetByAttribute(1234)).to.be.false;
            expect(converter.createSnippetByAttribute(true)).to.be.false;
            expect(converter.createSnippetByAttribute(false)).to.be.false;
            expect(converter.createSnippetByAttribute([])).to.be.false;
        });
        it("should return an object if the given parameter is an object", () => {
            expect(converter.createSnippetByAttribute({})).to.be.an("object").and.not.to.be.empty;
        });
    });
    describe("getSnippetsByAttributeWhitelist", () => {
        it("should return an empty array if first param is not an array and not an object", () => {
            expect(converter.getSnippetsByAttributeWhitelist(null)).to.be.an("array").and.to.be.empty;
            expect(converter.getSnippetsByAttributeWhitelist(undefined)).to.be.an("array").and.to.be.empty;
            expect(converter.getSnippetsByAttributeWhitelist(true)).to.be.an("array").and.to.be.empty;
            expect(converter.getSnippetsByAttributeWhitelist("string")).to.be.an("array").and.to.be.empty;
            expect(converter.getSnippetsByAttributeWhitelist(1234)).to.be.an("array").and.to.be.empty;
        });
        it("should return an array if first param is an array of objects", () => {
            expect(converter.getSnippetsByAttributeWhitelist([{}])).to.be.an("array").and.not.to.be.empty;
        });
        it("should return an array if first param is an object with key value pairs", () => {
            expect(converter.getSnippetsByAttributeWhitelist({key: "value"})).to.be.an("array").and.not.to.be.empty;
        });
        it("should return an array of strings if first param is an array of strings", () => {
            const expectedFoo = {
                    "attrName": "foo",
                    "delimitor": "|",
                    "format": undefined,
                    "matchingMode": "OR",
                    "operator": "EQ",
                    "type": "dropdown"
                },
                expectedBar = {
                    "attrName": "bar",
                    "delimitor": "|",
                    "format": undefined,
                    "matchingMode": "OR",
                    "operator": "EQ",
                    "type": "dropdown"
                };

            expect(converter.getSnippetsByAttributeWhitelist(["foo", "bar"])).to.deep.equal([expectedFoo, expectedBar]);
        });
    });
    describe("getSnippetsByPredefinedRules", () => {
        it("should return an empty array if first param is not an array", () => {
            expect(converter.getSnippetsByPredefinedRules(undefined)).to.be.an("array").and.to.be.empty;
            expect(converter.getSnippetsByPredefinedRules(null)).to.be.an("array").and.to.be.empty;
            expect(converter.getSnippetsByPredefinedRules(true)).to.be.an("array").and.to.be.empty;
            expect(converter.getSnippetsByPredefinedRules("string")).to.be.an("array").and.to.be.empty;
            expect(converter.getSnippetsByPredefinedRules(1234)).to.be.an("array").and.to.be.empty;
            expect(converter.getSnippetsByPredefinedRules({})).to.be.an("array").and.to.be.empty;
        });
        it("should return an empty array if parameter is an empty array", () => {
            expect(converter.getSnippetsByPredefinedRules([])).to.be.an("array").and.to.be.empty;
        });
    });
    describe("getSnippetsByPredefinedQuery", () => {
        it("should return an array in any case", () => {
            expect(converter.getSnippetsByPredefinedQuery(undefined)).to.be.an("array").and.to.be.empty;
            expect(converter.getSnippetsByPredefinedQuery(null)).to.be.an("array").and.to.be.empty;
            expect(converter.getSnippetsByPredefinedQuery("string")).to.be.an("array").and.to.be.empty;
            expect(converter.getSnippetsByPredefinedQuery(1234)).to.be.an("array").and.to.be.empty;
            expect(converter.getSnippetsByPredefinedQuery(true)).to.be.an("array").and.to.be.empty;
            expect(converter.getSnippetsByPredefinedQuery(false)).to.be.an("array").and.to.be.empty;
            expect(converter.getSnippetsByPredefinedQuery({})).to.be.an("array").and.to.be.empty;
            expect(converter.getSnippetsByPredefinedQuery([])).to.be.an("array").and.to.be.empty;
        });
    });
    describe("isCheckboxClassic", () => {
        it("should return false if the given parameter is not 'checkbox-classic'", () => {
            expect(converter.isCheckboxClassic(undefined)).to.be.false;
            expect(converter.isCheckboxClassic(null)).to.be.false;
            expect(converter.isCheckboxClassic(1234)).to.be.false;
            expect(converter.isCheckboxClassic(true)).to.be.false;
            expect(converter.isCheckboxClassic(false)).to.be.false;
            expect(converter.isCheckboxClassic({})).to.be.false;
            expect(converter.isCheckboxClassic([])).to.be.false;
            expect(converter.isCheckboxClassic("not-checkbox-classic")).to.be.false;
        });
        it("should return true if the given parameter is 'checkbox-classic'", () => {
            expect(converter.isCheckboxClassic("checkbox-classic")).to.be.true;
        });
    });
    describe("convertPredefinedQueriesToLayer", () => {
        it("should return false if first param is not an array", () => {
            expect(converter.convertPredefinedQueriesToLayer(undefined)).to.be.false;
            expect(converter.convertPredefinedQueriesToLayer(null)).to.be.false;
            expect(converter.convertPredefinedQueriesToLayer("")).to.be.false;
            expect(converter.convertPredefinedQueriesToLayer(true)).to.be.false;
            expect(converter.convertPredefinedQueriesToLayer(1234)).to.be.false;
            expect(converter.convertPredefinedQueriesToLayer({})).to.be.false;
        });
        it("should return an empty array if first param is an empty array", () => {
            expect(converter.convertPredefinedQueriesToLayer([])).to.be.an("array").and.to.be.empty;
        });
        it("should return an array with a layer with active true for all layers with isActive true", () => {
            const layers = converter.convertPredefinedQueriesToLayer([{isActive: true}]);

            expect(layers).to.be.an("array").to.have.lengthOf(1);
            expect(layers[0]).to.be.an("object");
            expect(layers[0].active).to.be.true;
        });
        it("should return an array with a layer with active true for all layers with isSelected true", () => {
            const layers = converter.convertPredefinedQueriesToLayer([{isSelected: true}]);

            expect(layers).to.be.an("array").to.have.lengthOf(1);
            expect(layers[0]).to.be.an("object");
            expect(layers[0].active).to.be.true;
        });
        it("should return an array with a layer with the title set by name property", () => {
            const layers = converter.convertPredefinedQueriesToLayer([{name: "name"}]);

            expect(layers).to.be.an("array").to.have.lengthOf(1);
            expect(layers[0]).to.be.an("object");
            expect(layers[0].title).to.equal("name");
        });
        it("should return an array with a layer with the layerId set by property", () => {
            const layers = converter.convertPredefinedQueriesToLayer([{layerId: "layerId"}]);

            expect(layers).to.be.an("array").to.have.lengthOf(1);
            expect(layers[0]).to.be.an("object");
            expect(layers[0].layerId).to.equal("layerId");
        });
        it("should return an array with a layer with the searchInMapExtent set by property", () => {
            const layers = converter.convertPredefinedQueriesToLayer([{searchInMapExtent: "searchInMapExtent"}]);

            expect(layers).to.be.an("array").to.have.lengthOf(1);
            expect(layers[0]).to.be.an("object");
            expect(layers[0].searchInMapExtent).to.equal("searchInMapExtent");
        });
        it("should return an array with a layer with the info set by property", () => {
            const layers = converter.convertPredefinedQueriesToLayer([{info: "info"}]);

            expect(layers).to.be.an("array").to.have.lengthOf(1);
            expect(layers[0]).to.be.an("object");
            expect(layers[0].info).to.equal("info");
        });
        it("should return an array with a layer with the info set by property", () => {
            const layers = converter.convertPredefinedQueriesToLayer([{info: "info"}]);

            expect(layers).to.be.an("array").to.have.lengthOf(1);
            expect(layers[0]).to.be.an("object");
            expect(layers[0].info).to.equal("info");
        });
        it("should set deactivateGFI if the second parameter is set to true", () => {
            const layers = converter.convertPredefinedQueriesToLayer([{}], true);

            expect(layers).to.be.an("array").to.have.lengthOf(1);
            expect(layers[0]).to.be.an("object");
            expect(layers[0].deactivateGFI).to.be.true;
        });
        it("should set strategy to active by default", () => {
            const layers = converter.convertPredefinedQueriesToLayer([{}]);

            expect(layers).to.be.an("array").to.have.lengthOf(1);
            expect(layers[0]).to.be.an("object");
            expect(layers[0].strategy).to.equal("active");
        });
        it("should set showHits to true if no checkbox-classic is detected", () => {
            const layers = converter.convertPredefinedQueriesToLayer([{}]);

            expect(layers).to.be.an("array").to.have.lengthOf(1);
            expect(layers[0]).to.be.an("object");
            expect(layers[0].showHits).to.be.true;
        });
        it("should set showHits to false if checkbox-classic is detected", () => {
            const layers = converter.convertPredefinedQueriesToLayer([{snippetType: "checkbox-classic"}]);

            expect(layers).to.be.an("array").to.have.lengthOf(1);
            expect(layers[0]).to.be.an("object");
            expect(layers[0].showHits).to.be.false;
        });
        it("should set snippetTags to true if no checkbox-classic is detected", () => {
            const layers = converter.convertPredefinedQueriesToLayer([{}]);

            expect(layers).to.be.an("array").to.have.lengthOf(1);
            expect(layers[0]).to.be.an("object");
            expect(layers[0].snippetTags).to.be.true;
        });
        it("should set snippetTags to false if checkbox-classic is detected", () => {
            const layers = converter.convertPredefinedQueriesToLayer([{snippetType: "checkbox-classic"}]);

            expect(layers).to.be.an("array").to.have.lengthOf(1);
            expect(layers[0]).to.be.an("object");
            expect(layers[0].snippetTags).to.be.false;
        });
    });
    describe("checkboxClassicExists", () => {
        it("should return false if config is not an object", () => {
            converter.setConfig([]);
            expect(converter.checkboxClassicExists()).to.be.false;
            converter.setConfig(1234);
            expect(converter.checkboxClassicExists()).to.be.false;
            converter.setConfig("string");
            expect(converter.checkboxClassicExists()).to.be.false;
            converter.setConfig(true);
            expect(converter.checkboxClassicExists()).to.be.false;
            converter.setConfig(undefined);
            expect(converter.checkboxClassicExists()).to.be.false;
            converter.setConfig(null);
            expect(converter.checkboxClassicExists()).to.be.false;
        });
        it("should return false if predefinedQueries property of config object not an array", () => {
            converter.setConfig({predefinedQueries: undefined});
            expect(converter.checkboxClassicExists()).to.be.false;
            converter.setConfig({predefinedQueries: null});
            expect(converter.checkboxClassicExists()).to.be.false;
            converter.setConfig({predefinedQueries: 1234});
            expect(converter.checkboxClassicExists()).to.be.false;
            converter.setConfig({predefinedQueries: "string"});
            expect(converter.checkboxClassicExists()).to.be.false;
            converter.setConfig({predefinedQueries: {}});
            expect(converter.checkboxClassicExists()).to.be.false;
            converter.setConfig({predefinedQueries: true});
            expect(converter.checkboxClassicExists()).to.be.false;
        });
        it("should return false if predefinedQueries property of config object an empty array", () => {
            converter.setConfig({predefinedQueries: []});
            expect(converter.checkboxClassicExists()).to.be.false;
        });
        it("should return true if any checkboxClassic snippetType property is found", () => {
            converter.setConfig({predefinedQueries: [
                {},
                {},
                {snippetType: "checkbox-classic"},
                {}
            ]});

            expect(converter.checkboxClassicExists()).to.be.true;
        });
        it("should return false if no checkboxClassic snippetType property is found", () => {
            converter.setConfig({predefinedQueries: [
                {},
                {},
                {snippetType: "not-checkbox-classic"},
                {}
            ]});

            expect(converter.checkboxClassicExists()).to.be.false;
        });
    });
    describe("getDeactivateGfi", () => {
        it("should return false if config is not an object", () => {
            converter.setConfig(undefined);
            expect(converter.getDeactivateGfi()).to.be.false;
            converter.setConfig(null);
            expect(converter.getDeactivateGfi()).to.be.false;
            converter.setConfig(1234);
            expect(converter.getDeactivateGfi()).to.be.false;
            converter.setConfig("string");
            expect(converter.getDeactivateGfi()).to.be.false;
            converter.setConfig(true);
            expect(converter.getDeactivateGfi()).to.be.false;
            converter.setConfig(false);
            expect(converter.getDeactivateGfi()).to.be.false;
            converter.setConfig([]);
            expect(converter.getDeactivateGfi()).to.be.false;
        });
        it("should return false if config property deactivateGfi is not set", () => {
            converter.setConfig({});
            expect(converter.getDeactivateGfi()).to.be.false;
        });
        it("should return false if config property deactivateGfi is false", () => {
            converter.setConfig({deactivateGfi: false});
            expect(converter.getDeactivateGfi()).to.be.false;
        });
        it("should return true if config property deactivateGfi is true", () => {
            converter.setConfig({deactivateGfi: true});
            expect(converter.getDeactivateGfi()).to.be.true;
        });
    });
    describe("getLayers", () => {
        it("should return an empty array if config is not an object", () => {
            converter.setConfig([]);
            expect(converter.getLayers()).to.be.an("array").and.to.be.empty;
            converter.setConfig(1234);
            expect(converter.getLayers()).to.be.an("array").and.to.be.empty;
            converter.setConfig("string");
            expect(converter.getLayers()).to.be.an("array").and.to.be.empty;
            converter.setConfig(true);
            expect(converter.getLayers()).to.be.an("array").and.to.be.empty;
            converter.setConfig(undefined);
            expect(converter.getLayers()).to.be.an("array").and.to.be.empty;
            converter.setConfig(null);
            expect(converter.getLayers()).to.be.an("array").and.to.be.empty;
        });
        it("should return an empty array if predefinedQueries property of config object not an array", () => {
            converter.setConfig({predefinedQueries: undefined});
            expect(converter.getLayers()).to.be.an("array").and.to.be.empty;
            converter.setConfig({predefinedQueries: null});
            expect(converter.getLayers()).to.be.an("array").and.to.be.empty;
            converter.setConfig({predefinedQueries: 1234});
            expect(converter.getLayers()).to.be.an("array").and.to.be.empty;
            converter.setConfig({predefinedQueries: "string"});
            expect(converter.getLayers()).to.be.an("array").and.to.be.empty;
            converter.setConfig({predefinedQueries: {}});
            expect(converter.getLayers()).to.be.an("array").and.to.be.empty;
            converter.setConfig({predefinedQueries: true});
            expect(converter.getLayers()).to.be.an("array").and.to.be.empty;
        });
    });
    describe("getLayerSelectorVisible", () => {
        it("should return false if checkbox classic is detected", () => {
            converter.setConfig({predefinedQueries: [{snippetType: "not-checkbox-classic"}]});
            expect(converter.getLayerSelectorVisible()).to.be.false;
        });
        it("should return false if the config is not an object", () => {
            converter.setConfig(undefined);
            expect(converter.getLayerSelectorVisible()).to.be.false;
        });
        it("should return false if predefinedQueries property of config object not an array", () => {
            converter.setConfig({predefinedQueries: undefined});
            expect(converter.getLayerSelectorVisible()).to.be.false;
        });
        it("should return false if predefinedQueries array has a length of 1 or lower", () => {
            converter.setConfig({predefinedQueries: [null]});
            expect(converter.getLayerSelectorVisible()).to.be.false;
        });
        it("should return true if predefinedQueries array has length greater than one", () => {
            converter.setConfig({predefinedQueries: [null, null]});
            expect(converter.getLayerSelectorVisible()).to.be.true;
        });
    });
    describe("getSaveTo", () => {
        it("should return 'void' if saveToUrl is not set", () => {
            expect(converter.getSaveTo()).to.equal("void");
        });
        it("should return 'url' if saveToUrl is set", () => {
            converter.setConfig({saveToUrl: true});
            expect(converter.getSaveTo()).to.equal("url");
        });
    });
    describe("isOldConfig", () => {
        it("should be false if no config is set", () => {
            expect(converter.isOldConfig()).to.be.false;
        });
        it("should be false if the config is not an old config", () => {
            expect(converter.isOldConfig({
                foo: true,
                bar: "string",
                baz: 1234
            })).to.be.false;
        });
        it("should be true if config has a param attributeWhiteList", () => {
            converter.setConfig({attributeWhiteList: true});
            expect(converter.isOldConfig()).to.be.true;
        });
        it("should be true if config has a param predefinedQueries", () => {
            converter.setConfig({predefinedQueries: true});
            expect(converter.isOldConfig()).to.be.true;
        });
        it("should be true if config has a param allowMultipleQueriesPerLayer", () => {
            converter.setConfig({allowMultipleQueriesPerLayer: true});
            expect(converter.isOldConfig()).to.be.true;
        });
    });
    describe("addInfosToSnippets", () => {
        it("should keep the second argument untouched if the first argument is anything but an object", () => {
            const layers = [{
                    snippets: [{foo: "bar"}]
                }],
                expected = [{
                    snippets: [{foo: "bar"}]
                }];

            converter.addInfosToSnippets(undefined, layers);
            expect(layers).to.deep.equal(expected);
            converter.addInfosToSnippets(null, layers);
            expect(layers).to.deep.equal(expected);
            converter.addInfosToSnippets(1234, layers);
            expect(layers).to.deep.equal(expected);
            converter.addInfosToSnippets("string", layers);
            expect(layers).to.deep.equal(expected);
            converter.addInfosToSnippets(true, layers);
            expect(layers).to.deep.equal(expected);
            converter.addInfosToSnippets(false, layers);
            expect(layers).to.deep.equal(expected);
            converter.addInfosToSnippets([], layers);
            expect(layers).to.deep.equal(expected);
        });
        it("should add info keys and value to all snippets where the key equals the attrName", () => {
            const layers = [{
                    snippets: [{attrName: "foo"}, {attrName: "bar"}, {attrName: "foobar"}]
                }],
                expected = [{
                    snippets: [{attrName: "foo", info: "infoA"}, {attrName: "bar"}, {attrName: "foobar", info: "infoB"}]
                }];

            converter.addInfosToSnippets({foo: "infoA", foobar: "infoB"}, layers);
            expect(layers).to.deep.equal(expected);
        });
    });
});
