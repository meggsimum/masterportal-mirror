import axios from "axios";
import store from "../../../../../../../app-store";
import {expect} from "chai";
import sinon from "sinon";
import {RoutingGeosearchResult} from "../../../../utils/classes/routing-geosearch-result";
import {
    fetchRoutingNominatimGeosearch,
    fetchRoutingNominatimGeosearchReverse
} from "../../../../utils/geosearch/routing-nominatim-geosearch";

describe("src/modules/tools/routing/utils/geosearch/routing-nominatim-geosearch.js", () => {
    beforeEach(() => {
        sinon.stub(i18next, "t").callsFake((...args) => args);
        store.getters.getRestServiceById = () => ({url: "tmp"});
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("should fetchRoutingNominatimGeosearch", () => {
        it("should process result correct", async () => {
            sinon.stub(axios, "get").returns(
                new Promise(resolve => resolve({
                    status: 200,
                    data: [
                        {
                            place_id: 562850,
                            licence:
                                "Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright",
                            osm_type: "node",
                            osm_id: 240048753,
                            boundingbox: [
                                "51.1731205",
                                "51.4931205",
                                "6.4023343",
                                "6.7223343"
                            ],
                            lat: "51.3331205",
                            lon: "6.5623343",
                            display_name:
                                "Krefeld, Nordrhein-Westfalen, 47798, Deutschland",
                            class: "place",
                            type: "city",
                            importance: 0.6811185795507755,
                            icon:
                                "https://nominatim.openstreetmap.org/ui/mapicons//poi_place_city.p.20.png"
                        },
                        {
                            place_id: 257562941,
                            licence:
                                "Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright",
                            osm_type: "relation",
                            osm_id: 62748,
                            boundingbox: [
                                "51.2857809",
                                "51.405491",
                                "6.4779483",
                                "6.7062122"
                            ],
                            lat: "51.3459404",
                            lon: "6.579289471155352",
                            display_name:
                                "Krefeld, Nordrhein-Westfalen, Deutschland",
                            class: "boundary",
                            type: "administrative",
                            importance: 0.6811185795507755,
                            icon:
                                "https://nominatim.openstreetmap.org/ui/mapicons//poi_boundary_administrative.p.20.png"
                        }
                    ]
                }))
            );

            const result = await fetchRoutingNominatimGeosearch("testsearch"),
                expectedResult = [
                    new RoutingGeosearchResult(
                        51.3331205,
                        6.5623343,
                        "Krefeld, Nordrhein-Westfalen, 47798, Deutschland"
                    ),
                    new RoutingGeosearchResult(
                        51.3459404,
                        6.579289471155352,
                        "Krefeld, Nordrhein-Westfalen, Deutschland"
                    )
                ];

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
                await fetchRoutingNominatimGeosearch("testsearch");
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
                        place_id: 19412206,
                        licence:
                            "Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright",
                        osm_type: "node",
                        osm_id: 2051802080,
                        lat: "51.3353612",
                        lon: "6.5752281",
                        display_name:
                            "17, Winnertzhof, Cracau, Krefeld-Mitte, Krefeld, Nordrhein-Westfalen, 47799, Deutschland",
                        boundingbox: [
                            "51.3353112",
                            "51.3354112",
                            "6.5751781",
                            "6.5752781"
                        ]
                    }
                }))
            );

            const result = await fetchRoutingNominatimGeosearchReverse(
                    "testsearch"
                ),
                expectedResult = new RoutingGeosearchResult(
                    51.3353612,
                    6.5752281,
                    "17, Winnertzhof, Cracau, Krefeld-Mitte, Krefeld, Nordrhein-Westfalen, 47799, Deutschland"
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
                await fetchRoutingNominatimGeosearchReverse("testsearch");
                // should not reach here
                expect(true).to.be.false;
            }
            catch (error) {
                expect(error.message).equal("testerror");
            }
        });
    });
});
