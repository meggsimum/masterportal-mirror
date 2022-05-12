import {expect} from "chai";
import {
    removeInvalidSnippets,
    convertStringSnippetsIntoObjects,
    addParent,
    getFlatArrayOfParentsAndChildren,
    addSnippetIds,
    addSnippetAdjustment,
    addSnippetApi,
    addSnippetMultiselect,
    addSnippetOperator,
    addSnippetTypes,
    checkSnippetTypeConsistency,
    getDefaultSnippetTypeByDataType,
    getDefaultOperatorBySnippetType
} from "../../../utils/compileSnippets.js";

describe("src/modules/tools/filterGeneral/utils/compileSnippets.js", () => {
    describe("removeInvalidSnippets", () => {
        it("should return an empty array if the first parameter is not an array", () => {
            expect(removeInvalidSnippets(undefined)).to.be.an("array").and.to.be.empty;
            expect(removeInvalidSnippets(null)).to.be.an("array").and.to.be.empty;
            expect(removeInvalidSnippets(1234)).to.be.an("array").and.to.be.empty;
            expect(removeInvalidSnippets("string")).to.be.an("array").and.to.be.empty;
            expect(removeInvalidSnippets(true)).to.be.an("array").and.to.be.empty;
            expect(removeInvalidSnippets(false)).to.be.an("array").and.to.be.empty;
            expect(removeInvalidSnippets({})).to.be.an("array").and.to.be.empty;
        });
        it("should remove invalid snippets", () => {
            const snippets = [
                    undefined,
                    null,
                    1234,
                    "string",
                    true,
                    false,
                    {},
                    []
                ],
                expected = [
                    "string",
                    {}
                ];

            expect(removeInvalidSnippets(snippets)).to.deep.equal(expected);
        });
    });
    describe("convertStringSnippetsIntoObjects", () => {
        it("should convert found strings into snippet objects", () => {
            const snippets = [
                    {},
                    "test"
                ],
                expected = [
                    {},
                    {attrName: "test"}
                ];

            convertStringSnippetsIntoObjects(snippets);
            expect(snippets).to.deep.equal(expected);
        });
    });
    describe("addParent", () => {
        it("should add the given parent as parent to all given children, should work recursive", () => {
            const snippets = [
                {},
                {children: [
                    {}
                ]}
            ];

            addParent(snippets, "parent");
            expect(snippets).to.be.an("array").and.to.have.lengthOf(2);
            expect(snippets[0]).to.be.an("object").and.to.include.all.keys(["parent"]);
            expect(snippets[1]).to.be.an("object").and.to.include.all.keys(["parent"]);
            expect(snippets[1].children).to.be.an("array").and.to.have.lengthOf(1);
            expect(snippets[1].children[0]).to.be.an("object").and.to.include.all.keys(["parent"]);
        });
    });
    describe("getFlatArrayOfParentsAndChildren", () => {
        it("should hook all found children after their parents into the given array", () => {
            const snippets = [
                    {id: 0, children: [
                        {id: 1}
                    ]},
                    {id: 2}
                ],
                result = getFlatArrayOfParentsAndChildren(snippets);

            expect(result).to.be.an("array").and.to.have.lengthOf(3);
            expect(result[0]).to.be.an("object");
            expect(result[0].id).to.equal(0);
            expect(result[1]).to.be.an("object");
            expect(result[1].id).to.equal(1);
            expect(result[2]).to.be.an("object");
            expect(result[2].id).to.equal(2);
        });
    });
    describe("addSnippetIds", () => {
        it("should add a snippetId to every snippet overriding previous snippetId", () => {
            const snippets = [
                    {snippetId: "snippetId"},
                    {}
                ],
                expected = [
                    {snippetId: 0},
                    {snippetId: 1}
                ];

            addSnippetIds(snippets);
            expect(snippets).to.deep.equal(expected);
        });
    });
    describe("addSnippetAdjustment", () => {
        it("should add a key adjustment to every snippet overriding previous adjustment key", () => {
            const snippets = [
                    {adjustment: "adjustment"},
                    {}
                ],
                expected = [
                    {adjustment: {}},
                    {adjustment: {}}
                ];

            addSnippetAdjustment(snippets);
            expect(snippets).to.deep.equal(expected);
        });
    });

    describe("addSnippetApi", () => {
        it("should add an api to every snippet if the snippet has its own service", () => {
            const snippets = [
                    {
                        service: {
                            name: "serviceA"
                        }
                    },
                    {
                        service: {
                            name: "serviceB"
                        }
                    }
                ],
                expected = [
                    {
                        name: "serviceA"
                    },
                    {
                        name: "serviceB"
                    }
                ],
                allSetServices = [];

            addSnippetApi(snippets, () => {
                return {
                    setService: service => {
                        allSetServices.push(service);
                    }
                };
            });

            expect(allSetServices).to.deep.equal(expected);
            expect(snippets[0]).to.be.an("object");
            expect(snippets[0].api).to.be.an("object");
            expect(snippets[1]).to.be.an("object");
            expect(snippets[1].api).to.be.an("object");
        });
        it("should not add an api to a snippet if the snippet does not have its own service", () => {
            const snippets = [
                    {
                        noService: {
                            name: "noApi"
                        }
                    }
                ],
                allSetServices = [];

            addSnippetApi(snippets, () => {
                return {
                    setService: service => {
                        allSetServices.push(service);
                    }
                };
            });
            expect(allSetServices).to.be.empty;
            expect(snippets[0]).to.be.an("object");
            expect(snippets[0].api).to.not.be.an("object");
        });
        it("should only add an api to a snippet if the snippet service is an object", () => {
            const snippets = [
                    {service: "serviceB"}
                ],
                allSetServices = [];

            addSnippetApi(snippets, () => {
                return {
                    setService: service => {
                        allSetServices.push(service);
                    }
                };
            });
            expect(allSetServices).to.be.empty;
            expect(snippets[0]).to.be.an("object");
            expect(snippets[0].api).to.not.be.an("object");
        });
    });

    describe("addSnippetMultiselect", () => {
        it("should add a key multiselect depending on matichingMode if a snippet has no multiselect", () => {
            const snippets = [
                    {multiselect: "multiselect"},
                    {matchingMode: "AND"},
                    {matchingMode: "anything"}
                ],
                expected = [
                    {multiselect: "multiselect"},
                    {multiselect: false},
                    {multiselect: true}
                ];

            addSnippetMultiselect(snippets);
            expect(snippets).to.deep.equal(expected);
        });
    });
    describe("addSnippetOperator", () => {
        it("should add an operator key to each snippet without operator key", () => {
            const snippets = [
                {},
                {operator: "operator"}
            ];

            addSnippetOperator(snippets);
            expect(snippets).to.be.an("array").and.to.have.lengthOf(2);
            expect(snippets[0]).to.be.an("object").and.to.have.property("operator");
            expect(snippets[1]).to.deep.equal({operator: "operator"});
        });
    });
    describe("addSnippetTypes", () => {
        it("should left the first parameter as it is if anything but an object is given as second parameter", () => {
            const snippets = [{}],
                expected = [{}];

            addSnippetTypes(snippets, undefined);
            expect(snippets).to.deep.equal(expected);
            addSnippetTypes(snippets, null);
            expect(snippets).to.deep.equal(expected);
            addSnippetTypes(snippets, "string");
            expect(snippets).to.deep.equal(expected);
            addSnippetTypes(snippets, 1234);
            expect(snippets).to.deep.equal(expected);
            addSnippetTypes(snippets, true);
            expect(snippets).to.deep.equal(expected);
            addSnippetTypes(snippets, false);
            expect(snippets).to.deep.equal(expected);
            addSnippetTypes(snippets, []);
            expect(snippets).to.deep.equal(expected);
        });
        it("should add a type calling getDefaultSnippetTypeByDataType using second parameter for each snippet without type", () => {
            const snippets = [
                    {attrName: "foo"},
                    {type: "type"},
                    {attrName: "unknown"},
                    {attrName: "bar"}
                ],
                attrTypes = {
                    foo: "typeA",
                    bar: "typeB"
                };

            addSnippetTypes(snippets, attrTypes);
            expect(snippets).to.be.an("array").and.to.have.lengthOf(4);
            expect(snippets[0]).to.be.an("object").and.to.have.property("type");
            expect(snippets[1]).to.be.an("object");
            expect(snippets[1].type).to.equal("type");
            expect(snippets[2]).to.be.an("object").and.to.have.property("type");
            expect(snippets[3]).to.be.an("object").and.to.have.property("type");
        });
    });
    describe("checkSnippetTypeConsistency", () => {
        it("should return true if the given array is empty", () => {
            expect(checkSnippetTypeConsistency([])).to.be.true;
        });
        it("should return false if any object in the given array has no type", () => {
            const snippets = [
                {type: "type"},
                {type: "type"},
                {notype: "notype"},
                {type: "type"}
            ];

            expect(checkSnippetTypeConsistency(snippets)).to.be.false;
        });
        it("should return true if every object in the given array has a type", () => {
            const snippets = [
                {type: "type"},
                {type: "type"},
                {type: "type"},
                {type: "type"}
            ];

            expect(checkSnippetTypeConsistency(snippets)).to.be.true;
        });
    });
    describe("getDefaultSnippetTypeByDataType", () => {
        it("should return snippet type according to the input data type", () => {
            expect(getDefaultSnippetTypeByDataType(undefined)).to.equal("text");
            expect(getDefaultSnippetTypeByDataType(null)).to.equal("text");
            expect(getDefaultSnippetTypeByDataType(0)).to.equal("text");
            expect(getDefaultSnippetTypeByDataType({})).to.equal("text");
            expect(getDefaultSnippetTypeByDataType([])).to.equal("text");
            expect(getDefaultSnippetTypeByDataType("boolean")).to.equal("checkbox");
            expect(getDefaultSnippetTypeByDataType("string")).to.equal("dropdown");
            expect(getDefaultSnippetTypeByDataType("number")).to.equal("sliderRange");
        });
    });
    describe("getDefaultOperatorBySnippetType", () => {
        it("should return operator according to the input snippet type", () => {
            expect(getDefaultOperatorBySnippetType(undefined)).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType(null)).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType(0)).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType({})).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType([])).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType("checkbox")).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType("date")).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType("dateRange")).to.equal("INTERSECTS");
            expect(getDefaultOperatorBySnippetType("dropdown")).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType("text")).to.equal("IN");
            expect(getDefaultOperatorBySnippetType("slider")).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType("sliderRange")).to.equal("BETWEEN");
        });
        it("should return expected operator if the second parameter is set to true", () => {
            expect(getDefaultOperatorBySnippetType(undefined, true)).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType(null, true)).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType(0, true)).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType({}, true)).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType([], true)).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType("checkbox", true)).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType("date", true)).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType("dateRange", true)).to.equal("INTERSECTS");
            expect(getDefaultOperatorBySnippetType("dropdown", true)).to.equal("IN");
            expect(getDefaultOperatorBySnippetType("text", true)).to.equal("IN");
            expect(getDefaultOperatorBySnippetType("slider", true)).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType("sliderRange", true)).to.equal("BETWEEN");
        });
    });
});
