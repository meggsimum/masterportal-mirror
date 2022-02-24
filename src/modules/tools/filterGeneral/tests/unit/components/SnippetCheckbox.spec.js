import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import SnippetCheckbox from "../../../components/SnippetCheckbox.vue";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("src/modules/tools/filterGeneral/components/SnippetCheckbox.vue", () => {
    describe("constructor", () => {
        it("should have correct default values", () => {
            const wrapper = shallowMount(SnippetCheckbox, {localVue});

            expect(wrapper.vm.info).to.be.false;
            expect(wrapper.vm.title).to.be.true;
            expect(wrapper.vm.operator).to.equal("EQ");
            expect(wrapper.vm.prechecked).to.be.false;
            expect(wrapper.vm.snippetId).to.equal(0);
            expect(wrapper.vm.value).to.deep.equal([true, false]);
            expect(wrapper.vm.visible).to.be.true;
            wrapper.destroy();
        });
        it("should render correctly with default values", () => {
            const wrapper = shallowMount(SnippetCheckbox, {localVue});

            expect(wrapper.find("input").classes("snippetCheckbox")).to.be.true;
            wrapper.destroy();
        });
        it("should render hidden if visible is false", () => {
            const wrapper = shallowMount(SnippetCheckbox, {
                propsData: {
                    visible: false
                },
                localVue
            });

            expect(wrapper.find(".snippetCheckboxContainer").element.style._values.display).to.be.equal("none");
            wrapper.destroy();
        });
        it("should render with checked box if prechecked is true", () => {
            const wrapper = shallowMount(SnippetCheckbox, {
                propsData: {
                    prechecked: true
                },
                localVue
            });

            expect(wrapper.find(".snippetCheckbox").element.checked).to.be.equal(true);
            wrapper.destroy();
        });
        it("should render but also be disabled", () => {
            const wrapper = shallowMount(SnippetCheckbox, {
                propsData: {
                    disabled: true
                },
                localVue
            });

            expect(wrapper.find(".snippetCheckbox").exists()).to.be.true;
            expect(wrapper.vm.disabled).to.be.true;
            expect(wrapper.find(".snippetCheckbox").element.disabled).to.be.true;
            wrapper.destroy();
        });
        it("should render with a title if the title is a string", () => {
            const wrapper = shallowMount(SnippetCheckbox, {
                propsData: {
                    title: "foobar"
                },
                localVue
            });

            expect(wrapper.find(".snippetCheckboxLabel").text()).to.be.equal("foobar");
            wrapper.destroy();
        });
        it("should render without a title if title is a boolean and false", () => {
            const wrapper = shallowMount(SnippetCheckbox, {
                propsData: {
                    title: false
                },
                localVue
            });

            expect(wrapper.find(".snippetCheckboxLabel").exists()).to.be.false;
            wrapper.destroy();
        });
        it("should not render the info button if info is a boolean and false", () => {
            const wrapper = shallowMount(SnippetCheckbox, {
                propsData: {
                    info: false
                },
                localVue
            });

            expect(wrapper.find(".info-icon").exists()).to.be.false;
            wrapper.destroy();
        });
    });

    describe("emitCurrentRule", () => {
        it("should emit changeRule function with the expected values", () => {
            const wrapper = shallowMount(SnippetCheckbox, {
                propsData: {
                    snippetId: 1234,
                    visible: false,
                    attrName: "attrName",
                    operator: "operator"
                },
                localVue
            });

            wrapper.vm.emitCurrentRule(true, "startup");
            expect(wrapper.emitted("changeRule")).to.be.an("array").and.to.have.lengthOf(1);
            expect(wrapper.emitted("changeRule")[0]).to.be.an("array").and.to.have.lengthOf(1);
            expect(wrapper.emitted("changeRule")[0][0]).to.deep.equal({
                snippetId: 1234,
                startup: "startup",
                fixed: true,
                attrName: "attrName",
                operator: "operator",
                value: true
            });
            wrapper.destroy();
        });
    });

    describe("deleteCurrentRule", () => {
        it("should emit deleteRule function with its snippetId", () => {
            const wrapper = shallowMount(SnippetCheckbox, {
                propsData: {
                    snippetId: 1234
                },
                localVue
            });

            wrapper.vm.deleteCurrentRule();
            expect(wrapper.emitted("deleteRule")).to.be.an("array").and.to.have.lengthOf(1);
            expect(wrapper.emitted("deleteRule")[0]).to.be.an("array").and.to.have.lengthOf(1);
            expect(wrapper.emitted("deleteRule")[0][0]).to.equal(1234);
            wrapper.destroy();
        });
    });

    describe("resetSnippet", () => {
        it("should reset the snippet value and call the given onsuccess handler", async () => {
            const wrapper = shallowMount(SnippetCheckbox, {
                propsData: {
                    prechecked: true
                },
                localVue
            });
            let called = false;

            expect(wrapper.vm.checked).to.equal(true);
            await wrapper.vm.resetSnippet(() => {
                called = true;
            });
            expect(wrapper.vm.checked).to.equal(false);
            expect(called).to.be.true;
            wrapper.destroy();
        });
    });
});
