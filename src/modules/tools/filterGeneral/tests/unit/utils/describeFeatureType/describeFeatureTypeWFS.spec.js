import {expect} from "chai";
import describeFeatureTypeWFS from "../../../../utils/describeFeatureType/describeFeatureTypeWFS.js";

describe("src/modules/tools/filterGeneral/utils/describeFeatureType/describeFeatureTypeWFS.js", () => {
    let lastSuccess = false,
        lastError = false,
        mock = null;

    beforeEach(() => {
        lastSuccess = false;
        lastError = false;
        mock = {
            onsuccess: value => {
                lastSuccess = value;
            },
            onerror: value => {
                lastError = value;
            }
        };
    });

    describe("describeFeatureTypeWFS", () => {
        it("should call the given url", () => {
            let lastUrl = false;

            describeFeatureTypeWFS("url", "typename", mock.onsuccess, mock.onerror, {
                get: url => new Promise(resolve => {
                    lastUrl = url;
                    resolve();
                })
            });
            expect(lastUrl).to.equal("url");
        });
        it("should call with fixed params", () => {
            let lastParams = false;

            describeFeatureTypeWFS("url", "typename", mock.onsuccess, mock.onerror, {
                get: (url, params) => new Promise(resolve => {
                    lastParams = params;
                    resolve();
                })
            });
            expect(lastParams).to.deep.equal({
                params: {
                    service: "WFS",
                    version: "1.1.0",
                    request: "DescribeFeatureType"
                }
            });
        });
        it("should handle a specific error if anything but an axios responseXML is received", async () => {
            await describeFeatureTypeWFS("url", "typename", mock.onsuccess, mock.onerror, {
                get: () => new Promise(resolve => {
                    resolve({
                        request: {
                            responseXML: undefined
                        }
                    });
                })
            });
            expect(lastError).to.be.an.instanceof(Error);
            expect(lastError.message).to.equal("The response from the server is invalid.");
        });
        it("should handle a specific error if the responseXML has no childElementCount", async () => {
            await describeFeatureTypeWFS("url", "typename", mock.onsuccess, mock.onerror, {
                get: () => new Promise(resolve => {
                    resolve({
                        request: {
                            responseXML: {
                                childElementCount: 0
                            }
                        }
                    });
                })
            });
            expect(lastError).to.be.an.instanceof(Error);
            expect(lastError.message).to.equal("The response from the server is empty.");
        });
        it("should handle a specific error if the first child of the responseXML is not valid", async () => {
            await describeFeatureTypeWFS("url", "typename", mock.onsuccess, mock.onerror, {
                get: () => new Promise(resolve => {
                    resolve({
                        request: {
                            responseXML: {
                                childElementCount: 1,
                                children: [
                                    undefined
                                ]
                            }
                        }
                    });
                })
            });
            expect(lastError).to.be.an.instanceof(Error);
            expect(lastError.message).to.equal("The response from the server has an invalid schema.");
        });
        it("should handle a specific error if the first child of the responseXML has invalid children", async () => {
            await describeFeatureTypeWFS("url", "typename", mock.onsuccess, mock.onerror, {
                get: () => new Promise(resolve => {
                    resolve({
                        request: {
                            responseXML: {
                                childElementCount: 1,
                                children: [
                                    {
                                        children: undefined
                                    }
                                ]
                            }
                        }
                    });
                })
            });
            expect(lastError).to.be.an.instanceof(Error);
            expect(lastError.message).to.equal("The response from the server has an empty schema.");
        });
        it("should handle a wfs error if the response is a wfs error", async () => {
            await describeFeatureTypeWFS("url", "typename", mock.onsuccess, mock.onerror, {
                get: () => new Promise(resolve => {
                    resolve({
                        request: {
                            responseXML: {
                                childElementCount: 1,
                                children: [
                                    {
                                        children: [
                                            {
                                                getAttribute: key => key === "exceptionCode",
                                                children: [
                                                    {
                                                        textContent: "textContent"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    });
                })
            });
            expect(lastError).to.be.an.instanceof(Error);
            expect(lastError.message).to.equal("textContent");
        });
        it("should handle a specific error if the typename is not found", async () => {
            await describeFeatureTypeWFS("url", "typename", mock.onsuccess, mock.onerror, {
                get: () => new Promise(resolve => {
                    resolve({
                        request: {
                            responseXML: {
                                childElementCount: 1,
                                children: [
                                    {
                                        children: [
                                            {
                                                tagName: "element",
                                                getAttribute: key => key === "exceptionCode" ? false : "anyTypename"
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    });
                })
            });
            expect(lastError).to.be.an.instanceof(Error);
            expect(lastError.message).to.equal("The typename 'typename' is unknown for this service.");
        });
        it("should handle a success", async () => {
            await describeFeatureTypeWFS("url", "typename", mock.onsuccess, mock.onerror, {
                get: () => new Promise(resolve => {
                    resolve({
                        request: {
                            responseXML: {
                                childElementCount: 1,
                                children: [
                                    {
                                        children: [
                                            {
                                                tagName: "element",
                                                getAttribute: key => key === "exceptionCode" ? false : "typename",
                                                getElementsByTagName: () => [
                                                    {
                                                        getAttribute: key => key === "name" ? "nameA" : "typeA"
                                                    },
                                                    {
                                                        getAttribute: key => key === "name" ? "nameB" : "double"
                                                    },
                                                    {
                                                        getAttribute: key => key === "name" ? "nameC" : "boolean"
                                                    },
                                                    {
                                                        getAttribute: key => key === "name" ? "nameD" : "string"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    });
                })
            });
            expect(lastSuccess).to.deep.equal({
                nameA: "typeA",
                nameB: "number",
                nameC: "boolean",
                nameD: "string"
            });
        });
    });
});
