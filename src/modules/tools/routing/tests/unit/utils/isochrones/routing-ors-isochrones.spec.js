import axios from "axios";
import store from "../../../../../../../app-store";
import {expect} from "chai";
import sinon from "sinon";
import {RoutingIsochrones} from "../../../../utils/classes/routing-isochrones";
import {RoutingIsochronesArea} from "../../../../utils/classes/routing-isochrones-area";
import {fetchRoutingOrsIsochrones} from "../../../../utils/isochrones/routing-ors-isochrones";
import state from "../../../../store/stateRouting";

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

    describe("should fetchRoutingOrsIsochrones", () => {
        it("should process result correct", async () => {
            sinon.stub(axios, "post").returns(
                new Promise(resolve => resolve({
                    data: {
                        type: "FeatureCollection",
                        bbox: [6.577318, 51.32985, 6.5873, 51.334001],
                        features: [
                            {
                                type: "Feature",
                                properties: {
                                    group_index: 0,
                                    value: 60.0,
                                    center: [
                                        6.582012174621497,
                                        51.331735245847746
                                    ]
                                },
                                geometry: {
                                    coordinates: [
                                        [
                                            [6.577318, 51.33017],
                                            [6.577483, 51.32985],
                                            [6.579256, 51.330183],
                                            [6.584608, 51.331645],
                                            [6.587009, 51.332532],
                                            [6.5873, 51.332744],
                                            [6.587089, 51.333649],
                                            [6.586613, 51.333726],
                                            [6.582049, 51.333983],
                                            [6.581608, 51.334001],
                                            [6.578644, 51.333313],
                                            [6.578357, 51.333097],
                                            [6.577318, 51.33017]
                                        ]
                                    ],
                                    type: "Polygon"
                                }
                            }
                        ],
                        metadata: {
                            attribution:
                                "openrouteservice.org | OpenStreetMap contributors",
                            service: "isochrones",
                            timestamp: 1633506999835,
                            query: {
                                locations: [
                                    [6.5821172105612185, 51.33169403960399]
                                ],
                                location_type: "start",
                                range: [60.0],
                                range_type: "time",
                                units: "m",
                                options: {},
                                area_units: "m",
                                interval: 60.0
                            },
                            engine: {
                                version: "6.6.0",
                                build_date: "2021-06-08T13:11:04Z",
                                graph_date: "2021-06-16T12:52:16Z"
                            }
                        }
                    }
                }))
            );

            state.isochronesSettings.timeValue = 1;
            state.isochronesSettings.intervalValue = 1;

            const result = await fetchRoutingOrsIsochrones({
                    coordinates: [6.5821172105612185, 51.33169403960399],
                    transformCoordinatesToLocal: coords => coords,
                    speedProfile: "CAR",
                    optimization: "TIME",
                    avoidSpeedProfileOptions: [],
                    preference: "RECOMMENDED",
                    transformCoordinates: true
                }),
                expectedResult = new RoutingIsochrones([
                    6.577318,
                    51.32985,
                    6.5873,
                    51.334001
                ]);

            expectedResult.addArea(
                new RoutingIsochronesArea(
                    [
                        [
                            [6.577318, 51.33017],
                            [6.577483, 51.32985],
                            [6.579256, 51.330183],
                            [6.584608, 51.331645],
                            [6.587009, 51.332532],
                            [6.5873, 51.332744],
                            [6.587089, 51.333649],
                            [6.586613, 51.333726],
                            [6.582049, 51.333983],
                            [6.581608, 51.334001],
                            [6.578644, 51.333313],
                            [6.578357, 51.333097],
                            [6.577318, 51.33017]
                        ]
                    ],
                    0,
                    60,
                    60,
                    60,
                    "CAR",
                    "TIME",
                    [],
                    1
                )
            );

            expect(result).deep.to.equal(expectedResult);
        });

        it("should throw error", async () => {
            sinon.stub(axios, "post").returns(
                new Promise((_, reject) => reject({
                    response: {
                        status: 404
                    }
                }))
            );

            try {
                await fetchRoutingOrsIsochrones({
                    coordinates: [6.5821172105612185, 51.33169403960399],
                    transformCoordinatesToLocal: coords => coords,
                    speedProfile: "CAR",
                    optimization: "TIME",
                    avoidSpeedProfileOptions: [],
                    preference: "RECOMMENDED",
                    transformCoordinates: true
                });
                // should not reach here
                expect(true).to.be.false;
            }
            catch (error) {
                expect(error.message).equal(
                    "common:modules.tools.routing.errors.errorIsochronesFetch"
                );
            }
        });
    });
});
