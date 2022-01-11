import {expect} from "chai";
import SearchResult from "../../../searchInterfaces/searchResult.js";

describe("src/modules/searchBar/searchInterfaces/searchResult.js", () => {
    let SearchResult1 = null;

    before(() => {
        SearchResult1 = new SearchResult();
    });

    describe("constructor", () => {
        it("should return an object that has the default value for empty input", () => {
            expect(SearchResult1).to.be.an("object").deep.equal({
                category: undefined,
                id: undefined,
                name: undefined,
                coordinates: [],
                displayedInfo: "",
                feature: {},
                geometryType: "",
                gfiAttributes: {},
                icon: "",
                imagePath: "",
                layerId: "",
                onClick: [],
                onHover: [],
                toolTip: ""
            });
        });
        it("should return an object that has the given params for params input", () => {
            const params = {
                    category: "abc",
                    id: "def",
                    name: "ghi",
                    coordinates: [1, 2],
                    displayedInfo: "jkl",
                    feature: {id: "123"},
                    geometryType: "mno",
                    gfiAttributes: {attr: "456"},
                    icon: "pqr",
                    imagePath: "stu",
                    layerId: "vw",
                    onClick: ["click"],
                    onHover: ["hover", "hover1234"],
                    toolTip: "xyz"
                },
                SearchResult2 = new SearchResult(params);

            expect(SearchResult2).to.be.an("object").deep.equal(params);
        });
    });
});
