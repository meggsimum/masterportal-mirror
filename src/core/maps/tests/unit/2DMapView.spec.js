import "../../2DMap";
import "../../2DMapView";
import Map from "ol/Map";
import View from "ol/View";
import mapCollection from "../../../../core/dataStorage/mapCollection.js";
import {expect} from "chai";

describe("src/core/maps/2DMapView.js", () => {
    /**
     * Is needed to run the tests.
     * @see https://github.com/vuejs/vue-test-utils/issues/974
     * @returns {void}
     */
    global.requestAnimationFrame = () => "";

    let map,
        mapView;

    beforeEach(() => {
        mapCollection.clear();
        map = new Map({
            id: "ol",
            mode: "2D",
            view: new View({
                extent: [510000.0, 5850000.0, 625000.4, 6000000.0],
                center: [565874, 5934140],
                zoom: 2,
                options: [
                    {resolution: 66.14579761460263, scale: 250000, zoomLevel: 0},
                    {resolution: 26.458319045841044, scale: 100000, zoomLevel: 1},
                    {resolution: 15.874991427504629, scale: 60000, zoomLevel: 2},
                    {resolution: 10.583327618336419, scale: 40000, zoomLevel: 3},
                    {resolution: 5.2916638091682096, scale: 20000, zoomLevel: 4},
                    {resolution: 2.6458319045841048, scale: 10000, zoomLevel: 5},
                    {resolution: 1.3229159522920524, scale: 5000, zoomLevel: 6},
                    {resolution: 0.6614579761460262, scale: 2500, zoomLevel: 7},
                    {resolution: 0.2645831904584105, scale: 1000, zoomLevel: 8},
                    {resolution: 0.1322915952292052, scale: 500, zoomLevel: 9}
                ],
                resolution: 15.874991427504629,
                resolutions: [66.14579761460263, 26.458319045841044, 15.874991427504629, 10.583327618336419, 5.2916638091682096, 2.6458319045841048, 1.3229159522920524, 0.6614579761460262, 0.2645831904584105, 0.13229159522920522]
            })
        });

        map.setSize([1059, 887]);

        mapCollection.addMap(map, "ol", "2D");
        mapView = mapCollection.getMapView("ol", "2D");
    });

    it("getCurrentExtent - calculate the extent for the current view state and the passed size", function () {
        expect(mapView.getCurrentExtent()).to.deep.equal([
            565080.2504286248,
            5933346.250428624,
            566667.7495713752,
            5934933.749571376
        ]);
    });

    it("Returns the bounding box with the projection EPSG:4326", () => {
        expect(mapView.getProjectedBBox()).to.deep.equal([
            5.0078219731923275,
            46.908179219825406,
            5.158843288524674,
            46.99452561170306
        ]);
    });

    it("getResolutionByScale - returns the resolution for the given scale", function () {
        expect(mapView.getResolutionByScale(5000, "max")).to.deep.equal(1.3229159522920524);
    });

    it("resetView - resets the view", function () {
        mapView.resetView();

        expect(mapView.getCenter()).to.deep.equal([565874, 5934140]);
        expect(mapView.getResolution()).to.deep.equal(15.874991427504629);
    });

    it("Sets the bbox", function () {
        mapView.setBBox([565760.049, 5931747.185, 568940.626, 5935453.891]);

        expect(mapView.getCenter()).to.deep.equal([567350.3375, 5933600.538]);
        expect(Math.round(mapView.getZoom())).equals(1);
    });

    it("Sets the center with integers", function () {
        mapView.setCenterCoord([1, 2]);

        expect(mapView.getCenter()).to.deep.equal([510793.74957137526, 5850793.749571376]);
    });

    it("Sets the center with strings", function () {
        mapView.setCenterCoord(["1", "2"]);

        expect(mapView.getCenter()).to.deep.equal([510793.74957137526, 5850793.749571376]);
    });

    it("Sets the resolution by scale", function () {
        mapView.setResolutionByScale(1000);

        expect(mapView.getResolution()).to.deep.equal(0.2645831904584105);
    });

    it("Sets the zoom level down", function () {
        mapView.setZoomLevelDown();

        expect(mapView.getZoom()).to.deep.equal(1);
    });

    it("Sets the zoom level up", function () {
        mapView.setZoomLevelUp();

        expect(mapView.getZoom()).to.deep.equal(3);
    });

    it("sets the background", function () {
        mapView.setBackground("Daisy Ducks custom BG");
        expect(mapView.background).to.equal("Daisy Ducks custom BG");

        mapView.setBackground("Mickey Mouses custom map");
        expect(mapView.background).to.equal("Mickey Mouses custom map");
    });
});
