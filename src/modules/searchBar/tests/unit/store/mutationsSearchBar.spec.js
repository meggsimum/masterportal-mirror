import mutations from "../../../store/mutationsSearchBar";
import {expect} from "chai";

const {
    addSearchInterfaceInstances,
    addSearchHits
} = mutations;

describe("src/modules/searchBar/store/mutationsSearchBar.spec.js", () => {
    describe("addSearchInterfaceInstances", () => {
        it("Should add a given SearchInterface to state", () => {
            const state = {
                    searchInterfaceInstances: []
                },
                searchInterfaceInstance = {
                    searchInterfaceId: "The first instance"
                };

            addSearchInterfaceInstances(state, searchInterfaceInstance);

            expect(state.searchInterfaceInstances).to.deep.equals([searchInterfaceInstance]);
        });
    });

    describe("addSearchHits", () => {
        const instance = {
                searchInterfaceId: "The first instance",
                searchState: "finnished",
                totalHits: 1
            },
            searchHits = {
                id: "The first search hit"
            };

        it("Should add search hits to state searchSuggestions by searchtype = 'suggestion'", () => {
            const state = {
                    searchSuggestions: [],
                    searchResults: []
                },
                searchType = "suggestion";

            addSearchHits(state, {instance, searchHits, searchType});

            expect(state.searchSuggestions).to.deep.equals([{
                searchInterfaceId: "The first instance",
                searchState: "finnished",
                totalHits: 1,
                searchSuggestions: {
                    id: "The first search hit"
                }
            }]);
            expect(state.searchResults).to.be.empty;
        });

        it("Should add search hits to state searchResults by searchtype = 'result'", () => {
            const state = {
                    searchSuggestions: [],
                    searchResults: []
                },
                searchType = "result";

            addSearchHits(state, {instance, searchHits, searchType});

            expect(state.searchSuggestions).to.be.empty;
            expect(state.searchResults).to.deep.equals([{
                searchInterfaceId: "The first instance",
                searchState: "finnished",
                totalHits: 1,
                searchResults: {
                    id: "The first search hit"
                }
            }]);
        });
    });
});
