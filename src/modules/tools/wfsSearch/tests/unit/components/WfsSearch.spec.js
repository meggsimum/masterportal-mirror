import Vuex from "vuex";
import {config, mount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import WfsSearchLiteral from "../../../components/WfsSearchLiteral.vue";
import WfsSearch from "../../../components/WfsSearch.vue";
import WfsSearchModule from "../../../store/indexWfsSearch";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/wfsSearch/components/WfsSearch.vue", () => {
    let instances,
        store;

    beforeEach(() => {
        instances = [{
            title: "Test WfsSearch",
            resultList: {},
            literals: [{}]
        }];
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        WfsSearch: WfsSearchModule
                    }
                }
            }
        });
        store.commit("Tools/WfsSearch/setActive", true);
    });
    afterEach(sinon.restore);

    it("renders a literal", () => {
        store.commit("Tools/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
            localVue,
            store
        });

        expect(wrapper.findComponent(WfsSearchLiteral).exists()).to.be.true;
    });
    it("renders multiple literals if configured", () => {
        instances[0].literals.push({}, {});
        store.commit("Tools/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
            localVue,
            store
        });

        expect(wrapper.findAllComponents(WfsSearchLiteral).length).to.equal(3);
    });
    it("renders a select field to select the searchInstance if configured", () => {
        instances.push({
            title: "Test WfsSearch II",
            literals: [{}]
        });
        store.commit("Tools/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
            localVue,
            store
        });

        expect(wrapper.find("#tool-wfsSearch-instances-select-label").exists()).to.be.true;
        expect(wrapper.find("#tool-wfsSearch-instances-select").exists()).to.be.true;
    });
    it("renders a container with userHelp if configured", () => {
        store.commit("Tools/WfsSearch/setUserHelp", "test");
        store.commit("Tools/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
            localVue,
            store
        });

        expect(wrapper.find("#tool-wfsSearch-userHelp").exists()).to.be.true;
        expect(wrapper.find("#tool-wfsSearch-userHelp-icon").exists()).to.be.true;
        expect(wrapper.find("#tool-wfsSearch-userHelp-text").exists()).to.be.true;
    });
    it("renders a button to reset the UI", () => {
        store.commit("Tools/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
                localVue,
                store
            }),
            resetButton = wrapper.find("#tool-wfsSearch-button-resetUI");

        expect(resetButton.exists()).to.be.true;
        expect(resetButton.text()).to.equal("common:modules.tools.wfsSearch.resetButton");
    });
    it("renders an input element of type submit to search", () => {
        store.commit("Tools/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
                localVue,
                store
            }),
            searchInput = wrapper.find("#tool-wfsSearch-button-search");

        expect(searchInput.exists()).to.be.true;
        expect(searchInput.element.value).to.equal("common:modules.tools.wfsSearch.searchButton");
        expect(searchInput.element.type).to.equal("submit");
    });
    it("renders a clickable button to show the search results if the user searched and results were found", () => {
        store.commit("Tools/WfsSearch/setSearched", true);
        store.commit("Tools/WfsSearch/setResults", [{}]);
        store.commit("Tools/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
                localVue,
                store
            }),
            searchButton = wrapper.find("#tool-wfsSearch-button-showResults");

        expect(searchButton.exists()).to.be.true;
        expect(searchButton.text()).to.equal("common:modules.tools.wfsSearch.showResults (1)");
        expect(searchButton.element.disabled).to.be.false;
    });
    it("renders a disabled button if the user searched and no results were found", () => {
        store.commit("Tools/WfsSearch/setSearched", true);
        store.commit("Tools/WfsSearch/setResults", []);
        store.commit("Tools/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
                localVue,
                store
            }),
            searchButton = wrapper.find("#tool-wfsSearch-button-showResults");

        expect(searchButton.exists()).to.be.true;
        expect(searchButton.text()).to.equal("common:modules.tools.wfsSearch.showResults (0)");
        expect(searchButton.element.disabled).to.be.true;
    });
    it("renders a disabled button if the user searched but the parameter 'resultList' was not configured", () => {
        store.commit("Tools/WfsSearch/setSearched", true);
        store.commit("Tools/WfsSearch/setResults", [{}]);
        delete instances[0].resultList;
        store.commit("Tools/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
                localVue,
                store
            }),
            searchButton = wrapper.find("#tool-wfsSearch-button-showResults");

        expect(searchButton.exists()).to.be.true;
        expect(searchButton.text()).to.equal("common:modules.tools.wfsSearch.showResults (1)");
        expect(searchButton.element.disabled).to.be.true;
    });
});
