import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import Feature from "ol/Feature.js";
import {Polygon} from "ol/geom.js";

import {expect} from "chai";

import style from "../../../utils/measureStyle";

describe("tools/measure/utils/measureStyle", function () {
    it("get correct coordinates for polygon", function () {
        const source = new VectorSource(),
            layer = new VectorLayer({
                source,
                style,
                id: "measureLayer",
                name: "measureLayer",
                alwaysOnTop: true
            }),
            feature = new Feature({
                geometry: new Polygon([[[0, 0], [0, 1], [1, 1], [1, 0]]])
            });
        let styles = null;

        layer.getSource().addFeature(feature);
        styles = layer.getStyleFunction()(feature);
        styles.forEach((aStyle, i) => {
            const geom = aStyle.getGeometryFunction()(feature);

            if (geom instanceof Polygon) {
                if (i === 0) {
                    expect(geom.getCoordinates()).to.deep.equals([[[0, 0], [0, 1], [1, 1], [1, 0]]]);
                }
                else if (i === 2) {
                    expect(geom.getCoordinates()).to.deep.equals([[[0, 1], [1, 1]]]);
                }
            }
        });
    });
});
