import {expect} from "chai";
import detectIso8601Precision from "../../detectIso8601Precision";

describe("src/utils/detectIso8601Precision.js", () => {
    describe("detectIso8601Precision", () => {
        it("should throw an error if anything but a string is given", () => {
            expect(() => detectIso8601Precision(undefined)).to.throw();
            expect(() => detectIso8601Precision(null)).to.throw();
            expect(() => detectIso8601Precision(1234)).to.throw();
            expect(() => detectIso8601Precision(true)).to.throw();
            expect(() => detectIso8601Precision(false)).to.throw();
            expect(() => detectIso8601Precision({})).to.throw();
            expect(() => detectIso8601Precision([])).to.throw();
        });
        it("should throw an error if the given string is no valid Iso 8601 time format", () => {
            expect(() => detectIso8601Precision("not the right format")).to.throw();
            expect(() => detectIso8601Precision("202")).to.throw();
            expect(() => detectIso8601Precision("2022-")).to.throw();
            expect(() => detectIso8601Precision("2022-1")).to.throw();
            expect(() => detectIso8601Precision("2022-13")).to.throw();
            expect(() => detectIso8601Precision("2022-11-")).to.throw();
            expect(() => detectIso8601Precision("2022-11-3")).to.throw();
            expect(() => detectIso8601Precision("2022-11-31")).to.throw();
            expect(() => detectIso8601Precision("2022-11-30T")).to.throw();
            expect(() => detectIso8601Precision("2022-11-30T2")).to.throw();
            expect(() => detectIso8601Precision("2022-11-30T25")).to.throw();
            expect(() => detectIso8601Precision("2022-11-30T23:6")).to.throw();
            expect(() => detectIso8601Precision("2022-11-30T23:60")).to.throw();
            expect(() => detectIso8601Precision("2022-11-30T23:59:")).to.throw();
            expect(() => detectIso8601Precision("2022-11-30T23:59:6")).to.throw();
            expect(() => detectIso8601Precision("2022-11-30T23:59:60")).to.throw();
            expect(() => detectIso8601Precision("2022-11-30T23:59:59.")).to.throw();
            expect(() => detectIso8601Precision("2022-11-30T23:59:59.1")).to.throw();
            expect(() => detectIso8601Precision("2022-11-30T23:59:59.11")).to.throw();
            expect(() => detectIso8601Precision("2022-11-30T23:59:59.1111")).to.throw();
        });
        it("should return the iso 8601 of the given string if a valid iso 8601 datetime is given", () => {
            expect(detectIso8601Precision("2022")).to.equal("YYYY");
            expect(detectIso8601Precision("2022-11")).to.equal("YYYY-MM");
            expect(detectIso8601Precision("2022-11-30")).to.equal("YYYY-MM-DD");
            expect(detectIso8601Precision("2022-11-30T23")).to.equal("YYYY-MM-DDTHH");
            expect(detectIso8601Precision("2022-11-30T23:59")).to.equal("YYYY-MM-DDTHH:mm");
            expect(detectIso8601Precision("2022-11-30T23:59:59")).to.equal("YYYY-MM-DDTHH:mm:ss");
            expect(detectIso8601Precision("2022-11-30T23:59:59.111")).to.equal("YYYY-MM-DDTHH:mm:ss.SSS");
        });
    });
});
