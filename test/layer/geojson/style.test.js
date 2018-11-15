import {Style} from "ol/style.js";

import style, {setCustomStyles} from "../../../src/layer/geojson/style";

const types = [
    "Point",
    "LineString",
    "MultiLineString",
    "MultiPoint",
    "MultiPolygon",
    "Polygon",
    "GeometryCollection",
    "Circle"
];

function mockFeature (type) {
    return {
        getGeometry: () => ({
            getType: () => type
        })
    };
}

describe("geojson/style", function () {
    // reset module in case another test changed it
    beforeEach(() => setCustomStyles({}));

    describe("style", function () {
        it("returns default styling for all openlayers feature types", function () {
            types.forEach(type => expect(style(mockFeature(type))).toBeInstanceOf(Style));
        });

        it("uses custom styles first, if set", function () {
            const custom = {
                Point: 1,
                Polygon: 1
            };

            setCustomStyles(custom);

            types.forEach(type => custom[type]
                ? expect(typeof style(mockFeature(type))).toBe("number")
                : expect(style(mockFeature(type))).toBeInstanceOf(Style));
        });
    });
});
