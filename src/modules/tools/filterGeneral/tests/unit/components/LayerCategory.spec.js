import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import LayerCategory from "../../../components/LayerCategory.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;


describe("src/modules/tools/filterGeneral/components/LayerCategory.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(LayerCategory, {
            propsData: {
                filtersOnly: [
                    {
                        "layerId": "8712",
                        "searchInMapExtent": true,
                        "paging": 10,
                        "snippets": [
                            {
                                "attrName": "checkbox",
                                "label": "Ist dies eine Schwerpunktschule?",
                                "type": "checkbox",
                                "operator": "EQ",
                                "prechecked": false,
                                "visible": true
                            }
                        ]
                    }
                ],
                categoriesOnly: [
                    {
                        category: "TEST",
                        shortDescription: "foo bar",
                        layers: [
                            {
                                "layerId": "8713",
                                "title": "FOOBAR",
                                "searchInMapExtent": true,
                                "paging": 10,
                                "snippets": [
                                    {
                                        "attrName": "checkbox",
                                        "label": "Ist dies eine Schwerpunktschule2?",
                                        "type": "checkbox",
                                        "operator": "EQ",
                                        "prechecked": false,
                                        "visible": true
                                    }
                                ]
                            }
                        ]
                    }
                ],
                multiLayerSelector: false,
                "layerSelectorVisible": true
            },
            localVue
        });
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("should render filters", () => {
        expect(wrapper.findAll(".panel-default").exists()).to.be.true;
    });

    it("should render description", () => {
        const description = wrapper.findAll(".layerInfoText");

        expect(description.exists()).to.be.true;
    });

    describe("updateSelectedLayers", () => {
        it("should not change selected layers if passed argument is not an id", () => {
            const expected = [];

            wrapper.vm.updateSelectedLayers(null);
            wrapper.vm.updateSelectedLayers(undefined);
            wrapper.vm.updateSelectedLayers([]);
            wrapper.vm.updateSelectedLayers("1234");
            wrapper.vm.updateSelectedLayers({});
            wrapper.vm.updateSelectedLayers(false);
            wrapper.vm.updateSelectedLayers(true);

            expect(wrapper.vm.selectedLayers).to.deep.equal(expected);

        });

        it("should update selected layers", () => {
            const expected = [1234],
                filterId = 1234;

            wrapper.vm.updateSelectedLayers(filterId);
            expect(wrapper.vm.selectedLayers).to.deep.equal(expected);
        });
    });

    describe("updateSelectedCategories", () => {
        it("should not change selected categories if passed argument is not an id", () => {
            const expected = [];

            wrapper.vm.updateSelectedCategories(null);
            wrapper.vm.updateSelectedCategories(undefined);
            wrapper.vm.updateSelectedCategories([]);
            wrapper.vm.updateSelectedCategories(1234);
            wrapper.vm.updateSelectedCategories({});
            wrapper.vm.updateSelectedCategories(false);
            wrapper.vm.updateSelectedCategories(true);

            expect(wrapper.vm.selectedCategory).to.deep.equal(expected);

        });

        it("should update selected layers", () => {
            const expected = ["foo"],
                category = "foo";

            wrapper.vm.updateSelectedCategories(category);
            expect(wrapper.vm.selectedCategory).to.deep.equal(expected);
        });
    });
});
