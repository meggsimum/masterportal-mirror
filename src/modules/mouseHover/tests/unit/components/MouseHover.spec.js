import Vuex from "vuex";
import {expect} from "chai";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import MouseHoverComponent from "../../../components/MouseHover.vue";
import MouseHover from "../../../store/indexMouseHover";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/mouseHover/components/MouseHover.vue", () => {
    const mockMapGetters = {
        ol2DMap: sinon.stub()
    };
    let store,
        wrapper;

    beforeEach(() => {
        MouseHover.actions.initialize = sinon.stub(MouseHover.actions.initialize);
        store = new Vuex.Store({
            namespaced: true,
            modules: {
                MouseHover,
                Maps: {
                    namespaced: true,
                    getters: mockMapGetters
                }
            },
            getters: {
                mobile: () => false
            }
        });
    });

    it("renders mouseHover module", () => {
        store.commit("MouseHover/setActive", true);
        wrapper = shallowMount(MouseHoverComponent, {store, localVue});

        expect(wrapper.find("#mousehover-overlay").exists()).to.be.true;
    });
});
