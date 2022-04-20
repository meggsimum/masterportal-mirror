import {expect} from "chai";
import {
    between,
    betweenForArray,
    endswith,
    endswithForArray,
    equals,
    equalsForArray,
    ge,
    gt,
    inForArray,
    inForString,
    intersectsForArray,
    le,
    lt,
    ne,
    startswith,
    startswithForArray
} from "../../../utils/ruleValidation.js";

describe("src/modules/tools/filterGeneral/utils/ruleValidation.js", () => {
    describe("intersectsForArray", () => {
        it("should return true if multi value match intersects", () => {
            expect(intersectsForArray(-1, 0, 0, 10)).to.be.true;
            expect(intersectsForArray(10, 11, 0, 10)).to.be.true;
        });
        it("should return false if multi value not match intersercts", () => {
            expect(intersectsForArray(-1, -0.1, 0, 10)).to.be.false;
            expect(intersectsForArray(10.000000001, 11, 0, 10)).to.be.false;
        });
        it("should return true if dates match intersect", () => {
            expect(intersectsForArray("01.01.2022", "02.01.2022", "01.01.2022", "10.01.2022")).to.be.true;
        });
        it("should return false if dates do not match intersect", () => {
            expect(intersectsForArray("31.01.2022", "01.02.2022", "01.01.2022", "10.01.2022")).to.be.false;
        });
    });
    describe("betweenForArray", () => {
        it("should return true if multi value is between", () => {
            expect(betweenForArray(1, 2, 0, 10)).to.be.true;
            expect(betweenForArray(0, 10, 0, 10)).to.be.true;
        });
        it("should return false if multi value is not between", () => {
            expect(betweenForArray(-1, -0.1, 0, 10)).to.be.false;
            expect(betweenForArray(-1, 11, 0, 10)).to.be.false;
        });
        it("should return true if dates are between", () => {
            expect(betweenForArray("01.01.2022", "02.01.2022", "01.01.2022", "10.01.2022")).to.be.true;
        });
        it("should return false if dates are not between", () => {
            expect(betweenForArray("31.12.2021", "11.01.2022", "01.01.2022", "10.01.2022")).to.be.false;
        });
    });
    describe("equalsForArray", () => {
        it("should return true if multi value is equeal", () => {
            expect(equalsForArray("foo", ["foo", "foo"])).to.be.true;
        });
        it("should return false if multi value is not equal", () => {
            expect(equalsForArray(-1, [0, 10])).to.be.false;
            expect(equalsForArray(10.000000001, [0, 10])).to.be.false;
        });
        it("should return true if dates are equal", () => {
            expect(equalsForArray("01.01.2022", ["01.01.2022", "10.01.2022"], "DD.MM.YYYY")).to.be.true;
        });
        it("should return false if dates are not equal", () => {
            expect(equalsForArray("31.01.2022", ["01.01.2022", "10.01.2022"], "DD.MM.YYYY")).to.be.false;
        });
    });
    describe("inForArray", () => {
        it("should return false if multi value is not in", () => {
            expect(inForArray("test qux test", ["foo", "bar"])).to.be.false;
        });
        it("should return true if multi value is in", () => {
            expect(inForArray("test foo bar", ["bar", "foo"])).to.be.true;
        });
    });
    describe("startswithForArray", () => {
        it("should return false if multi value does not match startswith", () => {
            expect(startswithForArray("baz buz bez", ["foo", "bar"])).to.be.false;
        });
        it("should return true if multi value does match startswith", () => {
            expect(startswithForArray("foo buz baz", ["foo", "bar"])).to.be.true;
        });
    });
    describe("endswithForArray", () => {
        it("should return false if multi value does not match endswith", () => {
            expect(endswithForArray("buz baz bez", ["foo", "bar"])).to.be.false;
        });
        it("should return true if multi value match endswith", () => {
            expect(endswithForArray("buz bam foo", ["foo", "bar"])).to.be.true;
        });
    });
    describe("between", () => {
        it("should return false if value is not between", () => {
            expect(between(0, 10, -0.00001)).to.be.false;
            expect(between(0, 10, 11)).to.be.false;
        });
        it("should return true if value is between", () => {
            expect(between(0, 10, 1)).to.be.true;
            expect(between(0, 10, 1)).to.be.true;
            expect(between(0, 10, 10)).to.be.true;
        });
        it("should return false if date is not between", () => {
            expect(between("01.01.2022", "10.01.2022", "31.12.2021", "DD.MM.YYYY")).to.be.false;
            expect(between("01.01.2022", "10.01.2022", "11.01.2022", "DD.MM.YYYY")).to.be.false;
            expect(between("01.01.2022", "10.01.2022", "05.01.2021", "DD.MM.YYYY")).to.be.false;
        });
        it("should return true if date is between", () => {
            expect(between("01.01.2022", "10.01.2022", "05.01.2022", "DD.MM.YYYY")).to.be.true;
            expect(between("01.01.2022", "10.01.2022", "01.01.2022", "DD.MM.YYYY")).to.be.true;
            expect(between("01.01.2022", "10.01.2022", "10.01.2022", "DD.MM.YYYY")).to.be.true;
        });
    });
    describe("equals", () => {
        it("should return false if value is not equal", () => {
            expect(equals("foo", "bar")).to.be.false;
        });
        it("should return true if value is equal", () => {
            expect(equals("foo", "foo")).to.be.true;
        });
        it("should return false if date is not equal", () => {
            expect(equals("31.12.2021", "10.01.2022", "DD.MM.YYYY")).to.be.false;
        });
        it("should return true if date is equal", () => {
            expect(equals("01.01.2022", "01.01.2022", "DD.MM.YYYY")).to.be.true;
        });
    });
    describe("ne", () => {
        it("should return true if value is not equal", () => {
            expect(ne("foo", "bar")).to.be.true;
        });
        it("should return false if value is equal", () => {
            expect(ne("foo", "foo")).to.be.false;
        });
        it("should return true if date is not equal", () => {
            expect(ne("31.12.2021", "10.01.2022", "DD.MM.YYYY")).to.be.true;
        });
        it("should return false if date is equal", () => {
            expect(ne("01.01.2022", "01.01.2022", "DD.MM.YYYY")).to.be.false;
        });
    });
    describe("gt", () => {
        it("should return false if value is not greater", () => {
            expect(gt(1, 10)).to.be.false;
            expect(gt(1, 1)).to.be.false;
        });
        it("should return true if value is greater", () => {
            expect(gt(10, 1)).to.be.true;
            expect(gt(11, 10)).to.be.true;
        });
        it("should return false if date is not greater", () => {
            expect(gt("31.12.2021", "10.01.2022", "DD.MM.YYYY")).to.be.false;
            expect(gt("10.01.2022", "10.01.2022", "DD.MM.YYYY")).to.be.false;
        });
        it("should return true if date is greater", () => {
            expect(gt("02.01.2022", "01.01.2022", "DD.MM.YYYY")).to.be.true;
        });
    });
    describe("ge", () => {
        it("should return false if value is not greater equals", () => {
            expect(ge(1, 10)).to.be.false;
        });
        it("should return true if value is greater equals", () => {
            expect(ge(10, 1)).to.be.true;
            expect(ge(10, 10)).to.be.true;
        });
        it("should return false if date is not greater equals", () => {
            expect(ge("31.12.2021", "10.01.2022", "DD.MM.YYYY")).to.be.false;
        });
        it("should return true if date is greater equals", () => {
            expect(ge("02.01.2022", "01.01.2022", "DD.MM.YYYY")).to.be.true;
            expect(ge("10.01.2022", "10.01.2022", "DD.MM.YYYY")).to.be.true;
        });
    });
    describe("lt", () => {
        it("should return false if value is not less", () => {
            expect(lt(11, 10)).to.be.false;
            expect(lt(10, 10)).to.be.false;
        });
        it("should return true if value is less", () => {
            expect(lt(1, 10)).to.be.true;
        });
        it("should return false if date is not less", () => {
            expect(lt("31.12.2022", "10.01.2022", "DD.MM.YYYY")).to.be.false;
            expect(lt("10.01.2022", "10.01.2022", "DD.MM.YYYY")).to.be.false;
        });
        it("should return true if date is less", () => {
            expect(lt("01.01.2022", "10.01.2022", "DD.MM.YYYY")).to.be.true;
        });
    });
    describe("le", () => {
        it("should return false if value is not less equal", () => {
            expect(le(11, 10)).to.be.false;
        });
        it("should return true if value is less equal", () => {
            expect(le(1, 10)).to.be.true;
            expect(le(10, 10)).to.be.true;
        });
        it("should return false if date is not less equal", () => {
            expect(le("31.12.2022", "10.01.2022", "DD.MM.YYYY")).to.be.false;
        });
        it("should return true if date is less equal", () => {
            expect(le("01.01.2022", "10.01.2022", "DD.MM.YYYY")).to.be.true;
            expect(le("10.01.2022", "10.01.2022", "DD.MM.YYYY")).to.be.true;
        });
    });
    describe("inForString", () => {
        it("should return false if value is not in", () => {
            expect(inForString("bar buz", "foo")).to.be.false;
        });
        it("should return true if value is in", () => {
            expect(inForString("foo buz", "foo")).to.be.true;
        });
    });
    describe("startswith", () => {
        it("should return false if value not starts with", () => {
            expect(startswith("bar buz", "foo")).to.be.false;
        });
        it("should return true if value starts with", () => {
            expect(startswith("foo buz", "foo")).to.be.true;
        });
    });
    describe("endswith", () => {
        it("should return false if value not ends with", () => {
            expect(endswith("bar buz", "foo")).to.be.false;
        });
        it("should return true if value ends with", () => {
            expect(endswith("bar foo", "foo")).to.be.true;
        });
    });
});
