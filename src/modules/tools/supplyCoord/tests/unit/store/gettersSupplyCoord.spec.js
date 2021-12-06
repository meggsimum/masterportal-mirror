import {expect} from "chai";
import sinon from "sinon";
import getters from "../../../store/gettersSupplyCoord";
import stateSupplyCoord from "../../../store/stateSupplyCoord";

describe("src/modules/tools/supplyCoord/store/gettersSupplyCoord.js", () => {

    describe("SupplyCoord getters", () => {
        it("returns the selectPointerMove from state", () => {
            const emptyFunc = sinon.stub(),
                state = {
                    selectPointerMove: emptyFunc
                };

            expect(getters.selectPointerMove(stateSupplyCoord)).to.equals(null);
            expect(getters.selectPointerMove(state)).to.equals(emptyFunc);
        });
        it("returns the projections from state", () => {
            const proj = [{name: "projection 1", projName: "utm"},
                    {name: "projection 2", projName: "longlat"}],
                state = {
                    projections: proj
                };

            expect(getters.projections(stateSupplyCoord)).to.be.an("array").that.is.empty;
            expect(getters.projections(state)).to.equals(proj);
        });
        it("returns the mapProjection from state", () => {
            const proj = {name: "projection 1", projName: "utm"},
                state = {
                    mapProjection: proj
                };

            expect(getters.mapProjection(stateSupplyCoord)).to.be.null;
            expect(getters.mapProjection(state)).to.equals(proj);
        });
        it("returns the positionMapProjection from state", () => {
            const pos = [100, 200],
                state = {
                    positionMapProjection: pos
                };

            expect(getters.positionMapProjection(stateSupplyCoord)).to.be.an("array").that.is.empty;
            expect(getters.positionMapProjection(state)).to.equals(pos);
        });
        it("returns the updatePosition from state", () => {
            const state = {
                updatePosition: false
            };

            expect(getters.updatePosition(stateSupplyCoord)).to.be.true;
            expect(getters.updatePosition(state)).to.be.false;
        });
        it("returns the currentProjectionName from state", () => {
            const name = "EPSG:25832",
                name2 = "EPSG:4326",
                state = {
                    currentProjectionName: name2
                };

            expect(getters.currentProjectionName(stateSupplyCoord)).to.be.equals(name);
            expect(getters.currentProjectionName(state)).to.be.equals(name2);
        });
        it("returns the currentProjection from state", () => {
            const proj = {name: "projection 1", projName: "utm"},
                state = {
                    currentProjection: proj
                };

            expect(getters.currentProjection(stateSupplyCoord)).to.be.null;
            expect(getters.currentProjection(state)).to.equals(proj);
        });
        it("returns the currentSelection from state", () => {
            const name = "EPSG:25832",
                name2 = "EPSG:4326",
                state = {
                    currentSelection: name2
                };

            expect(getters.currentSelection(stateSupplyCoord)).to.be.equals(name);
            expect(getters.currentSelection(state)).to.be.equals(name2);
        });
        it("returns the coordinatesEastingField from state", () => {
            const value = "160° 00′ 00″",
                state = {
                    coordinatesEastingField: value
                };

            expect(getters.coordinatesEastingField(stateSupplyCoord)).to.be.equals("");
            expect(getters.coordinatesEastingField(state)).to.be.equals(value);
        });
        it("returns the coordinatesNorthingField from state", () => {
            const value = "100° 00′ 00″ E",
                state = {
                    coordinatesNorthingField: value
                };

            expect(getters.coordinatesNorthingField(stateSupplyCoord)).to.be.equals("");
            expect(getters.coordinatesNorthingField(state)).to.be.equals(value);
        });
    });
    describe("testing default values", () => {
        it("returns the name default value from state", () => {
            expect(getters.name(stateSupplyCoord)).to.be.equals("common:menu.tools.supplyCoord");
        });
        it("returns the icon default value from state", () => {
            expect(getters.icon(stateSupplyCoord)).to.equals("bi-bullseye");
        });
        it("returns the renderToWindow default value from state", () => {
            expect(getters.renderToWindow(stateSupplyCoord)).to.be.true;
        });
        it("returns the resizableWindow default value from state", () => {
            expect(getters.resizableWindow(stateSupplyCoord)).to.be.true;
        });
        it("returns the isVisibleInMenu default value from state", () => {
            expect(getters.isVisibleInMenu(stateSupplyCoord)).to.be.true;
        });
        it("returns the deactivateGFI default value from state", () => {
            expect(getters.deactivateGFI(stateSupplyCoord)).to.be.true;
        });

    });
});
