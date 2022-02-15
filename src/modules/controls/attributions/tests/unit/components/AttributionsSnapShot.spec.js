import Vuex from "vuex";
import {config, mount, createLocalVue} from "@vue/test-utils";
import Attributions from "../../../components/AttributionsItem.vue";
import AttributionsModule from "../../../store/indexAttributions";
import {expect} from "jest";

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

    describe("snapshot test", () => {
        it('It should render correctly.', async () => {
        const wrapper = mount(Attributions, {store, localVue});
      
          expect(wrapper.element).toMatchSnapshot()
        });
      });
});
