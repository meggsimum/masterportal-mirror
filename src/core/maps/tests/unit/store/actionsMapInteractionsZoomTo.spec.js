import Map from "ol/Map";
import View from "ol/View";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import LayerGroup from "ol/layer/Group";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import store from "../../../../../app-store";
import {expect} from "chai";

describe("src/core/maps/store/actions/actionsMapInteractionsZoomTo.js", () => {
    /**
     * Is needed to run the tests.
     * @see https://github.com/vuejs/vue-test-utils/issues/974
     * @returns {void}
     */
    global.requestAnimationFrame = () => "";

    const layer1 = new VectorLayer({
            id: "Donald",
            name: "Duck1",
            source: new VectorSource()
        }),
        layer2 = new VectorLayer({
            id: "Dagobert",
            name: "Duck2",
            alwaysOnTop: true,
            source: new VectorSource()
        }),
        layer3 = new VectorLayer({
            id: "Darkwing",
            name: "Duck3",
            source: new VectorSource()
        }),
        layer4 = new VectorLayer({
            id: "Daisy",
            name: "Duck4",
            source: new VectorSource()
        }),
        layer5 = new LayerGroup({
            id: "Darkwing_Daisy",
            name: "Duck_group",
            layers: [layer3, layer4]
        });
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

        mapCollection.addMap(map, "2D");
        mapView = mapCollection.getMapView("2D");
    });
    describe.skip("zoomToExtent", () => {
        it("Zoom to the extent with duration 0 milliseconds", () => {
            store.dispatch("Maps/zoomToExtent", {extent: [565760.049, 5931747.185, 568940.626, 5935453.891], options: {duration: 0}});
            expect(mapView.getCenter()).to.deep.equal([567350.3375, 5933600.538]);
            expect(Math.round(mapView.getZoom())).equals(4);
        });
    });
    describe("zoomToFilteredFeatures", () => {
        const ids = ["Tick", "Track"],
            zoomOptions = {duration: 0},
            feature1 = new Feature({
                name: "Tick",
                geometry: new Point([555994.92, 5929695.34])
            }),
            feature2 = new Feature({
                name: "Trick",
                geometry: new Point([574780.33, 5946033.36])
            }),
            feature3 = new Feature({
                name: "Track",
                geometry: new Point([575441.79, 5924668.26])
            });

        it("Zoom to extend of the given featureIds of a vectorLayer", () => {
            feature1.setId("Tick");
            feature2.setId("Trick");
            feature3.setId("Track");

            layer1.getSource().addFeatures([feature1, feature2, feature3]);
            map.addLayer(layer1);
            map.addLayer(layer2);

            store.dispatch("Maps/zoomToFilteredFeatures", {ids: ids, layerId: "Donald", zoomOptions: zoomOptions});

            expect(Math.round(mapView.getZoom())).equals(2);
        });

        it("Zoom to extend of the given featureIds of a groupLayer", () => {
            feature1.setId("Tick");
            feature2.setId("Trick");
            feature3.setId("Track");

            layer3.getSource().addFeatures([feature1, feature2, feature3]);
            map.addLayer(layer2);
            map.addLayer(layer5);

            store.dispatch("Maps/zoomToFilteredFeatures", {ids: ids, layerId: "Darkwing", zoomOptions: zoomOptions});

            expect(Math.round(mapView.getZoom())).equals(2);
        });
    });
});
