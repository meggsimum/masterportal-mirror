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
    describe("setSearchInMapExtent", () => {
        it("should set the internal searchInMapExtent variable to the given value", () => {
            expect(wrapper.vm.searchInMapExtent).to.be.false;
            wrapper.vm.setSearchInMapExtent(true);
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
    describe("getDefaultSnippetTypeByDataType", () => {
        it("should return snippet type according to the input data type", () => {
            expect(wrapper.vm.getDefaultSnippetTypeByDataType(undefined)).to.equal("text");
            expect(wrapper.vm.getDefaultSnippetTypeByDataType(null)).to.equal("text");
            expect(wrapper.vm.getDefaultSnippetTypeByDataType(0)).to.equal("text");
            expect(wrapper.vm.getDefaultSnippetTypeByDataType({})).to.equal("text");
            expect(wrapper.vm.getDefaultSnippetTypeByDataType([])).to.equal("text");
            expect(wrapper.vm.getDefaultSnippetTypeByDataType("boolean")).to.equal("checkbox");
            expect(wrapper.vm.getDefaultSnippetTypeByDataType("string")).to.equal("dropdown");
            expect(wrapper.vm.getDefaultSnippetTypeByDataType("number")).to.equal("sliderRange");
        });
    });
    describe("getDefaultOperatorBySnippetType", () => {
        it("should return operator according to the input snippet type", () => {
            expect(wrapper.vm.getDefaultOperatorBySnippetType(undefined)).to.equal("EQ");
            expect(wrapper.vm.getDefaultOperatorBySnippetType(null)).to.equal("EQ");
            expect(wrapper.vm.getDefaultOperatorBySnippetType(0)).to.equal("EQ");
            expect(wrapper.vm.getDefaultOperatorBySnippetType({})).to.equal("EQ");
            expect(wrapper.vm.getDefaultOperatorBySnippetType([])).to.equal("EQ");
            expect(wrapper.vm.getDefaultOperatorBySnippetType("checkbox")).to.equal("EQ");
            expect(wrapper.vm.getDefaultOperatorBySnippetType("date")).to.equal("EQ");
            expect(wrapper.vm.getDefaultOperatorBySnippetType("dateRange")).to.equal("INTERSECTS");
            expect(wrapper.vm.getDefaultOperatorBySnippetType("dropdown")).to.equal("EQ");
            expect(wrapper.vm.getDefaultOperatorBySnippetType("text")).to.equal("IN");
            expect(wrapper.vm.getDefaultOperatorBySnippetType("slider")).to.equal("EQ");
            expect(wrapper.vm.getDefaultOperatorBySnippetType("sliderRange")).to.equal("BETWEEN");
        });
        it("should return expected operator if the second parameter is set to true", () => {
            expect(wrapper.vm.getDefaultOperatorBySnippetType(undefined, true)).to.equal("EQ");
            expect(wrapper.vm.getDefaultOperatorBySnippetType(null, true)).to.equal("EQ");
            expect(wrapper.vm.getDefaultOperatorBySnippetType(0, true)).to.equal("EQ");
            expect(wrapper.vm.getDefaultOperatorBySnippetType({}, true)).to.equal("EQ");
            expect(wrapper.vm.getDefaultOperatorBySnippetType([], true)).to.equal("EQ");
            expect(wrapper.vm.getDefaultOperatorBySnippetType("checkbox", true)).to.equal("EQ");
            expect(wrapper.vm.getDefaultOperatorBySnippetType("date", true)).to.equal("EQ");
            expect(wrapper.vm.getDefaultOperatorBySnippetType("dateRange", true)).to.equal("INTERSECTS");
            expect(wrapper.vm.getDefaultOperatorBySnippetType("dropdown", true)).to.equal("IN");
            expect(wrapper.vm.getDefaultOperatorBySnippetType("text", true)).to.equal("IN");
            expect(wrapper.vm.getDefaultOperatorBySnippetType("slider", true)).to.equal("EQ");
            expect(wrapper.vm.getDefaultOperatorBySnippetType("sliderRange", true)).to.equal("BETWEEN");
        });
    });
    describe("addMissingPropertiesToSnippets", () => {
        it("should not change the first parameter if anything but an array is given", () => {
            let snippets;

            wrapper.vm.addMissingPropertiesToSnippets(snippets);
            expect(snippets).to.be.undefined;

            snippets = null;
            wrapper.vm.addMissingPropertiesToSnippets(snippets);
            expect(snippets).to.be.null;

            snippets = "string";
            wrapper.vm.addMissingPropertiesToSnippets(snippets);
            expect(snippets).to.equal("string");

            snippets = 1234;
            wrapper.vm.addMissingPropertiesToSnippets(snippets);
            expect(snippets).to.equal(1234);

            snippets = {};
            wrapper.vm.addMissingPropertiesToSnippets(snippets);
            expect(snippets).to.be.an("object").and.to.be.empty;
        });
        it("should add missing properties to the given snippets", () => {
            const snippets = [
                    {test: "snippet with set adjustment - should be overriden", adjustment: "something"},
                    {test: "snippet with set multiselect", multiselect: "multiselect"},
                    {test: "snippet with matchingMode AND", matchingMode: "AND"},
                    {test: "snippet with any other matchingMode", matchingMode: "anything"},
                    {test: "snippet with dropdown type but without delimitor", type: "dropdown"},
                    {test: "snippet with dropdown type and delimitor", type: "dropdown", delimitor: "delimitor"},
                    {test: "snippet with visible set to false", visible: false}
                ],
                expected = [
                    {test: "snippet with set adjustment - should be overriden", adjustment: {}, visible: true, multiselect: true, operator: "EQ"},
                    {test: "snippet with set multiselect", multiselect: "multiselect", adjustment: {}, visible: true, operator: "EQ"},
                    {test: "snippet with matchingMode AND", adjustment: {}, visible: true, multiselect: false, operator: "EQ"},
                    {test: "snippet with any other matchingMode", adjustment: {}, visible: true, multiselect: true, operator: "EQ"},
                    {test: "snippet with dropdown type but without delimitor", type: "dropdown", adjustment: {}, visible: true, multiselect: true, operator: "EQ"},
                    {test: "snippet with dropdown type and delimitor", type: "dropdown", delimitor: "delimitor", adjustment: {}, visible: true, multiselect: true, operator: "IN"},
                    {test: "snippet with visible set to false", adjustment: {}, visible: false, multiselect: true, operator: "EQ"}
                ];

            wrapper.vm.addMissingPropertiesToSnippets(snippets);
            expect(snippets).to.deep.equal(expected);
        });
    });
    describe("checkSnippetTypeConsistency", () => {
        it("should return false if anything but an array is given", () => {
            expect(wrapper.vm.checkSnippetTypeConsistency(undefined)).to.be.false;
            expect(wrapper.vm.checkSnippetTypeConsistency(null)).to.be.false;
            expect(wrapper.vm.checkSnippetTypeConsistency("string")).to.be.false;
            expect(wrapper.vm.checkSnippetTypeConsistency(1234)).to.be.false;
            expect(wrapper.vm.checkSnippetTypeConsistency(true)).to.be.false;
            expect(wrapper.vm.checkSnippetTypeConsistency(false)).to.be.false;
            expect(wrapper.vm.checkSnippetTypeConsistency({})).to.be.false;
        });
        it("should return false if the given array is empty", () => {
            expect(wrapper.vm.checkSnippetTypeConsistency([])).to.be.false;
        });
        it("should return false if any entry of the given array is not an object", () => {
            const snippets = [
                {type: "type"},
                {type: "type"},
                null,
                {type: "type"}
            ];

            expect(wrapper.vm.checkSnippetTypeConsistency(snippets)).to.be.false;
        });
        it("should return false if any object in the given array has no type", () => {
            const snippets = [
                {type: "type"},
                {type: "type"},
                {notype: "notype"},
                {type: "type"}
            ];

            expect(wrapper.vm.checkSnippetTypeConsistency(snippets)).to.be.false;
        });
        it("should return true if every object in the given array has a type", () => {
            const snippets = [
                {type: "type"},
                {type: "type"},
                {type: "type"},
                {type: "type"}
            ];

            expect(wrapper.vm.checkSnippetTypeConsistency(snippets)).to.be.true;
        });
    });
});
