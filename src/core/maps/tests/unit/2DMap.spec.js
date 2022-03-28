/* import "../../2DMap";
import Map from "ol/Map";
import View from "ol/View";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import LayerGroup from "ol/layer/Group";
import mapCollection from "../../../../core/dataStorage/mapCollection.js";
import {expect} from "chai";

describe("src/core/maps/2DMap.js", () => {
    const layer1 = new VectorLayer({
            id: "Donald",
            name: "Duck1",
            source: new VectorSource()
        }),
        layer2 = new VectorLayer({
            id: "Dagobert",
            name: "Duck2",
            alwaysOnTop: true,
            source: new VectorSource()
        }),
        layer3 = new VectorLayer({
            id: "Darkwing",
            name: "Duck3",
            source: new VectorSource()
        }),
        layer4 = new VectorLayer({
            id: "Daisy",
            name: "Duck4",
            source: new VectorSource()
        }),
        layer5 = new VectorLayer({
            id: "Tick",
            name: "Duck5",
            source: new VectorSource()
        }),
        layer6 = new VectorLayer({
            id: "Trick",
            name: "Duck6",
            source: new VectorSource()
        }),
        layer7 = new VectorLayer({
            id: "Track",
            name: "Duck7",
            source: new VectorSource()
        }),
        layer8 = new LayerGroup({
            id: "Tick_Trick_Track",
            name: "Duck_group",
            layers: [layer5, layer6, layer7]
        });
    let map;

    beforeEach(() => {
        mapCollection.clear();
        map = new Map({
            id: "ol",
            mode: "2D",
            view: new View()
        });

        mapCollection.addMap(map, "ol", "2D");
    });

    describe("addLayer", () => {
        it("Set layer2 with alwaysOnTop on top", () => {
            const zIndexes = [0, 3, 2],
                ids = ["Donald", "Dagobert", "Darkwing"];

            map.addLayer(layer1, 0);
            map.addLayer(layer2, 1);
            map.addLayer(layer3, 2);

            map.getLayers().forEach((layer, index) => {
                expect(layer.getZIndex()).equals(zIndexes[index]);
                expect(layer.get("id")).equals(ids[index]);
            });
        });
    });

    describe("addLayerToIndex", () => {
        it("Set layer2 with alwaysOnTop on top", () => {
            const zIndexes = [0, 3, 2],
                ids = ["Donald", "Dagobert", "Darkwing"];

            map.addLayerToIndex(layer1, 0);
            map.addLayerToIndex(layer2, 1);
            map.addLayerToIndex(layer3, 2);

            map.getLayers().forEach((layer, index) => {
                expect(layer.getZIndex()).equals(zIndexes[index]);
                expect(layer.get("id")).equals(ids[index]);
            });
        });
    });

    describe("addLayerOnTop", () => {
        it("Set layer3 on top and then layer2 with alwaysOnTop on top", () => {
            const zIndexes = [0, 3, 2],
                ids = ["Donald", "Dagobert", "Darkwing"];

            map.addLayer(layer1);
            map.addLayer(layer2);
            map.addLayerOnTop(layer3);

            map.getLayers().forEach((layer, index) => {
                expect(layer.getZIndex()).equals(zIndexes[index]);
                expect(layer.get("id")).equals(ids[index]);
            });
        });
    });

    describe("addNewLayerIfNotExists", () => {
        it("create new layer with alwaysOnTop: true", () => {
            const zIndexes = [2, 1],
                ids = ["Tick, Trick und Track", "Donald"];

            map.addNewLayerIfNotExists("Tick, Trick und Track");
            map.addLayer(layer1);

            map.getLayers().forEach((layer, index) => {
                expect(layer.getZIndex()).equals(zIndexes[index]);
                expect(layer.get("id")).equals(ids[index]);
            });
        });

        it("create new layer with alwaysOnTop: false", () => {
            const zIndexes = [0, 1, 2],
                ids = ["Donald", "Tick, Trick und Track"];

            map.addLayer(layer1);
            map.addNewLayerIfNotExists("Tick, Trick und Track", false);

            map.getLayers().forEach((layer, index) => {
                expect(layer.getZIndex()).equals(zIndexes[index]);
                expect(layer.get("id")).equals(ids[index]);
            });
        });
    });

    describe("getLayerById", () => {
        it("Returns the layer with the correct id", () => {
            map.addLayer(layer1);
            map.addLayer(layer2);
            map.addLayer(layer3);
            map.addLayer(layer4);

            expect(map.getLayerById("Donald")).equals(layer1);
            expect(map.getLayerById("Dagobert")).equals(layer2);
            expect(map.getLayerById("Darkwing")).equals(layer3);
            expect(map.getLayerById("Daisy")).equals(layer4);
        });

        it("Returns the layer from groupLayer with the correct id", () => {
            map.addLayer(layer1);
            map.addLayer(layer8);

            expect(map.getLayerById("Donald")).equals(layer1);
            expect(map.getLayerById("Tick")).equals(layer5);
            expect(map.getLayerById("Trick")).equals(layer6);
            expect(map.getLayerById("Track")).equals(layer7);
        });

        it("Returns no groupLayer if searchInGroupLayers= false", () => {
            map.addLayer(layer1);
            map.addLayer(layer8);

            expect(map.getLayerById("Donald")).equals(layer1);
            expect(map.getLayerById("Tick", false)).equals(null);
            expect(map.getLayerById("Trick", false)).equals(null);
            expect(map.getLayerById("Track", false)).equals(null);
        });
    });

    describe("getLayerByName", () => {
        it("Returns the layer with the correct name", () => {
            map.addLayer(layer1);
            map.addLayer(layer2);
            map.addLayer(layer3);
            map.addLayer(layer4);

            expect(map.getLayerByName("Duck1")).equals(layer1);
            expect(map.getLayerByName("Duck2")).equals(layer2);
            expect(map.getLayerByName("Duck3")).equals(layer3);
            expect(map.getLayerByName("Duck4")).equals(layer4);
        });
    });
});
 */
