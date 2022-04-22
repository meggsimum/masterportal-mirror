import Vuex from "vuex";
import {config, createLocalVue, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import StartToolComponent from "../../../components/StartTool.vue";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/controls/startTool/components/StartTool.vue", () => {
    const toolIds = ["selectFeatures", "scaleSwitcher"],
        configuredTools = [
            {
                key: "selectFeatures"
            },
            {
                key: "scaleSwitcher"
            }
        ],
        mockConfigJson = {
            Portalconfig: {
                menu: {
                    controls: {
                        startTool: {
                            tools: toolIds
                        }
                    },
                    tools: {
                        children: {
                            scaleSwitcher: {
                                name: "translate#common:menu.tools.scaleSwitcher"
                            },
                            selectFeatures: {
                                name: "translate#common:menu.tools.selectFeatures"
                            }
                        }
                    }
                }
            }
        };
    let store,
        wrapper;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        ScaleSwitcher: sinon.stub(),
                        SelectFeatures: sinon.stub()
                    },
                    actions: {
                        activateToolInModelList: sinon.stub(),
                        setToolActive: sinon.stub()
                    },
                    getters: {
                        configuredTools: () => configuredTools
                    }
                }
            },
            getters: {
                uiStyle: () => ""
            },
            state: {
                configJson: mockConfigJson
            }
        });

        wrapper = shallowMount(StartToolComponent, {
            propsData: {
                tools: toolIds
            },
            store,
            localVue
        });
    });

    it("should render the controls", () => {
        expect(wrapper.find("div#start-tool-control").exists()).to.be.true;
    });

    describe("getValidToolStates", () => {
        beforeEach(() => {
            sinon.spy(console, "error");
        });

        afterEach(() => {
            console.error.restore();
        });

        it("should return the valid tools", () => {
            const validTools = wrapper.vm.getValidToolStates(toolIds, configuredTools);

            expect(validTools.length).equals(2);
            validTools.forEach((validTool, index) => {
                expect(validTool.id).equals(configuredTools[index].key);
            });
        });

        it("should return an empty array and print a console.error", () => {
            const tools = ["abc"],
                validTools = wrapper.vm.getValidToolStates(tools, configuredTools);

            expect(validTools.length).equals(0);
            expect(console.error.calledOnce).to.be.true;
            expect(console.error.firstCall.args[0]).to.equal(`The tool: "${tools[0]}" does not exist. Please check your configuration.`);
        });
    });

    describe("onClick", () => {
        it("should request tool from ModelList", () => {
            const spy = sinon.spy(Radio, "request"),
                tool = {
                    id: "selectFeatures"
                };

            wrapper.vm.onClick(tool);

            expect(spy.calledOnce).to.be.true;
            expect(spy.firstCall.args).to.deep.equal(["ModelList", "getModelByAttributes", tool]);
        });
    });
});
