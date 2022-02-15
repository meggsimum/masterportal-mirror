import {expect} from "chai";
import InterfaceOL from "../../../interfaces/interface.ol.js";

describe("src/modules/tools/filterGeneral/interfaces/utils/interface.ol.js", () => {
    let interfaceOL = null;

    beforeEach(() => {
        interfaceOL = new InterfaceOL(false, {
            getFeaturesByLayerId: false,
            isFeatureInMapExtent: false
        });
    });

    describe("changeValueToMatchReference", () => {
        it("should convert the given value to the type of the given reference", () => {
            expect(interfaceOL.changeValueToMatchReference(1234, "string")).to.equal("1234");
            expect(interfaceOL.changeValueToMatchReference(1234, false)).to.be.true;
            expect(interfaceOL.changeValueToMatchReference(0, false)).to.be.false;
            expect(interfaceOL.changeValueToMatchReference("string", 1234)).to.equal(0);
            expect(interfaceOL.changeValueToMatchReference("5string", 1234)).to.equal(5);
            expect(interfaceOL.changeValueToMatchReference("UppErCasEStriNg", "string")).to.equal("uppercasestring");
        });
        it("should return the given value as type of the given reference if a depth of 10 is not exceeded", () => {
            expect(interfaceOL.changeValueToMatchReference(1234, "string", 9)).to.equal("1234");
        });
        it("should return the given value if a depth of 10 is exceeded", () => {
            expect(interfaceOL.changeValueToMatchReference(1234, "string", 10)).to.equal(1234);
        });
        it("should return an array with converted values", () => {
            expect(interfaceOL.changeValueToMatchReference(["1string", "2string", "3string"], 1234)).to.deep.equal([1, 2, 3]);
        });
    });
    describe("checkRule", () => {
        it("should return false if anything but a valid rule object is given", () => {
            expect(interfaceOL.checkRule(undefined)).to.be.false;
            expect(interfaceOL.checkRule(null)).to.be.false;
            expect(interfaceOL.checkRule(1234)).to.be.false;
            expect(interfaceOL.checkRule("string")).to.be.false;
            expect(interfaceOL.checkRule(true)).to.be.false;
            expect(interfaceOL.checkRule(false)).to.be.false;
            expect(interfaceOL.checkRule([])).to.be.false;
            expect(interfaceOL.checkRule({})).to.be.false;
            expect(interfaceOL.checkRule({operator: "OR"})).to.be.false;
        });
        it("should check the operator BETWEEN for a single value", () => {
            expect(interfaceOL.checkRule({operator: "BETWEEN", value: -0.00001}, 0, 10)).to.be.false;
            expect(interfaceOL.checkRule({operator: "BETWEEN", value: 0}, 0, 10)).to.be.true;
            expect(interfaceOL.checkRule({operator: "BETWEEN", value: 10}, 0, 10)).to.be.true;
            expect(interfaceOL.checkRule({operator: "BETWEEN", value: 10.00001}, 0, 10)).to.be.false;
        });
        it("should check the operator EQ for a single value", () => {
            expect(interfaceOL.checkRule({operator: "EQ", value: true}, true)).to.be.true;
            expect(interfaceOL.checkRule({operator: "EQ", value: false}, false)).to.be.true;
            expect(interfaceOL.checkRule({operator: "EQ", value: true}, false)).to.be.false;
            expect(interfaceOL.checkRule({operator: "EQ", value: false}, true)).to.be.false;

            expect(interfaceOL.checkRule({operator: "EQ", value: "string"}, "string")).to.be.true;
            expect(interfaceOL.checkRule({operator: "EQ", value: "string"}, "!string")).to.be.false;
        });
        it("should check the operator NE for a single value", () => {
            expect(interfaceOL.checkRule({operator: "NE", value: true}, true)).to.be.false;
            expect(interfaceOL.checkRule({operator: "NE", value: false}, false)).to.be.false;
            expect(interfaceOL.checkRule({operator: "NE", value: true}, false)).to.be.true;
            expect(interfaceOL.checkRule({operator: "NE", value: false}, true)).to.be.true;

            expect(interfaceOL.checkRule({operator: "NE", value: "string"}, "string")).to.be.false;
            expect(interfaceOL.checkRule({operator: "NE", value: "string"}, "!string")).to.be.true;
        });
        it("should check the operator GT for a single value", () => {
            expect(interfaceOL.checkRule({operator: "GT", value: 4.9999}, 5)).to.be.true;
            expect(interfaceOL.checkRule({operator: "GT", value: 5}, 5)).to.be.false;
            expect(interfaceOL.checkRule({operator: "GT", value: 5.0001}, 5)).to.be.false;
        });
        it("should check the operator GE for a single value", () => {
            expect(interfaceOL.checkRule({operator: "GE", value: 4.9999}, 5)).to.be.true;
            expect(interfaceOL.checkRule({operator: "GE", value: 5}, 5)).to.be.true;
            expect(interfaceOL.checkRule({operator: "GE", value: 5.0001}, 5)).to.be.false;
        });
        it("should check the operator LT for a single value", () => {
            expect(interfaceOL.checkRule({operator: "LT", value: 4.9999}, 5)).to.be.false;
            expect(interfaceOL.checkRule({operator: "LT", value: 5}, 5)).to.be.false;
            expect(interfaceOL.checkRule({operator: "LT", value: 5.0001}, 5)).to.be.true;
        });
        it("should check the operator LE for a single value", () => {
            expect(interfaceOL.checkRule({operator: "LE", value: 4.9999}, 5)).to.be.false;
            expect(interfaceOL.checkRule({operator: "LE", value: 5}, 5)).to.be.true;
            expect(interfaceOL.checkRule({operator: "LE", value: 5.0001}, 5)).to.be.true;
        });
        it("should check the operator IN for a single value", () => {
            expect(interfaceOL.checkRule({operator: "IN", value: "bar"}, "foobarbaz")).to.be.true;
            expect(interfaceOL.checkRule({operator: "IN", value: "bar"}, "foobaz")).to.be.false;
        });
        it("should check the operator STARTSWITH for a single value", () => {
            expect(interfaceOL.checkRule({operator: "STARTSWITH", value: "foo"}, "foobarbaz")).to.be.true;
            expect(interfaceOL.checkRule({operator: "STARTSWITH", value: "foo"}, "bazbarfoo")).to.be.false;
        });
        it("should check the operator ENDSWITH for a single value", () => {
            expect(interfaceOL.checkRule({operator: "ENDSWITH", value: "foo"}, "foobarbaz")).to.be.false;
            expect(interfaceOL.checkRule({operator: "ENDSWITH", value: "foo"}, "bazbarfoo")).to.be.true;
        });
        it("should check the operator INTERSECTS for multi values", () => {
            expect(interfaceOL.checkRule({operator: "INTERSECTS", value: [0, 10]}, -1, -0.000001)).to.be.false;
            expect(interfaceOL.checkRule({operator: "INTERSECTS", value: [0, 10]}, -1, 0)).to.be.true;
            expect(interfaceOL.checkRule({operator: "INTERSECTS", value: [0, 10]}, 10, 11)).to.be.true;
            expect(interfaceOL.checkRule({operator: "INTERSECTS", value: [0, 10]}, 10.000001, 11)).to.be.false;

            expect(interfaceOL.checkRule({operator: "INTERSECTS", value: [0, 10]}, 1, 9)).to.be.true;
            expect(interfaceOL.checkRule({operator: "INTERSECTS", value: [0, 10]}, 0, 10)).to.be.true;
            expect(interfaceOL.checkRule({operator: "INTERSECTS", value: [0, 10]}, -1, 11)).to.be.true;
        });
        it("should check the operator BETWEEN for multi values", () => {
            expect(interfaceOL.checkRule({operator: "BETWEEN", value: [0, 10]}, -1, -0.000001)).to.be.false;
            expect(interfaceOL.checkRule({operator: "BETWEEN", value: [0, 10]}, -1, 0)).to.be.false;
            expect(interfaceOL.checkRule({operator: "BETWEEN", value: [0, 10]}, 10, 11)).to.be.false;
            expect(interfaceOL.checkRule({operator: "BETWEEN", value: [0, 10]}, 10.000001, 11)).to.be.false;

            expect(interfaceOL.checkRule({operator: "BETWEEN", value: [0, 10]}, 1, 9)).to.be.true;
            expect(interfaceOL.checkRule({operator: "BETWEEN", value: [0, 10]}, 0, 10)).to.be.true;
            expect(interfaceOL.checkRule({operator: "BETWEEN", value: [0, 10]}, -1, 11)).to.be.false;
        });
        it("should check the operator EQ for multi values", () => {
            expect(interfaceOL.checkRule({operator: "EQ", value: ["foo", "bar", "baz"]}, "foobar")).to.be.false;
            expect(interfaceOL.checkRule({operator: "EQ", value: ["foo", "bar", "baz"]}, "foo")).to.be.true;
            expect(interfaceOL.checkRule({operator: "EQ", value: ["foo", "bar", "baz"]}, "bar")).to.be.true;
            expect(interfaceOL.checkRule({operator: "EQ", value: ["foo", "bar", "baz"]}, "baz")).to.be.true;
        });
        it("should check the operator IN for multi values", () => {
            expect(interfaceOL.checkRule({operator: "IN", value: ["foo", "bar", "baz"]}, "test qux test")).to.be.false;
            expect(interfaceOL.checkRule({operator: "IN", value: ["foo", "bar", "baz"]}, "test foo test")).to.be.true;
            expect(interfaceOL.checkRule({operator: "IN", value: ["foo", "bar", "baz"]}, "test bar test")).to.be.true;
            expect(interfaceOL.checkRule({operator: "IN", value: ["foo", "bar", "baz"]}, "test baz test")).to.be.true;
        });
        it("should check the operator STARTSWITH for multi values", () => {
            expect(interfaceOL.checkRule({operator: "STARTSWITH", value: ["foo", "bar", "baz"]}, "qux test")).to.be.false;
            expect(interfaceOL.checkRule({operator: "STARTSWITH", value: ["foo", "bar", "baz"]}, "foo test")).to.be.true;
            expect(interfaceOL.checkRule({operator: "STARTSWITH", value: ["foo", "bar", "baz"]}, "bar test")).to.be.true;
            expect(interfaceOL.checkRule({operator: "STARTSWITH", value: ["foo", "bar", "baz"]}, "baz test")).to.be.true;
            expect(interfaceOL.checkRule({operator: "STARTSWITH", value: ["foo", "bar", "baz"]}, "test foo")).to.be.false;
            expect(interfaceOL.checkRule({operator: "STARTSWITH", value: ["foo", "bar", "baz"]}, "test bar")).to.be.false;
            expect(interfaceOL.checkRule({operator: "STARTSWITH", value: ["foo", "bar", "baz"]}, "test baz")).to.be.false;
        });
        it("should check the operator ENDSWITH for multi values", () => {
            expect(interfaceOL.checkRule({operator: "ENDSWITH", value: ["foo", "bar", "baz"]}, "qux test")).to.be.false;
            expect(interfaceOL.checkRule({operator: "ENDSWITH", value: ["foo", "bar", "baz"]}, "foo test")).to.be.false;
            expect(interfaceOL.checkRule({operator: "ENDSWITH", value: ["foo", "bar", "baz"]}, "bar test")).to.be.false;
            expect(interfaceOL.checkRule({operator: "ENDSWITH", value: ["foo", "bar", "baz"]}, "baz test")).to.be.false;
            expect(interfaceOL.checkRule({operator: "ENDSWITH", value: ["foo", "bar", "baz"]}, "test foo")).to.be.true;
            expect(interfaceOL.checkRule({operator: "ENDSWITH", value: ["foo", "bar", "baz"]}, "test bar")).to.be.true;
            expect(interfaceOL.checkRule({operator: "ENDSWITH", value: ["foo", "bar", "baz"]}, "test baz")).to.be.true;
        });
        it("should be case insensitive", () => {
            expect(interfaceOL.checkRule({operator: "IN", value: "FOO"}, "foo")).to.be.true;
            expect(interfaceOL.checkRule({operator: "IN", value: "bar"}, "BAR")).to.be.true;
        });
    });

    describe("checkRules", () => {
        it("should return false the given feature is not valid", () => {
            expect(interfaceOL.checkRules(undefined)).to.be.false;
            expect(interfaceOL.checkRules(null)).to.be.false;
            expect(interfaceOL.checkRules(1234)).to.be.false;
            expect(interfaceOL.checkRules("string")).to.be.false;
            expect(interfaceOL.checkRules(true)).to.be.false;
            expect(interfaceOL.checkRules(false)).to.be.false;
            expect(interfaceOL.checkRules([])).to.be.false;
            expect(interfaceOL.checkRules({})).to.be.false;
        });
        it("should return false if the given rules are not valid", () => {
            expect(interfaceOL.checkRules({get: v => v}, undefined)).to.be.false;
            expect(interfaceOL.checkRules({get: v => v}, null)).to.be.false;
            expect(interfaceOL.checkRules({get: v => v}, 1234)).to.be.false;
            expect(interfaceOL.checkRules({get: v => v}, "string")).to.be.false;
            expect(interfaceOL.checkRules({get: v => v}, true)).to.be.false;
            expect(interfaceOL.checkRules({get: v => v}, false)).to.be.false;
            expect(interfaceOL.checkRules({get: v => v}, {})).to.be.false;
        });
        it("should return true if no rules are given", () => {
            expect(interfaceOL.checkRules({get: v => v}, [])).to.be.true;
        });
        it("should return false if the rules do not match the attributes of the given feature", () => {
            const feature = {
                get: key => {
                    if (key === "foo") {
                        return 1;
                    }
                    else if (key === "bar") {
                        return "test";
                    }
                    else if (key === "baz") {
                        return 5;
                    }
                    return false;
                }
            };

            expect(interfaceOL.checkRules(feature, [{attrName: "foo", operator: "EQ", value: 1}])).to.be.true;
            expect(interfaceOL.checkRules(feature, [{attrName: "foo", operator: "EQ", value: 11}])).to.be.false;
            expect(interfaceOL.checkRules(feature, [{attrName: "bar", operator: "IN", value: "es"}])).to.be.true;
            expect(interfaceOL.checkRules(feature, [{attrName: "bar", operator: "IN", value: "se"}])).to.be.false;
            expect(interfaceOL.checkRules(feature, [{attrName: "bar", operator: "IN", value: ["baz", "es"]}])).to.be.true;
            expect(interfaceOL.checkRules(feature, [{attrName: "bar", operator: "IN", value: ["baz", "se"]}])).to.be.false;
            expect(interfaceOL.checkRules(feature, [
                {attrName: ["foo", "baz"], operator: "INTERSECTS", value: [4, 8]},
                {attrName: "bar", operator: "EQ", value: "test"}
            ])).to.be.true;
            expect(interfaceOL.checkRules(feature, [
                {attrName: ["foo", "baz"], operator: "INTERSECTS", value: [4, 8]},
                {attrName: "bar", operator: "EQ", value: "foobar"}
            ])).to.be.false;
            expect(interfaceOL.checkRules(feature, [
                {attrName: ["foo", "baz"], operator: "INTERSECTS", value: [6, 8]},
                {attrName: "bar", operator: "EQ", value: "test"}
            ])).to.be.false;
        });
    });
});
