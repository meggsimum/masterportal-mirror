import {expect} from "chai";
import {getFeatureGET, getFeaturePOST} from "../../../wfs/getFeature.js";
import errorHandling from "../../../utils/errorHandling.js";
import sinon from "sinon";

describe("src/api/wfs/getFeature.js", () => {
    let spyErrorHandling;

    beforeEach(function () {
        sinon.stub(console, "error").callsFake(sinon.stub());
        sinon.stub(console, "warn").callsFake(sinon.stub());
        spyErrorHandling = sinon.spy(errorHandling, "errorHandling");
    });

    afterEach(function () {
        console.error.restore();
        console.warn.restore();
        sinon.restore();
    });

    describe("getFeatureGET", () => {
        it("should return undefined if the first parameter is not defined", () => {
            const response = getFeatureGET(undefined);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the first parameter is not defined", () => {
            getFeatureGET(undefined);
            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeatureGET: Url is undefined. Url has to be defined and a string.")).to.be.true;
        });
        it("should return undefined if the first parameter is a number", () => {
            const response = getFeatureGET(666);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the first parameter is a number", () => {
            getFeatureGET(666);

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeatureGET: Url is 666. Url has to be defined and a string.")).to.be.true;
        });
        it("should return undefined if the first parameter is an array", () => {
            const response = getFeatureGET(["Array"]);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the first parameter is an array", () => {
            getFeatureGET(["Array"]);

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeatureGET: Url is Array. Url has to be defined and a string.")).to.be.true;
        });
        it("should return undefined if the first parameter is a boolean", () => {
            const response = getFeatureGET(true);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the first parameter is a boolean", () => {
            getFeatureGET(false);

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeatureGET: Url is false. Url has to be defined and a string.")).to.be.true;
        });
        it("should return undefined if the first parameter is null", () => {
            const response = getFeatureGET(null);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the first parameter is null", () => {
            getFeatureGET(null);

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeatureGET: Url is null. Url has to be defined and a string.")).to.be.true;
        });
        it("should return undefined if the first parameter is an object", () => {
            const response = getFeatureGET({});

            expect(response).to.be.undefined;
        });
        it("should call an error message if the first parameter is an object", () => {
            getFeatureGET({});

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeatureGET: Url is [object Object]. Url has to be defined and a string.")).to.be.true;
        });

        it("should return undefined if the second parameter is a string", () => {
            const response = getFeatureGET("url", "Guten Tag");

            expect(response).to.be.undefined;
        });
        it("should call an error message if the second parameter is a string", () => {
            getFeatureGET("url", "Guten Tag");

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeatureGET: Payload is Guten Tag. Payload has to be defined and an object (not null).")).to.be.true;
        });
        it("should return undefined if the second parameter is a number", () => {
            const response = getFeatureGET("url", 666);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the second parameter is a number", () => {
            getFeatureGET("url", 666);

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeatureGET: Payload is 666. Payload has to be defined and an object (not null).")).to.be.true;
        });
        it("should return undefined if the second parameter is a boolean", () => {
            const response = getFeatureGET("url", true);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the second parameter is a boolean", () => {
            getFeatureGET("url", false);

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeatureGET: Payload is false. Payload has to be defined and an object (not null).")).to.be.true;
        });
        it("should return undefined if the second parameter is an array", () => {
            const response = getFeatureGET("url", ["Array"]);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the second parameter is an array", () => {
            getFeatureGET("url", ["Array"]);

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeatureGET: Payload is Array. Payload has to be defined and an object (not null).")).to.be.true;
        });
        it("should return undefined if the second parameter is null", () => {
            const response = getFeatureGET("url", null);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the second parameter is null", () => {
            getFeatureGET("url", null);

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeatureGET: Payload is null. Payload has to be defined and an object (not null).")).to.be.true;
        });
        it("should return undefined if the second parameter is an empty object", () => {
            const response = getFeatureGET("url", {});

            expect(response).to.be.undefined;
        });
        it("should call an error message if the given object has no version attribute", () => {
            getFeatureGET("url", {});

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeatureGET: Version is undefined. Payload has to have the version attribute and it has to be a string.")).to.be.true;
        });
        it("should return undefined if version of the given object is a boolean", () => {
            const response = getFeatureGET("url", {
                version: true
            });

            expect(response).to.be.undefined;
        });
        it("should call an error message if version of the given object is a boolean", () => {
            getFeatureGET("url", {
                version: true
            });

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeatureGET: Version is true. Payload has to have the version attribute and it has to be a string.")).to.be.true;
        });
        it("should return undefined if version of the given object is a number", () => {
            const response = getFeatureGET("url", {
                version: 666
            });

            expect(response).to.be.undefined;
        });
        it("should call an error message if version of the given object is a number", () => {
            getFeatureGET("url", {
                version: 666
            });

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeatureGET: Version is 666. Payload has to have the version attribute and it has to be a string.")).to.be.true;
        });
        it("should return undefined if version of the given object is undefined", () => {
            const response = getFeatureGET("url", {
                version: undefined
            });

            expect(response).to.be.undefined;
        });
        it("should call an error message if version of the given object is a undefined", () => {
            getFeatureGET("url", {
                version: undefined
            });

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeatureGET: Version is undefined. Payload has to have the version attribute and it has to be a string.")).to.be.true;
        });
        it("should return undefined if version of the given object is null", () => {
            const response = getFeatureGET("url", {
                version: null
            });

            expect(response).to.be.undefined;
        });
        it("should call an error message if version of the given object is a null", () => {
            getFeatureGET("url", {
                version: null
            });

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeatureGET: Version is null. Payload has to have the version attribute and it has to be a string.")).to.be.true;
        });
        it("should return undefined if version of the given object is an object", () => {
            const response = getFeatureGET("url", {
                version: {}
            });

            expect(response).to.be.undefined;
        });
        it("should call an error message if version of the given object is an object", () => {
            getFeatureGET("url", {
                version: {}
            });

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeatureGET: Version is [object Object]. Payload has to have the version attribute and it has to be a string.")).to.be.true;
        });
        it("should return undefined if version of the given object is an array", () => {
            const response = getFeatureGET("url", {
                version: ["Array"]
            });

            expect(response).to.be.undefined;
        });
        it("should call an error message if version of the given object is an array", () => {
            getFeatureGET("url", {
                version: ["Array"]
            });

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeatureGET: Version is Array. Payload has to have the version attribute and it has to be a string.")).to.be.true;
        });

        it("should call an error message if the given object has no featureType attribute", () => {
            getFeatureGET("url", {
                version: "Version"
            });

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeatureGET: FeatureType is undefined. Payload has to have the featureType attribute and it has to be defined and a string or an array.")).to.be.true;
        });
        it("should return undefined if featureType of the given object is a boolean", () => {
            const response = getFeatureGET("url", {
                version: "Version",
                featureType: true
            });

            expect(response).to.be.undefined;
        });
        it("should call an error message if featureType of the given object is a boolean", () => {
            getFeatureGET("url", {
                version: "Version",
                featureType: true
            });

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeatureGET: FeatureType is true. Payload has to have the featureType attribute and it has to be defined and a string or an array.")).to.be.true;
        });
        it("should return undefined if featureType of the given object is a number", () => {
            const response = getFeatureGET("url", {
                version: "Version",
                featureType: 666
            });

            expect(response).to.be.undefined;
        });
        it("should call an error message if featureType of the given object is a number", () => {
            getFeatureGET("url", {
                version: "Version",
                featureType: 666
            });

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeatureGET: FeatureType is 666. Payload has to have the featureType attribute and it has to be defined and a string or an array.")).to.be.true;
        });
        it("should return undefined if featureType of the given object is undefined", () => {
            const response = getFeatureGET("url", {
                version: "Version",
                featureType: undefined
            });

            expect(response).to.be.undefined;
        });
        it("should call an error message if featureType of the given object is undefined", () => {
            getFeatureGET("url", {
                version: "Version",
                featureType: undefined
            });

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeatureGET: FeatureType is undefined. Payload has to have the featureType attribute and it has to be defined and a string or an array.")).to.be.true;
        });
        it("should return undefined if featureType of the given object is null", () => {
            const response = getFeatureGET("url", {
                version: "Version",
                featureType: null
            });

            expect(response).to.be.undefined;
        });
        it("should call an error message if featureType of the given object is null", () => {
            getFeatureGET("url", {
                version: "Version",
                featureType: null
            });

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeatureGET: FeatureType is null. Payload has to have the featureType attribute and it has to be defined and a string or an array.")).to.be.true;
        });
        it("should return undefined if featureType of the given object is an object", () => {
            const response = getFeatureGET("url", {
                version: "Version",
                featureType: {}
            });

            expect(response).to.be.undefined;
        });
        it("should call an error message if featureType of the given object is an object", () => {
            getFeatureGET("url", {
                version: "Version",
                featureType: {}
            });

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeatureGET: FeatureType is [object Object]. Payload has to have the featureType attribute and it has to be defined and a string or an array.")).to.be.true;
        });

        it("should return a reponse if the first (url) and second (payload) parameter are correct", async () => {
            const response = await getFeatureGET("https://geodienste.hamburg.de/HH_WFS_Krankenhaeuser", {
                version: "1.1.0",
                featureType: "krankenhaeuser_hh"
            });

            expect(response).to.be.a("string");
        });
        it("should call the errorHandling method if called with an invalid url", async () => {
            await getFeatureGET("https://geodienste.hamburg.de/HH_WFS_Kranken", {
                version: "1.1.0",
                featureType: "krankenhaeuser_hh"
            });

            expect(spyErrorHandling.calledOnce).to.be.true;
        });
        it("should return undefined if called with an invalid url", async () => {
            const response = await getFeatureGET("https://geodienste.hamburg.de/HH_WFS_Kranken", {
                version: "1.1.0",
                featureType: "krankenhaeuser_hh"
            });

            expect(response).to.be.undefined;
        });
    });

    describe("getFeaturePOST", () => {
        it("should return undefined if the first parameter is not defined", () => {
            const response = getFeaturePOST(undefined);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the first parameter is not defined", () => {
            getFeaturePOST(undefined);
            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeaturePOST: Url is undefined. Url has to be defined and a string.")).to.be.true;
        });
        it("should return undefined if the first parameter is a number", () => {
            const response = getFeaturePOST(666);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the first parameter is a number", () => {
            getFeaturePOST(666);

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeaturePOST: Url is 666. Url has to be defined and a string.")).to.be.true;
        });
        it("should return undefined if the first parameter is an array", () => {
            const response = getFeaturePOST(["Array"]);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the first parameter is an array", () => {
            getFeaturePOST(["Array"]);

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeaturePOST: Url is Array. Url has to be defined and a string.")).to.be.true;
        });
        it("should return undefined if the first parameter is a boolean", () => {
            const response = getFeaturePOST(true);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the first parameter is a boolean", () => {
            getFeaturePOST(false);

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeaturePOST: Url is false. Url has to be defined and a string.")).to.be.true;
        });
        it("should return undefined if the first parameter is null", () => {
            const response = getFeaturePOST(null);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the first parameter is null", () => {
            getFeaturePOST(null);

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeaturePOST: Url is null. Url has to be defined and a string.")).to.be.true;
        });
        it("should return undefined if the first parameter is an object", () => {
            const response = getFeaturePOST({});

            expect(response).to.be.undefined;
        });
        it("should call an error message if the first parameter is an object", () => {
            getFeaturePOST({});

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeaturePOST: Url is [object Object]. Url has to be defined and a string.")).to.be.true;
        });

        it("should return undefined if the second parameter is a string", () => {
            const response = getFeaturePOST("url", "Guten Tag");

            expect(response).to.be.undefined;
        });
        it("should call an error message if the second parameter is a string", () => {
            getFeaturePOST("url", "Guten Tag");

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeaturePOST: Payload is Guten Tag. Payload has to be defined and an object (not null).")).to.be.true;
        });
        it("should return undefined if the second parameter is a number", () => {
            const response = getFeaturePOST("url", 666);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the second parameter is a number", () => {
            getFeaturePOST("url", 666);

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeaturePOST: Payload is 666. Payload has to be defined and an object (not null).")).to.be.true;
        });
        it("should return undefined if the second parameter is a boolean", () => {
            const response = getFeaturePOST("url", true);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the second parameter is a boolean", () => {
            getFeaturePOST("url", false);

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeaturePOST: Payload is false. Payload has to be defined and an object (not null).")).to.be.true;
        });
        it("should return undefined if the second parameter is an array", () => {
            const response = getFeaturePOST("url", ["Array"]);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the second parameter is an array", () => {
            getFeaturePOST("url", ["Array"]);

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeaturePOST: Payload is Array. Payload has to be defined and an object (not null).")).to.be.true;
        });
        it("should return undefined if the second parameter is null", () => {
            const response = getFeaturePOST("url", null);

            expect(response).to.be.undefined;
        });
        it("should call an error message if the second parameter is null", () => {
            getFeaturePOST("url", null);

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeaturePOST: Payload is null. Payload has to be defined and an object (not null).")).to.be.true;
        });
        it("should return undefined if the second parameter is an empty object", () => {
            const response = getFeaturePOST("url", {});

            expect(response).to.be.undefined;
        });

        it("should call an error message if the given object has no featureTypes attribute", () => {
            getFeaturePOST("url", {
                version: "Version"
            });

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeaturePOST: FeatureTypes is undefined. FeatureTypes has to be defined and an array.")).to.be.true;
        });
        it("should return undefined if featureTypes of the given object is a string", () => {
            const response = getFeaturePOST("url", {
                version: "Version",
                featureTypes: "Guten Morgen"
            });

            expect(response).to.be.undefined;
        });
        it("should call an error message if featureTypes of the given object is a string", () => {
            getFeaturePOST("url", {
                version: "Version",
                featureTypes: "Guten Morgen"
            });

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeaturePOST: FeatureTypes is Guten Morgen. FeatureTypes has to be defined and an array.")).to.be.true;
        });
        it("should return undefined if featureTypes of the given object is a boolean", () => {
            const response = getFeaturePOST("url", {
                version: "Version",
                featureTypes: true
            });

            expect(response).to.be.undefined;
        });
        it("should call an error message if featureTypes of the given object is a boolean", () => {
            getFeaturePOST("url", {
                version: "Version",
                featureTypes: true
            });

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeaturePOST: FeatureTypes is true. FeatureTypes has to be defined and an array.")).to.be.true;
        });
        it("should return undefined if featureTypes of the given object is a number", () => {
            const response = getFeaturePOST("url", {
                version: "Version",
                featureTypes: 666
            });

            expect(response).to.be.undefined;
        });
        it("should call an error message if featureTypes of the given object is a number", () => {
            getFeaturePOST("url", {
                version: "Version",
                featureTypes: 666
            });

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeaturePOST: FeatureTypes is 666. FeatureTypes has to be defined and an array.")).to.be.true;
        });
        it("should return undefined if featureTypes of the given object is undefined", () => {
            const response = getFeaturePOST("url", {
                version: "Version",
                featureTypes: undefined
            });

            expect(response).to.be.undefined;
        });
        it("should call an error message if featureTypes of the given object is undefined", () => {
            getFeaturePOST("url", {
                version: "Version",
                featureTypes: undefined
            });

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeaturePOST: FeatureTypes is undefined. FeatureTypes has to be defined and an array.")).to.be.true;
        });
        it("should return undefined if featureTypes of the given object is null", () => {
            const response = getFeaturePOST("url", {
                version: "Version",
                featureTypes: null
            });

            expect(response).to.be.undefined;
        });
        it("should call an error message if featureTypes of the given object is null", () => {
            getFeaturePOST("url", {
                version: "Version",
                featureTypes: null
            });

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeaturePOST: FeatureTypes is null. FeatureTypes has to be defined and an array.")).to.be.true;
        });
        it("should return undefined if featureTypes of the given object is an object", () => {
            const response = getFeaturePOST("url", {
                version: "Version",
                featureTypes: {}
            });

            expect(response).to.be.undefined;
        });
        it("should call an error message if featureTypes of the given object is an object", () => {
            getFeaturePOST("url", {
                version: "Version",
                featureTypes: {}
            });

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("api/wfs/getFeaturePOST: FeatureTypes is [object Object]. FeatureTypes has to be defined and an array.")).to.be.true;
        });
        it("should return a reponse if the first (url) and second (payload) parameter are correct", async () => {
            const response = await getFeaturePOST("https://geodienste.hamburg.de/HH_WFS_Krankenhaeuser", {
                featureTypes: ["krankenhaeuser_hh"]
            });

            expect(response).to.be.a("string");
        });
        it("should call the errorHandling method if called with an invalid url", async () => {
            await getFeaturePOST("https://geodienste.hamburg.de/HH_WFS_Kranken", {
                featureTypes: ["krankenhaeuser_hh"]
            });

            expect(spyErrorHandling.calledOnce).to.be.true;
        });
        it("should return undefined if called with an invalid url", async () => {
            const response = await getFeatureGET("https://geodienste.hamburg.de/HH_WFS_Kranken", {
                featureTypes: ["krankenhaeuser_hh"]
            });

            expect(response).to.be.undefined;
        });
    });
});
