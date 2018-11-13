import findWhere from "../../src/lib/findWhere";

describe("findWhere.js", function () {
    it("returns only one element", function () {
        const result = findWhere([
            5, 5, 5, 5, 5
        ], entry => entry === 5);

        expect(result).toBe(5);
    });

    it("returns the first matching element", function () {
        const result = findWhere([
            {id: 4, x: false},
            {id: 5, x: true},
            {id: 5, x: false},
            {id: 5, x: false}
        ], entry => entry.id === 5);

        expect(result.x).toBe(true);
    });

    it("returns null if no elements match", function () {
        const result = findWhere([1, 2, 3, 4, 6, 7, 8, 9], entry => entry === 5);

        expect(result).toBeNull();
    });
});
