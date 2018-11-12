import * as rll from "../src/rawLayerList";

const symbol = Symbol(),
    services = [
        {id: "1001", same: "same", name: "WebAtlasDe", gfiAttributes: symbol},
        {id: "2001", same: "same", name: "Landesgrenze Hamburg", gfiAttributes: {fi9449gqgijg9hdg: "Breitengrad"}}
    ];

describe("rawLayerList.js", function () {
    describe("initializeLayerList", function () {
        it("registers the layers if given directly", function () {
            rll.initializeLayerList(services);
            expect(rll.getLayerList()).toBe(services);
        });

        // did not test async path where URL string is given instead of services object; doesn't seem worth the mock effort
    });

    describe("getDisplayNamesOfFeatureAttributes", function () {
        it("returns the gfi entry of a service description", function () {
            expect(rll.getDisplayNamesOfFeatureAttributes("1001")).toBe(symbol);
            expect(rll.getDisplayNamesOfFeatureAttributes("2001").fi9449gqgijg9hdg).toEqual("Breitengrad");
        });
    });

    describe("getLayerWhere", function () {
        it("returns the element by any parameter", function () {
            expect(rll.getLayerWhere({gfiAttributes: symbol})).toBe(services[0]);
        });

        it("returns only the first found layer that matches the parameters", function () {
            expect(rll.getLayerWhere({same: "same"})).toBe(services[0]);
        });

        it("only returns if all criteria match", function () {
            expect(rll.getLayerWhere({id: "2001", same: "not"})).toBeNull();
        })
    });
});
