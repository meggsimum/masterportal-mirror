import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import DrawItemComponent from "../../../components/DrawItem.vue";
import Draw from "../../../store/indexDraw";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue();

config.mocks.$t = key => key;
config.mocks.$i18n = {
    i18next: {
        exists: sinon.stub(),
        options: {
            isEnabled: () => sinon.stub(),
            getLanguages: () => sinon.stub()
        }
    }
};
localVue.use(Vuex);

describe("src/tools/draw/components/DrawItem.vue", () => {
    let store,
        wrapper,
        componentData;
    const
        mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            draw:
                                {
                                    "name": "draw",
                                    "renderToWindow": true
                                }
                        }
                    }
                }
            }
        };

    beforeEach(function () {
        Draw.state.layer = {
            getSource: () => {
                return {
                    getFeatures: () => []
                };
            }
        };

        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        Draw
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        componentData = () => {
            return {
                mapElement: {style: {cursor: "pointer"}},
                constants: {},
                drawing: true
            };
        };
        store.commit("Tools/Draw/setActive", true);
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("sets focus to first input control", async () => {
        const elem = document.createElement("div");

        if (document.body) {
            document.body.appendChild(elem);
        }

        wrapper = shallowMount(DrawItemComponent, {store, localVue, data: componentData, attachTo: elem});
        wrapper.vm.setFocusToFirstControl();
        await wrapper.vm.$nextTick();
        expect(wrapper.find("#tool-draw-drawType").element).to.equal(document.activeElement);
    });
});
