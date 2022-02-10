import Vuex from "vuex";
import {config, shallowMount, createLocalVue, mount} from "@vue/test-utils";
import FilterGeneral from "../../../components/FilterGeneral.vue";
import FilterGeneralModule from "../../../store/indexFilterGeneral";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

localVue.use(Vuex);

describe("src/modules/tools/filterGeneral/components/FilterGeneral.vue", () => {
    let store, wrapper;

    beforeEach(() => {
        FilterGeneralModule.actions.initialize = sinon.spy();

        FilterGeneralModule.state.serviceID = undefined;
        FilterGeneralModule.state.layers = [
            {
                layerId: "8712",
                searchInMapExtent: true,
                paging: 10,
                snippets: [
                    {
                        attrName: "checkbox",
                        label: "Ist dies eine Schwerpunktschule?",
                        type: "checkbox",
                        operator: "EQ",
                        prechecked: false,
                        visible: true
                    }
                ]
            }
        ];

        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        FilterGeneral: FilterGeneralModule
                    }
                }
            },
            getters: {
                uiStyle: () => sinon.stub()
            }
        });

        store.commit("Tools/FilterGeneral/setActive", true);
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("shows only layer names with selectbox if none is selected", () => {
        wrapper = mount(FilterGeneral, {store, localVue});

        const layers = wrapper.find(".layerSelector");

        expect(layers.exists()).to.be.true;
    });

    it("should update layer by passed filterIds", () => {
        wrapper = shallowMount(FilterGeneral, {store, localVue});
        wrapper.vm.updateSelectedLayers([0]);

        const expected = [{
            filterId: 0,
            layerId: "8712",
            searchInMapExtent: true,
            paging: 10,
            snippets: [
                {
                    attrName: "checkbox",
                    label: "Ist dies eine Schwerpunktschule?",
                    type: "checkbox",
                    operator: "EQ",
                    prechecked: false,
                    visible: true
                }
            ]
        }];

        expect(wrapper.vm.selectedLayers).to.deep.equal(expected);
    });

    it("should show layer if filterId is in selectedLayers", () => {
        wrapper = shallowMount(FilterGeneral, {store, localVue});
        wrapper.vm.updateSelectedLayers([0]);

        expect(wrapper.vm.showLayerSnippet(0)).to.be.true;
    });

    it("should not show layer if filterId is not in selectedLayers", () => {
        wrapper = shallowMount(FilterGeneral, {store, localVue});
        wrapper.vm.updateSelectedLayers([1]);

        expect(wrapper.vm.showLayerSnippet(0)).to.be.false;
    });
});
