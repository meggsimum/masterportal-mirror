import {View} from "ol";
import defaults from "../src/defaults";
import {createMapView} from "../src/mapView";

jest.mock("ol");

describe("map.js", function () {
    describe("createMapView", function () {
        it("returns an instance of MapView", function () {
            expect(createMapView()).toBeInstanceOf(View);
        });

        it("uses defaults where nothing was specified", function () {
            const testData = {
                extent: [5.0, 7.0, 7.4, 8.0],
                options: [
                    {resolution: 66.14579761460263, scale: 250000, zoomLevel: 0},
                    {resolution: 26.458319045841044, scale: 100000, zoomLevel: 1}
                ]
            };

            createMapView(testData);
            const callParam = View.mock.calls[View.mock.calls.length - 1][0]; /* eslint-disable-line */

            expect(callParam.extent).toBe(testData.extent);
            expect(callParam.resolutions).toEqual(testData.options.map(x => x.resolution));
            expect(callParam.resolution).toBe(defaults.startResolution);
            expect(callParam.center).toBe(defaults.startCenter);
            expect(callParam.projection).toBe(defaults.epsg);
        });
    });
});
