import * as gazetteerSearchResults from "./gazetteerSearchResults/index";

import {parse} from "../../src/searchAddress/parse";
import {searchTypes} from "../../src/searchAddress";

describe("searchAddress", function () {
    describe("parse", function () {
        it("parses district results as expected", function (done) {
            parse(searchTypes.DISTRICT, gazetteerSearchResults.districtResult)
                .then(x => {
                    expect(x[0].name).toBe("Barmbek-Nord");
                    expect(x[0].type).toBe(searchTypes.DISTRICT);
                    expect(x[0].properties.bundeslandname).toBe("Hamburg");
                    expect(x[0].geometry.type).toBe("Polygon");
                    expect(x[0].geometry.coordinates).toEqual([
                        "568356.869", "5937678.721",
                        "570782.596", "5937678.721",
                        "570782.596", "5940414.428",
                        "568356.869", "5940414.428",
                        "568356.869", "5937678.721"
                    ]);

                    expect(x[1].name).toBe("Barmbek-Süd");
                    expect(x[1].type).toBe(searchTypes.DISTRICT);
                    expect(x[1].properties.bundeslandname).toBe("Hamburg");
                    expect(x[1].geometry.coordinates).toEqual([
                        "567482.682", "5936181.467",
                        "569976.333", "5936181.467",
                        "569976.333", "5937853.832",
                        "567482.682", "5937853.832",
                        "567482.682", "5936181.467"
                    ]);
                    done();
                });
        });

        it("parses street key results as expected", function (done) {
            parse(searchTypes.STREET_KEY, gazetteerSearchResults.streetKeyResult)
                .then(x => {
                    expect(x[0].name).toBe("Alte Marsch");
                    expect(x[0].type).toBe(searchTypes.STREET_KEY);
                    expect(x[0].properties.postOrtsteil).toBe("Neugraben-Fischbek");
                    expect(x[0].geometry.type).toBe("Polygon");
                    expect(x[0].geometry.coordinates).toEqual([
                        "555024.929", "5925215.300",
                        "555158.132", "5925215.300",
                        "555158.132", "5925409.413",
                        "555024.929", "5925409.413",
                        "555024.929", "5925215.300"
                    ]);
                    done();
                });
        });

        it("parses street results as expected", function (done) {
            parse(searchTypes.STREET, gazetteerSearchResults.streetResult)
                .then(x => {
                    expect(x[0].name).toBe("Bargkoppelweg");
                    expect(x[0].type).toBe(searchTypes.STREET);
                    expect(x[0].properties.postOrtsteil).toBe("Rahlstedt");
                    expect(x[0].geometry.type).toBe("Polygon");
                    expect(x[0].geometry.coordinates).toEqual([
                        "576020.921", "5941871.589",
                        "576777.652", "5941871.589",
                        "576777.652", "5942463.286",
                        "576020.921", "5942463.286",
                        "576020.921", "5941871.589"
                    ]);
                    done();
                });
        });

        it("parses parcel results as expected", function (done) {
            parse(searchTypes.PARCEL, gazetteerSearchResults.parcelResult)
                .then(x => {
                    expect(x[0].name).toBe("0147/12561");
                    expect(x[0].type).toBe(searchTypes.PARCEL);
                    expect(x[0].properties.gemeindename).toBe("Wilhelmsburg");
                    expect(x[0].geometry.type).toBe("Point");
                    expect(x[0].geometry.coordinates).toEqual([
                        "566483.579", "5928126.330"
                    ]);
                    done();
                });
        });

        it("parses houseNumber results as expected", function (done) {
            parse(searchTypes.HOUSE_NUMBERS_FOR_STREET, gazetteerSearchResults.houseNumberResult)
                .then(x => {
                    expect(x[0].name).toBe("Pflugacker 11a");
                    expect(x[0].type).toBe(searchTypes.HOUSE_NUMBERS_FOR_STREET);
                    expect(x[0].geometry.type).toBe("Point");
                    expect(x[0].geometry.coordinates).toEqual([
                        "559587.466", "5940953.639"
                    ]);
                    done();
                });
        });

        it("parses address (with addition) results as expected", function (done) {
            parse(searchTypes.ADDRESS_AFFIXED, gazetteerSearchResults.addressResults.adresseMitZusatz)
                .then(x => {
                    expect(x[0].name).toBe("Pflugacker 13b");
                    expect(x[0].type).toBe(searchTypes.ADDRESS_AFFIXED);
                    expect(x[0].geometry.type).toBe("Point");
                    expect(x[0].geometry.coordinates).toEqual([
                        "559578.353", "5941044.732"
                    ]);
                    done();
                });
        });

        it("parses address (without addition) results as expected", function (done) {
            parse(searchTypes.ADDRESS_UNAFFIXED, gazetteerSearchResults.addressResults.adresseOhneZusatz)
                .then(x => {
                    expect(x[0].name).toBe("Bargkoppelweg 1");
                    expect(x[0].type).toBe(searchTypes.ADDRESS_UNAFFIXED);
                    expect(x[0].geometry.type).toBe("Point");
                    expect(x[0].geometry.coordinates).toEqual([
                        "576071.966", "5941920.455"
                    ]);
                    done();
                });
        });
    });
});
