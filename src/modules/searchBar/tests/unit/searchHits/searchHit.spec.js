import {expect} from "chai";
import SearchHit from "../../../searchHits/searchHit.js";

describe("src/modules/searchBar/searchHits/searchHit.js", () => {
    let SearchHit1 = null;

    before(() => {
        SearchHit1 = new SearchHit();
    });

    describe("constructor", () => {
        it("should return an object that has the default value for empty input", () => {
            expect(SearchHit1).to.be.an("object").deep.equal({
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
                    searchInterfaceId: "rrr",
                    displayedInfo: "jkl",
                    icon: "pqr",
                    imagePath: "stu",
                    toolTip: "xyz"
                },
                SearchHit2 = new SearchHit(params);

            expect(SearchHit2).to.be.an("object").deep.equal(params);
        });
    });
});
