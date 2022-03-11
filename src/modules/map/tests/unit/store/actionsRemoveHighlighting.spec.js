import testAction from "../../../../../../test/unittests/VueTestUtils";
import sinon from "sinon";
import actions from "../../../store/actions/actionsMap";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import {Fill, Stroke, Circle, Style} from "ol/style";

describe("src/modules/map/store/actions/removeHighlighting.js", () => {
    let state;


    afterEach(sinon.restore);

    /**
     * Creates an ol Feature with point geometry and Style
     * @returns {ol/Feature}  ol Feature
     */
    function createFeature () {
        const olFeature = new Feature({
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

        olFeature.setId("feature1");
        olFeature.setGeometry(new Point([10, 10]));
        olFeature.setStyle(styles);
        return olFeature;
    }

    describe("remove feature highlighting", () => {
        const olFeature = createFeature();

        state = {
            highlightedFeatures: [olFeature],
            highlightedFeatureStyles: [olFeature.getStyle()]
        };
        it("should reset the feature icon increase", done => {
            testAction(actions.removeHighlightFeature, olFeature, state, {}, [
                {type: "setHighlightedFeatureStyles", payload: []},
                {type: "setHighlightedFeatures", payload: []}
            ], {}, done);
        });
    });
});
