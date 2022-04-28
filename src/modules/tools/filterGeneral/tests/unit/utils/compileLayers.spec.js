import {expect} from "chai";
import {
    removeInvalidLayers,
    convertStringLayersIntoObjects,
    addFilterIds,
    addSnippetArrayIfMissing,
    createLayerConfigsAssoc
} from "../../../utils/compileLayers.js";

describe("src/modules/tools/filterGeneral/utils/compileLayers.js", () => {
    describe("createLayerConfigsAssoc", () => {
        it("should create a associative list of layers", () => {
            const layers = [
                    {filterId: "A"},
                    {filterId: "B"},
                    {
                        filterId: "C",
                        category: "category",
                        layers: [
                            {filterId: "D"},
                            {filterId: "E"}
                        ]
                    },
                    {filterId: "F"}
                ],
                expected = {
                    A: {filterId: "A"},
                    B: {filterId: "B"},
                    C: {
                        filterId: "C",
                        category: "category",
                        layers: [
                            {filterId: "D"},
                            {filterId: "E"}
                        ]
                    },
                    D: {filterId: "D"},
                    E: {filterId: "E"},
                    F: {filterId: "F"}
                };

            expect(createLayerConfigsAssoc(layers)).to.deep.equal(expected);
        });
    });
    describe("addSnippetArrayIfMissing", () => {
        it("should add a snippet array if missing", () => {
            const layers = [
                    {filterId: "A", snippets: [1, 2, 3]},
                    {filterId: "B"},
                    {
                        filterId: "C",
                        category: "category",
                        layers: [
                            {filterId: "D"},
                            {filterId: "E", snippets: [1, 2, 3]}
                        ]
                    },
                    {filterId: "F", snippets: "this is not an array"}
                ],
                expected = [
                    {filterId: "A", snippets: [1, 2, 3]},
                    {filterId: "B", snippets: []},
                    {
                        filterId: "C",
                        category: "category",
                        layers: [
                            {filterId: "D", snippets: []},
                            {filterId: "E", snippets: [1, 2, 3]}
                        ]
                    },
                    {filterId: "F", snippets: []}
                ];

            addSnippetArrayIfMissing(layers);
            expect(layers).to.deep.equal(expected);
        });
    });
    describe("addFilterIds", () => {
        it("should add an incremented filterId to all layers, should override", () => {
            const layers = [
                    {filterId: "A"},
                    {filterId: "B"},
                    {
                        filterId: "C",
                        category: "category",
                        layers: [
                            {filterId: "D"},
                            {filterId: "E"}
                        ]
                    },
                    {filterId: "F"}
                ],
                expected = [
                    {filterId: 0},
                    {filterId: 1},
                    {
                        filterId: 2,
                        category: "category",
                        layers: [
                            {filterId: 3},
                            {filterId: 4}
                        ]
                    },
                    {filterId: 5}
                ];

            addFilterIds(layers);
            expect(layers).to.deep.equal(expected);
        });
    });
    describe("convertStringLayersIntoObjects", () => {
        it("should convert string layers to objects", () => {
            const layers = [
                    {filterId: "A"},
                    "filterB",
                    {
                        filterId: "C",
                        category: "category",
                        layers: [
                            {filterId: "D"},
                            "filterE"
                        ]
                    },
                    {filterId: "F"}
                ],
                expected = [
                    {filterId: "A"},
                    {layerId: "filterB"},
                    {
                        filterId: "C",
                        category: "category",
                        layers: [
                            {filterId: "D"},
                            {layerId: "filterE"}
                        ]
                    },
                    {filterId: "F"}
                ];

            convertStringLayersIntoObjects(layers);
            expect(layers).to.deep.equal(expected);
        });
    });
    describe("removeInvalidLayers", () => {
        it("should return an empty array if anything but an array is given", () => {
            expect(removeInvalidLayers(undefined)).to.be.an("array").and.to.be.empty;
            expect(removeInvalidLayers(null)).to.be.an("array").and.to.be.empty;
            expect(removeInvalidLayers("string")).to.be.an("array").and.to.be.empty;
            expect(removeInvalidLayers(1234)).to.be.an("array").and.to.be.empty;
            expect(removeInvalidLayers(true)).to.be.an("array").and.to.be.empty;
            expect(removeInvalidLayers(false)).to.be.an("array").and.to.be.empty;
            expect(removeInvalidLayers({})).to.be.an("array").and.to.be.empty;
        });
        it("should remove layers that are no string and no object", () => {
            const layers = [
                    {filterId: "A"},
                    1234,
                    {
                        filterId: "C",
                        category: "category",
                        layers: [
                            {filterId: "D"},
                            [1, 2, 3, 4]
                        ]
                    },
                    false,
                    {filterId: "F"}
                ],
                expected = [
                    {filterId: "A"},
                    {
                        filterId: "C",
                        category: "category",
                        layers: [
                            {filterId: "D"}
                        ]
                    },
                    {filterId: "F"}
                ];

            expect(removeInvalidLayers(layers)).to.deep.equal(expected);
        });
    });
});
