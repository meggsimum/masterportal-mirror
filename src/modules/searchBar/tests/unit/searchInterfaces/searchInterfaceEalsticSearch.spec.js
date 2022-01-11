import {expect} from "chai";
import SearchInterface from "../../../searchInterfaces/searchInterface.js";
import SearchInterfaceElasticSearch from "../../../searchInterfaces/searchInterfaceElasticSearch.js";

describe("src/modules/searchBar/searchInterfaces/searchInterfaceElasticSearch.js", () => {
    let SearchInterface1 = null;

    before(() => {
        SearchInterface1 = new SearchInterfaceElasticSearch();
    });

    afterEach(() => {
        SearchInterface1.clearSearchResults();
    });

    describe("prototype", () => {
        it("SearchInterfaceElasticSearch should have the prototype SearchInterface", () => {
            expect(SearchInterface1).to.be.an.instanceof(SearchInterface);
        });
    });

    describe("", () => {
        it("", () => {
            // write more unit tests
        });
    });
});
