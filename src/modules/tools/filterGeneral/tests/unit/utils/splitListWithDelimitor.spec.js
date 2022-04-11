import {expect} from "chai";
import splitListWithDelimitor from "../../../utils/splitListWithDelimitor.js";

describe("src/modules/tools/filterGeneral/utils/splitListWithDelimitor.js", () => {
    describe("splitListWithDelimitor", () => {
        it("should return an empty array if anything but an array is given as first parameter", () => {
            expect(splitListWithDelimitor(undefined)).to.be.undefined;
            expect(splitListWithDelimitor(null)).to.be.null;
            expect(splitListWithDelimitor("string")).to.equal("string");
            expect(splitListWithDelimitor(1234)).to.equal(1234);
            expect(splitListWithDelimitor(true)).to.be.true;
            expect(splitListWithDelimitor(false)).to.be.false;
            expect(splitListWithDelimitor({})).to.be.an("object").and.to.be.empty;
        });
        it("should return the first parameter as it is if the second parameter is anything but a string", () => {
            expect(splitListWithDelimitor([1, 1, 1], undefined)).to.deep.equal([1, 1, 1]);
            expect(splitListWithDelimitor([1, 1, 1], null)).to.deep.equal([1, 1, 1]);
            expect(splitListWithDelimitor([1, 1, 1], 1234)).to.deep.equal([1, 1, 1]);
            expect(splitListWithDelimitor([1, 1, 1], true)).to.deep.equal([1, 1, 1]);
            expect(splitListWithDelimitor([1, 1, 1], false)).to.deep.equal([1, 1, 1]);
            expect(splitListWithDelimitor([1, 1, 1], {})).to.deep.equal([1, 1, 1]);
            expect(splitListWithDelimitor([1, 1, 1], [])).to.deep.equal([1, 1, 1]);
        });
        it("should return a list of unique value if a list of strings containing the given delimitor is given", () => {
            const list = [
                    "foo|bar|foobar|baz",
                    "baz|qux|bar|quux",
                    "foo|foobar",
                    "quux",
                    "something unique",
                    "other,;delimitors"
                ],
                expected = [
                    "foo",
                    "bar",
                    "foobar",
                    "baz",
                    "qux",
                    "quux",
                    "something unique",
                    "other,;delimitors"
                ];

            expect(splitListWithDelimitor(list, "|")).to.deep.equal(expected);
        });
    });
});
