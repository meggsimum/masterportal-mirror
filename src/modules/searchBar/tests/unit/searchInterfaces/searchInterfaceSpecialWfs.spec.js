import {expect} from "chai";
import SearchInterface from "../../../searchInterfaces/searchInterface.js";
import SearchInterfaceSpecialWfs from "../../../searchInterfaces/searchInterfaceSpecialWfs.js";

describe("src/modules/searchBar/searchInterfaces/searchInterfaceSpecialWfs.js", () => {
    let SearchInterface1 = null;

    before(() => {
        SearchInterface1 = new SearchInterfaceSpecialWfs();
    });

    afterEach(() => {
        SearchInterface1.clearSearchResults();
    });

    describe("prototype", () => {
        it("SearchInterfaceSpecialWfs should have the prototype SearchInterface", () => {
            expect(SearchInterface1).to.be.an.instanceof(SearchInterface);
        });
    });

    describe("", () => {
        it("", () => {
            // write more unit tests
        });
    });
});
