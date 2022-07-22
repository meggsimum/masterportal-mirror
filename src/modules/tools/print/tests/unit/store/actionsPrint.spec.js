import testAction from "../../../../../../../test/unittests/VueTestUtils";
import actions from "../../../store/actionsPrint";
import VectorLayer from "ol/layer/Vector.js";
import sinon from "sinon";

const {activatePrintStarted, getMetaDataForPrint, createPrintJob, migratePayload, waitForPrintJob, waitForPrintJobSuccess, downloadFile} = actions;

describe("src/modules/tools/print/store/actionsPrint", function () {
    describe("activatePrintStarted", function () {
        it("should set activatePrintStarted to true", done => {
            // action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done, rootGetters
            testAction(activatePrintStarted, undefined, {}, {}, [
                {type: "setPrintStarted", payload: true, commit: true}
            ], {}, done);
        });
    });

    describe("getMetaDataForPrint", function () {
        it("should get metadata", done => {
            const payload = {
                    getResponse: () => {
                        return true;
                    },
                    keyList: ["date", "orgaOwner", "address", "email", "tel", "url"],
                    layer: new VectorLayer(),
                    layerName: "Grenze der Metropolregion Hamburg",
                    metaId: "76E7AE5D-9C06-48A5-BC7F-94DDBF62745C",
                    uniqueId: "89"
                },
                useProxy = [
                    "http://www.sh-mis.schleswig-holstein.de/soapServices/CSWStartup",
                    "http://zebis.landsh.de/metadaten/servants/de/disy/preludio2/service/cat/csw/v_2_0_2/GetRecordByIdServant$Get",
                    "https://mis.bkg.bund.de/csw",
                    "https://www.geodaten-mv.de/soapServices/CSWStartup",
                    "https://metaver.de/csw"
                ];

            // action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done, rootGetters
            testAction(getMetaDataForPrint, payload, {}, {}, [], {}, done, {"metadata.useProxy": useProxy});
        });
    });
    describe("createPrintJob", function () {
        it("should create a printJob", done => {
            const defaults = {
                    attributes: {title: "Mein Titel", map: {}, scale: "1:60000", showGfi: false, gfi: {}},
                    layout: "A4 Hochformat",
                    outputFilename: "Ausdruck",
                    outputFormat: "pdf",
                    uniqueIdList: [],
                    visibleLayerIds: ["453", "8712", "1711"]
                },
                data = {
                    ownloadURL: "/mapfish_print_internet/print/report/2ca7f8ab-24f0-48e1-9fd7-a6fe3349ccd0@89c12004-d327-4fb1-88a3-2a3332fa36a0",
                    ref: "2ca7f8ab-24f0-48e1-9fd7-a6fe3349ccd0@89c12004-d327-4fb1-88a3-2a3332fa36a0",
                    statusURL: "/mapfish_print_internet/print/status/2ca7f8ab-24f0-48e1-9fd7-a6fe3349ccd0@89c12004-d327-4fb1-88a3-2a3332fa36a0.json"
                },
                payload = {
                    payload: encodeURIComponent(JSON.stringify(defaults)),
                    getResponse: () => {
                        return {data};
                    }
                },
                state = {
                    serviceUrl: "https://geodienste.hamburg.de/mapfish_print_internet/print/",
                    printAppId: "master",
                    currentFormat: "A4 Hochformat"
                };

            // action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done, rootGetters
            testAction(createPrintJob, payload, state, {}, [
                {type: "setPrintFileReady", payload: false, commit: true},
                {type: "setProgressWidth", payload: "width: 50%", commit: true},
                {type: "waitForPrintJob", payload: data, dispatch: true}
            ], {}, done);
        });
    });
    describe("migratePayload", function () {
        it("should migrate the for mapfish generated JSON to plotservice", done => {
            const state = {
                    outputFilename: "",
                    outputFormat: ""
                },
                payload = {
                    "layout": "Default A4 hoch",
                    "attributes": {
                        "title": "Mein Titel",
                        "map": {
                            "dpi": 120,
                            "projection": "EPSG:25832",
                            "center": [
                                562010,
                                5562814
                            ],
                            "scale": 500000,
                            "layers": []
                        }
                    }
                };

            testAction(migratePayload, encodeURIComponent(JSON.stringify(payload)), state, {}, [], {}, done);
        });
    });
    describe("waitForPrintJob", function () {
        it("should start another print request", done => {
            const state = {
                    serviceUrl: "https://geodienste.hamburg.de/mapfish_print_internet/print/",
                    printAppId: "master"
                },
                response = {
                    ref: "d023a604-99b0-4a4d-aa40-a1d3b5a0fd5d@5f00580a-5fd4-4579-8d21-1ad07051d09a",
                    index: 0
                },
                serviceRequest = {
                    "index": 0,
                    "serviceUrl": "https://geodienste.hamburg.de/mapfish_print_internet/print/master/status/d023a604-99b0-4a4d-aa40-a1d3b5a0fd5d@5f00580a-5fd4-4579-8d21-1ad07051d09a.json",
                    "requestType": "GET",
                    "onSuccess": "waitForPrintJobSuccess"
                };

            // action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done, rootGetters
            testAction(waitForPrintJob, response, state, {}, [
                {type: "setProgressWidth", payload: "width: 75%", commit: true},
                {type: "sendRequest", payload: serviceRequest, dispatch: true}
            ], {}, done);
        });
        it("should start another print request with service url without /print/", done => {
            const state = {
                    serviceUrl: "https://geodienste.hamburg.de/mapfish_print_internet/",
                    printAppId: "master",
                    printService: "mapfish"
                },
                response = {
                    ref: "d023a604-99b0-4a4d-aa40-a1d3b5a0fd5d@5f00580a-5fd4-4579-8d21-1ad07051d09a",
                    index: 0
                },
                serviceRequest = {
                    "index": 0,
                    "serviceUrl": "https://geodienste.hamburg.de/mapfish_print_internet/print/master/status/d023a604-99b0-4a4d-aa40-a1d3b5a0fd5d@5f00580a-5fd4-4579-8d21-1ad07051d09a.json",
                    "requestType": "GET",
                    "onSuccess": "waitForPrintJobSuccess"
                };

            // action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done, rootGetters
            testAction(waitForPrintJob, response, state, {}, [
                {type: "setProgressWidth", payload: "width: 75%", commit: true},
                {type: "sendRequest", payload: serviceRequest, dispatch: true}
            ], {}, done);
        });
    });

    describe("waitForPrintJobSuccess", function () {
        let clock;

        before(function () {
            clock = sinon.useFakeTimers();
        });
        after(function () {
            clock.restore();
        });
        it("is not done yet so it should start another print request", done => {
            const state = {
                    serviceUrl: "https://geodienste.hamburg.de/mapfish_print_internet/print/",
                    printAppId: "master"
                },
                response = {
                    index: 0,
                    done: false,
                    downloadURL: "/mapfish_print_internet/print/report/5dbc66f1-0ff5-4ba6-8257-640c600150d0@a8cb3d11-7c03-48d3-995e-b7734c564164",
                    elapsedTime: 4278,
                    status: "running",
                    waitingTime: 0
                },
                serviceRequest = {
                    index: 0,
                    serviceUrl: "https://geodienste.hamburg.de/mapfish_print_internet/print/master/status/5dbc66f1-0ff5-4ba6-8257-640c600150d0@a8cb3d11-7c03-48d3-995e-b7734c564164.json",
                    requestType: "GET",
                    onSuccess: "waitForPrintJobSuccess"
                };

            // action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done, rootGetters
            testAction(waitForPrintJobSuccess, response, state, {}, [
                {type: "setProgressWidth", payload: "width: 80%", commit: true},
                {type: "sendRequest", payload: serviceRequest, dispatch: true}
            ], {}, done);
            clock.tick(2001);
        });
        it("is done so it should activate the download", done => {
            const state = {
                    serviceUrl: "https://geodienste.hamburg.de/mapfish_print_internet/print/",
                    printAppId: "master",
                    filename: "Meine Datey"
                },
                response = {
                    index: 0,
                    done: true,
                    downloadURL: "/mapfish_print_internet/print/report/d75d96af-63b1-41b0-860c-96333e05e876@a8cb3d11-7c03-48d3-995e-b7734c564164",
                    elapsedTime: 6145,
                    status: "finished",
                    waitingTime: 0
                },
                fileSpecs = {
                    index: 0,
                    fileUrl: "https://geodienste.hamburg.de/mapfish_print_internet/print/master/report/d75d96af-63b1-41b0-860c-96333e05e876@a8cb3d11-7c03-48d3-995e-b7734c564164",
                    filename: "Meine Datey"
                };

            // action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done, rootGetters
            testAction(waitForPrintJobSuccess, response, state, {}, [
                {type: "setProgressWidth", payload: "width: 100%", commit: true},
                {type: "downloadFile", payload: fileSpecs, dispatch: true}
            ], {}, done);
        });

        describe("downloadFile", function () {
            it("should set parameters for one download file", done => {
                const state = {
                        serviceUrl: "https://geodienste.hamburg.de/mapfish_print_internet/print/",
                        printAppId: "master",
                        filename: "Pikachu"
                    },
                    fileSpecs = {
                        fileUrl: "https://geodienste.hamburg.de/mapfish_print_internet/print/master/report/d75d96af-63b1-41b0-860c-96333e05e876@a8cb3d11-7c03-48d3-995e-b7734c564164",
                        filename: "Raichu"
                    };

                testAction(downloadFile, fileSpecs, state, {}, [
                    {type: "setPrintStarted", payload: false, commit: true},
                    {type: "setPrintFileReady", payload: true, commit: true},
                    {type: "setFileDownloadUrl", payload: fileSpecs.fileUrl, commit: true},
                    {type: "setFilename", payload: fileSpecs.filename, commit: true}
                ], {}, done);
            });

            it("should set parameters for more than one download file", done => {
                const state = {
                        serviceUrl: "https://geodienste.hamburg.de/mapfish_print_internet/print/",
                        printAppId: "master",
                        filename: "Pikachu"
                    },
                    fileSpecs = {
                        index: 0,
                        fileUrl: "https://geodienste.hamburg.de/mapfish_print_internet/print/master/report/d75d96af-63b1-41b0-860c-96333e05e876@a8cb3d11-7c03-48d3-995e-b7734c564164",
                        filename: "Raichu"
                    };

                testAction(downloadFile, fileSpecs, state, {}, [
                    {type: "setPrintStarted", payload: false, commit: true},
                    {type: "setPrintFileReady", payload: true, commit: true},
                    {type: "setFileDownloadUrl", payload: fileSpecs.fileUrl, commit: true},
                    {type: "setFilename", payload: fileSpecs.filename, commit: true},
                    {type: "updateFileDownload", payload: {
                        index: fileSpecs.index,
                        finishState: true,
                        downloadUrl: fileSpecs.fileUrl
                    }, commit: true}
                ], {}, done);
            });
        });
    });
});
