import {expect} from "chai";
import findWhereJs from "../../findWhereJs";

describe("src/utils/findWhereJs.js", () => {
    describe("findWhereJs", () => {
        it("should return undefined if anything but an array is given as first parameter", () => {
            expect(findWhereJs(undefined)).to.be.undefined;
            expect(findWhereJs(null)).to.be.undefined;
            expect(findWhereJs(1234)).to.be.undefined;
            expect(findWhereJs("string")).to.be.undefined;
            expect(findWhereJs(true)).to.be.undefined;
            expect(findWhereJs(false)).to.be.undefined;
            expect(findWhereJs({})).to.be.undefined;
        });
        it("should return undefined if anything but an object is given as second parameter", () => {
            expect(findWhereJs([], undefined)).to.be.undefined;
            expect(findWhereJs([], null)).to.be.undefined;
            expect(findWhereJs([], 1234)).to.be.undefined;
            expect(findWhereJs([], "string")).to.be.undefined;
            expect(findWhereJs([], true)).to.be.undefined;
            expect(findWhereJs([], false)).to.be.undefined;
            expect(findWhereJs([], [])).to.be.undefined;
        });
        it("should return undefined if the properties don't match any entry of list", () => {
            const list = [undefined, null, 1234, "string", true, false, [], {}, {foo: "bar"}];

            expect(findWhereJs(list, {foo: "foobar"})).to.be.undefined;
        });
        it("should return the first match for properties found in list", () => {
            const list = [
                {foo: "bar", idx: 0},
                {foo: "foobar", idx: 1},
                {foo: "baz", idx: 2},
                {foo: "qrz", idx: 3},
                {foo: "baz", idx: 4},
                {foo: "foobar", idx: 5}
            ];

            expect(findWhereJs(list, {foo: "baz"})).to.deep.equal({foo: "baz", idx: 2});
        });
    });
});
