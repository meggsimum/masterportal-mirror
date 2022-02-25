import testAction from "../../../../../../test/unittests/VueTestUtils";
import actions from "../../../actionsTools";
import sinon from "sinon";

const {
    controlActivationOfTools,
    setToolActive,
    languageChanged,
    addTool,
    setToolActiveByConfig
} = actions;

describe("src/modules/tools/actionsTools.js", () => {
    describe("setToolActive", () => {
        const state = {
            ScaleSwitcher: {
                id: "scaleSwitcher",
                name: "ScaleSwitcher",
                deactivateGFI: false
            },
            Gfi: {
                id: "gfi"
            }
        };

        it("setToolActive set one tool and gfi to active", done => {
            const payload = {
                id: "scaleSwitcher",
                name: "ScaleSwitcher",
                active: true
            };

            testAction(setToolActive, payload, state, {}, [
                {type: "controlActivationOfTools", payload: payload.name, dispatch: true},
                {type: Object.keys(state)[0] + "/setActive", payload: payload.active, dispatch: true},
                {type: "Gfi/setActive", payload: true, commit: true},
                {type: "activateToolInModelList", payload: {tool: "Gfi", active: true}, dispatch: true}
            ], {}, done);
        });
        it("setToolActive deactivate a tool and activate gfi", done => {
            const payload = {
                id: "scaleSwitcher",
                name: "ScaleSwitcher",
                active: false
            };

            testAction(setToolActive, payload, state, {}, [
                {type: "controlActivationOfTools", payload: payload.name, dispatch: true},
                {type: Object.keys(state)[0] + "/setActive", payload: payload.active, commit: true},
                {type: "Gfi/setActive", payload: true, commit: true},
                {type: "activateToolInModelList", payload: {tool: "Gfi", active: true}, dispatch: true}
            ], {}, done);
        });

        it("setToolActive activate gfi", done => {
            const payload = {
                id: "gfi",
                active: true
            };

            testAction(setToolActive, payload, state, {}, [
                {type: Object.keys(state)[1] + "/setActive", payload: payload.active, commit: true}
            ], {}, done);
        });

        it("setToolActive no tool is active by payload.id is not defined", done => {
            const payload = {
                id: "otherTool",
                active: true
            };

            testAction(setToolActive, payload, state, {}, [], {}, done);
        });

    });

    describe("languageChanged", () => {
        const state = {
            ScaleSwitcher: {
                id: "scaleSwitcher"
            }
        };

        it("languageChanged", done => {
            const payload = {
                id: "scaleSwitcher",
                name: "Scale switcher"
            };

            testAction(languageChanged, payload, state, {}, [
                {type: Object.keys(state)[0] + "/setName", payload: payload.name}
            ], {}, done);
        });
    });

    describe("addTool", () => {
        it("addTool", done => {
            const tool = {
                    default: {
                        name: "VueAddon"
                    }
                },
                state = {
                    componentMap: {
                        scaleSwitcher: sinon.stub()
                    }
                };

            testAction(addTool, tool, state, {}, [
                {type: "setComponentMap", payload: Object.assign(state.componentMap, {"vueAddon": tool.default})}
            ], {}, done);
        });
    });

    describe("controlActivationOfTools", () => {
        it("controlActivationOfTools activeTool = SupplyCoord", done => {
            const state = {
                    Draw: {
                        active: true
                    },
                    ScaleSwitcher: {
                        active: true
                    },
                    SupplyCoord: {
                        active: false
                    }
                },
                activeToolName = "SupplyCoord";

            testAction(controlActivationOfTools, activeToolName, state, {}, [
                {type: "Draw/setActive", payload: false},
                {type: "ScaleSwitcher/setActive", payload: false},
                {type: "SupplyCoord/setActive", payload: true},
                {type: "activateToolInModelList", payload: {tool: "SupplyCoord", active: true}, dispatch: true}
            ], {
                getConfiguredToolNames: ["Draw", "ScaleSwitcher", "SupplyCoord"],
                getActiveToolNames: ["Draw", "ScaleSwitcher"]
            }, done);
        });
    });

    describe("setToolActiveByConfig", () => {
        it("activate a tool with active = true", done => {
            const state = {
                ScaleSwitcher: {
                    active: true
                }
            };

            testAction(setToolActiveByConfig, {}, state, {}, [
                {type: "ScaleSwitcher/setActive", payload: false},
                {type: "ScaleSwitcher/setActive", payload: true},
                {type: "activateToolInModelList", payload: {tool: "ScaleSwitcher", active: true}, dispatch: true},
                {type: "errorMessageToManyToolsActive", payload: {
                    activeTools: ["ScaleSwitcher"],
                    firstActiveTool: "ScaleSwitcher"
                }, dispatch: true}
            ], {
                getActiveToolNames: ["ScaleSwitcher"]
            }, done);


        });
        it("activate only the first tool with active = true", done => {
            const state = {
                SupplyCoord: {
                    active: true
                },
                ScaleSwitcher: {
                    active: true
                },
                FileImport: {
                    active: true
                }
            };

            testAction(setToolActiveByConfig, {}, state, {}, [
                {type: "SupplyCoord/setActive", payload: false},
                {type: "ScaleSwitcher/setActive", payload: false},
                {type: "FileImport/setActive", payload: false},
                {type: "SupplyCoord/setActive", payload: true},
                {type: "activateToolInModelList", payload: {tool: "SupplyCoord", active: true}, dispatch: true},
                {type: "errorMessageToManyToolsActive", payload: {
                    activeTools: ["SupplyCoord", "ScaleSwitcher", "FileImport"],
                    firstActiveTool: "SupplyCoord"
                }, dispatch: true}
            ], {
                getActiveToolNames: ["SupplyCoord", "ScaleSwitcher", "FileImport"]
            }, done);
        });
        it("activate only the first tool with active = true and deactivate gfi, if this tools has deactivateGFI = true", done => {
            const state = {
                SupplyCoord: {
                    active: true,
                    deactivateGFI: true
                },
                ScaleSwitcher: {
                    active: true
                },
                Gfi: {
                    active: true
                }
            };

            testAction(setToolActiveByConfig, {}, state, {}, [
                {type: "SupplyCoord/setActive", payload: false},
                {type: "ScaleSwitcher/setActive", payload: false},
                {type: "Gfi/setActive", payload: false},
                {type: "SupplyCoord/setActive", payload: true},
                {type: "activateToolInModelList", payload: {tool: "SupplyCoord", active: true}, dispatch: true},
                {type: "errorMessageToManyToolsActive", payload: {
                    activeTools: ["SupplyCoord", "ScaleSwitcher", "Gfi"],
                    firstActiveTool: "SupplyCoord"
                }, dispatch: true}
            ], {
                getActiveToolNames: ["SupplyCoord", "ScaleSwitcher", "Gfi"]
            }, done);
        });
        it("activate the first tool with active = true and the gfi, if this tools has deactivateGFI = false", done => {
            const state = {
                SupplyCoord: {
                    active: true,
                    deactivateGFI: false
                },
                ScaleSwitcher: {
                    active: true
                },
                Gfi: {
                    active: true
                }
            };

            testAction(setToolActiveByConfig, {}, state, {}, [
                {type: "SupplyCoord/setActive", payload: false},
                {type: "ScaleSwitcher/setActive", payload: false},
                {type: "Gfi/setActive", payload: false},
                {type: "SupplyCoord/setActive", payload: true},
                {type: "activateToolInModelList", payload: {tool: "SupplyCoord", active: true}, dispatch: true},
                {type: "Gfi/setActive", payload: true},
                {type: "activateToolInModelList", payload: {tool: "Gfi", active: true}, dispatch: true},
                {type: "errorMessageToManyToolsActive", payload: {
                    activeTools: ["SupplyCoord", "ScaleSwitcher", "Gfi"],
                    firstActiveTool: "SupplyCoord"
                }, dispatch: true}
            ], {
                getActiveToolNames: ["SupplyCoord", "ScaleSwitcher", "Gfi"]
            }, done);
        });
    });
});
