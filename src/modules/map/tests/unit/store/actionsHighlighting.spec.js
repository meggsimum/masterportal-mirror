import testAction from "../../../../../../test/unittests/VueTestUtils";
import sinon from "sinon";
import actions from "../../../store/actions/actionsMap";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import {Fill, Stroke, Circle, Style} from "ol/style";

describe("src/modules/map/store/actions/highlightFeature.js", () => {
    const olFeature = createFeature(),
        source = new VectorSource(),
        layer = new VectorLayer({
            name: name,
            source: source,
            alwaysOnTop: true,
            style: olFeature.getStyle(),
            id: "testLayer"
        }),
        highlightFeature = olFeature,
        highlightLayer = layer;

    let state, requestLayerList, requestStyleModel;

    beforeEach(() => {
        requestStyleModel = sinon.spy(() => {
            const fill = new Fill({
                    color: "rgba(255,255,255,0.4)"
                }),
                stroke = new Stroke({
                    color: "#3399CC",
                    width: 1.25
                }),
                style = new Style({
                    image: new Circle({
                        fill: fill,
                        stroke: stroke,
                        radius: 5,
                        scale: 1
                    }),
                    fill: fill,
                    stroke: stroke
                }),
                styleModel = {
                    style: style,
                    createStyle: function () {
                        return style;
                    }
                };

            return styleModel;
        });
        requestLayerList = sinon.spy(() => {
            const simulateLayer = highlightLayer;

            simulateLayer.getSource().addFeature(highlightFeature);
            return simulateLayer;
        });
    });

    afterEach(sinon.restore);

    /**
     * Creates an ol Feature with point geometry and Style
     * @returns {ol/Feature}  ol Feature
     */
    function createFeature () {
        const feature = new Feature({
                name: "feature123"
            }),
            fill = new Fill({
                color: "rgba(255,255,255,0.4)"
            }),
            stroke = new Stroke({
                color: "#3399CC",
                width: 1.25
            }),
            styles = [
                new Style({
                    image: new Circle({
                        fill: fill,
                        stroke: stroke,
                        radius: 5,
                        scale: 1
                    }),
                    fill: fill,
                    stroke: stroke
                })
            ];

        feature.setId("feature1");
        feature.setStyle(styles);
        return feature;
    }

    describe("highlights vector feature", () => {
        it("should increase the feature icon ", done => {
            const highlightObject = {
                type: "increase",
                feature: highlightFeature,
                layer: highlightLayer
            };

            sinon.stub(Radio, "request").callsFake(requestStyleModel);
            olFeature.setGeometry(new Point([10, 10]));
            state = {
                highlightedFeature: olFeature,
                highlightedFeatureStyle: olFeature.getStyle()
            };

            testAction(actions.highlightFeature, highlightObject, state, {}, [
                {type: "addHighlightedFeature", payload: highlightObject.feature},
                {type: "addHighlightedFeatureStyle", payload: highlightObject.feature.getStyle()}
            ], {}, done);
        });

        it("should highlight the vector feature via layerid and featureid", done => {
            const highlightObject = {
                type: "viaLayerIdAndFeatureId",
                layerIdAndFeatureId: "testLayer,feature1"
            };

            sinon.stub(Radio, "request").callsFake(requestLayerList);

            testAction(actions.highlightFeature, highlightObject, state, {}, [

            ], {layerById: () => undefined}, done);
        });
        it("should highlight the polygon feature via highlightVectorRules gfi parameter", done => {
            const highlightObject = {
                type: "highlightPolygon",
                feature: highlightFeature,
                layer: highlightLayer,
                highlightStyle: {
                    fill: {
                        "color": [215, 102, 41, 0.9]
                    },
                    stroke: {
                        "width": 4
                    }
                }
            };

            sinon.stub(Radio, "request").callsFake(requestStyleModel);
            olFeature.setGeometry(new Polygon([[[565086.1948534324, 5934664.461947621], [565657.6945448224, 5934738.54524095], [565625.9445619675, 5934357.545446689], [565234.3614400891, 5934346.962119071], [565086.1948534324, 5934664.461947621]]]));
            state = {
                highlightedFeature: olFeature,
                highlightedFeatureStyle: olFeature.getStyle()
            };

            testAction(actions.highlightFeature, highlightObject, state, {}, [
                {type: "addHighlightedFeature", payload: highlightObject.feature},
                {type: "addHighlightedFeatureStyle", payload: highlightObject.feature.getStyle()}
            ], {}, done);
        });
        it("should highlight the polygon feature via mapMarker", done => {
            const rootState = {
                    MapMarker: {
                        placingPolygonMarker: {}
                    }
                },
                highlightObject = {
                    type: "highlightPolygon",
                    feature: highlightFeature,
                    layer: highlightLayer
                };


            sinon.stub(Radio, "request").callsFake(requestStyleModel);
            olFeature.setGeometry(new Polygon([[[565086.1948534324, 5934664.461947621], [565657.6945448224, 5934738.54524095], [565625.9445619675, 5934357.545446689], [565234.3614400891, 5934346.962119071], [565086.1948534324, 5934664.461947621]]]));
            highlightObject.type = "highlightPolygon";

            testAction(actions.highlightFeature, highlightObject, {}, rootState, [
                {type: "MapMarker/placingPolygonMarker", payload: highlightObject.feature, dispatch: true}
            ], {}, done);
        });
    });
});
