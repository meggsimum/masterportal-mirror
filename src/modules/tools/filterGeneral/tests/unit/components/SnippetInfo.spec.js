import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import SnippetInfo from "../../../components/SnippetInfo.vue";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;
describe("src/modules/tools/filterGeneral/components/SnippetInfo.vue", () => {
    it("should render correctly", () => {
        const wrapper = shallowMount(SnippetInfo, {
            propsData: {
                info: "Information",
                translationKey: "snippetInput"
            },
            localVue
        });

        expect(wrapper.find(".info-icon").exists()).to.be.true;
        expect(wrapper.find(".bottom").exists()).to.be.true;
        expect(wrapper.find(".info-text").exists()).to.be.true;
        wrapper.destroy();
    });
    it("should not render elements", () => {
        const wrapper = shallowMount(SnippetInfo, {
            propsData: {
                info: false,
                translationKey: "snippetInput"
            },
            localVue
        });

        expect(wrapper.find(".info-icon").exists()).to.be.false;
        expect(wrapper.find(".bottom").exists()).to.be.false;
        expect(wrapper.find(".info-text").exists()).to.be.false;
        wrapper.destroy();
    });
    it("should show info if info-button is clicked", () => {
        const wrapper = shallowMount(SnippetInfo, {
            propsData: {
                info: "Information",
                translationKey: "snippetInput"
            },
            localVue
        });

        expect(wrapper.vm.showInfo).to.be.false;
        wrapper.vm.toggleInfo();
        expect(wrapper.vm.showInfo).to.be.true;
        expect(wrapper.find(".bottom").exists()).to.be.true;
        expect(wrapper.find(".info-text span").text()).to.be.equal("Information");

        wrapper.destroy();
    });
    it("should render info-icon correctly with translation key", () => {
        const wrapper = shallowMount(SnippetInfo, {
            propsData: {
                info: true,
                translationKey: "snippetInput"
            },
            localVue
        });

        wrapper.vm.toggleInfo();

        expect(wrapper.find(".info-icon").exists()).to.be.true;
        expect(wrapper.find(".bottom").exists()).to.be.true;
        expect(wrapper.find(".info-text span").text()).to.be.equal("common:modules.tools.filterGeneral.info.snippetInput");

        wrapper.destroy();
    });
});
