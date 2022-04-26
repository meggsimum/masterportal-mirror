import BuildSpec from "./../../../utils/buildSpec";
import {Style as OlStyle} from "ol/style.js";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import TileGrid from "ol/tilegrid/TileGrid";
import {TileWMS, ImageWMS, WMTS} from "ol/source.js";
import {Tile, Vector} from "ol/layer.js";
import {expect} from "chai";
import {EOL} from "os";
import createTestFeatures from "./testHelper";

describe("src/modules/tools/print/utils/buildSpec", function () {
    let buildSpec,
        pointFeatures,
        multiPointFeatures,
        lineStringFeatures,
        multiLineStringFeatures,
        polygonFeatures,
        multiPolygonFeatures;

    const attr = {
            "layout": "A4 Hochformat",
            "outputFormat": "pdf",
            "attributes": {
                "title": "TestTitel",
                "map": {
                    "dpi": 96,
                    "projection": "EPSG:25832",
                    "center": [561210, 5932600],
                    "scale": 40000
                }
            }
        },
        style = {
            getText: () => {
                return {
                    getText: () => "veryCreativeLabelText"
                };
            }
        };

    before(() => {
        buildSpec = BuildSpec;
        buildSpec.setAttributes(attr);
        pointFeatures = createTestFeatures("resources/testFeatures.xml");
        multiPointFeatures = createTestFeatures("resources/testFeaturesSpassAmWasserMultiPoint.xml");
        polygonFeatures = createTestFeatures("resources/testFeaturesNaturschutzPolygon.xml");
        multiPolygonFeatures = createTestFeatures("resources/testFeaturesBplanMultiPolygon.xml");
        lineStringFeatures = createTestFeatures("resources/testFeaturesVerkehrsnetzLineString.xml");
        multiLineStringFeatures = createTestFeatures("resources/testFeaturesVeloroutenMultiLineString.xml");
    });

    describe("parseAddressToString", function () {
        it("should return empty string if all keys in address object are empty", function () {
            const addressEmpty = {
                street: "",
                housenr: "",
                postalCode: "",
                city: ""
            };

            expect(buildSpec.parseAddressToString(addressEmpty)).to.equal("n.N.");
        });
        it("should return empty address object is empty", function () {
            expect(buildSpec.parseAddressToString({})).to.equal("n.N.");
        });
        it("should return empty address object is undefined", function () {
            expect(buildSpec.parseAddressToString(undefined)).to.equal("n.N.");
        });
        it("should return parsed complete address", function () {
            const address = {street: "Hufnerstraße", housenr: "7", postalCode: "22305", city: "Hamburg"};

            expect(buildSpec.parseAddressToString(address)).to.equal("Hufnerstraße 7\n 22305 Hamburg");
        });
        it("should return parsed address - no housenr", function () {
            const address = {street: "Hufnerstraße", housenr: "", postalCode: "22305", city: "Hamburg"};

            expect(buildSpec.parseAddressToString(address)).to.equal("Hufnerstraße\n 22305 Hamburg");
        });
        it("should return parsed address - no street", function () {
            const address = {street: "", housenr: "7", postalCode: "22305", city: "Hamburg"};

            expect(buildSpec.parseAddressToString(address)).to.equal("7\n 22305 Hamburg");
        });
        it("should return parsed address - no housenr, street", function () {
            const address = {street: "", housenr: "", postalCode: "22305", city: "Hamburg"};

            expect(buildSpec.parseAddressToString(address)).to.equal("22305 Hamburg");
        });
        it("should return parsed address - no housenr, street, postalCode", function () {
            const address = {street: "", housenr: "", postalCode: "", city: "Hamburg"};

            expect(buildSpec.parseAddressToString(address)).to.equal("Hamburg");
        });
    });
    describe("isOwnMetaRequest", function () {
        it("should return true if uniqueId is in uniqueIdList", function () {
            expect(buildSpec.isOwnMetaRequest(["1234", "5678"], "1234")).to.be.true;
        });
        it("should return false if uniqueId is NOT in uniqueIdList", function () {
            expect(buildSpec.isOwnMetaRequest(["1234", "5678"], "91011")).to.be.false;
        });
        it("should return false if uniqueId is undefined", function () {
            expect(buildSpec.isOwnMetaRequest(["1234", "5678"], undefined)).to.be.false;
        });
        it("should return false if uniqueIdList is undefined", function () {
            expect(buildSpec.isOwnMetaRequest(undefined, "91011")).to.be.false;
        });
        it("should return false if uniqueIdList and uniqueId is undefined", function () {
            expect(buildSpec.isOwnMetaRequest(undefined, undefined)).to.be.false;
        });
    });
    describe("removeUniqueIdFromList", function () {
        it("should remove uniqueId from uniqueIdList if uniqueId in uniqueIdList", function () {
            buildSpec.removeUniqueIdFromList(["1234", "5678"], "1234");
            expect(buildSpec.defaults.uniqueIdList).to.deep.equal(["5678"]);
        });
        it("should leave uniqueIdList if uniqueId not in uniqueIdList", function () {
            buildSpec.removeUniqueIdFromList(["1234", "5678"], "123456789");
            expect(buildSpec.defaults.uniqueIdList).to.deep.equal(["1234", "5678"]);
        });
        it("should leave uniqueIdList if uniqueId is undefined", function () {
            buildSpec.removeUniqueIdFromList(["1234", "5678"], undefined);
            expect(buildSpec.defaults.uniqueIdList).to.deep.equal(["1234", "5678"]);
        });
        it("should leave uniqueIdList if uniqueIdList is undefined", function () {
            buildSpec.removeUniqueIdFromList(undefined, "5678");
            expect(buildSpec.defaults.uniqueIdList).to.be.an("array").that.is.empty;
        });
        it("should leave uniqueIdList if uniqueIdList and uniqueId is undefined", function () {
            buildSpec.removeUniqueIdFromList(undefined, undefined);
            expect(buildSpec.defaults.uniqueIdList).to.be.an("array").that.is.empty;
        });
    });
    describe("updateMetaData", function () {
        it("should not crash if legend doesn't exist yet", function () {
            const parsedData = {
                date: "",
                orgaOwner: "",
                address: {},
                email: "",
                tel: "",
                url: ""
            };

            buildSpec.updateMetaData("testLayerName", parsedData);
            expect(buildSpec.defaults.attributes.legend).to.be.undefined;
        });
        it("should write parsedData to layer", function () {
            const parsedData = {
                    date: "1.1.2019",
                    orgaOwner: "LGV",
                    address: {},
                    email: "e@mail.de",
                    tel: "123456",
                    url: "www.url.de"
                },
                legend = {
                    "layers": [
                        {
                            "layerName": "testLayerName",
                            "values": []
                        }
                    ]
                };

            buildSpec.defaults.attributes.legend = legend;
            buildSpec.updateMetaData("testLayerName", parsedData);
            expect(buildSpec.defaults.attributes.legend.layers[0]).to.own.include({
                metaDate: "1.1.2019",
                metaOwner: "LGV",
                metaAddress: "n.N.",
                metaEmail: "e@mail.de",
                metaTel: "123456",
                metaUrl: "www.url.de"
            });
        });
    });
    describe("legendContainsPdf", function () {
        it("should return false if legend array of strings does not contain PDF", function () {
            const legend = ["foobar", "barfoo"];

            expect(buildSpec.legendContainsPdf(legend)).to.be.false;
        });
        it("should return true if legend array of strings contains PDF", function () {
            const legend = ["foobar", "some.pdf", "barfoo"];

            expect(buildSpec.legendContainsPdf(legend)).to.be.true;
        });
        it("should return false if legend array of objects does not contain PDF", function () {
            const legend = [
                {
                    graphic: "foobar",
                    name: "name_foobar"
                },
                {
                    graphic: "barfoo",
                    name: "name_barfoo"
                }];

            expect(buildSpec.legendContainsPdf(legend)).to.be.false;
        });
        it("should return true if legend array of objects contains PDF", function () {
            const legend = [
                {
                    graphic: "foobar",
                    name: "name_foobar"
                },
                {
                    graphic: "some.pdf",
                    name: "name_some_pdf"
                },
                {
                    graphic: "barfoo",
                    name: "name_barfoo"
                }];

            expect(buildSpec.legendContainsPdf(legend)).to.be.true;
        });
    });
    describe("prepareLegendAttributes", function () {
        it("should return prepared legend attributes for legend array of strings", function () {
            const legend = [
                "SomeGetLegendGraphicRequest",
                "<svg some really short svg with fill:rgb(255,0,0);></svg>",
                "barfoo.png"
            ];

            expect(buildSpec.prepareLegendAttributes(legend)).to.deep.equal([
                {
                    legendType: "wmsGetLegendGraphic",
                    geometryType: "",
                    imageUrl: "SomeGetLegendGraphicRequest",
                    color: "",
                    label: undefined
                },
                {
                    legendType: "geometry",
                    geometryType: "polygon",
                    imageUrl: "",
                    color: "rgb(255,0,0)",
                    label: undefined
                },
                {
                    legendType: "wfsImage",
                    geometryType: "",
                    imageUrl: "barfoo.png",
                    color: "",
                    label: undefined
                }
            ]);
        });
        it("should return prepared legend attributes for legend array of object", function () {
            const legend = [
                {
                    graphic: "SomeGetLegendGraphicRequest",
                    name: "name_WMS"
                },
                {
                    graphic: "<svg some really short svg with fill:rgb(255,0,0);></svg>",
                    name: "name_SVG"
                },
                {
                    graphic: "barfoo.png",
                    name: "name_WFS_Image"
                }];

            expect(buildSpec.prepareLegendAttributes(legend)).to.deep.equal([
                {
                    legendType: "wmsGetLegendGraphic",
                    geometryType: "",
                    imageUrl: "SomeGetLegendGraphicRequest",
                    color: "",
                    label: "name_WMS"
                },
                {
                    legendType: "geometry",
                    geometryType: "polygon",
                    imageUrl: "",
                    color: "rgb(255,0,0)",
                    label: "name_SVG"
                },
                {
                    legendType: "wfsImage",
                    geometryType: "",
                    imageUrl: "barfoo.png",
                    color: "",
                    label: "name_WFS_Image"
                }
            ]);
        });
    });
    describe("getFillColorFromSVG", function () {
        it("should return fillcolor from svg string in rgb", function () {
            const svg_string = "<svg foobar fill:rgb(255,0,0);/>";

            expect(buildSpec.getFillColorFromSVG(svg_string)).to.equal("rgb(255,0,0)");
        });
        it("should return fillcolor from svg string in hex", function () {
            const svg_string = "<svg foobar fill:#ff0000;/>";

            expect(buildSpec.getFillColorFromSVG(svg_string)).to.equal("#ff0000");
        });
    });
    describe("prepareGfiAttributes", function () {
        it("should create gfi attributes array", function () {
            const gfiAttributes = {
                attr1: "value1",
                attr2: "value2",
                attr3: "value3"
            };

            expect(buildSpec.prepareGfiAttributes(gfiAttributes)[0]).to.deep.own.include({
                key: "attr1",
                value: "value1"
            });
            expect(buildSpec.prepareGfiAttributes(gfiAttributes)[1]).to.deep.own.include({
                key: "attr2",
                value: "value2"
            });
            expect(buildSpec.prepareGfiAttributes(gfiAttributes)[2]).to.deep.own.include({
                key: "attr3",
                value: "value3"
            });
        });
        it("should create empty gfi attributes array for empty attributes", function () {
            expect(buildSpec.prepareGfiAttributes({})).to.be.an("array").that.is.empty;
        });
        it("should create empty gfi attributes array for undefined attributes", function () {
            expect(buildSpec.prepareGfiAttributes({})).to.be.an("array").that.is.empty;
        });
    });
    describe("buildScale", function () {
        it("should create scale that is \"1:20000\" for number input", function () {
            buildSpec.buildScale(20000);
            expect(buildSpec.defaults.attributes.scale).to.deep.include("1:20000");
        });
        it("should create scale that is \"1:undefined\" for undefined input", function () {
            buildSpec.buildScale(undefined);
            expect(buildSpec.defaults.attributes.scale).to.deep.include("1:undefined");
        });

    });
    describe("inInScaleRange", function () {
        it("Should return false if current resolution is higher than layer max resolution", function () {
            expect(buildSpec.isInScaleRange(1000, 5000, 10000)).to.be.false;
        });
        it("Should return false if current resolution is lower than layer min resolution", function () {
            expect(buildSpec.isInScaleRange(2500, 5000, 1000)).to.be.false;
        });
        it("Should return true if current resolution is lower than layer max resolution and higher than layer min resolution", function () {
            expect(buildSpec.isInScaleRange(0, Infinity, 10000)).to.be.true;
        });
        it("Should return true if current resolution is lower than layer max resolution and higher than layer min resolution", function () {
            expect(buildSpec.isInScaleRange(0, 10000, 5000)).to.be.true;
        });
        it("Should return true if current resolution the layer max resolution", function () {
            expect(buildSpec.isInScaleRange(0, 5000, 5000)).to.be.true;
        });
        it("Should return true if current resolution the layer min resolution", function () {
            expect(buildSpec.isInScaleRange(1000, 5000, 1000)).to.be.true;
        });

    });
    describe("buildWmts", () => {
        const matrixIds = [0, 1, 2],
            matrixSizes = [[1, 1], [2, 2], [4, 4]],
            origin = [0, 0],
            scales = [2, 1, 0],
            tileSize = 512,
            wmtsLayer = new Tile({
                source: new WMTS({
                    tileGrid: new WMTSTileGrid({
                        origin,
                        resolutions: [2, 1, 0],
                        matrixIds,
                        tileSize
                    }),
                    urls: ["url"],
                    matrixSet: "tileMatrixSet",
                    layer: "my_layer",
                    style: "lit",
                    requestEncoding: "REST"
                }),
                opacity: 1
            });

        wmtsLayer.getSource().matrixSizes = matrixSizes;
        wmtsLayer.getSource().scales = scales;

        it("should buildWmts", function () {
            const matrices = [];

            for (let i = 0; i < matrixIds.length; i++) {
                matrices.push({
                    identifier: matrixIds[i],
                    matrixSize: matrixSizes[i],
                    topLeftCorner: origin,
                    scaleDenominator: scales[i],
                    tileSize: [tileSize, tileSize]
                });
            }

            expect(buildSpec.buildWmts(wmtsLayer, wmtsLayer.getSource())).to.deep.own.include({
                baseURL: "url",
                opacity: 1,
                type: "WMTS",
                layer: "my_layer",
                style: "lit",
                imageFormat: "image/jpeg",
                matrixSet: "tileMatrixSet",
                matrices,
                requestEncoding: "REST"
            });
        });
    });
    describe("buildTileWms", function () {
        const tileWmsLayer = new Tile({
            source: new TileWMS({
                url: "url",
                params: {
                    LAYERS: "layer1,layer2",
                    FORMAT: "image/png",
                    TRANSPARENT: true,
                    WIDTH: 512,
                    HEIGHT: 512
                },
                tileGrid: new TileGrid({
                    extent: [510000.0, 5850000.0, 625000.4, 6000000.0],
                    resolutions: [78271.51696401172, 305.7481131406708, 152.8740565703354, 76.4370282851677, 2.3886571339114906],
                    tileSize: [512, 512]
                })
            }),
            opacity: 1
        });

        it("should buildTileWms", function () {
            expect(buildSpec.buildTileWms(tileWmsLayer)).to.deep.own.include({
                baseURL: "url",
                opacity: 1,
                type: "tiledwms",
                layers: ["layer1", "layer2"],
                imageFormat: "image/png",
                customParams: {
                    TRANSPARENT: true,
                    DPI: 200
                },
                tileSize: [512, 512]
            });
        });
    });
    describe("buildImageWms", function () {
        const imageWmsLayer = new Tile({
            source: new ImageWMS({
                url: "url",
                params: {
                    LAYERS: "layer1,layer2",
                    FORMAT: "image/png",
                    TRANSPARENT: true
                }
            }),
            opacity: 1
        });

        it("should buildImageWms", function () {
            expect(buildSpec.buildImageWms(imageWmsLayer)).to.deep.own.include({
                baseURL: "url",
                opacity: 1,
                type: "WMS",
                layers: ["layer1", "layer2"],
                imageFormat: "image/png",
                customParams: {
                    TRANSPARENT: true,
                    DPI: 200
                }
            });
        });
    });
    describe("getStyleAttributes", function () {
        const vectorLayer = new Vector();

        it("should return \"styleId\" if styleList is not available", function () {
            expect(buildSpec.getStyleAttributes(vectorLayer, pointFeatures[0], false)).to.eql(["styleId"]);
        });
    });
    describe("getFeatureStyle", function () {
        const vectorLayer = new Vector();

        it("should return array with an ol-style", function () {
            expect(buildSpec.getFeatureStyle(pointFeatures[0], vectorLayer)).to.be.an("array");
            expect(buildSpec.getFeatureStyle(pointFeatures[0], vectorLayer)[0]).to.be.an.instanceof(OlStyle);
        });
    });
    describe("addFeatureToGeoJsonList", function () {
        let list = [];

        it("should return array with point JSON", function () {
            buildSpec.addFeatureToGeoJsonList(pointFeatures[0], list, style);
            expect(list).to.be.an("array");
            expect(list[0]).to.deep.own.include({
                type: "Feature",
                properties: {
                    anzahl_plaetze_teilstationaer: "43",
                    anzahl_planbetten: "252",
                    geburtsklinik_differenziert: "Nein",
                    hinweiszeile: undefined,
                    homepage: "http://www.evangelisches-krankenhaus-alsterdorf.de",
                    kh_nummer: "20",
                    krankenhausverzeichnis: "www.krankenhausverzeichnis.de|www.google.com|www.hamburg.de",
                    name: "Evangelisches Krankenhaus Alsterdorf",
                    ort: "22337  Hamburg",
                    stand: "01.01.2016",
                    strasse: "Bodelschwinghstraße 24",
                    teilnahme_geburtsklinik: "Nein",
                    teilnahme_notversorgung: "false",
                    _label: "veryCreativeLabelText"
                },
                geometry: {
                    type: "Point",
                    coordinates: [567708.612, 5941076.513, 0]
                }
            });
        });
        it("should return array with multiPoint JSON", function () {
            list = [];

            buildSpec.addFeatureToGeoJsonList(multiPointFeatures[0], list, style);
            expect(list).to.be.an("array");
            expect(list[0]).to.deep.own.include({
                type: "Feature",
                id: "APP_SPASS_IM_UND_AM_WASSER_1",
                properties: {
                    nummer: "1",
                    name: "Ostender Teich - Sommerbad Ostende (Eintritt)",
                    kategorie: "Badeseen",
                    adresse: "Tonndorfer Strand 30, 22045 Hamburg",
                    link: "http://www.hamburg.de/sommerbad-ostende/",
                    kurztext: "Das Strandbad Ostende verfügt über einen Sandstrand und eine große Liegewiese mit Spielgeräten für Kinder",
                    _label: "veryCreativeLabelText"
                },
                geometry: {
                    type: "MultiPoint",
                    coordinates: [
                        [573983.957, 5938583.644, 0]
                    ]
                }
            });
        });
        it("should return array with lineString JSON", function () {
            list = [];

            buildSpec.addFeatureToGeoJsonList(lineStringFeatures[0], list, style);
            expect(list).to.be.an("array");
            expect(list[0]).to.deep.own.include({
                type: "Feature",
                id: "APP_STRASSENNETZ_INSPIRE_BAB_6351",
                properties: {
                    abs: "252500101 252500102",
                    abschnittslaenge: "469.0",
                    ast: "0",
                    europastrasse: "E 45",
                    gemeindeschluessel: undefined,
                    kreisschluessel: undefined,
                    laengenherkunft: undefined,
                    landesschluessel: "02",
                    strasse: "A 7",
                    strassenart: "A",
                    strassenname: "BAB A7",
                    strassennummer: "7",
                    _label: "veryCreativeLabelText"
                },
                geometry: {
                    type: "LineString",
                    coordinates: [
                        [561590.68, 5921144.34, 0],
                        [561644.084, 5921103.671, 0],
                        [561659.2, 5921092.16, 0],
                        [561716.088, 5921051.085, 0],
                        [561735.65, 5921036.96, 0],
                        [561842.988, 5920965.121, 0],
                        [561877.19, 5920942.23, 0],
                        [561979.23, 5920880.72, 0]
                    ]
                }
            });
        });
        it("should return array with multiLineString JSON", function () {
            list = [];

            buildSpec.addFeatureToGeoJsonList(multiLineStringFeatures[0], list, style);
            expect(list).to.be.an("array");
            expect(list[0]).to.deep.own.include({
                type: "Feature",
                id: "Erster_Gruener_Ring.1",
                properties: {
                    RoutenTyp: "Radfernwege",
                    Status: "Hauptroute",
                    Richtung: "Hin- und Rückweg",
                    RoutenName: "1. Grüner Ring",
                    Group_: "1. Grüner Ring_Hauptroute_Hinweg",
                    Routennummer: "0",
                    Verlauf: `${EOL}Landungsbrücken - Deichtorhallen - Planten un Blomen - Wallring - Landungsbrücken${EOL}`,
                    Routeninformation: `${EOL}Landungsbrücken - Deichtorhallen - Planten un Blomen - Wallring - Landungsbrücken${EOL}`,
                    _label: "veryCreativeLabelText"
                },
                geometry: {
                    type: "MultiLineString",
                    coordinates: [[
                        [5933240.612299999, 565065.9052999998, 0],
                        [5933242.200099999, 565024.3496000003, 0],
                        [5933243.6862, 564984.2522, 0],
                        [5933245.1719, 564955.2928999998, 0],
                        [5933239.976399999, 564871.3853000002, 0],
                        [5933232.553300001, 564780.0521999998, 0],
                        [5933229.584100001, 564741.4397, 0]
                    ]]
                }
            });
        });
        it("should return array with polygon JSON", function () {
            list = [];

            buildSpec.addFeatureToGeoJsonList(polygonFeatures[0], list, style);
            expect(list).to.be.an("array");
            expect(list[0]).to.deep.own.include({
                type: "Feature",
                id: "APP_AUSGLEICHSFLAECHEN_333876",
                properties: {
                    vorhaben: "W-006 - BPlan Marienthal 22 (Husarenweg)",
                    vorhaben_zulassung_am: "23.04.1996",
                    vorhaben_verfahrensart: "BPlan",
                    kompensationsmassnahme: "Grünfläche",
                    massnahmenstatus: "festgesetzt",
                    flaechensicherung: "k.A.",
                    flaeche: "6837.878000000001",
                    hektar: "0.6838000000000001",
                    kompensationsmassnahme_detail: "Bepflanzung mit Gehölzen und/oder Sträuchern",
                    _label: "veryCreativeLabelText"
                },
                geometry: {
                    type: "Polygon",
                    coordinates: [[
                        [573169.734, 5935998.106, 0],
                        [573174.965, 5935999.887, 0],
                        [573179.967, 5936000.464, 0],
                        [573290.094, 5935931.609, 0],
                        [573299.702, 5935890.794, 0],
                        [573290.927, 5935888.812, 0],
                        [573251.047, 5935912.837, 0],
                        [573192.37, 5935919.986, 0],
                        [573194.244, 5935935.367, 0],
                        [573176.051, 5935952.246, 0],
                        [573147.404, 5935981.236, 0],
                        [573169.734, 5935998.106, 0]
                    ]]
                }
            });
        });
        it("should return array with multiPolygon JSON", function () {
            list = [];

            buildSpec.addFeatureToGeoJsonList(multiPolygonFeatures[0], list, style);
            expect(list).to.be.an("array");
            expect(list[0]).to.deep.own.include({
                type: "Feature",
                id: "APP_PROSIN_FESTGESTELLT_1",
                properties: {
                    aenderung1: undefined,
                    aenderung2: undefined,
                    aenderung3: undefined,
                    feststellung: "11.11.1969",
                    gop: undefined,
                    goplink: undefined,
                    hotlink: "http://daten-hamburg.de/infrastruktur_bauen_wohnen/bebauungsplaene/pdfs/bplan/Bahrenfeld18.pdf                                                                                                                                                                 ",
                    hotlink_begr: "http://daten-hamburg.de/infrastruktur_bauen_wohnen/bebauungsplaene/pdfs/bplan_begr/Bahrenfeld18.pdf                                                                                                                                                            ",
                    nachricht: undefined,
                    name_png: "Bahrenfeld18.png",
                    planjahr_m: "1969",
                    planrecht: "Bahrenfeld18                                                                                                                                                                                                                                                   ",
                    staedtebaulichervertrag: undefined,
                    _label: "veryCreativeLabelText"
                },
                geometry: {
                    type: "MultiPolygon",
                    coordinates: [[[
                        [560717.814, 5936195.048, 0],
                        [560904.504, 5936154.977, 0],
                        [560987.031, 5936160.915, 0],
                        [561110.273, 5936169.785, 0],
                        [561125.876, 5936177.985, 0],
                        [561145.448, 5936138.313, 0],
                        [561186.978, 5936014.535, 0],
                        [561204.961, 5935958.995, 0],
                        [561223.729, 5935885.048, 0],
                        [561239.877, 5935821.734, 0],
                        [561086.214, 5935819.353, 0],
                        [561062.173, 5935818.616, 0],
                        [560960.89, 5935815.511, 0],
                        [560876.868, 5935811.999, 0],
                        [560865.675, 5935811.531, 0],
                        [560862.37, 5935822.577, 0],
                        [560859.9, 5935832.94, 0],
                        [560847.669, 5935884.252, 0],
                        [560843.601, 5935901.318, 0],
                        [560840.342, 5935914.697, 0],
                        [560824.457, 5935979.913, 0],
                        [560804.971, 5936059.458, 0],
                        [560787.478, 5936062.022, 0],
                        [560786.155, 5936062.216, 0],
                        [560742.375, 5936069.167, 0],
                        [560724.241, 5936122.096, 0],
                        [560719.891, 5936136.876, 0],
                        [560718.946, 5936139.051, 0],
                        [560717.814, 5936195.048, 0]
                    ]]]
                }
            });
        });
    });
    describe("convertFeatureToGeoJson", function () {
        it("should convert point feature to JSON", function () {
            expect(buildSpec.convertFeatureToGeoJson(pointFeatures[0], style)).to.deep.own.include({
                type: "Feature",
                properties: {
                    anzahl_plaetze_teilstationaer: "43",
                    anzahl_planbetten: "252",
                    geburtsklinik_differenziert: "Nein",
                    hinweiszeile: undefined,
                    homepage: "http://www.evangelisches-krankenhaus-alsterdorf.de",
                    kh_nummer: "20",
                    krankenhausverzeichnis: "www.krankenhausverzeichnis.de|www.google.com|www.hamburg.de",
                    name: "Evangelisches Krankenhaus Alsterdorf",
                    ort: "22337  Hamburg",
                    stand: "01.01.2016",
                    strasse: "Bodelschwinghstraße 24",
                    teilnahme_geburtsklinik: "Nein",
                    teilnahme_notversorgung: "false",
                    _label: "veryCreativeLabelText"
                },
                geometry: {
                    type: "Point",
                    coordinates: [567708.612, 5941076.513, 0]
                }
            });
        });
        it("should convert multiPoint feature to JSON", function () {
            expect(buildSpec.convertFeatureToGeoJson(multiPointFeatures[0], style)).to.deep.own.include({
                type: "Feature",
                id: "APP_SPASS_IM_UND_AM_WASSER_1",
                properties: {
                    nummer: "1",
                    name: "Ostender Teich - Sommerbad Ostende (Eintritt)",
                    kategorie: "Badeseen",
                    adresse: "Tonndorfer Strand 30, 22045 Hamburg",
                    link: "http://www.hamburg.de/sommerbad-ostende/",
                    kurztext: "Das Strandbad Ostende verfügt über einen Sandstrand und eine große Liegewiese mit Spielgeräten für Kinder",
                    _label: "veryCreativeLabelText"
                },
                geometry: {
                    type: "MultiPoint",
                    coordinates: [
                        [573983.957, 5938583.644, 0]
                    ]
                }
            });
        });
        it("should convert lineString feature to JSON", function () {
            expect(buildSpec.convertFeatureToGeoJson(lineStringFeatures[0], style)).to.deep.own.include({
                type: "Feature",
                id: "APP_STRASSENNETZ_INSPIRE_BAB_6351",
                properties: {
                    abs: "252500101 252500102",
                    abschnittslaenge: "469.0",
                    ast: "0",
                    europastrasse: "E 45",
                    gemeindeschluessel: undefined,
                    kreisschluessel: undefined,
                    laengenherkunft: undefined,
                    landesschluessel: "02",
                    strasse: "A 7",
                    strassenart: "A",
                    strassenname: "BAB A7",
                    strassennummer: "7",
                    _label: "veryCreativeLabelText"
                },
                geometry: {
                    type: "LineString",
                    coordinates: [
                        [561590.68, 5921144.34, 0],
                        [561644.084, 5921103.671, 0],
                        [561659.2, 5921092.16, 0],
                        [561716.088, 5921051.085, 0],
                        [561735.65, 5921036.96, 0],
                        [561842.988, 5920965.121, 0],
                        [561877.19, 5920942.23, 0],
                        [561979.23, 5920880.72, 0]
                    ]
                }
            });
        });
        it("should convert multiLineString feature to JSON", function () {
            expect(buildSpec.convertFeatureToGeoJson(multiLineStringFeatures[0], style)).to.deep.own.include({
                type: "Feature",
                id: "Erster_Gruener_Ring.1",
                properties: {
                    RoutenTyp: "Radfernwege",
                    Status: "Hauptroute",
                    Richtung: "Hin- und Rückweg",
                    RoutenName: "1. Grüner Ring",
                    Group_: "1. Grüner Ring_Hauptroute_Hinweg",
                    Routennummer: "0",
                    Verlauf: `${EOL}Landungsbrücken - Deichtorhallen - Planten un Blomen - Wallring - Landungsbrücken${EOL}`,
                    Routeninformation: `${EOL}Landungsbrücken - Deichtorhallen - Planten un Blomen - Wallring - Landungsbrücken${EOL}`,
                    _label: "veryCreativeLabelText"
                },
                geometry: {
                    type: "MultiLineString",
                    coordinates: [[
                        [5933240.612299999, 565065.9052999998, 0],
                        [5933242.200099999, 565024.3496000003, 0],
                        [5933243.6862, 564984.2522, 0],
                        [5933245.1719, 564955.2928999998, 0],
                        [5933239.976399999, 564871.3853000002, 0],
                        [5933232.553300001, 564780.0521999998, 0],
                        [5933229.584100001, 564741.4397, 0]
                    ]]
                }
            });
        });
        it("should convert polygon feature to JSON", function () {
            expect(buildSpec.convertFeatureToGeoJson(polygonFeatures[0], style)).to.deep.own.include({
                type: "Feature",
                id: "APP_AUSGLEICHSFLAECHEN_333876",
                properties: {
                    vorhaben: "W-006 - BPlan Marienthal 22 (Husarenweg)",
                    vorhaben_zulassung_am: "23.04.1996",
                    vorhaben_verfahrensart: "BPlan",
                    kompensationsmassnahme: "Grünfläche",
                    massnahmenstatus: "festgesetzt",
                    flaechensicherung: "k.A.",
                    flaeche: "6837.878000000001",
                    hektar: "0.6838000000000001",
                    kompensationsmassnahme_detail: "Bepflanzung mit Gehölzen und/oder Sträuchern",
                    _label: "veryCreativeLabelText"
                },
                geometry: {
                    type: "Polygon",
                    coordinates: [[
                        [573169.734, 5935998.106, 0],
                        [573174.965, 5935999.887, 0],
                        [573179.967, 5936000.464, 0],
                        [573290.094, 5935931.609, 0],
                        [573299.702, 5935890.794, 0],
                        [573290.927, 5935888.812, 0],
                        [573251.047, 5935912.837, 0],
                        [573192.37, 5935919.986, 0],
                        [573194.244, 5935935.367, 0],
                        [573176.051, 5935952.246, 0],
                        [573147.404, 5935981.236, 0],
                        [573169.734, 5935998.106, 0]
                    ]]
                }
            });
        });
        it("should convert multiPolygon feature to JSON", function () {
            expect(buildSpec.convertFeatureToGeoJson(multiPolygonFeatures[0], style)).to.deep.own.include({
                type: "Feature",
                id: "APP_PROSIN_FESTGESTELLT_1",
                properties: {
                    aenderung1: undefined,
                    aenderung2: undefined,
                    aenderung3: undefined,
                    feststellung: "11.11.1969",
                    gop: undefined,
                    goplink: undefined,
                    hotlink: "http://daten-hamburg.de/infrastruktur_bauen_wohnen/bebauungsplaene/pdfs/bplan/Bahrenfeld18.pdf                                                                                                                                                                 ",
                    hotlink_begr: "http://daten-hamburg.de/infrastruktur_bauen_wohnen/bebauungsplaene/pdfs/bplan_begr/Bahrenfeld18.pdf                                                                                                                                                            ",
                    nachricht: undefined,
                    name_png: "Bahrenfeld18.png",
                    planjahr_m: "1969",
                    planrecht: "Bahrenfeld18                                                                                                                                                                                                                                                   ",
                    staedtebaulichervertrag: undefined,
                    _label: "veryCreativeLabelText"
                },
                geometry: {
                    type: "MultiPolygon",
                    coordinates: [[[
                        [560717.814, 5936195.048, 0],
                        [560904.504, 5936154.977, 0],
                        [560987.031, 5936160.915, 0],
                        [561110.273, 5936169.785, 0],
                        [561125.876, 5936177.985, 0],
                        [561145.448, 5936138.313, 0],
                        [561186.978, 5936014.535, 0],
                        [561204.961, 5935958.995, 0],
                        [561223.729, 5935885.048, 0],
                        [561239.877, 5935821.734, 0],
                        [561086.214, 5935819.353, 0],
                        [561062.173, 5935818.616, 0],
                        [560960.89, 5935815.511, 0],
                        [560876.868, 5935811.999, 0],
                        [560865.675, 5935811.531, 0],
                        [560862.37, 5935822.577, 0],
                        [560859.9, 5935832.94, 0],
                        [560847.669, 5935884.252, 0],
                        [560843.601, 5935901.318, 0],
                        [560840.342, 5935914.697, 0],
                        [560824.457, 5935979.913, 0],
                        [560804.971, 5936059.458, 0],
                        [560787.478, 5936062.022, 0],
                        [560786.155, 5936062.216, 0],
                        [560742.375, 5936069.167, 0],
                        [560724.241, 5936122.096, 0],
                        [560719.891, 5936136.876, 0],
                        [560718.946, 5936139.051, 0],
                        [560717.814, 5936195.048, 0]
                    ]]]
                }
            });
        });
    });
    describe("getStylingRules", function () {
        const vectorLayer = new Vector();

        it("should return \"*\" if styleAttribute is empty string", function () {
            expect(buildSpec.getStylingRules(vectorLayer, pointFeatures[0], [""])).to.equal("*");
        });
        it("should return \"[styleId='undefined']\" if styleAttribute is \"styleId\"", function () {
            expect(buildSpec.getStylingRules(vectorLayer, pointFeatures[0], ["styleId"])).to.equal("[styleId='undefined']");
        });
        it("should return \"[kh_nummer='20']\" if styleAttribute is \"kh_nummer\"", function () {
            expect(buildSpec.getStylingRules(vectorLayer, pointFeatures[0], ["kh_nummer"])).to.equal("[kh_nummer='20']");
        });
    });
    describe("rgbStringToRgbArray", function () {
        it("should turn \"rgb(0,12,345)\" into [0,12,345]", function () {
            expect(buildSpec.rgbStringToRgbArray("rgb(0,12,345)")).to.deep.equal([0, 12, 345]);
        });
        it("should turn \"rgba(0,12,345,1)\" into [0,12,345,1]", function () {
            expect(buildSpec.rgbStringToRgbArray("rgb(0,12,345,1)")).to.deep.equal([0, 12, 345, 1]);
        });
        it("should turn \"rgba(0,12,345,.1)\" into [0,12,345,.1]", function () {
            expect(buildSpec.rgbStringToRgbArray("rgb(0,12,345,.1)")).to.deep.equal([0, 12, 345, 0.1]);
        });
        it("should turn \"rgba(0,12,345,0.1)\" into [0,12,345,01]", function () {
            expect(buildSpec.rgbStringToRgbArray("rgb(0,12,345,0.1)")).to.deep.equal([0, 12, 345, 0.1]);
        });
    });
    describe("getFontSize", function () {
        it("should return \"16\" as size", function () {
            expect(buildSpec.getFontSize("bold 16px Helvetica")).to.equals("16");
        });
        it("should return \"16\" as size", function () {
            expect(buildSpec.getFontSize("16px Helvetica")).to.equals("16");
        });
        it("should return \"16\" as size", function () {
            expect(buildSpec.getFontSize("bold 16em Helvetica")).to.equals("16");
        });
        it("should return null as size if called with undefined", function () {
            expect(buildSpec.getFontSize(undefined)).to.equals(null);
        });
        it("should return null as size if called with null", function () {
            expect(buildSpec.getFontSize(null)).to.equals(null);
        });
        it("should return null as size if called with empty string", function () {
            expect(buildSpec.getFontSize("")).to.equals(null);
        });

    });
    describe("getFontFamily", function () {
        it("should return the font family", function () {
            expect(buildSpec.getFontFamily("bold 16px Helvetica", "16")).to.equals("Helvetica");
            expect(buildSpec.getFontFamily("bold 20px Sans Serif", "20")).to.equals("Sans Serif");
            expect(buildSpec.getFontFamily("20px Sans Serif", "20")).to.equals("Sans Serif");
        });
        it("should return \"\" if called with undefined", function () {
            expect(buildSpec.getFontFamily(undefined, undefined)).to.equals("");
            expect(buildSpec.getFontFamily("", undefined)).to.equals("");
            expect(buildSpec.getFontFamily(undefined, "")).to.equals("");
        });
        it("should return \"\" if called with null", function () {
            expect(buildSpec.getFontFamily(null, null)).to.equals("");
            expect(buildSpec.getFontFamily("", null)).to.equals("");
            expect(buildSpec.getFontFamily(null, "")).to.equals("");
        });
        it("should return \"\" if called with nonsense", function () {
            expect(buildSpec.getFontFamily("asdfghjklhghggh", "16")).to.equals("");
            expect(buildSpec.getFontFamily("", "pzuouk")).to.equals("");
            expect(buildSpec.getFontFamily("16", "")).to.equals("");
        });


    });
});
