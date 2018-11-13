import {Map, View} from "ol";
import proj4 from "proj4";
import * as Proj from "ol/proj.js";
import * as crs from "../src/crs";

const namedProjections = [
    ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
    ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
    ["EPSG:8395", "+title=ETRS89/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
    ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
];

describe("crs.js", function () {
    beforeAll(() => crs.registerProjections(namedProjections));

    describe("registerProjections", function () {
        it("registers the projections", function () {
            // registerProjection was called in beforeAll
            namedProjections.forEach(namedProjection => {
                const proj4Return = proj4.defs(namedProjection[0]),
                    olReturn = Proj.get(namedProjection[0]);

                expect(typeof proj4Return).toBe("object");
                expect(typeof olReturn).toBe("object");
            });
        });
    });

    describe("getProjection", function () {
        it("returns the proj4 projection", function () {
            expect(crs.getProjection("EPSG:25832")).toEqual(proj4.defs("EPSG:25832"));
        });
    });

    describe("getProjections", function () {
        it("returns all known projections", function () {
            const projections = crs.getProjections(),
                projectionNames = projections.map(entry => entry.name),
                knownProjectionNames = namedProjections.map(entry => entry[0]);

            // proj4 may come with default projections, hence >=
            expect(projectionNames.length >= knownProjectionNames.length).toBe(true);
            projections.forEach(projection => expect(typeof projection).toBe("object"));
            knownProjectionNames.forEach(name => expect(projectionNames).toContain(name));
        });
    });

    describe("transform", function () {
        it("transforms based on projection names", function () {
            const resultA = crs.transform("EPSG:25832", "EPSG:4326", [0, 0]),
                resultB = crs.transform("EPSG:4326", "EPSG:25832", resultA);

            expect(resultA[0]).toBeCloseTo(4.511256115);
            expect(resultA[1]).toBe(0);
            expect(resultB[0]).toBeCloseTo(0);
            expect(resultB[1]).toBe(0);
        });

        it("transforms based on projections", function () {
            const resultA = crs.transform(proj4.defs("EPSG:25832"), proj4.defs("EPSG:4326"), [0, 0]),
                resultB = crs.transform(proj4.defs("EPSG:4326"), proj4.defs("EPSG:25832"), resultA);

            expect(resultA[0]).toBeCloseTo(4.511256115);
            expect(resultA[1]).toBe(0);
            expect(resultB[0]).toBeCloseTo(0);
            expect(resultB[1]).toBe(0);
        });

        it("returns undefined and logs error if transformation can not be performed", function () {
            const consoleError = console.error,
                mockError = jest.fn();
            let result = null;

            console.error = mockError;
            result = crs.transform(proj4.defs("EPSG:WHOOPS_TYPO"), proj4.defs("EPSG:4326"), [0, 0]);
            expect(result).toBeUndefined();
            expect(mockError.mock.calls.length).toBe(1);
            console.error = consoleError;
        });
    });

    describe("transformToMapProjection", function () {
        it("transforms point to map's current projection", function () {
            const map = new Map({
                    view: new View({
                        projection: "EPSG:4326"
                    })
                }),
                result = crs.transformToMapProjection(map, "EPSG:25832", [0, 0]);

            expect(result[0]).toBeCloseTo(4.511256115);
            expect(result[1]).toBe(0);
        });
    });

    describe("transformFromMapProjection", function () {
        it("transforms point from map's current projection", function () {
            const map = new Map({
                    view: new View({
                        projection: "EPSG:25832"
                    })
                }),
                result = crs.transformFromMapProjection(map, "EPSG:4326", [0, 0]);

            expect(result[0]).toBeCloseTo(4.511256115);
            expect(result[1]).toBe(0);
        });
    });
});
