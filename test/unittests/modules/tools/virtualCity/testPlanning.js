import chai, {expect} from "chai";
import Planning from "@modules/tools/virtualCity/planning.js";
import TilesetLayer from "@modules/core/modelList/layer/tileset.js";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

describe("tools/virtualCity/planning", function () {
    let planning,
        server,
        scene,
        datasourceCollection;

    const planningOptions = {
            "_id": "QaDu3L3wWpjCKaL9a",
            "public": true,
            "name": "Testing",
            "description": "For testing the provided models from Hamburg",
            "mapId": "BjtEA4zwBEiZeG2CX",
            "viewpoints": [
                {
                    "distance": 1495.72117175818,
                    "cameraPosition": [
                        9.978894825333914,
                        53.534997499316766,
                        1230.5019528866933
                    ],
                    "groundPosition": [
                        9.987251978187745,
                        53.540927197816465,
                        8.005747831063161
                    ],
                    "heading": 40.01240424005808,
                    "pitch": -54.8221377599124,
                    "roll": 0.2062110469924584,
                    "animate": false,
                    "default": true
                },
                {
                    "distance": 4683.148060743276,
                    "cameraPosition": [
                        9.970687199458565,
                        53.54942568675911,
                        375.98219097089395
                    ],
                    "groundPosition": [
                        10.035469105785054,
                        53.532984111152075,
                        4.9479906590771465
                    ],
                    "heading": 113.05187804861602,
                    "pitch": -4.565098985175707,
                    "roll": 0.16992162979283587,
                    "animate": false,
                    "default": false
                }
            ],
            "planningObjects": [
                {
                    "_id": "sCJt9bADvGAbkhmuX",
                    "name": "U4_DHDNGauss3d-3.dae",
                    "type": "gltf",
                    "status": "ready",
                    "modelMeta": {
                        "longitude": 10.02346444786372,
                        "latitude": 53.534904837986566,
                        "height": 5.588562208251864,
                        "heading": 88.8,
                        "pitch": 0,
                        "roll": 0,
                        "scale": 1
                    },
                    "visibility": true,
                    "url": "/models/mNJSwCaW2kJQbyFK.glb"
                },
                {
                    "_id": "x4Wb9jS45GBpTG7ra",
                    "name": "ArchiCAD-Haeuser_25832.ifc",
                    "type": "gltf",
                    "status": "ready",
                    "modelMeta": {
                        "longitude": 9.98954845518644,
                        "latitude": 53.539293444625685,
                        "height": 1.998609298478401,
                        "heading": 0,
                        "pitch": 0,
                        "roll": 0,
                        "scale": 1
                    },
                    "visibility": true,
                    "url": "/models/279grAZoApL9cFSf.glb"
                },
                {
                    "_id": "zNaBofjqEykbrRjdd",
                    "type": "featureStore",
                    "name": "Vector",
                    "status": "ready",
                    "layerId": "nQgP6fhAxsvHtppds",
                    "visibility": true
                },
                {
                    "_id": "AjX4Fhii6wHE45LSv",
                    "type": "image",
                    "name": "Laerm-Test.png",
                    "status": "ready",
                    "visibility": true,
                    "imageMeta": {
                        "extent": [
                            568426.237,
                            5931985.674,
                            569614.713,
                            5933174.15
                        ],
                        "opacity": 1
                    },
                    "url": "/models/pQ34QDp3pxCiS4Kn.png"
                }
            ],
            "hiddenObjects": [
                "id_1",
                "id_2",
                "id_3"

            ],
            "url": "https://devel.virtualcityplanner.de",
            "id": "QaDu3L3wWpjCKaL9a"
        },
        layerOptions = {
            "id": "Spk2S5sixN6r69DFh",
            "type": "FeatureCollection",
            "hiddenStaticFeatureIds": [],
            "featureType": "simple",
            "staticRepresentation": {
                "threeDim": "static/tFgi5eRuDTx4AHNbd/tileset.json"
            },
            "vcsMeta": {
                "version": "1.0",
                "altitudeMode": "clampToGround",
                "style": {
                    "type": "vector",
                    "fill": {
                        "color": [
                            255,
                            255,
                            255,
                            0.4
                        ]
                    },
                    "stroke": {
                        "color": [
                            51,
                            153,
                            204,
                            1
                        ],
                        "width": 1.25,
                        "lineDash": null
                    },
                    "text": {
                        "font": "bold 18px sans-serif",
                        "fill": {
                            "color": [
                                51,
                                51,
                                51,
                                1
                            ]
                        },
                        "textBaseline": "bottom",
                        "offsetY": -15,
                        "offsetX": 0
                    },
                    "image": {
                        "scale": 1,
                        "fill": {
                            "color": [
                                87,
                                226,
                                63,
                                1
                            ]
                        },
                        "radius": 10,
                        "stroke": {
                            "color": [
                                0,
                                0,
                                0,
                                1
                            ],
                            "width": 1,
                            "lineDash": null
                        }
                    }
                }
            }
        };

    beforeEach(function () {
        planning = new Planning(planningOptions);
        planning.initialize();
        server = sinon.createFakeServer();
        server.respondWith(JSON.stringify(layerOptions));
        server.autoRespond = true;
        scene = new Cesium.Scene({
            canvas: document.createElement("canvas"),
            creditContainer: document.createElement("div")
        });
        datasourceCollection = new Cesium.DataSourceCollection();
        sinon.stub(Radio, "request").callsFake(function (channel, topic) {
            if (topic === "isMap3d") {
                return true;
            }
            else if (topic === "getModelsByAttributes") {
                const tilesetLayer = new TilesetLayer();

                tilesetLayer.prepareLayerObject();
                return [tilesetLayer];
            }
            else if (topic === "getMap3d") {
                return {
                    getCesiumScene () {
                        return scene;
                    },
                    getDataSources () {
                        return datasourceCollection;
                    }
                };
            }
            return null;
        });
    });

    afterEach(function () {
        sinon.restore();
        server.restore();
    });

    describe("initializePlanning", function () {
        it("should set the default viewpoint", function () {
            return planning.initializePlanning().then(()=> {
                expect(planning.defaultViewpoint).to.equal(planningOptions.viewpoints[0]);
            });
        });
        it("should setup tileset vector layer", function () {
            return planning.initializePlanning().then(()=> {
                expect(planning.planningTilesetInstances).to.have.length(1);
            });
        });
        it("should setup staticImage Layers", function () {
            return planning.initializePlanning().then(()=> {
                expect(planning.staticImageLayers).to.have.length(1);
            });
        });
        it("should add gltf entities to EntitiesLayer", function () {
            return planning.initializePlanning().then(()=> {
                expect(planning.entitiesLayer.get("customDatasource").entities.values).to.have.length(2);
            });
        });
        it("should add change listener to the Map Channel", function () {
            return planning.initializePlanning().then(()=> {
                const channelId = Radio.channel("Map")._listenId;

                expect(planning._listeningTo[channelId]).to.not.be.undefined;
            });
        });
    });

    describe("activate", function () {
        it("should set isSelected of the entitiesLayer to true", function () {
            return planning.activate().then(() => {
                expect(planning.entitiesLayer.get("isSelected")).to.be.true;
            });
        });
        it("should set isSelected of the planningTilesetInstance to true", function () {
            return planning.activate().then(() => {
                expect(planning.planningTilesetInstances[0].get("isSelected")).to.be.true;
            });
        });
    });

    describe("deactivate", function () {
        it("should set isSelected of the entitiesLayer to true", function () {
            return planning.deactivate().then(() => {
                expect(planning.entitiesLayer.get("isSelected")).to.be.false;
            });
        });
        it("should set isSelected of the planningeTilesetInstance to true", function () {
            return planning.deactivate().then(() => {
                expect(planning.planningTilesetInstances[0].get("isSelected")).to.be.false;
            });
        });
    });

    describe("gotoViewpoint", function () {
        it("should trigger Map:setCameraParameter", function () {
            return planning.initializePlanning().then(() => {
                const spy = sinon.spy(Radio, "trigger");

                planning.gotoViewpoint(0);
                expect(spy).to.have.been.calledWith("Map", "setCameraParameter", planningOptions.viewpoints[0]);

                planning.gotoViewpoint(1);
                expect(spy).to.have.been.calledWith("Map", "setCameraParameter", planningOptions.viewpoints[1]);
            });
        });

        it("should not trigger Map:setCameraParameter if the viewpoint does not exist", function () {
            return planning.initializePlanning().then(() => {
                const spy = sinon.spy(Radio, "trigger");

                planning.gotoViewpoint(12);
                expect(spy).to.not.have.been.called;
            });
        });
    });
});
