import {expect} from "chai";
import {
    getListOfRelevantAttrNames,
    getAttrValuesOfItemsGroupedByAttrNames,
    snippetDateCompareFunction,
    getSnippetAdjustments
} from "../../../utils/getSnippetAdjustments.js";

describe("src/modules/tools/filterGeneral/utils/getSnippetAdjustments.js", () => {
    describe("getListOfRelevantAttrNames", () => {
        it("should return an empty array if anything but an array or empty array is given", () => {
            expect(getListOfRelevantAttrNames(undefined)).to.be.an("array").and.to.be.empty;
            expect(getListOfRelevantAttrNames(null)).to.be.an("array").and.to.be.empty;
            expect(getListOfRelevantAttrNames("string")).to.be.an("array").and.to.be.empty;
            expect(getListOfRelevantAttrNames(1234)).to.be.an("array").and.to.be.empty;
            expect(getListOfRelevantAttrNames(true)).to.be.an("array").and.to.be.empty;
            expect(getListOfRelevantAttrNames(false)).to.be.an("array").and.to.be.empty;
            expect(getListOfRelevantAttrNames({})).to.be.an("array").and.to.be.empty;
            expect(getListOfRelevantAttrNames([])).to.be.an("array").and.to.be.empty;
        });
        it("should return an empty array if the given array includes no objects", () => {
            expect(getListOfRelevantAttrNames([undefined, null, "string", 1234, true, false, []])).to.be.an("array").and.to.be.empty;
        });
        it("should return an empty array if the given array includes no objects with attrName key", () => {
            expect(getListOfRelevantAttrNames([{}, {somekey: "somevalue"}])).to.be.an("array").and.to.be.empty;
        });
        it("should return an array of the attrNames of the given objects with an expected structure", () => {
            expect(getListOfRelevantAttrNames([
                {attrName: "attrNameA"},
                {attrName: "attrNameB"}
            ])).to.deep.equal(["attrNameA", "attrNameB"]);
        });
        it("should return an array of the attrNames of the given objects if they are in arrays", () => {
            expect(getListOfRelevantAttrNames([
                {attrName: ["attrNameA", "attrNameC"]},
                {attrName: "attrNameB"}
            ])).to.deep.equal(["attrNameA", "attrNameC", "attrNameB"]);
        });
    });
    describe("getAttrValuesOfItemsGroupedByAttrNames", () => {
        it("should return an empty object if the first argument is not an array", () => {
            expect(getAttrValuesOfItemsGroupedByAttrNames(undefined)).to.be.an("object").and.to.be.empty;
            expect(getAttrValuesOfItemsGroupedByAttrNames(null)).to.be.an("object").and.to.be.empty;
            expect(getAttrValuesOfItemsGroupedByAttrNames("string")).to.be.an("object").and.to.be.empty;
            expect(getAttrValuesOfItemsGroupedByAttrNames(1234)).to.be.an("object").and.to.be.empty;
            expect(getAttrValuesOfItemsGroupedByAttrNames(true)).to.be.an("object").and.to.be.empty;
            expect(getAttrValuesOfItemsGroupedByAttrNames(false)).to.be.an("object").and.to.be.empty;
            expect(getAttrValuesOfItemsGroupedByAttrNames({})).to.be.an("object").and.to.be.empty;
        });
        it("should return an empty object if the second argument is not an array", () => {
            expect(getAttrValuesOfItemsGroupedByAttrNames([], undefined)).to.be.an("object").and.to.be.empty;
            expect(getAttrValuesOfItemsGroupedByAttrNames([], null)).to.be.an("object").and.to.be.empty;
            expect(getAttrValuesOfItemsGroupedByAttrNames([], "string")).to.be.an("object").and.to.be.empty;
            expect(getAttrValuesOfItemsGroupedByAttrNames([], 1234)).to.be.an("object").and.to.be.empty;
            expect(getAttrValuesOfItemsGroupedByAttrNames([], true)).to.be.an("object").and.to.be.empty;
            expect(getAttrValuesOfItemsGroupedByAttrNames([], false)).to.be.an("object").and.to.be.empty;
            expect(getAttrValuesOfItemsGroupedByAttrNames([], {})).to.be.an("object").and.to.be.empty;
        });
        it("should return an empty object if the first argument is an empty array", () => {
            expect(getAttrValuesOfItemsGroupedByAttrNames([], ["something"])).to.be.an("object").and.to.be.empty;
        });
        it("should return an empty object if the second argument is an empty array", () => {
            expect(getAttrValuesOfItemsGroupedByAttrNames(["something"], [])).to.be.an("object").and.to.be.empty;
        });
        it("should return an empty object if the first argument is an array of no valid objects", () => {
            expect(getAttrValuesOfItemsGroupedByAttrNames([
                {},
                {anykey: "anyvalue"}
            ], ["something"])).to.be.an("object").and.to.be.empty;
        });
        it("should return an empty object if the first argument is valid and the second argument is empty", () => {
            expect(getAttrValuesOfItemsGroupedByAttrNames([
                {get: () => false}
            ], [])).to.be.an("object").and.to.be.empty;
        });
        it("should return an empty object if the second argument includes no valid attr names", () => {
            expect(getAttrValuesOfItemsGroupedByAttrNames([
                {get: () => false}
            ], [undefined, null, 1234, true, false, {}, []])).to.be.an("object").and.to.be.empty;
        });
        it("should return an object of attrNames an their occurrences if valid arguments are given", () => {
            expect(getAttrValuesOfItemsGroupedByAttrNames([
                {get: attrName => attrName === "attrNameA" ? 1 : 3},
                {get: attrName => attrName === "attrNameA" ? 2 : 3},
                {get: () => undefined}
            ], ["attrNameA", "attrNameB"])).deep.equal({
                "attrNameA": ["1", "2"],
                "attrNameB": ["3"]
            });
        });
    });
    describe("snippetDateCompareFunction", () => {
        it("should return 1 if the first argument is not a valid date string", () => {
            expect(snippetDateCompareFunction("test", "04.02.2022", "DD.MM.YYYY")).to.equal(1);
        });
        it("should return -1 if the second argument is not a valid date string", () => {
            expect(snippetDateCompareFunction("04.02.2022", "test", "DD.MM.YYYY")).to.equal(-1);
        });
        it("should return -1 if the first argument is same or before the second argument", () => {
            expect(snippetDateCompareFunction("03.02.2022", "04.02.2022", "DD.MM.YYYY")).to.equal(-1);
            expect(snippetDateCompareFunction("04.02.2022", "04.02.2022", "DD.MM.YYYY")).to.equal(-1);
        });
        it("should return 1 if the first argument is greater than the second argument", () => {
            expect(snippetDateCompareFunction("05.02.2022", "04.02.2022", "DD.MM.YYYY")).to.equal(1);
        });
    });
    describe("getSnippetAdjustments", () => {
        it("should return false if the first argument is not an array", () => {
            expect(getSnippetAdjustments(undefined)).to.be.false;
            expect(getSnippetAdjustments(null)).to.be.false;
            expect(getSnippetAdjustments("string")).to.be.false;
            expect(getSnippetAdjustments(1234)).to.be.false;
            expect(getSnippetAdjustments(true)).to.be.false;
            expect(getSnippetAdjustments(false)).to.be.false;
            expect(getSnippetAdjustments({})).to.be.false;
        });
        it("should return false if the second argument is not an array", () => {
            expect(getSnippetAdjustments([], undefined)).to.be.false;
            expect(getSnippetAdjustments([], null)).to.be.false;
            expect(getSnippetAdjustments([], "string")).to.be.false;
            expect(getSnippetAdjustments([], 1234)).to.be.false;
            expect(getSnippetAdjustments([], true)).to.be.false;
            expect(getSnippetAdjustments([], false)).to.be.false;
            expect(getSnippetAdjustments([], {})).to.be.false;
        });
        it("should return false if the third argument is not a number", () => {
            expect(getSnippetAdjustments([], [], undefined)).to.be.false;
            expect(getSnippetAdjustments([], [], null)).to.be.false;
            expect(getSnippetAdjustments([], [], "string")).to.be.false;
            expect(getSnippetAdjustments([], [], true)).to.be.false;
            expect(getSnippetAdjustments([], [], false)).to.be.false;
            expect(getSnippetAdjustments([], [], {})).to.be.false;
            expect(getSnippetAdjustments([], [], [])).to.be.false;
        });
        it("should return an object with start=true parameter if the third argument is 1", () => {
            expect(getSnippetAdjustments([], [], 1)).deep.equal({start: true, finish: false});
        });
        it("should return an object with start=true parameter if the third argument is anything but 1", () => {
            expect(getSnippetAdjustments([], [], 0)).deep.equal({start: false, finish: false});
            expect(getSnippetAdjustments([], [], 2)).deep.equal({start: false, finish: false});
        });
        it("should return an object with finish=true if the third and fourth parameter are equal", () => {
            expect(getSnippetAdjustments([], [], 2, 2)).deep.equal({start: false, finish: true});
        });
        it("should be able to set both start and finish if the third and fourth parameter are 1", () => {
            expect(getSnippetAdjustments([], [], 1, 1)).deep.equal({start: true, finish: true});
        });
        it("should return an object with values for different snippet types", () => {
            const responses = [
                    {A: "v07", B: 4, C: 8, D: 13, E: "24.02.2022", F: "05.01.2022", G: "05.12.2022", H: "anything"},
                    {A: "v24", B: 1, C: 8, D: 14, E: "24.03.2022", F: "05.06.2022", G: "05.11.2022", H: "anything"},
                    {A: "v42", B: 2, C: 9, D: 7, E: "24.04.2022", F: "05.04.2022", G: "05.10.2022", H: "anything"},
                    {A: "v24", B: 5, C: 19, D: 16, E: "24.05.2022", F: "05.12.2021", G: "05.09.2022", H: "anything"},
                    {A: "v01", B: 3, C: 11, D: 17, E: "24.06.2022", F: "05.04.2022", G: "05.08.2023", H: "anything"},
                    {A: "v24", B: 6, C: 12, D: 18, E: "24.07.2022", F: "05.05.2022", G: "05.07.2022", H: "anything"}
                ],
                page = 1,
                total = 1;

            expect(getSnippetAdjustments([
                {snippetId: 1, type: "dropdown", attrName: "A"},
                {snippetId: 2, type: "slider", attrName: "B"},
                {snippetId: 3, type: "sliderRange", attrName: ["C", "D"]},
                {snippetId: 4, type: "date", attrName: "E", format: "DD.MM.YYYY"},
                {snippetId: 5, type: "dateRange", attrName: ["F", "G"], format: "DD.MM.YYYY"},
                {snippetId: 6, type: "anything", attrName: "H"}
            ], [
                {get: attrName => responses[0][attrName]},
                {get: attrName => responses[1][attrName]},
                {get: attrName => responses[2][attrName]},
                {get: attrName => responses[3][attrName]},
                {get: attrName => responses[4][attrName]},
                {get: attrName => responses[5][attrName]}
            ], page, total)).deep.equal({
                start: true,
                finish: true,
                1: {value: ["v07", "v24", "v42", "v01"]},
                2: {min: 1, max: 6},
                3: {min: 7, max: 19},
                4: {min: "24.02.2022", max: "24.07.2022"},
                5: {min: "05.12.2021", max: "05.08.2023"}
            });
        });
    });
});
