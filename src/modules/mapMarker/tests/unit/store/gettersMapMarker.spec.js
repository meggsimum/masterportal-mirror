import {expect} from "chai";
import getters from "../../../store/gettersMapMarker";
import stateMapMarker from "../../../store/stateMapMarker";

describe("src/modules/mapMarker/store/gettersMapMarker.js", () => {

    describe("MapMarker getters", () => {
        it("returns the pointStyleId from state", () => {
            expect(getters.pointStyleId(stateMapMarker)).to.equals("defaultMapMarkerPoint");
        });
        it("returns the polygonStyleId from state", () => {
            expect(getters.polygonStyleId(stateMapMarker)).to.equals("defaultMapMarkerPolygon");
        });
        it.skip("returns the markerPoint from state", () => {
            expect(getters.markerPoint(stateMapMarker).getSource()).is.not.undefined;
            expect(getters.markerPoint(stateMapMarker).get("name")).equals("markerPoint");
            expect(getters.markerPoint(stateMapMarker).getVisible()).to.be.false;
            expect(getters.markerPoint(stateMapMarker).getStyle()).is.not.undefined;
        });
        it("returns the markerPolygon from state", () => {
            expect(getters.markerPolygon(stateMapMarker).getSource()).is.not.undefined;
            expect(getters.markerPolygon(stateMapMarker).get("name")).equals("markerPolygon");
            expect(getters.markerPolygon(stateMapMarker).getVisible()).to.be.false;
            expect(getters.markerPolygon(stateMapMarker).getStyle()).is.not.undefined;
        });
    });
});
