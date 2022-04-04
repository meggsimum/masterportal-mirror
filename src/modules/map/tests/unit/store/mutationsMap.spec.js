import {expect} from "chai";
import mutations from "../../../store/mutationsMap";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import mapCollection from "../../../../../core/dataStorage/mapCollection.js";

const {addLayerToMap, removeLayerFromMap} = mutations;

describe("src/modules/map/store/mutationsMap.js", () => {
    describe("addLayerToMap", () => {
        it("should add a layer to the map", () => {
            const layers = [],
                state = {
                    mapId: "ol",
                    mode: "2D"
                },
                map = {
                    id: "ol",
                    mode: "2D",
                    addLayer: (layer) => {
                        layers.push(layer);
                    },
                    getLayers: () => {
                        return layers;
                    }
                },
                layer = new VectorLayer({
                    name: "layer123",
                    source: new VectorSource()
                });

            mapCollection.clear();
            mapCollection.addMap(map, "ol", "2D");

            addLayerToMap(state, layer);

            expect(map.getLayers().length).to.equals(1);
            expect(map.getLayers()[0].get("name")).to.equals("layer123");
        });

        it("should only be added if given parameter is a instance of BaseLayer", () => {
            const state = {
                    mapId: "ol",
                    mode: "2D"
                },
                layers = [],
                map = {
                    id: "ol",
                    mode: "2D",
                    addLayer: (layer) => {
                        layers.push(layer);
                    },
                    getLayers: () => {
                        return layers;
                    }
                };

            mapCollection.clear();
            mapCollection.addMap(map, "ol", "2D");

            addLayerToMap(state, undefined);
            addLayerToMap(state, null);
            addLayerToMap(state, []);
            addLayerToMap(state, {});
            addLayerToMap(state, false);
            addLayerToMap(state, new VectorSource());
            addLayerToMap(state, "Layer");
            expect(map.getLayers()).to.have.lengthOf(0);
        });
    });

    describe("removeLayerFromMap", () => {
        it("should remove a layer from the map", () => {
            const state = {
                    mapId: "ol",
                    mode: "2D"
                },
                layers = [],
                layer = new VectorLayer({
                    name: "layer123",
                    source: new VectorSource()
                }),
                map = {
                    id: "ol",
                    mode: "2D",
                    getLayers: () => {
                        return layers;
                    },
                    addLayer: (aLayer) => {
                        layers.push(aLayer);
                    },
                    removeLayer: (l) => {
                        layers.splice(layers.indexOf(l), 1);
                    }
                };

            mapCollection.clear();
            mapCollection.addMap(map, "ol", "2D");

            addLayerToMap(state, layer);
            expect(map.getLayers().length).to.equals(1);
            removeLayerFromMap(state, layer);
            expect(map.getLayers().length).to.equals(0);
        });

        it("should only be remove if given parameter is a instance of BaseLayer", () => {
            const state = {
                    mapId: "ol",
                    mode: "2D"
                },
                layer = new VectorLayer({
                    name: "layer123",
                    source: new VectorSource()
                }),
                layers = [layer],
                map = {
                    id: "ol",
                    mode: "2D",
                    getLayers: () => {
                        return layers;
                    },
                    removeLayer: (aLayer) => {
                        layers.splice(layers.indexOf(aLayer), 1);
                    }
                };

            mapCollection.clear();
            mapCollection.addMap(map, "ol", "2D");

            removeLayerFromMap(state, undefined);
            removeLayerFromMap(state, null);
            removeLayerFromMap(state, []);
            removeLayerFromMap(state, {});
            removeLayerFromMap(state, false);
            removeLayerFromMap(state, new VectorSource());
            removeLayerFromMap(state, "Layer");
            expect(map.getLayers()).to.have.lengthOf(1);
        });
    });
});
