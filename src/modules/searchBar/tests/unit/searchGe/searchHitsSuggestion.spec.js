import {expect} from "chai";
import SearchHitSuggestion from "../../../searchHits/searchHitSuggestion.js";

describe("src/modules/searchBar/searchHits/searchHitSuggestion.js", () => {
    let SearchHitSuggestion1 = null;

    before(() => {
        SearchHitSuggestion1 = new SearchHitSuggestion();
    });

    describe("constructor", () => {
        it("should return an object that has the default value for empty input", () => {
            expect(SearchHitSuggestion1).to.be.an("object").deep.equal({
                category: undefined,
                id: undefined,
                index: undefined,
                name: undefined,
                searchInterfaceId: undefined,
                displayedInfo: "",
                icon: "",
                imagePath: "",
                toolTip: ""
            });
        });
        it("should return an object that has the given params for params input", () => {
            const params = {
                    category: "abc",
                    id: "def",
                    index: 0,
                    name: "ghi",
                    searchInterfaceId: "gaz",
                    displayedInfo: "jkl",
                    icon: "pqr",
                    imagePath: "stu",
                    toolTip: "xyz"
                },
                SearchHitSuggestion2 = new SearchHitSuggestion(params);

            expect(SearchHitSuggestion2).to.be.an("object").deep.equal(params);
        });
    });
});
