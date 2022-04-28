import axios from "axios";
import store from "../../../../../../../app-store";
import {expect} from "chai";
import sinon from "sinon";
import {RoutingDirections} from "../../../../utils/classes/routing-directions";
import {RoutingDirectionsSegment} from "../../../../utils/classes/routing-directions-segment";
import {RoutingDirectionsStep} from "../../../../utils/classes/routing-directions-step";
import {fetchRoutingOrsDirections} from "../../../../utils/directions/routing-ors-directions";

describe("src/modules/tools/routing/utils/directions/routing-ors-directions.js", () => {
    beforeEach(() => {
        sinon.stub(i18next, "t").callsFake((...args) => args);
        store.getters = {
            getRestServiceById: () => ({url: "tmp"})
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("should fetchRoutingOrsDirections", () => {
        it("should process result correct", async () => {
            sinon.stub(axios, "post").returns(
                new Promise(resolve => resolve({
                    data: {
                        type: "FeatureCollection",
                        features: [
                            {
                                bbox: [
                                    10.213668,
                                    51.384521,
                                    10.216961,
                                    51.385604
                                ],
                                type: "Feature",
                                properties: {
                                    segments: [
                                        {
                                            distance: 262.4,
                                            duration: 10.5,
                                            steps: [
                                                {
                                                    distance: 262.4,
                                                    duration: 10.5,
                                                    type: 11,
                                                    instruction:
                                                        "Further east on L 3080",
                                                    name: "L 3080",
                                                    way_points: [0, 5]
                                                },
                                                {
                                                    distance: 0.0,
                                                    duration: 0.0,
                                                    type: 10,
                                                    instruction:
                                                        "You will reach L 3080 (right)",
                                                    name: "-",
                                                    way_points: [5, 5]
                                                }
                                            ]
                                        }
                                    ],
                                    way_points: [0, 5],
                                    summary: {
                                        distance: 262.4,
                                        duration: 10.5
                                    }
                                },
                                geometry: {
                                    coordinates: [
                                        [10.213668, 51.385604],
                                        [10.214002, 51.385548],
                                        [10.214881, 51.385399],
                                        [10.215266, 51.385304],
                                        [10.215633, 51.385145],
                                        [10.216961, 51.384521]
                                    ],
                                    type: "LineString"
                                }
                            }
                        ],
                        bbox: [10.213668, 51.384521, 10.216961, 51.385604],
                        metadata: {
                            attribution:
                                "openrouteservice.org | OpenStreetMap contributors",
                            service: "routing",
                            timestamp: 1633502053004,
                            query: {
                                coordinates: [
                                    [10.213645727260518, 51.38555222959108],
                                    [10.216914023843442, 51.384482245544675]
                                ],
                                profile: "driving-car",
                                preference: "recommended",
                                format: "geojson",
                                units: "m",
                                language: "de",
                                geometry: true,
                                instructions: true,
                                options: {
                                    avoid_polygons: {
                                        coordinates: [],
                                        type: "MultiPolygon"
                                    }
                                }
                            },
                            engine: {
                                version: "6.6.0",
                                build_date: "2021-06-08T13:11:04Z",
                                graph_date: "2021-06-16T12:52:16Z"
                            }
                        }
                    }})
                )
            );

            const result = await fetchRoutingOrsDirections({
                    coordinates: [
                        [10.213645727260518, 51.38555222959108],
                        [10.216914023843442, 51.384482245544675]
                    ],
                    language: "de",
                    transformCoordinatesToLocal: coords => coords,
                    speedProfile: "CAR",
                    avoidSpeedProfileOptions: [],
                    preference: "RECOMMENDED",
                    avoidPolygons: [],
                    instructions: true
                }),
                expectedResult = new RoutingDirections({
                    bbox: [10.213668, 51.384521, 10.216961, 51.385604],
                    distance: 262.4,
                    duration: 10.5,
                    lineString: [
                        [10.213668, 51.385604],
                        [10.214002, 51.385548],
                        [10.214881, 51.385399],
                        [10.215266, 51.385304],
                        [10.215633, 51.385145],
                        [10.216961, 51.384521]
                    ],
                    lineStringWaypointIndex: [0, 5]
                });

            expectedResult.segments.push(
                new RoutingDirectionsSegment({
                    distance: 262.4,
                    duration: 10.5,
                    steps: [
                        new RoutingDirectionsStep({
                            distance: 262.4,
                            duration: 10.5,
                            instruction: "Further east on L 3080",
                            name: "L 3080",
                            type: 11,
                            waypoints: [0, 5]
                        }),
                        new RoutingDirectionsStep({
                            distance: 0,
                            duration: 0,
                            instruction: "You will reach L 3080 (right)",
                            name: "-",
                            type: 10,
                            waypoints: [5, 5]
                        })
                    ]
                })
            );

            expect(result).deep.to.equal(expectedResult);
        });

        it("should throw error 404", async () => {
            sinon.stub(axios, "post").returns(
                new Promise((_, reject) => reject({
                    response: {
                        status: 404
                    }
                }))
            );

            try {
                await fetchRoutingOrsDirections({
                    coordinates: [
                        [10.213645727260518, 51.38555222959108],
                        [10.216914023843442, 51.384482245544675]
                    ],
                    language: "de",
                    transformCoordinatesToLocal: coords => coords,
                    speedProfile: "CAR",
                    avoidSpeedProfileOptions: [],
                    preference: "RECOMMENDED",
                    avoidPolygons: [],
                    instructions: true
                });
                // should not reach here
                expect(true).to.be.false;
            }
            catch (error) {
                expect(error.message).equal("common:modules.tools.routing.errors.noRouteFound");
            }
        });

        it("should throw error 2003", async () => {
            sinon.stub(axios, "post").returns(
                new Promise((_, reject) => reject({
                    response: {
                        data: {
                            error: {
                                code: 2003
                            }
                        }
                    }
                }))
            );

            try {
                await fetchRoutingOrsDirections({
                    coordinates: [
                        [10.213645727260518, 51.38555222959108],
                        [10.216914023843442, 51.384482245544675]
                    ],
                    language: "de",
                    transformCoordinatesToLocal: coords => coords,
                    speedProfile: "CAR",
                    avoidSpeedProfileOptions: [],
                    preference: "RECOMMENDED",
                    avoidPolygons: [],
                    instructions: true
                });
                // should not reach here
                expect(true).to.be.false;
            }
            catch (error) {
                expect(error.message).equal("common:modules.tools.routing.errors.avoidAreaBig");
            }
        });

        it("should throw other error", async () => {
            sinon.stub(axios, "post").returns(
                new Promise((_, reject) => reject({
                    response: {
                        status: 999
                    }
                }))
            );

            try {
                await fetchRoutingOrsDirections({
                    coordinates: [
                        [10.213645727260518, 51.38555222959108],
                        [10.216914023843442, 51.384482245544675]
                    ],
                    language: "de",
                    transformCoordinatesToLocal: coords => coords,
                    speedProfile: "CAR",
                    avoidSpeedProfileOptions: [],
                    preference: "RECOMMENDED",
                    avoidPolygons: [],
                    instructions: true
                });
                // should not reach here
                expect(true).to.be.false;
            }
            catch (error) {
                expect(error.message).equal("common:modules.tools.routing.errors.errorRouteFetch");
            }
        });
    });
});
