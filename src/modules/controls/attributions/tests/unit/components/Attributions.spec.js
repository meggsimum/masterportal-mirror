import Vuex from "vuex";
import {config, mount, createLocalVue} from "@vue/test-utils";
import Attributions from "../../../components/AttributionsItem.vue";
import AttributionsModule from "../../../store/indexAttributions";
import {expect} from "chai";
import {expect as expectJest}  from "jest";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe.only("src/modules/controls/backForward/components/Attributions.vue", () => {
    let store;
    const attribution = {
        name: "Krankenhäuser",
        text: "Attributierung für Fachlayer",
        type: "layer"
    };

    beforeEach(() => {
        const map = {
            id: "ol",
            mode: "2D"
        };
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                controls: {
                    namespaced: true,
                    modules: {
                        attributions: AttributionsModule
                    }
                },
                Map: {
                    namespaced: true,
                    getters: {
                        mapId: () => "ol",
                        mapMode: () => "2D",
                        ol2DMap: () => {
                            return map;
                        }
                    }
                }
            },
            getters: {
                mobile: () => false
            },
        });
    });

    describe("component test", () => {

    it("renders the Attributions button", () => {
        const wrapper = mount(Attributions, {store, localVue});

        expect(wrapper.find(".attributions-button").exists()).to.be.true;
        expect(wrapper.findAll("button")).to.have.length(1);
    });

    it("should open/closed close/opened attributions on clicking attribution button", async () => {
        const wrapper = mount(Attributions, {store, localVue}),
        button = wrapper.find(".attributions-button");

        store.state.controls.attributions.attributionList.push(attribution);
        await wrapper.vm.$nextTick();
        button.trigger("click");
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll(".attributions-div")).to.have.length(0);

        button.trigger("click");
        await wrapper.vm.$nextTick();
        expect(wrapper.find(".attributions-view").exists()).to.be.true;
    });

    it("should have attributions text 'Attributierung für Fachlayer'", async () => {
        const wrapper = mount(Attributions, {store, localVue}),
        button = wrapper.find(".attributions-button");
        store.state.controls.attributions.attributionList.push(attribution);

        await wrapper.vm.$nextTick();
        button.trigger("click");
        await wrapper.vm.$nextTick();
        button.trigger("click");
        await wrapper.vm.$nextTick();

        const dt = wrapper.find("dt"),
        dd = wrapper.find("dd");

        expect(dt.exists()).to.be.true;
        expect(dt.text()).to.be.equals(attribution.name+":");
        expect(dd.exists()).to.be.true;
        expect(dd.text()).to.be.equals(attribution.text);
        expect(wrapper).toMatchSnapshot();
    });
    });
});
