import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import Dropdown from "../../../components/DropdownSimple.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/share-components/dropdowns/components/DropdownSimple.vue", () => {
    const props = {
        value: "mon",
        options: {
            mon: "Montag",
            die: "Dienstag",
            mit: "Mittwoch",
            don: "Donnerstag"
        },
        focusOnCreation: true
    };

    it("should have a select element", () => {
        const wrapper = shallowMount(Dropdown, {
            propsData: props,
            localVue
        });

        expect(wrapper.find("select").exists()).to.be.true;
    });

    it("should have the bootstrap css class 'form-select'", () => {
        const wrapper = shallowMount(Dropdown, {
            propsData: props,
            localVue
        });

        expect(wrapper.classes("form-select")).to.be.true;
    });

    it("should have four option elements", () => {
        const wrapper = shallowMount(Dropdown, {
            propsData: props,
            localVue
        });

        expect(wrapper.findAll("option")).to.have.lengthOf(4);
    });

    it("should match the text content in the option elements to the options prop", () => {
        const wrapper = shallowMount(Dropdown, {
            propsData: props,
            localVue
        });

        expect(wrapper.findAll("option").at(0).text()).to.be.equal("Montag");
        expect(wrapper.findAll("option").at(1).text()).to.be.equal("Dienstag");
        expect(wrapper.findAll("option").at(2).text()).to.be.equal("Mittwoch");
        expect(wrapper.findAll("option").at(3).text()).to.be.equal("Donnerstag");
    });

    it("should match the value in the option elements to the options prop", () => {
        const wrapper = shallowMount(Dropdown, {
            propsData: props,
            localVue
        });

        expect(wrapper.findAll("option").at(0).element.value).to.be.equal("mon");
        expect(wrapper.findAll("option").at(1).element.value).to.be.equal("die");
        expect(wrapper.findAll("option").at(2).element.value).to.be.equal("mit");
        expect(wrapper.findAll("option").at(3).element.value).to.be.equal("don");
    });

    it("should be the first option element selected", () => {
        const wrapper = shallowMount(Dropdown, {
            propsData: props,
            localVue
        });

        expect(wrapper.findAll("option").at(0).element.selected).to.be.true;
    });

    it("should be the value of the select element equal to the value of the first option element", () => {
        const wrapper = shallowMount(Dropdown, {
                propsData: props,
                localVue
            }),
            optionValue = wrapper.findAll("option").at(0).element.value;

        expect(wrapper.find("select").element.value).to.equal(optionValue);
    });

    it("should change the value of the select element to the value of the third option element", async () => {
        const wrapper = shallowMount(Dropdown, {
                propsData: props,
                localVue
            }),
            options = wrapper.find("select").findAll("option");

        await options.at(2).setSelected();
        expect(wrapper.find("select").element.value).to.equal("mit");
    });

    it("should change the value of the select element to the value prop", async () => {
        const wrapper = shallowMount(Dropdown, {
            propsData: props,
            localVue
        });

        await wrapper.setProps({value: "don"});
        expect(wrapper.find("select").element.value).to.equal("don");
    });

    it("should emit the selected value with an input event if the select element triggers an input event", async () => {
        const wrapper = shallowMount(Dropdown, {
            propsData: props,
            localVue
        });

        await wrapper.find("select").trigger("input");
        expect(wrapper.emitted().input[0]).to.deep.equal(["mon"]);
    });

    it("sets focus to select control", async () => {
        const elem = document.createElement("div");

        if (document.body) {
            document.body.appendChild(elem);
        }
        // eslint-disable-next-line one-var
        const wrapper = shallowMount(Dropdown, {
            propsData: props,
            attachTo: elem,
            localVue
        });

        await wrapper.vm.$nextTick();
        expect(wrapper.find(".form-select").element).to.equal(document.activeElement);
    });

});
