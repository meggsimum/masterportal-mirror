import coordsToPairs from "../../src/lib/coordsToPairs";

describe("coordsToPairs.js", function () {
    describe("coordsToPairs", function () {
        it("parses an array of ongoing coordinates to coordinate pairs", function () {
            expect(coordsToPairs(["1.1", "2.2", "3.3", "4.4"])).toEqual([[1.1, 2.2], [3.3, 4.4]]);
        });
    });
});
