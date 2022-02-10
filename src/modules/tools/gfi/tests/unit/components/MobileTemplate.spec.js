import Vuex from "vuex";
import {shallowMount, createLocalVue, config} from "@vue/test-utils";
import {expect} from "chai";
import MobileTemplate from "../../../components/templates/MobileTemplate.vue";
import sinon from "sinon";

const localVue = createLocalVue();

config.mocks.$t = key => key;

localVue.use(Vuex);

describe("src/modules/tools/gfi/components/templates/MobileTemplate.vue", () => {

    it("should have a title", () => {
        const wrapper = shallowMount(MobileTemplate, {
            propsData: {
                feature: {
                    getTheme: () => "default",
                    getMimeType: () => "text/html",
                    getTitle: () => "Hallo",
                    getProperties: () => sinon.stub(),
                    getFeatures: () => sinon.stub()
                }
            },
            localVue
        });

        expect(wrapper.find(".modal-title").text()).to.be.equal("Hallo");
    });

    it("should have the child component Default (-Theme)", () => {
        const wrapper = shallowMount(MobileTemplate, {
            propsData: {
                feature: {
                    getTheme: () => "default",
                    getMimeType: () => "text/html",
                    getTitle: () => "Hallo",
                    getProperties: () => sinon.stub(),
                    getFeatures: () => sinon.stub()
                }
            },
            localVue
        });

        expect(wrapper.findComponent({name: "DefaultTheme"}).exists()).to.be.true;
    });

    it("should have a close button", async () => {
        const wrapper = shallowMount(MobileTemplate, {
            propsData: {
                feature: {
                    getTheme: () => "Default",
                    getMimeType: () => "text/html",
                    getTitle: () => "Hallo",
                    getProperties: () => sinon.stub(),
                    getFeatures: () => sinon.stub()
                }
            },
            localVue
        });

        expect(wrapper.find("button.close").exists()).to.be.true;
    });


    it("should emitted close event if button is clicked", async () => {
        const wrapper = shallowMount(MobileTemplate, {
                data: function () {
                    return {reactOnOutsideClick: true};
                },
                propsData: {
                    feature: {
                        getTheme: () => "Default",
                        getMimeType: () => "text/html",
                        getTitle: () => "Hallo",
                        getProperties: () => sinon.stub(),
                        getFeatures: () => sinon.stub()
                    }
                },
                localVue
            }),
            button = wrapper.find(".close");

        await button.trigger("click");
        expect(wrapper.emitted()).to.have.property("close");
        expect(wrapper.emitted().close).to.have.lengthOf(1);
    });

    it("should emitted close event if clicked outside the modal", async () => {
        const wrapper = shallowMount(MobileTemplate, {
                data: function () {
                    return {reactOnOutsideClick: true};
                },
                propsData: {
                    feature: {
                        getTheme: () => "Default",
                        getMimeType: () => "text/html",
                        getTitle: () => "Hallo",
                        getProperties: () => sinon.stub(),
                        getFeatures: () => sinon.stub()
                    }
                },
                localVue
            }),
            div = wrapper.find(".modal-mask");


        await div.trigger("click");
        expect(wrapper.emitted()).to.have.property("close");
        expect(wrapper.emitted().close).to.have.lengthOf(1);
    });

    it("should not emitted close event if clicked inside the modal", async () => {
        const wrapper = shallowMount(MobileTemplate, {
                data: function () {
                    return {reactOnOutsideClick: true};
                },
                propsData: {
                    feature: {
                        getTheme: () => "Default",
                        getMimeType: () => "text/html",
                        getTitle: () => "Hallo",
                        getProperties: () => sinon.stub(),
                        getFeatures: () => sinon.stub()
                    }
                },
                localVue
            }),
            modal = wrapper.find(".modal-dialog");

        await modal.trigger("click");
        expect(wrapper.emitted()).to.not.have.property("close");
        expect(wrapper.emitted()).to.be.empty;
    });

    it("should render the footer slot within .modal-footer", () => {
        const wrapper = shallowMount(MobileTemplate, {
                propsData: {
                    feature: {
                        getTheme: () => "Default",
                        getMimeType: () => "text/html",
                        getTitle: () => "Hallo",
                        getProperties: () => sinon.stub(),
                        getFeatures: () => sinon.stub()
                    }
                },
                slots: {
                    footer: "<div>Footer</div>"
                },
                localVue
            }),
            footer = wrapper.find(".modal-footer");

        expect(footer.text()).to.be.equal("Footer");
    });

});
