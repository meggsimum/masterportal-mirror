import {expect} from "chai";
import SearchResult from "../../../searchResults/searchResult.js";

describe("src/modules/searchBar/searchResults/searchResult.js", () => {
    let SearchResult1 = null;

    before(() => {
        SearchResult1 = new SearchResult();
    });

    describe("constructor", () => {
        it("should return an object that has the default value for empty input", () => {
            expect(SearchResult1).to.be.an("object").deep.equal({
                category: undefined,
                events: undefined,
                id: undefined,
                name: undefined,
                displayedInfo: "",
                icon: "",
                imagePath: "",
                toolTip: ""
            });
        });
        it("should return an object that has the given params for params input", () => {
            const params = {
                    category: "abc",
                    events: {a: 1, b: 2},
                    id: "def",
                    name: "ghi",
                    displayedInfo: "jkl",
                    icon: "pqr",
                    imagePath: "stu",
                    toolTip: "xyz"
                },
                SearchResult2 = new SearchResult(params);

            expect(SearchResult2).to.be.an("object").deep.equal(params);
        });
    });
});
