import testAction from "../../../../../../test/unittests/VueTestUtils";
import actions from "../../../store/actionsMapMarker";
import sinon from "sinon";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import Point from "ol/geom/Point.js";
import {Icon, Style} from "ol/style.js";
import {expect} from "chai";

const {
    placingPointMarker,
    removePointMarker,
    placingPolygonMarker,
    removePolygonMarker,
    rotatePointMarker
} = actions;

describe("src/modules/mapMarker/store/actionsMapMarker.js", () => {
    let markerPoint, markerPolygon, rootGetters;

    beforeEach(() => {
        markerPoint = new VectorLayer({
            name: "markerPoint",
            source: new VectorSource(),
            alwaysOnTop: true,
            visible: false,
            style: new Style()
        });
        markerPolygon = new VectorLayer({
            name: "markerPolygon",
            source: new VectorSource(),
            alwaysOnTop: true,
            visible: false,
            style: new Style()
        });
        rootGetters = {
            "Map/ol2DMap": {
                removeLayer: sinon.spy(),
                addLayer: sinon.spy()
            }
        };
    });
    afterEach(() => {
        sinon.restore();
    });
    describe("placingPointMarker", () => {
        it("placingPointMarker if no styleListModel exist", done => {
            const payload = [10, 10],
                state = {
                    markerPoint: markerPoint
                };

            testAction(placingPointMarker, payload, state, {}, [
                {type: "removePointMarker", dispatch: true}
            ], {}, done);
        });
    });

    describe("removePointMarker", () => {
        it("removePointMarker", done => {
            const state = {
                markerPoint: markerPoint
            };

            testAction(removePointMarker, null, state, {}, [
                {type: "clearMarker", payload: "markerPoint"},
                {type: "setVisibilityMarker", payload: {visbility: false, marker: "markerPoint"}}
            ], {}, done, rootGetters);
        });
    });
    describe("rotatePointMarker", () => {
        it("rotatePointMarker", done => {
            let feature = null;
            const coordValues = [100, 100],
                state = {
                    markerPoint: markerPoint
                },
                getters = {
                    "markerPoint": state.markerPoint
                },
                iconfeature = new Feature({
                    geometry: new Point(coordValues)
                }),
                style = new Style({
                    image: new Icon({
                        src: "/test/unittests/resources/icons/cloud.png",
                        scale: 1,
                        opacity: 100
                    }),
                    zIndex: 1
                }),
                payload = 180;

            iconfeature.setStyle(style);
            state.markerPoint.getSource().addFeature(iconfeature);
            feature = state.markerPoint?.getSource().getFeatures()[0];

            expect(feature.getStyle().getImage().getRotation()).to.be.equals(0);
            testAction(rotatePointMarker, payload, state, {}, [
                {type: "clearMarker", payload: "markerPoint"},
                {type: "addFeatureToMarker", payload: {feature: feature, marker: "markerPoint"}}
            ], getters, done, rootGetters);
            expect(feature.getStyle().getImage().getRotation()).to.be.equals(payload * Math.PI / 180);
        });
    });

    describe("placingPolygonMarker", () => {
        it("placingPolygonMarker if no styleListModel exist", done => {
            const payload = new Feature({
                    geometry: new Polygon([[[565086.1948534324, 5934664.461947621], [565657.6945448224, 5934738.54524095], [565625.9445619675, 5934357.545446689], [565234.3614400891, 5934346.962119071], [565086.1948534324, 5934664.461947621]]])
                }),
                state = {
                    markerPolygon: markerPolygon
                };

            testAction(placingPolygonMarker, payload, state, {}, [
                {type: "removePolygonMarker", dispatch: true}
            ], {}, done);
        });
    });

    describe("removePolygonMarker", () => {
        it("removePolygonMarker", done => {
            const state = {
                markerPolygon: markerPolygon
            };

            testAction(removePolygonMarker, null, state, {}, [
                {type: "clearMarker", payload: "markerPolygon"},
                {type: "setVisibilityMarker", payload: {visbility: false, marker: "markerPolygon"}}
            ], {}, done, rootGetters);
        });
    });

});
