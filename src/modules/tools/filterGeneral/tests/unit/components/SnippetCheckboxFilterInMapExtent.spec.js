import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import SnippetCheckboxFilterInMapExtentComponent from "../../../components/SnippetCheckboxFilterInMapExtent.vue";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("src/modules/tools/filterGeneral/components/SnippetCheckboxFilterInMapExtent.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(SnippetCheckboxFilterInMapExtentComponent, {
            propsData: {
                filterId: 1
            },
            localVue
        });
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("should render correctly", () => {
        expect(wrapper.find("input").classes("snippetCheckbox")).to.be.true;
        expect(wrapper.find(".snippetCheckbox").element.checked).to.be.equal(false);
    });
});
