import {expect} from "chai";
import mutations from "../../../mutationsTools";
import sinon from "sinon";

const {setConfiguredTools} = mutations;

describe("src/modules/tools/mutationsTools.js", () => {

    describe("setConfiguredTools", () => {
        it("initially sets the configuredTools without params", () => {
            const state = {
                configuredTools: []
            };

            setConfiguredTools(state);

            expect(state.configuredTools).to.be.an("array").that.is.empty;
        });
        it("initially sets the configuredTools with menuConfig is empty", () => {
            const state = {
                    configuredTools: []
                },
                menuConfig = {};

            setConfiguredTools(state, menuConfig);

            expect(state.configuredTools).to.be.an("array").that.is.empty;
        });
        it("initially sets the configuredTools with two tools in the menuConfig", () => {
            const state = {
                    componentMap: {
                        scaleSwitcher: sinon.stub(),
                        supplyCoord: sinon.stub()
                    },
                    configuredTools: []
                },
                menuConfig = {
                    tools: {
                        children: {
                            scaleSwitcher: {
                                "name": "scaleSwitcher",
                                "icon": "bi-arrows-angle-expand",
                                "renderToWindow": true
                            }
                        }
                    },
                    supplyCoord: {
                        "name": "supplyCoord",
                        "icon": "bi-bullseye",
                        "renderToWindow": true
                    }
                };

            setConfiguredTools(state, menuConfig);

            expect(state.configuredTools).to.be.an("array");
            expect(state.configuredTools.length).to.equals(2);
            expect(state.configuredTools).to.deep.equal([
                {
                    component: state.componentMap.supplyCoord,
                    configPath: "configJson.Portalconfig.menu.supplyCoord",
                    key: "supplyCoord"
                },
                {
                    component: state.componentMap.scaleSwitcher,
                    configPath: "configJson.Portalconfig.menu.tools.children.scaleSwitcher",
                    key: "scaleSwitcher"
                }
            ]);
        });
    });

});
