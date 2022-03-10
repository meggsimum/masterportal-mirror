import actions from "../../../../store/actions/actionsSearchBarSearchInterfaces";
import {expect} from "chai";
import sinon from "sinon";

const {
    instantiateSearchInterfaces,
    search
} = actions;

describe("src/modules/searchBar/store/actions/actionsSearchBarSearchInterfaces.spec.js", () => {
    describe("instantiateSearchInterfaces", () => {
        it("should instantiate the gazetteer search interface", () => {
            const state = {
                    searchInterfaces: {
                        "gazetteer": {
                            "serviceId": "8",
                            "searchAddress": true,
                            "searchStreets": true,
                            "searchHouseNumbers": true,
                            "searchDistricts": true,
                            "searchParcels": true,
                            "searchStreetKey": true
                        }
                    }
                },
                commit = sinon.spy();

            instantiateSearchInterfaces({state, commit});

            expect(commit.calledOnce).to.be.true;
            expect(commit.args[0]).includes("addSearchInterfaceInstances");
        });
    });

    describe("search", () => {
        it("should search in configured search instances", async () => {
            const state = {
                    searchInterfaceInstances: [{
                        search: async (searchInput) => [searchInput]
                    }]
                },
                searchInput = "Test",
                searchType = "result",
                commit = sinon.spy();

            await search({state, commit}, {searchInput, searchType});

            expect(commit.calledOnce).to.be.true;
            expect(commit.args[0]).includes("addSearchHits");
        });
    });
});
