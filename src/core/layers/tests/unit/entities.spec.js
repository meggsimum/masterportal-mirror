import {expect} from "chai";
import sinon from "sinon";
import EntitiesLayer from "../../entities";
import store from "../../../../app-store";

describe("src/core/layers/entities.js", () => {
    let attributes, map3D, dataSources,
        dataSourcesContent,
        dataSourceValues;

    before(() => {
        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D"
        };

        dataSources = {
            getByName: (name) => {
                return dataSourcesContent[name] ? [dataSourcesContent[name]] : [];
            },
            add: async (dataSource) => {
                dataSourcesContent[dataSource.name] = dataSource;
                return Promise.resolve(dataSource).then(function (value) {
                    return value;
                });
            }
        };
        map3D = {
            id: "1",
            mode: "3D",
            getDataSources: () => dataSources
        };
        mapCollection.addMap(map, "2D");
        mapCollection.addMap(map3D, "3D");
    });
    beforeEach(() => {
        dataSourcesContent = {};
        dataSourceValues = [];
        global.Cesium = {};
        global.Cesium.Cartesian3 = {};
        global.Cesium.Transforms = {};
        global.Cesium.Cartesian3.fromDegrees = sinon.stub();
        global.Cesium.HeadingPitchRoll = sinon.stub();
        global.Cesium.Transforms.headingPitchRollQuaternion = sinon.stub();
        global.Cesium.CustomDataSource = function CustomDataSource (name) {
            this.name = name;
            this.entities = {
                values: dataSourceValues,
                add: (toAdd) => {
                    dataSourceValues.push(toAdd);
                    this.length++;
                    return toAdd;
                },
                contains: (value) => dataSourceValues.includes(value)
            };
            this.length = 0;
            this.forEach = () => dataSourceValues.forEach;
        };
        attributes = {
            id: "4003",
            name: "EntitiesLayer",
            typ: "Entities3D",
            entities: [
                {
                    "url": "https://daten-hamburg.de/gdi3d/datasource-data/Simple_Building.glb",
                    "attributes": {
                        "name": "einfaches Haus in Planten und Blomen"
                    },
                    "latitude": 53.5631,
                    "longitude": 9.9800,
                    "height": 16,
                    "heading": 0,
                    "pitch": 0,
                    "roll": 0,
                    "scale": 5,
                    "allowPicking": true,
                    "show": true
                }
            ]
        };
        store.state.Maps.mode = "3D";
        store.getters = {
            "Maps/mode": store.state.Maps.mode
        };
    });

    afterEach(() => {
        sinon.restore();
        global.Cesium = null;
        store.state.Maps.mode = "2D";
    });

    /**
     * Checks the layer for attributes content.
     * @param {Object} layer the layer
     * @param {Object} entitiesLayer the entitiesLayer
     * @param {Object} attrs the attributes
     * @returns {void}
     */
    function checkLayer (layer, entitiesLayer, attrs) {
        expect(layer).not.to.be.undefined;
        expect(entitiesLayer.get("name")).to.be.equals(attrs.name);
        expect(entitiesLayer.get("id")).to.be.equals(attrs.id);
        expect(entitiesLayer.get("typ")).to.be.equals(attrs.typ);
    }

    it("createLayer shall create an entities layer", function () {
        const entitiesLayer = new EntitiesLayer(attributes),
            layer = entitiesLayer.get("layer");

        checkLayer(layer, entitiesLayer, attributes);
        expect(entitiesLayer.get("isVisibleInMap")).to.equal(false);
    });
    it("createLayer shall create a visible entities layer", function () {
        attributes.isSelected = true;
        const entitiesLayer = new EntitiesLayer(attributes),
            layer = entitiesLayer.get("layer");

        checkLayer(layer, entitiesLayer, attributes);
        expect(entitiesLayer.get("isVisibleInMap")).to.equal(true);
    });
    it("setVisible shall call setIsSelected", function () {
        const entitiesLayer = new EntitiesLayer(attributes),
            layer = entitiesLayer.get("layer"),
            setIsSelectedSpy = sinon.spy(EntitiesLayer.prototype, "setIsSelected");

        entitiesLayer.setVisible(true);
        checkLayer(layer, entitiesLayer, attributes);
        expect(setIsSelectedSpy.calledOnce).to.equal(true);
        expect(setIsSelectedSpy.calledWithMatch(true)).to.equal(true);
    });
    it("setIsSelected true shall set isVisibleInMap", function () {
        const entitiesLayer = new EntitiesLayer(attributes),
            layer = entitiesLayer.get("layer");

        entitiesLayer.setIsSelected(true);
        checkLayer(layer, entitiesLayer, attributes);
        expect(entitiesLayer.get("isVisibleInMap")).to.equal(true);
    });
    it("setIsVisibleInMap shall set isVisibleInMap", function () {
        const entitiesLayer = new EntitiesLayer(attributes),
            layer = entitiesLayer.get("layer");

        entitiesLayer.setIsVisibleInMap(true);
        checkLayer(layer, entitiesLayer, attributes);
        expect(entitiesLayer.get("isVisibleInMap")).to.equal(true);

        entitiesLayer.setIsVisibleInMap(false);
        expect(entitiesLayer.get("isVisibleInMap")).to.equal(false);
    });
});


