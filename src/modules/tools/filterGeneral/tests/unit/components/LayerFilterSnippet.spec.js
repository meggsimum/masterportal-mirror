import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import LayerFilterSnippet from "../../../components/LayerFilterSnippet.vue";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("src/modules/tools/filterGeneral/components/LayerFilterSnippet.vue", () => {
    let wrapper = null;

    beforeEach(() => {
        wrapper = shallowMount(LayerFilterSnippet, {
            propsData: {
                layerConfig: {
                    service: {
                        type: "something external"
                    }
                }
            },
            localVue
        });
    });
    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    describe("constructor", () => {
        it("should setup with an external service if no internal service is given", () => {
            expect(wrapper.vm.layerService).to.deep.equal({
                type: "something external"
            });
        });
        it("should setup with an external service if a layerId is given, but no internal service is given", () => {
            const localWrapper = shallowMount(LayerFilterSnippet, {
                propsData: {
                    layerConfig: {
                        layerId: "layerId",
                        service: {
                            type: "something external"
                        }
                    }
                },
                localVue
            });

            expect(wrapper.vm.layerService).to.deep.equal({
                type: "something external"
            });
            localWrapper.destroy();
        });
    });
    describe("hasThisSnippetTheExpectedType", () => {
        it("should return false if the given snippet has not the expected type", () => {
            expect(wrapper.vm.hasThisSnippetTheExpectedType(undefined)).to.be.false;
            expect(wrapper.vm.hasThisSnippetTheExpectedType(null)).to.be.false;
            expect(wrapper.vm.hasThisSnippetTheExpectedType(1234)).to.be.false;
            expect(wrapper.vm.hasThisSnippetTheExpectedType("string")).to.be.false;
            expect(wrapper.vm.hasThisSnippetTheExpectedType(true)).to.be.false;
            expect(wrapper.vm.hasThisSnippetTheExpectedType(false)).to.be.false;
            expect(wrapper.vm.hasThisSnippetTheExpectedType([])).to.be.false;
            expect(wrapper.vm.hasThisSnippetTheExpectedType({})).to.be.false;

            expect(wrapper.vm.hasThisSnippetTheExpectedType({type: "anything"}, "something")).to.be.false;
        });
        it("should return true if the given snippet has the expected type", () => {
            expect(wrapper.vm.hasThisSnippetTheExpectedType({type: "something"}, "something")).to.be.true;
        });
    });
    describe("searchInMapExtentChanged", () => {
        it("should set the internal searchInMapExtent variable to the given value", () => {
            expect(wrapper.vm.searchInMapExtent).to.be.false;
            wrapper.vm.searchInMapExtentChanged(true);
            expect(wrapper.vm.searchInMapExtent).to.be.true;
        });
    });
    describe("isRule", () => {
        it("should return false if anything but a rule is given", () => {
            expect(wrapper.vm.isRule(undefined)).to.be.false;
            expect(wrapper.vm.isRule(null)).to.be.false;
            expect(wrapper.vm.isRule("string")).to.be.false;
            expect(wrapper.vm.isRule(1234)).to.be.false;
            expect(wrapper.vm.isRule(true)).to.be.false;
            expect(wrapper.vm.isRule(false)).to.be.false;
            expect(wrapper.vm.isRule([])).to.be.false;
            expect(wrapper.vm.isRule({})).to.be.false;
        });
        it("should return true if a rule is given", () => {
            expect(wrapper.vm.isRule({
                snippetId: 0,
                startup: false,
                fixed: false,
                attrName: "",
                operator: ""
            })).to.be.true;
        });
    });
    describe("changeRule", () => {
        it("should add the new rule", () => {
            wrapper.vm.changeRule({
                snippetId: 0,
                startup: false,
                fixed: false,
                attrName: "test",
                operator: "EQ"
            });
            expect(wrapper.vm.rules).to.deep.equal([{
                snippetId: 0,
                startup: false,
                fixed: false,
                attrName: "test",
                operator: "EQ"
            }]);
        });
        it("should change an existing rule", () => {
            wrapper.vm.changeRule({
                snippetId: 0,
                startup: false,
                fixed: false,
                attrName: "test",
                operator: "EQ"
            });
            wrapper.vm.changeRule({
                snippetId: 0,
                startup: false,
                fixed: false,
                attrName: "test",
                operator: "IN"
            });
            expect(wrapper.vm.rules).to.deep.equal([{
                snippetId: 0,
                startup: false,
                fixed: false,
                attrName: "test",
                operator: "IN"
            }]);
        });
    });
    describe("deleteRule", () => {
        it("should delete an existing rule", () => {
            wrapper.vm.changeRule({
                snippetId: 0,
                startup: false,
                fixed: false,
                attrName: "test",
                operator: "EQ"
            });
            wrapper.vm.deleteRule(0);
            expect(wrapper.vm.rules).to.deep.equal([false]);
        });
    });
    describe("hasUnfixedRules", () => {
        it("should return false if there are no rules with fixed=false", () => {
            wrapper.vm.changeRule({
                snippetId: 1,
                startup: false,
                fixed: true,
                attrName: "test",
                operator: "EQ"
            });
            expect(wrapper.vm.hasUnfixedRules()).to.be.false;
        });
        it("should return true if there are rules with fixed=false in the rules", () => {
            wrapper.vm.changeRule({
                snippetId: 0,
                startup: false,
                fixed: false,
                attrName: "test",
                operator: "EQ"
            });
            wrapper.vm.changeRule({
                snippetId: 1,
                startup: false,
                fixed: true,
                attrName: "test",
                operator: "EQ"
            });
            expect(wrapper.vm.hasUnfixedRules()).to.be.true;
        });
    });
});
