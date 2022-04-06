import sinon from "sinon";
import {expect} from "chai";

import * as actions from "../../../store/actions/actionsDownload";

import {KML, GeoJSON, GPX} from "ol/format";
import Circle from "ol/geom/Circle";
import Feature from "ol/Feature";
import Line from "ol/geom/LineString";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";
import proj4 from "proj4";

describe("src/modules/tools/draw/store/actions/actionsDownload.js", () => {
    let dispatch, state, rootGetters;

    beforeEach(() => {
        dispatch = sinon.spy();
        rootGetters = {"Maps/projectionCode": "EPSG:25832"};
        proj4.defs("EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
    });

    afterEach(sinon.restore);

    describe("convertFeatures", () => {
        // As these don't need to be transformed for this test, they are already in EPSG:4326
        beforeEach(() => {
            const line = new Line([
                    [11.553402467114491, 48.18048612894288],
                    [11.575007532544808, 48.18114662023035],
                    [11.581260790292623, 48.18657710798541]
                ]),
                point = new Point([11.557298950358712, 48.19011266676286]),
                polygon = new Polygon([[
                    [11.549606597773037, 48.17285700012215],
                    [11.600757126507961, 48.179280978813836],
                    [11.57613610823175, 48.148267667042006],
                    [11.549606597773037, 48.17285700012215]
                ]]);

            state = {
                download: {
                    features: [line, point, polygon].map(geometry => new Feature({geometry}))
                }
            };
            // features: [line, point, polygon].map(geometry => new Feature({geometry}))
            // features: [new Feature({geometry: line}), new Feature({geometry: point}), new Feature({geometry: polygon})]
            // Mocking actions
            dispatch = (actionName, payload) => {
                return new Promise((resolve, reject) => {
                    if (actionName === "transformCoordinates") {
                        const type = payload.getType();

                        if (type === "LineString" || type === "Point" || type === "Polygon") {
                            resolve(payload.getCoordinates());
                        }
                        else {
                            reject(`The geometry type ${payload.getType()} is not supported!`);
                        }
                    }
                    else {
                        reject(`The action ${actionName} is not mocked for these tests!`);
                    }
                });
            };
        });

        it("should convert features to a KML String", async () => {
            expect(await actions.convertFeatures({state, dispatch}, new KML({extractStyles: true}))).to.equal(
                "<kml xmlns=\"http://www.opengis.net/kml/2.2\" xmlns:gx=\"http://www.google.com/kml/ext/2.2\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd\"><Document><Placemark><LineString><coordinates>11.553402467114491,48.18048612894288 11.575007532544808,48.18114662023035 11.581260790292623,48.18657710798541</coordinates></LineString></Placemark><Placemark><Point><coordinates>11.557298950358712,48.19011266676286</coordinates></Point></Placemark><Placemark><Polygon><outerBoundaryIs><LinearRing><coordinates>11.549606597773037,48.17285700012215 11.600757126507961,48.179280978813836 11.57613610823175,48.148267667042006 11.549606597773037,48.17285700012215</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></Document></kml>"
            );
        });
        it("should convert features to a GeoJSON String", async () => {
            expect(await actions.convertFeatures({state, dispatch}, new GeoJSON())).to.eql(
                "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"LineString\",\"coordinates\":[[11.553402467114491,48.18048612894288],[11.575007532544808,48.18114662023035],[11.581260790292623,48.18657710798541]]},\"properties\":null},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[11.557298950358712,48.19011266676286]},\"properties\":null},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Polygon\",\"coordinates\":[[[11.549606597773037,48.17285700012215],[11.600757126507961,48.179280978813836],[11.57613610823175,48.148267667042006],[11.549606597773037,48.17285700012215]]]},\"properties\":null}]}"
            );
        });
        it("should convert features to a GPX String", async () => {
            expect(await actions.convertFeatures({state, dispatch}, new GPX())).to.equal(
                "<gpx xmlns=\"http://www.topografix.com/GPX/1/1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd\" version=\"1.1\" creator=\"OpenLayers\"><rte><rtept lat=\"48.18048612894288\" lon=\"11.553402467114491\"/><rtept lat=\"48.18114662023035\" lon=\"11.575007532544808\"/><rtept lat=\"48.18657710798541\" lon=\"11.581260790292623\"/></rte><wpt lat=\"48.19011266676286\" lon=\"11.557298950358712\"/></gpx>"
            );
        });
    });
    describe("transformCoordinates", () => {
        it("should transform point coordinates from EPSG:25832 to EPSG:4326", () => {
            const geometry = new Point([690054.1273707711, 5340593.1785796825]);

            expect(actions.transformCoordinates({dispatch, rootGetters}, geometry)).to.eql(
                [11.557298950390026, 48.19011285902384]
            );
            expect(dispatch.notCalled).to.be.true;
        });
        it("should transform line coordinates from EPSG:25832 to EPSG:4326", () => {
            const geometry = new Line([
                [689800.1275079311, 5339513.679162612],
                [691403.501642109, 5339640.679094031],
                [691848.0014020792, 5340259.803759704]
            ]);

            expect(actions.transformCoordinates({dispatch, rootGetters}, geometry)).to.eql(
                [
                    [11.553402467145743, 48.1804863212112],
                    [11.57500753257633, 48.18114681249815],
                    [11.581260790324238, 48.18657730024906]
                ]
            );
            expect(dispatch.notCalled).to.be.true;
        });
        it("should transform polygon coordinates from EPSG:25832 to EPSG:4326", () => {
            const geometry = new Polygon([[
                [689546.127645091, 5338656.429625526],
                [693324.3756048371, 5339497.804171184],
                [691609.8765306666, 5335989.431065706],
                [689546.127645091, 5338656.429625526]
            ]]);

            expect(actions.transformCoordinates({dispatch, rootGetters}, geometry)).to.eql(
                [[
                    [11.549606597804212, 48.17285719239628],
                    [11.600757126539783, 48.17928117108303],
                    [11.57613610826325, 48.1482678593347],
                    [11.549606597804212, 48.17285719239628]
                ]]
            );
            expect(dispatch.notCalled).to.be.true;
        });
        it("should not transform the geometry if it is neither a Line, Point or Polygon and return an empty Array", () => {
            const geometry = new Circle([690054.1273707711, 5340593.1785796825], 5);

            expect(actions.transformCoordinates({dispatch, rootGetters}, geometry)).to.eql([]);
            expect(dispatch.calledOnce).to.be.true;
            /* NOTE: i18next isn't actually working in tests yet, so here undefined
             * is compared with undefined - works, but has limited meaning */
            expect(dispatch.calledWith("Alerting/addSingleAlert", i18next.t("common:modules.tools.download.unknownGeometry", {geometry: geometry.getType()}))).to.be.true;
        });
    });
    describe("validateFileName", () => {
        beforeEach(() => {
            state = {
                download: {
                    fileName: "",
                    selectedFormat: ""
                }
            };
        });
        it("should return an empty String if the fileName as well as the selectedFormat are both not set yet", () => {
            expect(actions.validateFileName({state})).to.equal("");
        });
        it("should return the filename including the suffix of the file format", () => {
            state.download = {
                fileName: "foo",
                selectedFormat: "bar"
            };
            expect(actions.validateFileName({state})).to.equal("foo.bar");
        });
        it("should return the filename including the suffix of the file format if the user has added it to the filename on input", () => {
            state.download = {
                fileName: "foo.bar",
                selectedFormat: "bar"
            };
            expect(actions.validateFileName({state})).to.equal("foo.bar");
        });
        it("should return an empty String if the format but not the filename is set", () => {
            state.download.selectedFormat = "bar";
            expect(actions.validateFileName({state})).to.equal("");
        });
        it("should return an empty String if the fileName but not the format is set", () => {
            state.download.fileName = "foo";
            expect(actions.validateFileName({state})).to.equal("");

        });
    });
});
