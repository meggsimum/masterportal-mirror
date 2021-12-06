import {expect} from "chai";
import {
    convertToNewConfig,
    convertPredefinedQueryToLayer,
    getSnippetsByQueries,
    convertPredefRuleToSnippet,
    convertWhiteListAttributeToSnippet
} from "../../../utils/convertToNewConfig";

describe("src/module/tools/filterGeneral/utils/converToNewConfig.js", () => {
    describe("convertToNewConfig", () => {
        it("should return an empty object if anything but an object is given", () => {
            expect(convertToNewConfig(null)).to.deep.equal({});
            expect(convertToNewConfig("string")).to.deep.equal({});
            expect(convertToNewConfig(1234)).to.deep.equal({});
            expect(convertToNewConfig(true)).to.deep.equal({});
            expect(convertToNewConfig(false)).to.deep.equal({});
            expect(convertToNewConfig([])).to.deep.equal({});
            expect(convertToNewConfig(undefined)).to.deep.equal({});
        });

        it("should return an empty object if given config does not contain an filter object", () => {
            expect(convertToNewConfig({})).to.deep.equal({});
        });

        it("should return an new config object based on an older one", () => {
            const deprecated = {
                    filter: {
                        name: "Filter",
                        icon: "bi-funnel-fill",
                        deactivateGFI: false,
                        isGeneric: false,
                        isInitOpen: false,
                        allowMultipleQueriesPerLayer: false,
                        predefinedQueries: [
                            {
                                layerId: "8712",
                                isActive: false,
                                isSelected: false,
                                name: "Grundschulen",
                                predefinedRules: [
                                    {
                                        attrName: "kapitelbezeichnung",
                                        values: ["Grundschulen", "Langformschulen"]
                                    }
                                ],
                                attributeWhiteList: ["bezirk"]
                            }
                        ]
                    }
                },
                expected = {
                    filterGeneral: {
                        name: "Filter",
                        icon: "bi-funnel-fill",
                        deactivateGFI: false,
                        isInitOpen: false,
                        layers: [{
                            name: "Grundschulen",
                            layerId: "8712",
                            active: false,
                            searchInMapExtent: undefined,
                            info: undefined,
                            deactivateGFI: false,
                            snippets: [
                                {
                                    attrName: "kapitelbezeichnung",
                                    preChecked: ["Grundschulen", "Langformschulen"],
                                    visible: false,
                                    type: "dropdown",
                                    matchingMode: "OR",
                                    operator: "EQ",
                                    multiselect: true
                                },
                                "bezirk"
                            ]
                        }]
                    }
                };

            expect(convertToNewConfig(deprecated)).to.deep.equal(expected);
        });
    });
    describe("convertPredefinedQueryToLayer", () => {
        it("should return an empty array if anything but an array is given", () => {
            expect(convertPredefinedQueryToLayer(null)).to.deep.equal([]);
            expect(convertPredefinedQueryToLayer("string")).to.deep.equal([]);
            expect(convertPredefinedQueryToLayer(1234)).to.deep.equal([]);
            expect(convertPredefinedQueryToLayer(true)).to.deep.equal([]);
            expect(convertPredefinedQueryToLayer(false)).to.deep.equal([]);
            expect(convertPredefinedQueryToLayer({})).to.deep.equal([]);
            expect(convertPredefinedQueryToLayer(undefined)).to.deep.equal([]);
        });

        it("should return an converted array if correct array is given", () => {
            const preDefQueries = [
                    {
                        layerId: "8712",
                        isActive: false,
                        isSelected: false,
                        name: "Grundschulen",
                        predefinedRules: [
                            {
                                attrName: "kapitelbezeichnung",
                                values: ["Grundschulen", "Langformschulen"]
                            }
                        ],
                        attributeWhiteList: ["bezirk"]
                    }
                ],
                expected = [
                    {
                        name: "Grundschulen",
                        layerId: "8712",
                        active: false,
                        searchInMapExtent: undefined,
                        info: undefined,
                        deactivateGFI: false,
                        snippets: [
                            {
                                attrName: "kapitelbezeichnung",
                                preChecked: ["Grundschulen", "Langformschulen"],
                                visible: false,
                                type: "dropdown",
                                matchingMode: "OR",
                                operator: "EQ",
                                multiselect: true
                            },
                            "bezirk"
                        ]
                    }
                ];

            expect(convertPredefinedQueryToLayer(preDefQueries)).to.deep.equal(expected);
        });
    });
    describe("getSnippetsByQueries", () => {
        it("should return an empty list if no attrWhiteList is not an object and predefQuery is an empty array", () => {
            expect(getSnippetsByQueries([], null)).to.deep.equal([]);
            expect(getSnippetsByQueries([], "string")).to.deep.equal([]);
            expect(getSnippetsByQueries([], 1234)).to.deep.equal([]);
            expect(getSnippetsByQueries([], true)).to.deep.equal([]);
            expect(getSnippetsByQueries([], false)).to.deep.equal([]);
            expect(getSnippetsByQueries([], {})).to.deep.equal([]);
            expect(getSnippetsByQueries([], undefined)).to.deep.equal([]);
        });

        it("should return an empty list if predefQuery is not an object and attrWhiteList is an empty array", () => {
            expect(getSnippetsByQueries(null, [])).to.deep.equal([]);
            expect(getSnippetsByQueries("string", [])).to.deep.equal([]);
            expect(getSnippetsByQueries(1234, [])).to.deep.equal([]);
            expect(getSnippetsByQueries(true, [])).to.deep.equal([]);
            expect(getSnippetsByQueries(false, [])).to.deep.equal([]);
            expect(getSnippetsByQueries({}, [])).to.deep.equal([]);
            expect(getSnippetsByQueries(undefined, [])).to.deep.equal([]);
        });

        it("should return an empty list if predefQuery and attrWhiteList are not arrays", () => {
            expect(getSnippetsByQueries(null, null)).to.deep.equal([]);
            expect(getSnippetsByQueries("string", "string")).to.deep.equal([]);
            expect(getSnippetsByQueries(1234, 1234)).to.deep.equal([]);
            expect(getSnippetsByQueries(true, false)).to.deep.equal([]);
            expect(getSnippetsByQueries(false, true)).to.deep.equal([]);
            expect(getSnippetsByQueries([], [])).to.deep.equal([]);
            expect(getSnippetsByQueries(undefined, undefined)).to.deep.equal([]);

        });

        it("should return a list of objects if correct param is given", () => {
            const predefinedRules = [
                    {
                        attrName: "kapitelbezeichnung",
                        values: ["Grundschulen", "Langformschulen"]
                    }
                ],
                attrWhitelist = ["bezirk"],
                expected = [
                    {
                        attrName: "kapitelbezeichnung",
                        preChecked: ["Grundschulen", "Langformschulen"],
                        visible: false,
                        type: "dropdown",
                        matchingMode: "OR",
                        operator: "EQ",
                        multiselect: true
                    },
                    "bezirk"
                ];

            expect(getSnippetsByQueries(predefinedRules, attrWhitelist)).to.deep.equal(expected);
        });
    });
    describe("convertPredefRulesToSnippets", () => {
        it("should return an empty object if anything but an object is given", () => {
            expect(convertPredefRuleToSnippet(null)).to.deep.equal({});
            expect(convertPredefRuleToSnippet("string")).to.deep.equal({});
            expect(convertPredefRuleToSnippet(1234)).to.deep.equal({});
            expect(convertPredefRuleToSnippet(true)).to.deep.equal({});
            expect(convertPredefRuleToSnippet(false)).to.deep.equal({});
            expect(convertPredefRuleToSnippet([])).to.deep.equal({});
            expect(convertPredefRuleToSnippet(undefined)).to.deep.equal({});
        });

        it("should return a snippet object when correct param is given", () => {
            const predefinedRule = {
                    attrName: "kapitelbezeichnung",
                    values: ["Grundschulen", "Langformschulen"]
                },
                expected = {
                    attrName: "kapitelbezeichnung",
                    preChecked: ["Grundschulen", "Langformschulen"],
                    visible: false,
                    type: "dropdown",
                    matchingMode: "OR",
                    operator: "EQ",
                    multiselect: true
                };

            expect(convertPredefRuleToSnippet(predefinedRule)).to.deep.equal(expected);
        });
    });
    describe("convertWhiteListToSnippets", () => {
        it("should return an empty object if anything but an object or an string is given", () => {
            expect(convertWhiteListAttributeToSnippet(null)).to.deep.equal({});
            expect(convertWhiteListAttributeToSnippet(1234)).to.deep.equal({});
            expect(convertWhiteListAttributeToSnippet(true)).to.deep.equal({});
            expect(convertWhiteListAttributeToSnippet(false)).to.deep.equal({});
            expect(convertWhiteListAttributeToSnippet([])).to.deep.equal({});
            expect(convertWhiteListAttributeToSnippet(undefined)).to.deep.equal({});
        });

        it("should return the given param if it is a string and the snippet type is not set", () => {
            expect(convertWhiteListAttributeToSnippet("string")).to.be.equal("string");
        });

        it("should return a fixed snippet object if given param is a string and the snippetType is equals 'checkbox-classic'", () => {
            const expected = {
                attrName: "blub",
                type: "dropdown",
                display: "list",
                renderIcons: "fromLegend",
                operator: "EQ",
                prechecked: "all",
                multiselect: true
            };

            expect(convertWhiteListAttributeToSnippet("blub", "checkbox-classic")).to.deep.equal(expected);
        });

        it("should return a snippet object if correct param is given", () => {
            const attribute = {
                    name: "baubeginn",
                    displayName: "Baustelle",
                    attrNameUntil: "bauende",
                    matchingMode: "OR",
                    format: "DD.MM.YYYY",
                    type: "date"
                },
                expected = {
                    attrName: ["baubeginn", "bauende"],
                    label: "Baustelle",
                    matchingMode: "OR",
                    operator: "EQ",
                    format: "DD.MM.YYYY",
                    type: "date"
                };

            expect(convertWhiteListAttributeToSnippet(attribute, null)).to.deep.equal(expected);
        });
    });
});
