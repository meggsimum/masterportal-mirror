import {search} from "../../src/searchAddress";
import {searchTypes as types} from "../../src/searchAddress/types";

// mock implementation for search gazetteer just returns example values by type and ignores search value
jest.mock("../../src/searchAddress/searchGazetteer", () => {
    // must disable this rule since jest.mock requires import within mock https://github.com/facebook/jest/issues/2567#issuecomment-271937555
    /* eslint-disable global-require */
    const {searchTypes} = require("../../src/searchAddress/types"),
        {addressResults, districtResult, houseNumberResult, parcelResult, streetResult, streetKeyResult} = require("./gazetteerSearchResults");
    /* eslint-enable global-require */

    return {
        searchGazetteer: jest.fn((type, value) => new Promise((resolve, reject) => {
            const exampleResult = {
                [searchTypes.PARCEL]: parcelResult,
                [searchTypes.STREET]: streetResult,
                [searchTypes.STREET_KEY]: streetKeyResult,
                [searchTypes.HOUSE_NUMBERS_FOR_STREET]: houseNumberResult,
                [searchTypes.DISTRICT]: districtResult,
                [searchTypes.ADDRESS_AFFIXED]: addressResults.adresseMitZusatz,
                [searchTypes.ADDRESS_UNAFFIXED]: addressResults.adresseOhneZusatz
            }[type];

            if (exampleResult) {
                resolve(exampleResult);
            }
            else {
                reject(`No test data for type/value '${type}/${value}'.`);
            }
        }))
    };
});

import {searchGazetteer as mockedSearchGazetteer} from "../../src/searchAddress/searchGazetteer";

describe("searchAddress", function () {
    describe("search", function () {
        it("rejects if missing configuration of what to search for", function (done) {
            search("Pflugacker", {}).catch(e => {
                expect(typeof e.error).toBe("string");
                done();
            });
        });

        it("rejects if string is below default minimum length", function (done) {
            search("P", {searchStreets: true})
                .catch(e => {
                    expect(typeof e.error).toBe("string");
                    done();
                });
        });

        it("rejects if string is below defined length", function (done) {
            search("Pflugacker", {minCharacters: 20, searchStreets: true})
                .catch(e => {
                    expect(typeof e.error).toBe("string");
                    done();
                });
        });

        it("forwards the expected type and string to the searchGazetteer method", function (done) {
            jest.clearAllMocks(); // reset mock calls

            const searches = [
                search("Address 7", {searchAddress: true}),
                search("Address 7b", {searchAddress: true}),
                search("Streetname", {searchStreets: true}),
                search("StreetnameAndHnrs", {searchStreets: true, searchHouseNumbers: true}),
                search("Districtname", {searchDistricts: true}),
                search("1234/1234", {searchParcels: true}),
                search("12345678", {searchParcels: true}),
                search("A12345", {searchStreetKey: true})
            ];

            Promise.all(searches)
                .then(results => {
                    // order of calls may vary, hence using expect.arrayContaining
                    const expected = [
                        [types.ADDRESS_UNAFFIXED, ["Address", "7"]],
                        [types.ADDRESS_AFFIXED, ["Address", "7", "b"]],
                        [types.STREET, "Streetname"],
                        [types.STREET, "StreetnameAndHnrs"],
                        [types.HOUSE_NUMBERS_FOR_STREET, "Bargkoppelweg"],
                        [types.DISTRICT, "Districtname"],
                        [types.PARCEL, ["1234", "1234"]],
                        [types.PARCEL, ["1234", "5678"]],
                        [types.STREET_KEY, "A12345"]
                    ];

                    expect(results[0]).toHaveLength(1);
                    expect(results[1]).toHaveLength(1);
                    expect(results[2]).toHaveLength(1);
                    expect(results[3]).toHaveLength(2);
                    expect(results[4]).toHaveLength(2);
                    expect(results[5]).toHaveLength(1);
                    expect(results[6]).toHaveLength(1);
                    expect(results[7]).toHaveLength(1);
                    expect(mockedSearchGazetteer.mock.calls).toHaveLength(9);
                    expect(mockedSearchGazetteer.mock.calls).toEqual(expect.arrayContaining(expected));
                    done();
                })
                .catch(e => console.error(e));
        });

        it("calls zoomTo if params indicate to zoom and there is exactly one result", function (done) {
            const fitMock = jest.fn(),
                zoomToParams = {x: 0};

            search("Streetname", {
                searchStreets: true,
                zoom: true,
                zoomToParams,
                map: {
                    getView: () => ({
                        fit: fitMock
                    })
                }
            })
                .then(results => {
                    expect(results).toHaveLength(1);
                    expect(fitMock).toHaveBeenCalledWith(expect.any(Object), zoomToParams);
                    done();
                })
                .catch(e => console.error(e));
        });

        it("does not call zoomTo if params indicate to zoom, but there is not exactly one result", function (done) {
            const fitMock = jest.fn();

            search("StreetnameAndHnrs", {
                searchStreets: true,
                searchHouseNumbers: true,
                zoom: true,
                zoomToParams: {x: 0},
                map: {
                    getView: () => ({
                        fit: fitMock
                    })
                }
            })
                .then(results => {
                    expect(results).toHaveLength(2);
                    expect(fitMock).not.toHaveBeenCalled();
                    done();
                })
                .catch(e => console.error(e));
        });
    });
});
