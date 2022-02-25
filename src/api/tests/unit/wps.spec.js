import WPS from "../../wps.js";
import {expect} from "chai";

describe("api/WPS", () => {
    describe("setXMLElement", () => {
        it("should return empty String if input strings are undefined", () => {
            expect(WPS.setXMLElement(undefined, undefined, undefined)).to.be.a("string").to.have.a.lengthOf(0);
        });
        it("should return String with \"hallo \" prepended to \"world\"", function () {
            expect(WPS.setXMLElement("world", "world", "hallo ")).to.have.string("hallo world");
        });
    });

    describe("buildXML", () => {
        const expectedOutput = "<xml><ows:Identifier>workbench.fmw</ows:Identifier>" +
                                "<wps:DataInputs>" +
                                "<wps:Input><ows:Identifier>test</ows:Identifier><wps:Data><wps:LiteralData>123</wps:LiteralData></wps:Data></wps:Input>" +
                                "</wps:DataInputs></xml>";

        it("should return empty String if input strings are undefined", () => {
            expect(WPS.buildXML(undefined, undefined, undefined, undefined)).to.be.a("string").to.have.a.lengthOf(0);
        });
        it("should return xml if input object is JSON ", function () {
            const identifier = "workbench.fmw",
                data = {"test": 123},
                xmlTemplate = "<xml><ows:Identifier></ows:Identifier><wps:DataInputs></wps:DataInputs></xml>",
                dataInputXmlTemplate = "<wps:Input><ows:Identifier></ows:Identifier><wps:Data><wps:LiteralData></wps:LiteralData></wps:Data></wps:Input>";

            expect(WPS.buildXML(identifier, xmlTemplate, dataInputXmlTemplate, data)).to.have.string(expectedOutput);
        });
        it("should return xml if input object is object ", () => {
            const identifier = "workbench.fmw",
                data = {test: 123},
                xmlTemplate = "<xml><ows:Identifier></ows:Identifier><wps:DataInputs></wps:DataInputs></xml>",
                dataInputXmlTemplate = "<wps:Input><ows:Identifier></ows:Identifier><wps:Data><wps:LiteralData></wps:LiteralData></wps:Data></wps:Input>";

            expect(WPS.buildXML(identifier, xmlTemplate, dataInputXmlTemplate, data)).to.have.string(expectedOutput);
        });
    });
});
