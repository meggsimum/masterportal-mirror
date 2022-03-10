import {expect} from "chai";
import sinon from "sinon";
import SearchInterface from "../../../searchInterfaces/searchInterface.js";
import SearchInterfaceGazetteer from "../../../searchInterfaces/searchInterfaceGazetteer.js";
import store from "../../../../../app-store";

describe("src/modules/searchBar/searchInterfaces/searchInterfaceGazetteer.js", () => {
    let SearchInterface1 = null;

    before(() => {
        store.getters = {
            getRestServiceById: () => sinon.stub()
        };

        SearchInterface1 = new SearchInterfaceGazetteer();
    });

    afterEach(() => {
        SearchInterface1.clearSearchResults();
    });

    describe("prototype", () => {
        it("SearchInterfaceGazetteer should have the prototype SearchInterface", () => {
            expect(SearchInterface1).to.be.an.instanceof(SearchInterface);
        });
    });

    describe("", () => {
        it("", () => {
            // write more unit tests
        });
    });
});
