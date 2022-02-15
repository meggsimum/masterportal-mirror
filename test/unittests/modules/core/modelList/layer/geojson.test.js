import {assert, expect} from "chai";
import GeoJsonLayerModel from "@modules/core/modelList/layer/geojson.js";
import Util from "@testUtil";
import Feature from "ol/Feature.js";
import mapCollection from "../../../../../../src/core/dataStorage/mapCollection.js";
import Map from "ol/Map";
import View from "ol/View";

describe("core/modelList/layer/geojson", function () {
    let geojsonLayer,
        geojson,
        utilModel;

    before(function () {
        mapCollection.clear();
        const map = new Map({
            id: "ol",
            mode: "2D",
            view: new View()
        });

        mapCollection.addMap(map, "ol", "2D");
        utilModel = new Util();
        geojson = utilModel.getGeoJsonTestFeatures();
        geojsonLayer = new GeoJsonLayerModel();
    });

    describe("createLayerSource", function () {
        it("should createLayerSource", function () {
            geojsonLayer.createLayerSource();

            expect(geojsonLayer.attributes).to.have.property("layerSource");
            assert.typeOf(geojsonLayer.attributes.layerSource, "Object");
            expect(geojsonLayer.attributes).not.to.have.property("clusterLayerSource");
        });
        it("should createClusterLayerSource", function () {
            geojsonLayer.set("clusterDistance", 20);
            geojsonLayer.createLayerSource();

            expect(geojsonLayer.attributes).to.have.property("layerSource");
            assert.typeOf(geojsonLayer.attributes.layerSource, "Object");
            expect(geojsonLayer.attributes).to.have.property("clusterLayerSource");
            assert.typeOf(geojsonLayer.attributes.clusterLayerSource, "Object");
        });
    });

    describe("parseDataToFeatures", function () {
        it("should return an array with the length 100", function () {
            const features = geojsonLayer.parseDataToFeatures(geojson);

            expect(features).to.have.lengthOf(100);
        });
        it("should parse geojson in default crs", function () {
            const features = geojsonLayer.parseDataToFeatures(geojson);

            expect(features[0] instanceof Feature).to.be.true;
        });
        it("should parse geojson in EPSG:25832", function () {
            const miniJson = {
                    "type": "FeatureCollection",
                    "name": "C_Schulen_2017_pr_alle",
                    "crs": {
                        "type": "name",
                        "properties": {
                            "name": "urn:ogc:def:crs:EPSG::25832"
                        }
                    },
                    "features": [
                        {
                            "type": "Feature",
                            "properties": {
                                "fid": "C_Schulen_2017_pr_alle_neu.0"
                            },
                            "geometry": {
                                "type": "Point",
                                "coordinates": [
                                    569881.56,
                                    5934722.32
                                ]
                            }
                        }
                    ]
                },
                features = geojsonLayer.parseDataToFeatures(miniJson);

            expect(features).to.have.lengthOf(1);
            expect(features[0] instanceof Feature).to.be.true;
            expect(features[0].getGeometry().getCoordinates()).to.be.an("array").that.includes(569881.56, 5934722.32);
        });
    });

    describe("getJsonProjection", function () {
        it("should return default crs", function () {
            expect(geojsonLayer.getJsonProjection(JSON.stringify(geojson))).to.be.an("string").that.equals("EPSG:4326");
        });
        it("should return json crs", function () {
            geojson.crs = {
                "type": "name",
                "properties": {
                    "name": "urn:ogc:def:crs:EPSG::25832"
                }
            };
            expect(geojsonLayer.getJsonProjection(JSON.stringify(geojson))).to.be.an("string").that.equals("urn:ogc:def:crs:EPSG::25832");
        });
    });

    describe("addId", function () {
        it("should not add an id if already set", function () {
            const features = geojsonLayer.parseDataToFeatures(geojson);

            geojsonLayer.addId(features);
            expect(features[0].getId()).to.be.an("string").that.equals("APP_ITGBM_ERHEBUNG_8734");
        });

        it("should add an id to an array of features", function () {
            const features = geojsonLayer.parseDataToFeatures(geojson);

            features[0].unset("id", {silent: true});
            geojsonLayer.addId(features);
            expect(features[0].getId()).to.be.an("string");
        });
    });
});
