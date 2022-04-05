/**/
import testAction from "../../../../../../../test/unittests/VueTestUtils";
import actions from "../../../store/actionsFileImport";
import importedState from "../../../store/stateFileImport";
import rawSources from "../../resources/rawSources.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import * as crs from "masterportalapi/src/crs";

const
    {importKML} = actions,
    namedProjections = [
        ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
        ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
        ["EPSG:8395", "+title=ETRS89/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
        ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
    ];

before(() => {
    crs.registerProjections(namedProjections);

    i18next.init({
        lng: "cimode",
        debug: false
    });
});

describe("src/modules/tools/fileImport/store/actionsFileImport.js", () => {
    describe("file import - file should add some features to the current draw layer", () => {
        const
            source = new VectorSource(),
            layer = new VectorLayer({
                name: name,
                source: source,
                alwaysOnTop: true
            });

        it("preset \"auto\", correct kml file, correct filename", done => {
            const payload = {layer: layer, raw: rawSources[0], filename: "TestFile1.kml"};

            testAction(importKML, payload, importedState, {}, [{
                type: "Alerting/addSingleAlert",
                payload: {
                    category: i18next.t("common:modules.alerting.categories.info"),
                    content: i18next.t("common:modules.tools.fileImport.alertingMessages.success", {filename: payload.filename})},
                dispatch: true
            }], {}, done, {"Map/projectionCode": "EPSG:25832"});
        });

        it("preset \"auto\", correct kml file, wrong filename", done => {
            const payload = {layer: layer, raw: rawSources[0], filename: "bogus_file.bog"};

            testAction(importKML, payload, importedState, {}, [{
                type: "Alerting/addSingleAlert",
                payload: {
                    category: i18next.t("common:modules.alerting.categories.error"),
                    content: i18next.t("common:modules.tools.fileImport.alertingMessages.missingFormat")
                },
                dispatch: true
            }], {}, done);
        });

        it("preset \"auto\", broken kml file, correct filename", done => {
            const payload = {layer: layer, raw: rawSources[1], filename: "TestFile1.kml"};

            testAction(importKML, payload, importedState, {}, [{
                type: "Alerting/addSingleAlert",
                payload: {
                    category: i18next.t("common:modules.alerting.categories.error"),
                    content: i18next.t("common:modules.tools.fileImport.alertingMessages.missingFileContent")
                },
                dispatch: true
            }], {}, done);
        });

        it("preset \"auto\", empty kml file, correct filename", done => {
            const payload = {layer: layer, raw: "", filename: "TestFile1.kml"};

            testAction(importKML, payload, importedState, {}, [{
                type: "Alerting/addSingleAlert",
                payload: {
                    category: i18next.t("common:modules.alerting.categories.error"),
                    content: i18next.t("common:modules.tools.fileImport.alertingMessages.missingFileContent")
                },
                dispatch: true
            }], {}, done);
        });

        it("preset \"auto\", correct gpx file, correct filename", done => {
            const payload = {layer: layer, raw: rawSources[2], filename: "TestFile1.gpx"};

            testAction(importKML, payload, importedState, {}, [{
                type: "Alerting/addSingleAlert",
                payload: {
                    category: i18next.t("common:modules.alerting.categories.info"),
                    content: i18next.t("common:modules.tools.fileImport.alertingMessages.success", {filename: payload.filename})},
                dispatch: true
            }], {}, done, {"Map/projectionCode": "EPSG:25832"});
        });

        it("preset \"auto\", correct geojson file, correct filename", done => {
            const payload = {layer: layer, raw: rawSources[3], filename: "TestFile1.json"};

            testAction(importKML, payload, importedState, {}, [{
                type: "Alerting/addSingleAlert",
                payload: {
                    category: i18next.t("common:modules.alerting.categories.info"),
                    content: i18next.t("common:modules.tools.fileImport.alertingMessages.success", {filename: payload.filename})},
                dispatch: true
            }], {}, done, {"Map/projectionCode": "EPSG:25832"});
        });

        it("preset \"gpx\", correct kml file, correct filename", done => {
            const
                payload = {layer: layer, raw: rawSources[3], filename: "TestFile1.json"},
                tmpState = {...importedState, ...{selectedFiletype: "gpx"}};

            testAction(importKML, payload, tmpState, {}, [{
                type: "Alerting/addSingleAlert",
                payload: {
                    category: i18next.t("common:modules.alerting.categories.error"),
                    content: i18next.t("common:modules.tools.fileImport.alertingMessages.missingFileContent")},
                dispatch: true
            }], {}, done);
        });
    });
});
