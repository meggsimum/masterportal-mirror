import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";

import SearchBarSuggestionListComponent from "../../../components/SearchBarSuggestionList.vue";
import SearchBar from "../../../store/indexSearchBar";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/searchBar/components/SearchBarSuggestionList.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            searchBar: {
                id: "searchBar",
                placeholder: "common:modules.searchbar.placeholder.address"
            }
        }
    };
    let store,
        wrapper;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaced: true,
            modules: {
                namespaced: true,
                modules: {
                    SearchBar
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
    });

    it("renders the SearchBarSuggestionList", () => {
        wrapper = shallowMount(SearchBarSuggestionListComponent, {store, localVue});

        expect(wrapper.find("#search-bar-suggestion-list").exists()).to.be.true;
    });
});
