import {expect} from "chai";
import getters from "../../../store/gettersScaleSwitcher";
import stateScaleSwitcher from "../../../store/stateScaleSwitcher";


const {
    active,
    id,
    name,
    icon,
    renderToWindow,
    resizableWindow,
    isVisibleInMenu,
    deactivateGFI
} = getters;

describe("src/modules/tools/scaleSwitcher/store/gettersScaleSwitcher.js", () => {
    describe("ScaleSwitcher getters", () => {
        it("returns the active from state", () => {
            expect(active(stateScaleSwitcher)).to.be.false;
        });
        it("returns the id from state", () => {
            expect(id(stateScaleSwitcher)).to.equals("scaleSwitcher");
        });
    });
    describe("testing default values", () => {
        it("returns the name default value from state", () => {
            expect(name(stateScaleSwitcher)).to.be.equals("common:menu.tools.scaleSwitcher");
        });
        it("returns the icon default value from state", () => {
            expect(icon(stateScaleSwitcher)).to.equals("bi-arrows-angle-contract");
        });
        it("returns the renderToWindow default value from state", () => {
            expect(renderToWindow(stateScaleSwitcher)).to.be.true;
        });
        it("returns the resizableWindow default value from state", () => {
            expect(resizableWindow(stateScaleSwitcher)).to.be.true;
        });
        it("returns the isVisibleInMenu default value from state", () => {
            expect(isVisibleInMenu(stateScaleSwitcher)).to.be.true;
        });
        it("returns the deactivateGFI default value from state", () => {
            expect(deactivateGFI(stateScaleSwitcher)).to.be.false;
        });
    });
});
