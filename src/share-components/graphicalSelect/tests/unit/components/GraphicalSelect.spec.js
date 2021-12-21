import Vuex from "vuex";
import {config, shallowMount, mount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import GraphicalSelectComponent from "../../../components/GraphicalSelect.vue";
import GraphicalSelectModule from "../../../store/indexGraphicalSelect.js";
import Dropdown from "../../../../dropdowns/components/DropdownSimple.vue";
import sinon from "sinon";


const localVue = createLocalVue(),
    mockMapGetters = {
    },
    mockMapActions = {
        removeInteraction: sinon.stub(),
        addInteraction: sinon.stub()
    },
    mockMapMutations = {
        addLayerToMap: sinon.stub(),
        removeLayerFromMap: sinon.stub()
    };

localVue.use(Vuex);
config.mocks.$t = key => key;
let store;

describe("src/share-components/graphicalSelect/components/GraphicalSelect.vue", () => {

    const GrandParentVm = mount({
            template: "<div/>"
        }).vm,

        Parent = {
            created () {
                this.$parent = GrandParentVm;
            }
        };

    beforeEach(function () {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                GraphicalSelect: GraphicalSelectModule,
                Map: {
                    namespaced: true,
                    getters: mockMapGetters,
                    mutations: mockMapMutations,
                    actions: mockMapActions
                }
            }
        });
    });

    describe("Component DOM", () => {
        it("Dom should exist", () => {
            const wrapper = shallowMount(GraphicalSelectComponent, {store, localVue, parentComponent: Parent});

            expect(wrapper.exists()).to.be.true;
        });

        it("should have a form element", () => {
            const wrapper = shallowMount(GraphicalSelectComponent, {store, localVue, parentComponent: Parent}),
                formElement = wrapper.find("form");

            expect(formElement.exists()).to.be.true;
        });

        it("the form element has a select element of class form-seelct", () => {
            const wrapper = shallowMount(GraphicalSelectComponent, {store, localVue, parentComponent: Parent, stubs: {"Dropdown": Dropdown}}),
                formElement = wrapper.find("select.form-seelct");

            expect(formElement.exists()).to.be.true;
        });

        it("the select element of class form-select has at least one option element", () => {
            const wrapper = shallowMount(GraphicalSelectComponent, {store, localVue, parentComponent: Parent, stubs: {"Dropdown": Dropdown}});

            expect(wrapper.findAll("select.form-select > option")).to.not.have.lengthOf(0);
        });

        it("options contain only provided draw modus", () => {
            const wrapper = shallowMount(GraphicalSelectComponent, {store, localVue, parentComponent: Parent, stubs: {"Dropdown": Dropdown}});
            let option = {};

            for (option in wrapper.vm.options) {
                expect(wrapper.vm.geographicValues).to.include(option);
            }
        });
    });
});
