import axios from "axios";
import store from "../../../../../../../app-store";
import {expect} from "chai";
import sinon from "sinon";
import {RoutingGeosearchResult} from "../../../../utils/classes/routing-geosearch-result";
import {
    fetchRoutingBkgGeosearch,
    fetchRoutingBkgGeosearchReverse
} from "../../../../utils/geosearch/routing-bkg-geosearch";

describe("src/modules/tools/routing/utils/geosearch/routing-bkg-geosearch.js", () => {
    beforeEach(() => {
        sinon.stub(i18next, "t").callsFake((...args) => args);
        store.getters.getRestServiceById = () => ({url: "tmp"});
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("should fetchRoutingBkgGeosearch", () => {
        it("should process result correct", async () => {
            sinon.stub(axios, "get").returns(
                new Promise(resolve => resolve({
                    status: 200,
                    data: {
                        success: true,
                        type: "FeatureCollection",
                        features: [
                            {
                                type: "Feature",
                                bbox: [
                                    6.47933210954439,
                                    51.2849325585585,
                                    6.70186498354972,
                                    51.4071125869666
                                ],
                                geometry: {
                                    type: "Point",
                                    coordinates: [6.56089, 51.33264]
                                },
                                properties: {
                                    text: "Krefeld",
                                    typ: "Ort",
                                    score: 1.7286196,
                                    bbox: {
                                        type: "Polygon",
                                        coordinates: [
                                            [
                                                [6.47933, 51.28493],
                                                [6.47933, 51.40711],
                                                [6.70186, 51.40711],
                                                [6.70186, 51.28493],
                                                [6.47933, 51.28493]
                                            ]
                                        ]
                                    }
                                },
                                id: "DEGAC00000081638"
                            },
                            {
                                type: "Feature",
                                bbox: [
                                    6.5074903650681,
                                    51.3455092448856,
                                    6.51893373216666,
                                    51.3473656574494
                                ],
                                geometry: {
                                    type: "Point",
                                    coordinates: [6.51518, 51.34567]
                                },
                                properties: {
                                    text: "47804 Krefeld - Hüls",
                                    typ: "Ort",
                                    score: 1.7022437,
                                    bbox: {
                                        type: "Polygon",
                                        coordinates: [
                                            [
                                                [6.50749, 51.34551],
                                                [6.50749, 51.34737],
                                                [6.51893, 51.34737],
                                                [6.51893, 51.34551],
                                                [6.50749, 51.34551]
                                            ]
                                        ]
                                    }
                                },
                                id: "DEGAC00000027025"
                            }
                        ]
                    }
                }))
            );

            const result = await fetchRoutingBkgGeosearch("testsearch"),
                expectedResult = [
                    new RoutingGeosearchResult(51.33264, 6.56089, "Krefeld"),
                    new RoutingGeosearchResult(
                        51.34567,
                        6.51518,
                        "47804 Krefeld - Hüls"
                    )
                ];

            expect(result).deep.to.equal(expectedResult);
        });

        it("should throw error with status", async () => {
            sinon.stub(axios, "get").returns(
                new Promise((_, reject) => reject({
                    status: 999,
                    message: "testerror"
                })
                )
            );

            try {
                await fetchRoutingBkgGeosearch("testsearch");
                // should not reach here
                expect(true).to.be.false;
            }
            catch (error) {
                expect(error.message).equal("testerror");
            }
        });
    });

    describe("should fetchRoutingBkgGeosearchReverse", () => {
        it("should process result correct", async () => {
            sinon.stub(axios, "get").returns(
                new Promise(resolve => resolve({
                    status: 200,
                    data: {
                        success: true,
                        type: "FeatureCollection",
                        features: [
                            {
                                type: "Feature",
                                bbox: [
                                    6.56412165145409,
                                    51.3267394906946,
                                    6.56944658394794,
                                    51.3400332636572
                                ],
                                geometry: {
                                    type: "Point",
                                    coordinates: [6.56619, 51.33329]
                                },
                                properties: {
                                    text: "47798 Krefeld - Cracau",
                                    typ: "Ort",
                                    score: 1.542608,
                                    bbox: {
                                        type: "Polygon",
                                        coordinates: [
                                            [
                                                [6.56412, 51.32674],
                                                [6.56412, 51.34003],
                                                [6.56945, 51.34003],
                                                [6.56945, 51.32674],
                                                [6.56412, 51.32674]
                                            ]
                                        ]
                                    }
                                },
                                id: "DEGAC00000026993"
                            }
                        ]
                    }
                }))
            );

            const result = await fetchRoutingBkgGeosearchReverse("testsearch"),
                expectedResult = new RoutingGeosearchResult(
                    51.33329,
                    6.56619,
                    "47798 Krefeld - Cracau"
                );

            expect(result).deep.to.equal(expectedResult);
        });

        it("should throw error with status", async () => {
            sinon.stub(axios, "get").returns(
                new Promise((_, reject) => reject({
                    status: 999,
                    message: "testerror"
                }))
            );

            try {
                await fetchRoutingBkgGeosearchReverse("testsearch");
                // should not reach here
                expect(true).to.be.false;
            }
            catch (error) {
                expect(error.message).equal("testerror");
            }
        });
    });
});
