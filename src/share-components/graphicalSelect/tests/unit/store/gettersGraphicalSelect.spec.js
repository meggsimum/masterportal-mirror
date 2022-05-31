import {expect} from "chai";
import stateGraphicalSelect from "../../../store/stateGraphicalSelect";
import getters from "../../../store/gettersGraphicalSelect";


describe("src/share-components/graphicalSelect/store/gettersGraphicalSelect", function () {
    it("returns the active from state", function () {
        expect(stateGraphicalSelect.active).to.be.false;
    });
    it("returns the name from state", function () {
        expect(stateGraphicalSelect.name).to.be.equal("Geometrie");
    });

    it("returns the type default value from state", function () {
        expect(stateGraphicalSelect.type).to.be.equal("string");
    });
    it("returns the displayName default value from state", function () {
        expect(stateGraphicalSelect.displayName).to.be.equal("common:snippets.graphicalSelect.displayName");
    });
    it("returns the snippetType default value from state", function () {
        expect(stateGraphicalSelect.snippetType).to.be.equal("graphicalSelect");
    });
    it("returns the isMultiple default value from state", function () {
        expect(stateGraphicalSelect.isMultiple).to.be.false;
    });
    it("returns the selectionElements default value from state", function () {
        expect(stateGraphicalSelect.selectionElements).to.be.eql(["Dropdown"]);
    });
    it("returns the geographicValues default value from state", function () {
        expect(stateGraphicalSelect.geographicValues).to.be.eql(["Box", "Circle", "Polygon"]);
    });
    it("returns the currentValue default value from state", function () {
        expect(stateGraphicalSelect.currentValue).to.be.equal("");
    });
    it("returns the tooltipMessage default value from state", function () {
        expect(stateGraphicalSelect.tooltipMessage).to.be.equal("common:snippets.graphicalSelect.tooltipMessage");
    });
    it("returns the tooltipMessagePolygon default value from state", function () {
        expect(stateGraphicalSelect.tooltipMessagePolygon).to.be.equal("common:snippets.graphicalSelect.tooltipMessagePolygon");
    });
    it("returns the selectedAreaGeoJson default value from state", function () {
        expect(stateGraphicalSelect.selectedAreaGeoJson).to.be.equal(undefined);
    });
    it("returns the defaultSelection default value from state", function () {
        expect(stateGraphicalSelect.defaultSelection).to.be.equal("");
    });
    it("returns the circleOverlay default values from state", () => {
        expect(getters.circleOverlay(stateGraphicalSelect).getId()).to.be.equal("circle-overlay");
        expect(getters.circleOverlay(stateGraphicalSelect).getElement()).not.to.be.undefined;
        expect(getters.circleOverlay(stateGraphicalSelect).getOffset()).to.deep.equal([15, 0]);
        expect(getters.circleOverlay(stateGraphicalSelect).getPositioning()).to.be.equal("center-left");
    });
    it("returns the tooltipOverlay default values from state", () => {
        expect(getters.tooltipOverlay(stateGraphicalSelect).getId()).to.be.equal("tooltip-overlay");
        expect(getters.tooltipOverlay(stateGraphicalSelect).getElement()).not.to.be.undefined;
        expect(getters.tooltipOverlay(stateGraphicalSelect).getOffset()).to.deep.equal([15, 20]);
        expect(getters.tooltipOverlay(stateGraphicalSelect).getPositioning()).to.be.equal("top-left");
    });
});
