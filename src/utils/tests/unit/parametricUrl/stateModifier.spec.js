import {expect} from "chai";
import {checkIsURLQueryValid, setValueToState} from "../../../parametricUrl/stateModifier";
import * as crs from "masterportalapi/src/crs";

const namedProjections = [
    ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
    ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
    ["EPSG:8395", "+title=ETRS89/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
    ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
];

describe("src/utils/parametricUrl/stateModifier.js", () => {
    describe("setValueToState", () => {
        it("setValueToState does not react if key is not an array", () => {
            const state = {
                    urlParams: {},
                    Tools: {
                        Measure: {
                            active: false
                        }
                    }
                },
                value = "true";

            setValueToState(state, null, value);
            expect(state.Tools.Measure.active).to.be.equals(false);

            setValueToState(state, undefined, value);
            expect(state.Tools.Measure.active).to.be.equals(false);

            setValueToState(state, {}, value);
            expect(state.Tools.Measure.active).to.be.equals(false);
        });
        it("setValueToState sets a boolean", async () => {
            const key = "Tools/Measure/active",
                state = {
                    urlParams: {},
                    Tools: {
                        Measure: {
                            active: false
                        }
                    }
                };

            await setValueToState(state, key, "true");
            expect(state.Tools.Measure.active).to.be.equals(true);

            state.Tools.Measure.active = false;
            await setValueToState(state, key, true);
            expect(state.Tools.Measure.active).to.be.equals(true);

            await setValueToState(state, key, "false");
            expect(state.Tools.Measure.active).to.be.equals(false);

            state.Tools.Measure.active = true;
            await setValueToState(state, key, false);
            expect(state.Tools.Measure.active).to.be.equals(false);
        });


        /**
        * These kinds of params are possible for starting tool draw:
        * It doesn't matter if it is controlled by vuex state or by backbone.
        *  ?Tools/Draw/active=true
        *  ?tools/Draw/active=true
        *  ?tools/draw/active=true
        *  ?Draw/active=true
        *  ?draw/active=true
        *  ?Draw/active
        *  ?draw/active
        *  ?isinitopen=draw
        *  ?isinitopen=Draw
        *  ?startupmodul=Draw
        *  ?startupmodul=draw
        */
        describe("test start tool by urlparams", () => {
            it("setValueToState sets tool active with param without incomplete key, no value or key has not expected case", async () => {
                let key = "Tools/Measure/active";
                const state = {
                    urlParams: {},
                    Tools: {
                        Measure: {
                            active: false
                        }
                    }
                };

                await setValueToState(state, key, "true");
                expect(state.Tools.Measure.active).to.be.equals(true);

                state.Tools.Measure.active = false;
                key = "tools/Measure/active";
                await setValueToState(state, key, "true");
                expect(state.Tools.Measure.active).to.be.equals(true);

                state.Tools.Measure.active = false;
                key = "tools/Measure/active";
                await setValueToState(state, key, "");
                expect(state.Tools.Measure.active).to.be.equals(true);

                state.Tools.Measure.active = false;
                key = "tools/measure/active";
                await setValueToState(state, key, "true");
                expect(state.Tools.Measure.active).to.be.equals(true);

                state.Tools.Measure.active = false;
                key = "Measure/active";
                await setValueToState(state, key, "true");
                expect(state.Tools.Measure.active).to.be.equals(true);

                state.Tools.Measure.active = false;
                key = "measure/active";
                await setValueToState(state, key, "true");
                expect(state.Tools.Measure.active).to.be.equals(true);

                state.Tools.Measure.active = false;
                key = "Measure/active";
                await setValueToState(state, key, "");
                expect(state.Tools.Measure.active).to.be.equals(true);

                state.Tools.Measure.active = false;
                key = "measure/active";
                await setValueToState(state, key, "");
                expect(state.Tools.Measure.active).to.be.equals(true);

                state.Tools.Measure.active = false;
                key = "measure";
                await setValueToState(state, key, "true");
                expect(state.Tools.Measure.active).to.be.equals(true);

            });
            it("setValueToState with isinitopen, tool is in state", async () => {
                const key = "isinitopen",
                    state = {
                        urlParams: {},
                        Tools: {
                            Measure: {
                                active: false
                            }
                        }
                    };
                let value = "measure";

                await setValueToState(state, key, value);
                expect(state.Tools.Measure.active).to.be.equals(true);
                expect(state.urlParams[key]).to.be.equals(undefined);

                state.Tools.Measure.active = false;
                state.isinitopen = undefined;
                value = "Measure";
                await setValueToState(state, key, value);
                expect(state.Tools.Measure.active).to.be.equals(true);
                expect(state.urlParams[key]).to.be.equals(undefined);

            });
            it("setValueToState with isinitopen, tool is not in state", async () => {
                const key = "isinitopen",
                    state = {
                        urlParams: {},
                        Tools: {
                        }
                    };
                let value = "print";

                await setValueToState(state, key, value);
                expect(state.Tools.Print).to.be.equals(undefined);
                expect(state.urlParams[key]).to.be.equals("print");

                state.Tools = {};
                state.urlParams = {};
                state.isinitopen = undefined;
                value = "Print";
                await setValueToState(state, key, value);
                expect(state.Tools.Print).to.be.equals(undefined);
                expect(state.urlParams[key]).to.be.equals("Print");
            });


            it("setValueToState with startupmodul, tool is in state", async () => {
                const key = "startupmodul",
                    state = {
                        urlParams: {},
                        Tools: {
                            Measure: {
                                active: false
                            }
                        }
                    };
                let value = "measure";

                await setValueToState(state, key, value);
                expect(state.Tools.Measure.active).to.be.equals(true);
                expect(state.urlParams.isinitopen).to.be.equals(undefined);

                state.Tools.Measure.active = false;
                state.startupmodul = undefined;
                value = "Measure";
                await setValueToState(state, key, value);
                expect(state.Tools.Measure.active).to.be.equals(true);
                expect(state.urlParams.isinitopen).to.be.equals(undefined);

            });
            it("setValueToState with startupmodul, tool is not in state", async () => {
                const key = "startupmodul",
                    state = {
                        urlParams: {},
                        Tools: {
                        }
                    };
                let value = "print";

                await setValueToState(state, key, value);
                expect(state.Tools.Print).to.be.equals(undefined);
                expect(state.urlParams.isinitopen).to.be.equals("print");

                state.Tools.Print = undefined;
                state.urlParams.isinitopen = undefined;
                value = "Print";
                await setValueToState(state, key, value);
                expect(state.Tools.Print).to.be.equals(undefined);
                expect(state.urlParams.isinitopen).to.be.equals("Print");
            });
        });

        // describe("test start tool by urlparams", () => {
        it("?Map/center or only center as param-key is set to state", async () => {
            let key = "Map/center",
                valueAsString = "[553925,5931898]";
            const state = {
                    urlParams: {},
                    Map: {
                        center: [0, 0]
                    }
                },
                value = [553925, 5931898];

            await setValueToState(state, key, valueAsString);
            expect(state.Map.center).to.be.deep.equals(value);

            state.Map.center = [0, 0];
            key = "center";
            await setValueToState(state, key, valueAsString);
            expect(state.Map.center).to.be.deep.equals(value);

            state.Map.center = [0, 0];
            key = "Map/center";
            valueAsString = "553925,5931898";
            await setValueToState(state, key, valueAsString);
            expect(state.Map.center).to.be.deep.equals(value);

            state.Map.center = [0, 0];
            key = "center";
            valueAsString = "553925,5931898";
            await setValueToState(state, key, valueAsString);
            expect(state.Map.center).to.be.deep.equals(value);
        });
        it("test param marker and MapMarker, coordinates as array or comma separated", async () => {
            let key = "marker",
                valueAsString = "[553925,5931898]";
            const state = {
                    urlParams: {},
                    MapMarker: {
                        coordinates: [0, 0]
                    }
                },
                value = [553925, 5931898];

            await setValueToState(state, key, valueAsString);
            expect(state.MapMarker.coordinates).to.be.deep.equals(value);

            state.MapMarker.coordinates = [0, 0];
            key = "MapMarker";
            await setValueToState(state, key, valueAsString);
            expect(state.MapMarker.coordinates).to.be.deep.equals(value);

            state.MapMarker.coordinates = [0, 0];
            key = "mapmarker";
            await setValueToState(state, key, valueAsString);
            expect(state.MapMarker.coordinates).to.be.deep.equals(value);

            state.MapMarker.coordinates = [0, 0];
            key = "mapmarker";
            valueAsString = "553925,5931898";
            await setValueToState(state, key, valueAsString);
            expect(state.MapMarker.coordinates).to.be.deep.equals(value);
        });
        it("test param marker with projection", async () => {
            crs.registerProjections(namedProjections);

            // ?Map/projection=EPSG:8395&marker=[3565836,5945355]
            const key = "marker",
                valueAsString = "[3565836,5945355]",
                state = {
                    urlParams: {},
                    MapMarker: {
                        coordinates: [0, 0]
                    }
                },
                value = [3565836, 5945355];

            await setValueToState(state, key, valueAsString);
            await setValueToState(state, "Map/projection", "EPSG:8395");
            expect(state.MapMarker.coordinates).to.be.deep.equals(value);
            expect(state.urlParams.projection.name).to.be.deep.equals("http://www.opengis.net/gml/srs/epsg.xml#8395");
        });
        it("test param zoomLevel", async () => {
            let key = "zoomLevel";
            const valueAsString = "5",
                state = {
                    urlParams: {},
                    Map: {
                        zoomLevel: 2
                    }
                };

            await setValueToState(state, key, valueAsString);
            expect(state.Map.zoomLevel).to.be.equals(5);

            state.Map.zoomLevel = 2;
            key = "zoomlevel";
            await setValueToState(state, key, valueAsString);
            expect(state.Map.zoomLevel).to.be.deep.equals(5);

        });
        it("test param map", async () => {
            let key = "map",
                valueAsString = "3D";
            const state = {
                urlParams: {},
                Map: {
                    mapMode: "2D"
                }
            };

            await setValueToState(state, key, valueAsString);
            expect(state.Map.mapMode).to.be.equals("3D");

            key = "mapmode";
            valueAsString = "2D";
            await setValueToState(state, key, valueAsString);
            expect(state.Map.mapMode).to.be.equals("2D");

            key = "map/mapmode";
            valueAsString = "3D";
            await setValueToState(state, key, valueAsString);
            expect(state.Map.mapMode).to.be.equals("3D");

        });
        it("test param layerIds", async () => {
            let key = "Map/layerIds";
            const state = {
                    urlParams: {},
                    Map: {
                        layerIds: null
                    }
                },
                valueAsString = "1711,20622";

            await setValueToState(state, key, valueAsString);
            expect(state.Map.layerIds).to.be.deep.equals([1711, 20622]);

            key = "layerIds";
            await setValueToState(state, key, valueAsString);
            expect(state.Map.layerIds).to.be.deep.equals([1711, 20622]);

            key = "layerids";
            await setValueToState(state, key, valueAsString);
            expect(state.Map.layerIds).to.be.deep.equals([1711, 20622]);

        });
        it("test param featureid", async () => {
            let key = "featureid";
            const state = {
                    urlParams: {}
                },
                valueAsString = "1,2",
                result = [1, 2];

            await setValueToState(state, key, valueAsString);
            expect(state.urlParams["Map/zoomToFeatureId"]).to.be.deep.equals(result);

            key = "zoomToFeatureId";
            await setValueToState(state, key, valueAsString);
            expect(state.urlParams["Map/zoomToFeatureId"]).to.be.deep.equals(result);

            key = "Map/zoomTofeatureId";
            await setValueToState(state, key, valueAsString);
            expect(state.urlParams["Map/zoomToFeatureId"]).to.be.deep.equals(result);

        });
        it("test param featureViaUrl", async () => {
            let key = "featureViaURL";
            const state = {
                    urlParams: {}
                },
                valueAsString = "[{\"layerId\":\"4020\",\"features\":[{\"coordinates\":[[[10.05,53.5],[10,53.5],[9.80,53.55],[10,53.55]],[[10.072,53.492],[9.92,53.492],[9.736,53.558],[10.008,53.558]]],\"label\":\"TestMultiPolygon\"}]}]";

            await setValueToState(state, key, valueAsString);
            expect(state.urlParams.featureViaURL).to.be.equals(valueAsString);

            key = "featureViaUrl";
            await setValueToState(state, key, valueAsString);
            expect(state.urlParams.featureViaURL).to.be.equals(valueAsString);
        });
        it("test param highlightfeature", async () => {
            let key = "highlightfeature";
            const state = {
                    urlParams: {}
                },
                valueAsString = "8712,APP_STAATLICHE_SCHULEN_452280";

            await setValueToState(state, key, valueAsString);
            expect(state.urlParams["Map/highlightFeature"]).to.be.equals(valueAsString);

            key = "Map/highlightFeature";
            await setValueToState(state, key, valueAsString);
            expect(state.urlParams["Map/highlightFeature"]).to.be.equals(valueAsString);
        });
        it("test param uiStyle", async () => {
            let key = "uiStyle";
            const state = {
                    urlParams: {}
                },
                valueAsString = "SIMPLE";

            await setValueToState(state, key, valueAsString);
            expect(state.urlParams.uiStyle).to.be.equals(valueAsString);

            key = "style";
            await setValueToState(state, key, valueAsString);
            expect(state.urlParams.uiStyle).to.be.equals(valueAsString);
        });
        it("test param Map/zoomToExtent", async () => {
            let key = "Map/zoomToExtent";
            const state = {
                    urlParams: {}
                },
                valueAsString = "510000,5850000,625000,6000000",
                result = [510000, 5850000, 625000, 6000000];

            await setValueToState(state, key, valueAsString);
            expect(state.urlParams["Map/zoomToExtent"]).to.be.deep.equals(result);

            key = "zoomToExtent";
            await setValueToState(state, key, valueAsString);
            expect(state.urlParams["Map/zoomToExtent"]).to.be.deep.equals(result);
        });
        it("test param Map/zoomToGeometry", async () => {
            let key = "Map/zoomToGeometry";
            const state = {
                    urlParams: {}
                },
                valueAsString = "altona";

            await setValueToState(state, key, valueAsString);
            expect(state.urlParams["Map/zoomToGeometry"]).to.be.equals(valueAsString);

            key = "zoomToGeometry";
            await setValueToState(state, key, valueAsString);
            expect(state.urlParams["Map/zoomToGeometry"]).to.be.equals(valueAsString);

            key = "bezirk";
            await setValueToState(state, key, valueAsString);
            expect(state.urlParams["Map/zoomToGeometry"]).to.be.equals(valueAsString);
        });
        it("test param Map/mdid", async () => {
            let key = "Map/mdid";
            const state = {
                    urlParams: {}
                },
                valueAsString = "F35EAC11-C236-429F-B1BF-751C0C18E8B7";

            await setValueToState(state, key, valueAsString);
            expect(state.urlParams["Map/mdId"]).to.be.equals(valueAsString);

            key = "mdId";
            await setValueToState(state, key, valueAsString);
            expect(state.urlParams["Map/mdId"]).to.be.equals(valueAsString);
        });
        it("test param filter", async () => {
            const key = "filter",
                state = {
                    urlParams: {}
                },
                valueAsString = "[{\"name\":\"Alle Schulen\",\"isSelected\":true})";

            await setValueToState(state, key, valueAsString);
            expect(state.urlParams.filter).to.be.equals(valueAsString);
        });

        describe("UrlParam brwId, brwlayername", () => {
            it("test param brwId", async () => {
                const key = "brwId",
                    state = {
                        urlParams: {}
                    },
                    valueAsString = "01510241";

                await setValueToState(state, key, valueAsString);
                expect(state.urlParams.brwId).to.be.equals(valueAsString);
            });
            it("test param brwlayername", async () => {
                const key = "brwlayername",
                    state = {
                        urlParams: {}
                    },
                    valueAsString = "31.12.2017";

                await setValueToState(state, key, valueAsString);
                expect(state.urlParams.brwLayerName).to.be.equals(valueAsString);
            });
        });
    });
    describe("checkIsURLQueryValid", function () {
        it("should be false by html input", function () {
            const query = "zoomtogeometry=<h3>Please%20login%20to%20proceed</h3>%20<form>Username:<br><input%20type%3D'username'%20name%3D'username'></br>Password:<br><input%20type%3D'password'%20name%3D'password'></br><br><input%20type%3D'submit'%20value%3D'Logon'></br>";

            expect(checkIsURLQueryValid(query)).to.be.false;
        });
        it("should be false by iframe html input", function () {
            const query = "zoomtogeometry=<iframe%20src%3dhttps://example.com%20/>";

            expect(checkIsURLQueryValid(query)).to.be.false;
        });
        it("should be false by iframe with content input", function () {
            const query = "zoomtogeometry=<iframe%20src%3dhttps://example.com>test</iframe%20>";

            expect(checkIsURLQueryValid(query)).to.be.false;
        });
        it("should be true by zoomtogeometry string without html input", function () {
            const query = "zoomtogeometry=bergedorf";

            expect(checkIsURLQueryValid(query)).to.be.true;
        });
        it("should be true by isinitopen string without html input", function () {
            const query = "isinitopen=measure";

            expect(checkIsURLQueryValid(query)).to.be.true;
        });
        it("should be true by a large string without html input", function () {
            const query = "layerIDs=13032,12884,12883,16100,453,8712,1711&visibility=true,true,true,true,true,true,true&transparency=0,0,0,0,0,0,0&center=569591.1587110137,5939300.381241594&zoomlevel=5";

            expect(checkIsURLQueryValid(query)).to.be.true;
        });
    });
});
