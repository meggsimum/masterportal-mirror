import _ from "underscore";
import * as wms from "../../src/layer/wms";

describe("wms.js", function () {
    describe("generateSessionId", function () {
        it("returns a number", function () {
            var sid = wms.generateSessionId();

            expect(_.isNumber(sid)).toEqual(true);
        });
    });

    /* TODO
    describe("makeParams", function () {

    });
    describe("createTileGrid", function () {

    });
    describe("createLayerSource", function () {

    });
    describe("createLayer", function () {

    });
    describe("updateSource", function () {

    });
    describe("getLegendURL", function () {

    });
    describe("getGfiURL", function () {

    });
    */
});
