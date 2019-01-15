import {getGazetteerUrl, setGazetteerUrl} from "../../src/searchAddress";
import defaults from "../../src/defaults";

describe("searchAddress", function () {
    describe("setGazetteerUrl/getGazetteerUrl", function () {
        it("gazetteer url can be setted and getted, is initially default", function () {
            const initialUrl = getGazetteerUrl();

            expect(initialUrl).toEqual(defaults.gazetteerUrl);
            setGazetteerUrl("test");
            expect(getGazetteerUrl()).toEqual("test");
            setGazetteerUrl(initialUrl);
        });

        it("setting gazetteer url with falsy value means not changing previous value", function () {
            const initialUrl = getGazetteerUrl();

            setGazetteerUrl(undefined);
            expect(getGazetteerUrl()).toEqual(initialUrl);
        });
    });
});
