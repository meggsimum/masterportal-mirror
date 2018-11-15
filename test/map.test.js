import {Map} from "ol";
import {Tile as TileLayer} from "ol/layer.js";
import {createMap, addLayer} from "../src/map";
import {initializeLayerList} from "../src/rawLayerList.js";
import {registerProjections} from "../src/crs.js";
import setBackgroundImage from "../src/lib/setBackgroundImage.js";
import {createMapView} from "../src/mapView";
import defaults from "../src/defaults";

/*
 * This test is mocking a lot to check what functions are called with.
 * createMap logic is mostly calling other functions.
 */
jest.mock("ol");
jest.mock("../src/rawLayerList.js", () => {
    const original = require.requireActual("../src/rawLayerList.js");

    original.getLayerWhere = ({id}) => ({
        exists: {
            typ: "doesntExist"
        },
        works: {
            typ: "WMS"
        }
    })[id];
    original.initializeLayerList = jest.fn();
    return original;
});
jest.mock("../src/crs.js");
jest.mock("../src/lib/setBackgroundImage.js");
jest.mock("../src/mapView.js");

describe("map.js", function () {
    describe("createMap", function () {
        it("calls all initialization functions", function () {
            const callback = jest.fn();

            createMap(defaults, {callback});
            expect(initializeLayerList).toHaveBeenCalledWith(defaults.layerConf, callback);
            expect(registerProjections).toHaveBeenCalledWith(defaults.namedProjections);
            expect(setBackgroundImage).toHaveBeenCalledWith(defaults);
        });

        it("creates a MapView", function () {
            createMap(defaults);
            expect(createMapView).toHaveBeenCalledWith(defaults);
        });

        it("creates and returns a Map object from openlayers with optional additional params", function () {
            const ret = createMap(defaults, {mapParams: {test: 1}});

            expect(Map.mock.calls[Map.mock.calls.length - 1][0].test).toBe(1);
            expect(ret).toBeInstanceOf(Map);
        });
    });

    describe("addLayer", function () {
        it("logs an error for unknown ids", function () {
            console.error = jest.fn();
            const consoleError = console.error,
                result = addLayer("999999999999999");

            expect(console.error).toHaveBeenCalled();
            expect(result).toBeNull();
            console.error = consoleError;
        });

        it("logs an error for unknown types", function () {
            console.error = jest.fn();
            const consoleError = console.error,
                result = addLayer("exists");

            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalledWith("Layer with id 'exists' has unknown type 'doesntExist'. No layer added to map.");
            console.error = consoleError;
        });

        it("adds existing layers that have a known builder to the map", function () {
            const map = createMap(defaults),
                result = addLayer("works");

            expect(result).toBeInstanceOf(TileLayer);
            expect(map.addLayer).toHaveBeenCalledWith(result);
        });
    });
});
