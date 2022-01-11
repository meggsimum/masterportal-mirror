import {expect} from "chai";
import SearchInterface from "../../../searchInterfaces/searchInterface.js";
import SearchInterfaceOsmNominatim from "../../../searchInterfaces/searchInterfaceOsmNominatim.js";

describe("src/modules/searchBar/searchInterfaces/searchInterfaceOsmNominatim.js", () => {
    let SearchInterface1 = null;

    before(() => {
        SearchInterface1 = new SearchInterfaceOsmNominatim();
    });

    afterEach(() => {
        SearchInterface1.clearSearchResults();
    });

    describe("prototype", () => {
        it("SearchInterfaceOsmNominatim should have the prototype SearchInterface", () => {
            expect(SearchInterface1).to.be.an.instanceof(SearchInterface);
        });
    });

    describe("", () => {
        it("", () => {
            // write more unit tests
        });
    });
});
