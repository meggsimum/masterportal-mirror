import {expect} from "chai";
import {extractEventCoordinates} from "../../extractEventCoordinates.js";

describe("src/utils/extractEventCoordinates.js", () => {
    describe("extractEventCoordinates", () => {
        it("should return the first parameter unchanged if it is an array", () => {
            expect(extractEventCoordinates([])).to.be.an("array").and.to.be.empty;
            expect(extractEventCoordinates([1, 2, 3])).to.deep.equal([1, 2, 3]);
        });
        it("should split the first parameter at spaces and return the resulting array", () => {
            expect(extractEventCoordinates("")).to.deep.equal([""]);
            expect(extractEventCoordinates("1 2 3")).to.deep.equal(["1", "2", "3"]);
        });
        it("should return an empty array if anything but an array or a string is given", () => {
            expect(extractEventCoordinates(undefined)).to.be.undefined;
            expect(extractEventCoordinates(null)).to.be.undefined;
            expect(extractEventCoordinates(1234)).to.be.undefined;
            expect(extractEventCoordinates(true)).to.be.undefined;
            expect(extractEventCoordinates(false)).to.be.undefined;
            expect(extractEventCoordinates({})).to.be.undefined;
        });
    });
});
