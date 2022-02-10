import {expect} from "chai";
import {convertAttrTypeXML} from "../../../utils/convertAttrType.js";

describe("src/modules/tools/filterGeneral/utils/convertAttrType.js", () => {
    describe("convertAttrTypeXML", () => {
        it("should return 'string' if the input is 'string'", () => {
            expect(convertAttrTypeXML("string")).to.equal("string");
            expect(convertAttrTypeXML("char")).to.equal("string");
        });
        it("should return 'boolean' if the input is 'boolean'", () => {
            expect(convertAttrTypeXML("boolean")).to.equal("boolean");
            expect(convertAttrTypeXML("bool")).to.equal("boolean");
        });
        it("should return 'number' if the input is any known xml number word", () => {
            expect(convertAttrTypeXML("number")).to.equal("number");
            expect(convertAttrTypeXML("short")).to.equal("number");
            expect(convertAttrTypeXML("long")).to.equal("number");
            expect(convertAttrTypeXML("double")).to.equal("number");
            expect(convertAttrTypeXML("decimal")).to.equal("number");
            expect(convertAttrTypeXML("integer")).to.equal("number");
            expect(convertAttrTypeXML("float")).to.equal("number");
        });
        it("should return the input if the input is unknown", () => {
            expect(convertAttrTypeXML("anything else")).to.equal("anything else");
        });
    });
});
