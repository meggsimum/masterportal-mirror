import getInitialLayers from "../../src/lib/getInitialLayers";
import defaults from "../../src/defaults";

describe("getInitialLayers.js", function () {
    it("returns configured layers if given", function () {
        const config = {layers: [{id: "1"}]},
            initialLayers = getInitialLayers(config);

        expect(initialLayers).toEqual(config.layers);
    });

    it("returns default initialization if no layers configured, but lgv services are in use", function () {
        const config1 = {},
            config2 = {layerConf: defaults.layerConf},
            initialLayers1 = getInitialLayers(config1),
            initialLayers2 = getInitialLayers(config2);

        expect(initialLayers1).toEqual(defaults.layers);
        expect(initialLayers2).toEqual(defaults.layers);
    });

    it("returns an empty array if neither user-specified nor default usable", function () {
        const config = {layerConf: "example.com/services.json"},
            initialLayers = getInitialLayers(config);

        expect(initialLayers).toEqual([]);
    });
});
