import {expect} from "chai";
import sinon from "sinon";
import axios from "axios";
import {getFeatureDescription, describeFeatureType} from "../../../wfs/describeFeatureType.js";
const fs = require("fs");

describe("src/api/wfs/describeFeatureType.js", () => {
    let xml;

    const json = {
        schema: {
            element: [{
                attributes: {
                    name: "hallo"
                },
                complexType: {
                    complexContent: {
                        extension: {
                            sequence: {
                                element: [{
                                    getAttributes: () => {
                                        return {
                                            name: "first",
                                            type: "string"
                                        };
                                    }
                                },
                                {
                                    getAttributes: () => {
                                        return {
                                            name: "second",
                                            type: "string"
                                        };
                                    }
                                }]
                            }
                        }
                    }
                }
            }]
        }
    };

    before(function () {
        const data = fs.readFileSync("src/api/tests/unit/wfs/response.xml", "utf8");

        xml = new window.DOMParser().parseFromString(data, "text/xml");
    });
    beforeEach(function () {
        sinon.spy(console, "error");
    });

    afterEach(function () {
        console.error.restore();
        sinon.restore();
    });

    describe("describeFeatureType", () => {
        it("should return undefined if the first parameter is not defined", () => {
            const response = describeFeatureType(undefined);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the first parameter is not defined", () => {
            describeFeatureType(undefined);

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/describeFeatureType: Url is undefined. Url has to be defined and a string.")).to.be.true;
        });
        it("should return undefined if the first parameter is a number", () => {
            const response = describeFeatureType(666);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the first parameter is a number", () => {
            describeFeatureType(666);

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/describeFeatureType: Url is 666. Url has to be defined and a string.")).to.be.true;
        });
        it("should return undefined if the first parameter is an array", () => {
            const response = describeFeatureType(["Array"]);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the first parameter is an array", () => {
            describeFeatureType(["Array"]);

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/describeFeatureType: Url is Array. Url has to be defined and a string.")).to.be.true;
        });
        it("should return undefined if the first parameter is a boolean", () => {
            const response = describeFeatureType(true);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the first parameter is a boolean", () => {
            describeFeatureType(false);

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/describeFeatureType: Url is false. Url has to be defined and a string.")).to.be.true;
        });
        it("should return undefined if the first parameter is null", () => {
            const response = describeFeatureType(null);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the first parameter is null", () => {
            describeFeatureType(null);

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/describeFeatureType: Url is null. Url has to be defined and a string.")).to.be.true;
        });
        it("should return undefined if the first parameter is an object", () => {
            const response = describeFeatureType({});

            expect(response).to.be.undefined;
        });
        it("should call an error message if the first parameter is an object", () => {
            describeFeatureType({});

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/describeFeatureType: Url is [object Object]. Url has to be defined and a string.")).to.be.true;
        });
        it("should return undefined if the second parameter is a number", () => {
            const response = describeFeatureType("url", 666);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the second parameter is a number", () => {
            describeFeatureType("url", 666);

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/describeFeatureType: Version is 666. Version has to be a string. Default is 1.1.0.")).to.be.true;
        });
        it("should return undefined if the second parameter is an array", () => {
            const response = describeFeatureType("url", [666]);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the second parameter is an array", () => {
            describeFeatureType("url", [666]);

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/describeFeatureType: Version is 666. Version has to be a string. Default is 1.1.0.")).to.be.true;
        });
        it("should return undefined if the second parameter is a boolean", () => {
            const response = describeFeatureType("url", true);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the second parameter is a boolean", () => {
            describeFeatureType("url", false);

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/describeFeatureType: Version is false. Version has to be a string. Default is 1.1.0.")).to.be.true;
        });
        it("should return undefined if the second parameter is a null", () => {
            const response = describeFeatureType("url", null);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the second parameter is a null", () => {
            describeFeatureType("url", null);

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/describeFeatureType: Version is null. Version has to be a string. Default is 1.1.0.")).to.be.true;
        });
        it("should return undefined if the second parameter is an object", () => {
            const response = describeFeatureType("url", {});

            expect(response).to.be.undefined;
        });
        it("should call an error message if the second parameter is an object", () => {
            describeFeatureType("url", {});

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/describeFeatureType: Version is [object Object]. Version has to be a string. Default is 1.1.0.")).to.be.true;
        });

        it("should return a reponse if the first paramerter is correct and the second parameter is not defined and 3. param is given", async () => {
            const url = "https://geodienste.hamburg.de/HH_WFS_Krankenhaeuser",
                featureTypes = "krankenhaeuser_hh",
                axiosStub = sinon.stub(axios, "get").returns(Promise.resolve({request: {status: 200, responseXML: xml}})),
                response = await describeFeatureType(url, undefined, featureTypes);

            expect(response).to.be.an("object");
            expect(axiosStub.calledOnce).to.be.true;
        });
        it("should return a reponse if the first, second and third parameter are correct", async () => {
            const url = "https://geodienste.hamburg.de/HH_WFS_Krankenhaeuser",
                featureTypes = "krankenhaeuser_hh",
                axiosStub = sinon.stub(axios, "get").returns(Promise.resolve({request: {status: 200, responseXML: xml}})),
                response = await describeFeatureType(url, "2.0.0", featureTypes);

            expect(response).to.be.an("object");
            expect(axiosStub.calledOnce).to.be.true;
        });
        it("should return undefined if the first paramerter is wrong and the second parameter is not defined", async () => {
            const response = await describeFeatureType("url", undefined);

            expect(response).to.be.undefined;
        });

        it("should return undefined if the first and second parameter are incorrect strings", async () => {
            const response = await describeFeatureType("test", "test");

            expect(response).to.be.undefined;
        });
    });

    describe("getFeatureDescription", () => {
        it("should return undefined if the first parameter is a number and call a console error", () => {
            expect(getFeatureDescription(123)).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return undefined if the first parameter is an empty object and call a console error", () => {
            expect(getFeatureDescription({})).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return undefined if the first parameter is an array and call a console error", () => {
            expect(getFeatureDescription([])).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return undefined if the first parameter is a boolean and call a console error", () => {
            expect(getFeatureDescription(true)).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return undefined if the first parameter is a string and call a console error", () => {
            expect(getFeatureDescription("Hallo")).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return undefined if the first parameter is undefined and call a console error", () => {
            expect(getFeatureDescription(undefined)).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return undefined if the first parameter is null and call a console error", () => {
            expect(getFeatureDescription(null)).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return undefined if the second parameter is a number and call a console error", () => {
            expect(getFeatureDescription(json, 123)).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return undefined if the second parameter is a boolean and call a console error", () => {
            expect(getFeatureDescription(json, true)).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return undefined if the second parameter is an array and call a console error", () => {
            expect(getFeatureDescription(json, [])).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return undefined if the second parameter is an object and call a console error", () => {
            expect(getFeatureDescription(json, {})).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return undefined if the second parameter is undefined and call a console error", () => {
            expect(getFeatureDescription(json, undefined)).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return undefined if the second parameter is null and call a console error", () => {
            expect(getFeatureDescription(json, null)).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return an array with two objects if featureType was found", () => {
            expect(getFeatureDescription(json, "hallo")).to.be.an("array");
            expect(getFeatureDescription(json, "hallo")[0]).to.be.an("object");
            expect(getFeatureDescription(json, "hallo")[1]).to.be.an("object");
        });

        it("should return an object with the keys name and type", () => {
            expect(getFeatureDescription(json, "hallo")[0]).to.have.all.keys("name", "type");
        });

        it("should return undefined if featureType was not found", () => {
            expect(getFeatureDescription(json, "test")).to.be.undefined;
        });
    });
});
