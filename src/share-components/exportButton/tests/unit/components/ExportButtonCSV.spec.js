import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import ExportButtonCSV from "../../../components/ExportButtonCSV.vue";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/share-components/exportButton/components/exportButtonCSV.vue", () => {
    before(() => {
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });
    describe("createFilename", () => {
        const wrapper = shallowMount(ExportButtonCSV, {
            propsData: {},
            localVue
        });

        expect(wrapper.vm.createFilename("prefix", "YYYY")).to.equal("prefix" + String(new Date().getFullYear()) + ".csv");
    });
    describe("template", () => {
        const wrapper = shallowMount(ExportButtonCSV, {
            propsData: {},
            localVue
        });

        expect(wrapper.find("button").exists()).to.be.true;
    });
});
