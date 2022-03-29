import {expect} from "chai";
import {getStateAsUrlParams} from "../../../parametricUrl/stateToUrlWriter";


describe("src/utils/parametricUrl/stateToUrlWriter.js", () => {
    it("test getStateAsUrlParams", () => {
        const rootState = {
                Tools: {
                    SaveSelection: {
                        layerIds: ["1", "2"],
                        layerVisibilities: ["true", "true"],
                        layerTransparencies: ["0", "50"]
                    }
                }
            },
            rootGetters = {
                "Maps/center": [123, 456],
                "Maps/getView": {
                    getZoom: () => {
                        return "7";
                    }
                }
            },
            expected = "?Map/layerIds=1,2&visibility=true,true&transparency=0,50&Map/center=[123,456]&Map/zoomLevel=7",
            actual = getStateAsUrlParams(rootState, rootGetters);

        expect(actual.substring(actual.indexOf("?"))).to.be.equals(expected);

    });
});
