import Vuex from "vuex";
import {config, mount, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import TableTemplate from "../../../components/templates/TableTemplate.vue";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/gfi/components/templates/TableTemplate.vue", () => {
    let propsData,
        components,
        computed,
        store;

    beforeEach(() => {
        propsData = {
            feature: {
                getTheme: () => "Default",
                getMimeType: () => "text/xml",
                getTitle: () => "Hallo"
            }
        };
        components = {
            DefaultTheme: {
                name: "DefaultTheme",
                template: "<span />"
            }
        };
        computed = {
            clickCoord: () => []
        };
        store = new Vuex.Store({
            namespaced: true,
            modules: {
                MapMarker: {
                    namespaced: true,
                    actions: {
                        removePointMarker: sinon.stub(),
                        placingPointMarker: sinon.stub()
                    }
                }
            }
        });
    });


    it("should have a title", () => {
        const wrapper = mount(TableTemplate, {
            propsData,
            components,
            computed,
            store,
            localVue
        });

        expect(wrapper.find(".tool-window-heading-title span").text()).to.be.equal("Hallo");
    });

    it("should have the child component Default (-Theme)", () => {
        const wrapper = shallowMount(TableTemplate, {
            propsData,
            components,
            computed,
            store,
            localVue
        });

        expect(wrapper.findComponent({name: "DefaultTheme"}).exists()).to.be.true;
    });

    it("should have a close button", async () => {
        const wrapper = mount(TableTemplate, {
            propsData,
            components,
            computed,
            store,
            localVue
        });

        expect(wrapper.find("span.glyphicon.glyphicon-remove").exists()).to.be.true;
    });

    it("should emitted close event if button is clicked", async () => {
        const wrapper = mount(TableTemplate, {
                propsData,
                components,
                computed,
                store,
                localVue
            }),
            button = wrapper.find("span.glyphicon.glyphicon-remove");

        await button.trigger("click");
        expect(wrapper.emitted()).to.have.property("close");
        expect(wrapper.emitted().close).to.have.lengthOf(1);
    });

    it("should not emitted close event if clicked inside the content", async () => {
        const wrapper = mount(TableTemplate, {
                propsData,
                components,
                computed,
                store,
                localVue
            }),
            modal = wrapper.find(".vue-tool-content-body");

        await modal.trigger("click");
        expect(wrapper.emitted()).to.not.have.property("close");
        expect(wrapper.emitted()).to.be.empty;
    });

    it("should rotates the gfi by 90 degrees if 'rotate-button' is clicked", async () => {
        const wrapper = mount(TableTemplate, {
                propsData,
                components,
                computed,
                store,
                localVue
            }),
            button = wrapper.find("span.icon-turnarticle");

        await button.trigger("click");
        expect(wrapper.vm.rotateAngle).to.be.equal(-90);
    });

    it("should rotates the gfi to the starting position if 'rotate-button' clicked four times", async () => {
        const wrapper = mount(TableTemplate, {
                propsData,
                components,
                computed,
                store,
                localVue
            }),
            button = wrapper.find("span.icon-turnarticle");

        await button.trigger("click");
        await button.trigger("click");
        await button.trigger("click");
        await button.trigger("click");
        expect(wrapper.vm.rotateAngle).to.be.equal(0);
    });

    it("should render the footer slot within .gfi-footer", () => {
        const wrapper = mount(TableTemplate, {
                propsData,
                slots: {
                    footer: "<div class=\"gfi-footer\">Footer</div>"
                },
                components,
                computed,
                store,
                localVue
            }),
            footer = wrapper.find(".gfi-footer");

        expect(footer.text()).to.be.equal("Footer");
    });

});
