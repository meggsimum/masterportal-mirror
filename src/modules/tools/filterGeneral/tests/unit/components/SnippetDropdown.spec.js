import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import SnippetDropdown from "../../../components/SnippetDropdown.vue";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("src/modules/tools/filterGeneral/components/SnippetDropdown.vue", () => {
    describe("constructor", () => {
        it("should have correct default values", () => {
            const wrapper = shallowMount(SnippetDropdown, {localVue});

            expect(wrapper.vm.api).to.be.null;
            expect(wrapper.vm.addSelectAll).to.be.false;
            expect(wrapper.vm.autoInit).to.be.true;
            expect(wrapper.vm.display).to.equal("default");
            expect(wrapper.vm.info).to.be.false;
            expect(wrapper.vm.title).to.be.true;
            expect(wrapper.vm.multiselect).to.be.false;
            expect(wrapper.vm.operator).to.equal("EQ");
            expect(wrapper.vm.prechecked).to.be.undefined;
            expect(wrapper.vm.renderIcons).to.be.undefined;
            expect(wrapper.vm.snippetId).to.equal(0);
            expect(wrapper.vm.value).to.be.undefined;
            expect(wrapper.vm.visible).to.be.true;
            wrapper.destroy();
        });
        it("should render correctly with default values", () => {
            const wrapper = shallowMount(SnippetDropdown, {localVue});

            expect(wrapper.find(".select-box-container").exists()).to.be.true;
            wrapper.destroy();
        });
        it("should render hidden if visible is false", () => {
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {
                    visible: false
                },
                localVue
            });

            expect(wrapper.find(".snippetDropdownContainer").element.style._values.display).to.be.equal("none");
            wrapper.destroy();
        });
        it("should render but also be disabled", () => {
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {
                    disabled: true
                },
                localVue
            });

            expect(wrapper.find(".select-box-container").exists()).to.be.true;
            expect(wrapper.vm.disabled).to.be.true;
            wrapper.destroy();
        });
        it("should render with a title if the title is a string", () => {
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {
                    title: "foobar"
                },
                localVue
            });

            expect(wrapper.find(".select-box-label").text()).to.be.equal("foobar");
            wrapper.destroy();
        });
        it("should render without a title if title is a boolean and false", () => {
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {
                    title: false
                },
                localVue
            });

            expect(wrapper.find(".select-box-label").exists()).to.be.false;
            wrapper.destroy();
        });
        it("should have an empty list if autoInit is false and the api may be set", () => {
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {
                    api: true,
                    autoInit: false
                },
                localVue
            });

            expect(wrapper.vm.dropdownValue).to.be.an("array").and.to.be.empty;
            wrapper.destroy();
        });
    });

    describe("emitCurrentRule", () => {
        it("should emit changeRule function with the expected values", () => {
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {
                    snippetId: 1234,
                    visible: false,
                    attrName: "attrName",
                    operator: "operator"
                },
                localVue
            });

            wrapper.vm.emitCurrentRule("value", "startup");
            expect(wrapper.emitted("changeRule")).to.be.an("array").and.to.have.lengthOf(1);
            expect(wrapper.emitted("changeRule")[0]).to.be.an("array").and.to.have.lengthOf(1);
            expect(wrapper.emitted("changeRule")[0][0]).to.deep.equal({
                snippetId: 1234,
                startup: "startup",
                fixed: true,
                attrName: "attrName",
                operator: "operator",
                value: "value"
            });
            wrapper.destroy();
        });
        it("should emit changeRule function with the expected values when values are objects", () => {
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {
                    snippetId: 1234,
                    visible: false,
                    attrName: "attrName",
                    operator: "operator"
                },
                localVue
            });

            wrapper.vm.emitCurrentRule([
                {
                    title: "value",
                    img: "img",
                    desc: "desc"
                }
            ], "startup");
            expect(wrapper.emitted("changeRule")).to.be.an("array").and.to.have.lengthOf(1);
            expect(wrapper.emitted("changeRule")[0]).to.be.an("array").and.to.have.lengthOf(1);
            expect(wrapper.emitted("changeRule")[0][0]).to.deep.equal({
                snippetId: 1234,
                startup: "startup",
                fixed: true,
                attrName: "attrName",
                operator: "operator",
                value: ["value"]
            });
            wrapper.destroy();
        });
    });

    describe("deleteCurrentRule", () => {
        it("should emit deleteRule function with its snippetId", () => {
            const wrapper = shallowMount(SnippetDropdown, {
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
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {
                    prechecked: ["value"]
                },
                localVue
            });
            let called = false;

            expect(wrapper.vm.dropdownSelected).to.deep.equal(["value"]);
            await wrapper.vm.resetSnippet(() => {
                called = true;
            });
            expect(wrapper.vm.dropdownSelected).to.deep.equal([]);
            expect(called).to.be.true;
            wrapper.destroy();
        });
    });

    describe("display list", () => {
        it("should render a list with radio", async () => {
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {
                    "type": "dropdown",
                    "attrName": "kapitelbezeichnung",
                    "display": "list",
                    "multiselect": false,
                    "value": ["yek", "do"]
                },
                localVue
            });

            expect(wrapper.find(".snippetListContainer").exists()).to.be.true;
            expect(wrapper.find(".snippetListContainer .radio").exists()).to.be.true;

            wrapper.destroy();
        });
        it("should render a list with checkbox", async () => {
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {
                    "type": "dropdown",
                    "attrName": "kapitelbezeichnung",
                    "display": "list",
                    "multiselect": true,
                    "value": ["yek", "do"]
                },
                localVue
            });

            expect(wrapper.find(".snippetListContainer").exists()).to.be.true;
            expect(wrapper.find(".snippetListContainer .checkbox").exists()).to.be.true;

            wrapper.destroy();
        });
    });
});
