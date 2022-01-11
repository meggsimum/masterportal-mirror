import {expect} from "chai";
import SearchInterface from "../../../searchInterfaces/searchInterface.js";
import SearchInterfaceBkg from "../../../searchInterfaces/searchInterfaceBkg.js";

describe("src/modules/searchBar/searchInterfaces/searchInterfaceBkg.js", () => {
    let SearchInterface1 = null;

    before(() => {
        SearchInterface1 = new SearchInterfaceBkg();
    });

    afterEach(() => {
        SearchInterface1.clearSearchResults();
    });

    describe("prototype", () => {
        it("SearchInterfaceBkg should have the prototype SearchInterface", () => {
            expect(SearchInterface1).to.be.an.instanceof(SearchInterface);
        });
    });

    describe("", () => {
        it("", () => {
            // write more unit tests
        });
    });
});
