import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import SessionTool from "../../../components/SessionTool.vue";
import SessionToolModule from "../../../store/indexSessionTool";


const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("src/modules/tools/sessionTool/components/sessionTool.vue", () => {
    let wrapper;

    const store = new Vuex.Store({
        namespaces: true,
        modules: {
            Tools: {
                namespaced: true,
                modules: {
                    SessionTool: SessionToolModule
                }
            }
        }
    });

    beforeEach(() => {
        wrapper = shallowMount(SessionTool, {store, localVue});
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("should render correctly", () => {
        expect(wrapper.find("div").classes("session-tool")).to.be.true;
    });
});
