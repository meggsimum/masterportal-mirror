import {expect} from "chai";
import sinon from "sinon";
import getters from "../../../store/gettersCoordToolkit";
import stateCoord from "../../../store/stateCoordToolkit";

describe("src/modules/tools/coordToolkit/store/gettersCoordToolkit.js", () => {

    describe("getters supplyCoord", () => {
        it("returns the selectPointerMove from state", () => {
            const emptyFunc = sinon.stub(),
                state = {
                    selectPointerMove: emptyFunc
                };

            expect(getters.selectPointerMove(stateCoord)).to.equals(null);
            expect(getters.selectPointerMove(state)).to.equals(emptyFunc);
        });
        it("returns the projections from state", () => {
            const proj = [{name: "projection 1", projName: "utm"},
                    {name: "projection 2", projName: "longlat"}],
                state = {
                    projections: proj
                };

            expect(getters.projections(stateCoord)).to.be.an("array").that.is.empty;
            expect(getters.projections(state)).to.equals(proj);
        });
        it("returns the mapProjection from state", () => {
            const proj = {name: "projection 1", projName: "utm"},
                state = {
                    mapProjection: proj
                };

            expect(getters.mapProjection(stateCoord)).to.be.null;
            expect(getters.mapProjection(state)).to.equals(proj);
        });
        it("returns the positionMapProjection from state", () => {
            const pos = [100, 200],
                state = {
                    positionMapProjection: pos
                };

            expect(getters.positionMapProjection(stateCoord)).to.be.an("array").that.is.empty;
            expect(getters.positionMapProjection(state)).to.equals(pos);
        });
        it("returns the updatePosition from state", () => {
            const state = {
                updatePosition: false
            };

            expect(getters.updatePosition(stateCoord)).to.be.true;
            expect(getters.updatePosition(state)).to.be.false;
        });
        it("returns the currentProjection from state", () => {
            const proj1 = {id: "EPSG:25832", name: "EPSG:25832", projName: "utm"},
                proj2 = {id: "EPSG:4326", name: "EPSG:4326", projName: "longlat"},
                state = {
                    currentProjection: proj2
                };

            expect(getters.currentProjection(stateCoord).id).to.be.equals(proj1.id);
            expect(getters.currentProjection(stateCoord).name).to.be.equals(proj1.name);
            expect(getters.currentProjection(stateCoord).projName).to.be.equals(proj1.projName);
            expect(getters.currentProjection(state)).to.be.equals(proj2);
        });
        it("returns the currentProjection from state", () => {
            const name = "EPSG:25832",
                name2 = "EPSG:4326",
                state = {
                    currentProjection: {name: name2}
                };

            expect(getters.currentProjection(stateCoord).name).to.be.equals(name);
            expect(getters.currentProjection(state).name).to.be.equals(name2);
        });
        it("returns the coordinatesEastingField from state", () => {
            const easting = {id: "easting", value: "160° 00′ 00″"},
                state = {
                    coordinatesEasting: easting
                };

            expect(getters.coordinatesEasting(stateCoord).value).to.be.equals("");
            expect(getters.coordinatesEasting(state).value).to.be.equals(easting.value);
        });
        it("returns the coordinatesNorthingField from state", () => {
            const northing = {id: "northing", value: "100° 00′ 00″ E"},
                state = {
                    coordinatesNorthing: northing
                };

            expect(getters.coordinatesNorthing(stateCoord).value).to.be.equals("");
            expect(getters.coordinatesNorthing(state).value).to.be.equals(northing.value);
        });
    });
    describe("testing default values", () => {
        it("returns the name default value from state", () => {
            expect(getters.name(stateCoord)).to.be.equals("common:menu.tools.coordToolkit");
        });
        it("returns the icon default value from state", () => {
            expect(getters.icon(stateCoord)).to.equals("bi-globe");
        });
        it("returns the renderToWindow default value from state", () => {
            expect(getters.renderToWindow(stateCoord)).to.be.true;
        });
        it("returns the resizableWindow default value from state", () => {
            expect(getters.resizableWindow(stateCoord)).to.be.true;
        });
        it("returns the isVisibleInMenu default value from state", () => {
            expect(getters.isVisibleInMenu(stateCoord)).to.be.true;
        });
        it("returns the deactivateGFI default value from state", () => {
            expect(getters.deactivateGFI(stateCoord)).to.be.true;
        });

    });
    describe("getters SearchByCoord", () => {

        describe("getEastingError", () => {
            it("Returns true if the easting coordinates don´t match the specified format", () => {
                const state = {
                    eastingNoCoord: false,
                    eastingNoMatch: true
                };

                expect(getters.getEastingError(state)).to.be.true;
            });
            it("Returns true if no easting coordinates were entered", () => {
                const state = {
                    eastingNoCoord: true,
                    eastingNoMatch: false
                };

                expect(getters.getEastingError(state)).to.be.true;
            });
            it("Returns false when there are no easting errors", () => {
                const state = {
                    eastingNoCoord: false,
                    eastingNoMatch: false
                };

                expect(getters.getEastingError(state)).to.be.false;
            });
        });
        describe("getNorthingError", () => {
            it("Returns true if the northing coordinates don´t match the specified format", () => {
                const state = {
                    northingNoCoord: false,
                    northingNoMatch: true
                };

                expect(getters.getNorthingError(state)).to.be.true;
            });
            it("Returns true if no northing coordinates were entered", () => {
                const state = {
                    northingNoCoord: true,
                    northingNoMatch: false
                };

                expect(getters.getNorthingError(state)).to.be.true;
            });
            it("Returns false when there are no northing errors", () => {
                const state = {
                    northingNoCoord: false,
                    northingNoMatch: false
                };

                expect(getters.getNorthingError(state)).to.be.false;
            });
        });
    });
});
