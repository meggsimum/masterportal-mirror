import Vuex from "vuex";
import {config, mount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";

import WfsSearchField from "../../../components/WfsSearchField.vue";
import WfsSearchModule from "../../../store/indexWfsSearch";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/wfsSearch/components/WfsSearchField.vue", () => {
    let store;

    beforeEach(() => {
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
    });

    it("renders an input element with fitting label", () => {
        const wrapper = mount(WfsSearchField, {
            localVue,
            store,
            propsData: {
                fieldId: "fieldId",
                fieldName: "fieldName",
                inputLabel: "inputLabel"
            }
        });

        expect(wrapper.find("input").exists()).to.be.true;
        expect(wrapper.find("select").exists()).to.be.false;
        expect(wrapper.find("label").text()).to.equal("inputLabel");
    });

    it("renders a select element for the value when given options", () => {
        const wrapper = mount(WfsSearchField, {
                localVue,
                store,
                propsData: {
                    fieldId: "fieldId",
                    fieldName: "fieldName",
                    inputLabel: "inputLabel",
                    options: ["Option A", "Option B"]
                }
            }),
            options = wrapper.findAll("option");

        expect(wrapper.find("select").exists()).to.be.true;
        expect(wrapper.find("label").text()).to.equal("inputLabel");
        expect(wrapper.find("input").exists()).to.be.false;
        expect(options.at(0).text()).to.equal("common:modules.tools.wfsSearch.optionsPlaceholder");
        expect(options.at(1).text()).to.equal("Option A");
        expect(options.at(2).text()).to.equal("Option B");
    });

    it("renders a select element instead of the label when given label options", () => {
        const wrapper = mount(WfsSearchField, {
                localVue,
                store,
                propsData: {
                    fieldId: "fieldId",
                    fieldName: "fieldName",
                    inputLabel: ["inputLabel A", "inputLabel B"]
                }
            }),
            options = wrapper.findAll("option");

        expect(wrapper.find("label").exists()).to.be.false;
        expect(wrapper.find("select").exists()).to.be.true;
        expect(options.at(0).text()).to.equal("inputLabel A");
        expect(options.at(1).text()).to.equal("inputLabel B");
    });
});
