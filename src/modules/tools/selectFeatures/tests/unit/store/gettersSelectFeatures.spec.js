import {expect} from "chai";
import getters from "../../../store/gettersSelectFeatures";
import stateSelectFeatures from "../../../store/stateSelectFeatures";


const {
    active,
    id,
    name,
    icon,
    renderToWindow,
    resizableWindow,
    isVisibleInMenu,
    deactivateGFI} = getters;

describe("src/modules/tools/selectFeatures/store/gettersSelectFeatures", function () {
    it("returns the active from state", function () {
        expect(active(stateSelectFeatures)).to.be.false;
    });
    it("returns the id from state", function () {
        expect(id(stateSelectFeatures)).to.equals("selectFeatures");
    });

    describe("testing default values", function () {
        it("returns the name default value from state", function () {
            expect(name(stateSelectFeatures)).to.be.equals("common:menu.tools.selectFeatures");
        });
        it("returns the icon default value from state", function () {
            expect(icon(stateSelectFeatures)).to.equals("bi-card-list");
        });
        it("returns the renderToWindow default value from state", function () {
            expect(renderToWindow(stateSelectFeatures)).to.be.true;
        });
        it("returns the resizableWindow default value from state", function () {
            expect(resizableWindow(stateSelectFeatures)).to.be.true;
        });
        it("returns the isVisibleInMenu default value from state", function () {
            expect(isVisibleInMenu(stateSelectFeatures)).to.be.true;
        });
        it("returns the deactivateGFI default value from state", function () {
            expect(deactivateGFI(stateSelectFeatures)).to.be.true;
        });

    });
});
