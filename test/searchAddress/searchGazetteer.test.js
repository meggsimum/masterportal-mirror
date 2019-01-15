import {encode, getIdQuery, searchGazetteer} from "../../src/searchAddress/searchGazetteer";
import {searchTypes} from "../../src/searchAddress/types";
import defaults from "../../src/defaults";

describe("searchAddress", function () {
    describe("encode", function () {
        it("encodes a string or an array of strings for URi use", function () {
            const a = "\"hello world\"",
                arr = [a, a, a];

            expect(encode(a)).toEqual("%22hello%20world%22");
            expect(encode(arr)).toEqual([encode(a), encode(a), encode(a)]);
        });
    });

    describe("getIdQuery", function () {
        it("encodes given search phrase(s) and builds query fragment from it", function () {
            expect(getIdQuery(searchTypes.STREET, "hello world")).toEqual("&StoredQuery_ID=findeStrasse&strassenname=hello%20world");
            expect(getIdQuery(searchTypes.DISTRICT, "hello world")).toEqual("&StoredQuery_ID=findeStadtteil&stadtteilname=hello%20world");
            expect(getIdQuery(searchTypes.PARCEL, ["1 a", "1 b"])).toEqual("&StoredQuery_ID=Flurstueck&gemarkung=1%20a&flurstuecksnummer=1%20b");
            expect(getIdQuery(searchTypes.STREET_KEY, "A12345")).toEqual("&StoredQuery_ID=findeStrassenSchluessel&strassenschluessel=A12345");
            expect(getIdQuery(searchTypes.ADDRESS_AFFIXED, ["Street", "1", "b"])).toEqual("&StoredQuery_ID=AdresseMitZusatz&strassenname=Street&hausnummer=1&zusatz=b");
            expect(getIdQuery(searchTypes.ADDRESS_UNAFFIXED, ["Street", "1"])).toEqual("&StoredQuery_ID=AdresseOhneZusatz&strassenname=Street&hausnummer=1");
            expect(getIdQuery(searchTypes.HOUSE_NUMBERS_FOR_STREET, "Street")).toEqual("&StoredQuery_ID=HausnummernZuStrasse&strassenname=Street");
        });
    });

    describe("searchGazetteer", function () {
        it("constructs an URL and requests it", function () {
            const mockXHR = {
                    open: jest.fn(),
                    send: jest.fn()
                },
                originalXMLHttpRequest = window.XMLHttpRequest;

            window.XMLHttpRequest = jest.fn(() => mockXHR);
            searchGazetteer("district", "district name");
            window.XMLHttpRequest = originalXMLHttpRequest;

            expect(mockXHR.open).toHaveBeenCalledWith("GET", `${defaults.gazetteerUrl}?service=WFS&request=GetFeature&version=2.0.0&StoredQuery_ID=findeStadtteil&stadtteilname=district%20name`);
        });
    });
});
