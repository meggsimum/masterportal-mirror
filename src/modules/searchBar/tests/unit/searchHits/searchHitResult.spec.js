import {expect} from "chai";
import SearchHitResult from "../../../searchHits/searchHitResult.js";

describe("src/modules/searchBar/searchHits/searchHitResult.js", () => {
    let SearchHitResult1 = null;

    before(() => {
        SearchHitResult1 = new SearchHitResult();
    });

    describe("constructor", () => {
        it("should return an object that has the default value for empty input", () => {
            expect(SearchHitResult1).to.be.an("object").deep.equal({
                category: undefined,
                events: undefined,
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
                    events: {a: 1, b: 2},
                    id: "def",
                    index: 0,
                    name: "ghi",
                    searchInterfaceId: "gaz",
                    displayedInfo: "jkl",
                    icon: "pqr",
                    imagePath: "stu",
                    toolTip: "xyz"
                },
                SearchHitResult2 = new SearchHitResult(params);

            expect(SearchHitResult2).to.be.an("object").deep.equal(params);
        });
    });
});
