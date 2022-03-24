import {expect} from "chai";
import describeFeatureTypeOAF from "../../../../utils/describeFeatureType/describeFeatureTypeOAF.js";

describe("src/modules/tools/filterGeneral/utils/describeFeatureType/describeFeatureTypeOAF.js", () => {
    describe("describeFeatureTypeOAF", () => {
        it("should call the given url with the expected format", () => {
            let lastUrl = false;
            const expectedUrl = "url/collections/typename/appschema";

            describeFeatureTypeOAF("url", "typename", "onsuccess", "onerror", {
                get: url => new Promise(resolve => {
                    lastUrl = url;
                    resolve();
                })
            });
            expect(lastUrl).to.equal(expectedUrl);
        });
    });
});
