import axios from "axios";
import getProxyUrl from "../../../../utils/getProxyUrl";
import BuildSpec from "./../utils/buildSpec";
import {getRecordById} from "../../../../api/csw/getRecordById";
import omit from "../../../../utils/omit";
import actionsPrintInitialization from "./actions/actionsPrintInitialization";
import getVisibleLayer from "./../utils/getVisibleLayer";

export default {

    ...actionsPrintInitialization,
    /**
     * Performs an asynchronous HTTP request
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {Object} serviceRequest the request content
     * @returns {void}
     */
    sendRequest: function ({state, dispatch}, serviceRequest) {
        /**
         * @deprecated in the next major-release!
         * useProxy
         * getProxyUrl()
         */
        const url = state.useProxy ? getProxyUrl(serviceRequest.serviceUrl) : serviceRequest.serviceUrl;

        axios({
            url: url,
            type: serviceRequest.requestType
        }).then(response => {
            if (Object.prototype.hasOwnProperty.call(serviceRequest, "index")) {
                response.data.index = serviceRequest.index;
            }
            dispatch(String(serviceRequest.onSuccess), response.data);
        });
    },

    /**
     * sets the printStarted to activie for the Add Ons
     * @param {Object} param.commit the commit
     * @returns {void}
     */
    activatePrintStarted: function ({commit}) {
        commit("setPrintStarted", true);
    },

    /**
     * sets the visibleLayerList
     * @param {Object} param.commit the commit
     * @param {Array} visibleLayerList the list
     * @returns {void}
     */
    setVisibleLayerList: function ({commit}, visibleLayerList) {
        commit("setVisibleLayerList", visibleLayerList);
    },

    /**
     * starts the printing process
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.commit the commit
     * @param {Object} print the print parameters.
     * @param {Function} print.getResponse The function that calls the axios request.
     * @param {Number} print.index The print index.
     * @returns {void}
     */
    startPrint: async function ({state, dispatch, commit}, print) {
        commit("setProgressWidth", "width: 25%");
        getVisibleLayer(state.printMapMarker);

        const visibleLayerList = state.visibleLayerList,
            attr = {
                "layout": state.currentLayoutName,
                "outputFilename": state.filename,
                "outputFormat": state.currentFormat,
                "attributes": {
                    "title": state.title,
                    "map": {
                        "dpi": state.dpiForPdf,
                        "projection": mapCollection.getMapView("2D").getProjection().getCode(),
                        "center": mapCollection.getMapView("2D").getCenter(),
                        "scale": state.currentScale
                    }
                }
            };

        let spec = BuildSpec;

        spec.setAttributes(attr);

        if (state.isMetadataAvailable) {
            spec.setMetadata(true);
        }

        if (state.isScaleAvailable) {
            spec.buildScale(state.currentScale);
        }
        await spec.buildLayers(visibleLayerList);

        if (state.isGfiAvailable) {
            dispatch("getGfiForPrint");
            spec.buildGfi(state.isGfiSelected, state.gfiForPrint);
        }

        if (state.isLegendAvailable) {
            spec.buildLegend(state.isLegendSelected, state.isMetadataAvailable, print.getResponse, print.index);
        }
        else {
            spec.setLegend({});
            spec.setShowLegend(false);
            spec = omit(spec, ["uniqueIdList"]);
            const printJob = {
                index: print.index,
                payload: encodeURIComponent(JSON.stringify(spec.defaults)),
                printAppId: state.printAppId,
                currentFormat: state.currentFormat,
                getResponse: print.getResponse
            };

            dispatch("createPrintJob", printJob);
        }
    },

    /**
     * Gets the Gfi Information
     * @param {Object} param.rootGetters the rootgetters
     * @param {Object} param.commit the commit
     * @returns {void}
     */
    getGfiForPrint: async function ({rootGetters, commit}) {
        if (rootGetters["Tools/Gfi/currentFeature"] !== null) {
            commit("setGfiForPrint", [rootGetters["Tools/Gfi/currentFeature"].getMappedProperties(), rootGetters["Tools/Gfi/currentFeature"].getTitle(), rootGetters["Maps/clickCoordinate"]]);
        }
        else {
            commit("setGfiForPrint", []);
        }
    },

    /**
     * sets the metadata for print
     * @param {Object} param.rootGetters the rootGetters
     * @param {Object} param.dispatch the dispatch
     * @param {Object} cswObject the object with all the info
     * @returns {void}
     */
    getMetaDataForPrint: async function ({rootGetters, dispatch}, cswObject) {
        const cswObj = cswObject;
        let metadata;

        if (cswObj.layer.get("datasets") && Array.isArray(cswObj.layer.get("datasets")) && cswObj.layer.get("datasets")[0] !== null && typeof cswObj.layer.get("datasets")[0] === "object") {
            cswObj.cswUrl = Object.prototype.hasOwnProperty.call(cswObj.layer.get("datasets")[0], "csw_url") ? cswObj.layer.get("datasets")[0].csw_url : null;
        }

        cswObj.parsedData = {};

        if (cswObj.cswUrl === null || typeof cswObj.cswUrl === "undefined") {
            const cswId = Config.cswId || "3",
                cswService = rootGetters.getRestServiceById(cswId);

            cswObj.cswUrl = cswService.url;
        }

        /**
         * @deprecated in the next major-release!
         * useProxy
         * getProxyUrl()
         */
        if (rootGetters.metadata.useProxy.includes(cswObj.cswUrl)) {
            metadata = await getRecordById(getProxyUrl(cswObj.cswUrl), cswObj.metaId);
        }
        else {
            metadata = await getRecordById(cswObj.cswUrl, cswObj.metaId);
        }

        if (typeof metadata === "undefined") {
            dispatch("Alerting/addSingleAlert", i18next.t("common:modules.layerInformation.errorMessage", {cswObjCswUrl: cswObj.cswUrl}), {root: true});
        }
        else {
            cswObj.parsedData = {};
            cswObj.parsedData.orgaOwner = metadata.getOwner().name || "n.N.";
            cswObj.parsedData.address = {
                street: metadata.getOwner().street || "",
                housenr: "",
                postalCode: metadata.getOwner().postalCode || "",
                city: metadata.getOwner().city || ""
            };
            cswObj.parsedData.email = metadata.getOwner().email || "n.N.";
            cswObj.parsedData.tel = metadata.getOwner().phone || "n.N.";
            cswObj.parsedData.url = metadata.getOwner().link || "n.N.";

            if (typeof metadata.getRevisionDate() !== "undefined") {
                cswObj.parsedData.date = metadata.getRevisionDate();
            }
            else if (typeof metadata.getPublicationDate() !== "undefined") {
                cswObj.parsedData.date = metadata.getPublicationDate();
            }
            else if (typeof metadata.getCreationDate() !== "undefined") {
                cswObj.parsedData.date = metadata.getCreationDate();
            }
        }

        BuildSpec.fetchedMetaData(cswObj);
    },

    /**
     * sends an async request to create a print job
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} printContent the content for the printRequest
     * @returns {void}
     */
    createPrintJob: async function ({state, dispatch, rootGetters, commit}, printContent) {
        const printJob = printContent,
            printId = printJob.printAppId || state.printAppId,
            printFormat = printJob.format || state.currentFormat;
        let url = "",
            response = "",
            serviceUrlDefinition = state.serviceUrl;

        if (state.printService !== "plotservice" && !state.serviceUrl.includes("/print/")) {
            serviceUrlDefinition = state.serviceUrl + "print/";
        }

        commit("setPrintFileReady", false);
        if (state.serviceUrl === "") {
            let serviceUrl;

            if (state.mapfishServiceId !== "") {
                serviceUrl = rootGetters.getRestServiceById(state.mapfishServiceId).url;
            }
            else {
                serviceUrl = rootGetters.getRestServiceById("mapfish").url;
            }

            if (state.printService !== "plotservice" && !serviceUrl.includes("/print/")) {
                serviceUrl = serviceUrl + "print/";
            }

            commit("setServiceUrl", serviceUrl);
            serviceUrlDefinition = state.serviceUrl;
        }

        url = state.printService === "plotservice" ? serviceUrlDefinition + "/create.json" : serviceUrlDefinition + printId + "/report." + printFormat;

        commit("setProgressWidth", "width: 50%");
        if (typeof printJob.getResponse === "function") {
            if (state.printService === "plotservice") {
                printJob.payload = await dispatch("migratePayload", printJob.payload);
            }
            response = await printJob.getResponse(url, printJob.payload);
        }

        if ("getURL" in response.data) {
            await commit("setPlotserviceIndex", state.plotserviceIndex + 1);
            dispatch("downloadFile", {
                "fileUrl": response.data.getURL,
                "index": state.plotserviceIndex,
                "filename": state.filename + "." + state.outputFormat
            });
        }
        else {
            response.data.index = printJob.index;
            dispatch("waitForPrintJob", response.data);
        }
    },

    /**
     * migrates the payload intended for mapfish to the format High Resolution Plot Service needs
     * @param {Object} param.state the state
     * @param {Object} payload object to migrate
     * @returns {Object} object for High Resolution Plot Service to start the printing
     */
    migratePayload: function ({state}, payload) {
        const plotservicePayload = {},
            decodePayload = JSON.parse(decodeURIComponent(payload.replace(/imageFormat/g, "format")));

        plotservicePayload.layout = decodePayload.layout;
        plotservicePayload.srs = decodePayload.attributes.map.projection;
        plotservicePayload.layers = decodePayload.attributes.map.layers;
        plotservicePayload.layers.forEach((key) => {
            key.styles = [""];
        });
        plotservicePayload.pages = [{
            center: decodePayload.attributes.map.center,
            scale: String(decodePayload.attributes.map.scale),
            scaleText: "Ca. 1 : " + decodePayload.attributes.map.scale,
            geodetic: true,
            dpi: String(decodePayload.attributes.map.dpi),
            mapTitle: decodePayload.attributes.title
        }];
        plotservicePayload.outputFilename = state.filename;
        plotservicePayload.outputFormat = state.outputFormat;

        return JSON.stringify(plotservicePayload);
    },

    /**
     * Sends a request to get the status for a print job until it is finished.
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.commit the commit
     * @param {Object} response Response of print job.
     * @param {Number} response.index The print index.
     * @returns {void}
     */
    waitForPrintJob: async function ({state, dispatch, commit}, response) {
        let printFolderUrlPart = "";

        if (state.printService !== "plotservice" && !state.serviceUrl.includes("/print/")) {
            printFolderUrlPart = "print/";
        }

        const printAppId = state.printAppId,
            url = state.serviceUrl + printFolderUrlPart + printAppId + "/status/" + response.ref + ".json",
            serviceRequest = {
                "index": response.index,
                "serviceUrl": url,
                "requestType": "GET",
                "onSuccess": "waitForPrintJobSuccess"
            };

        commit("setProgressWidth", "width: 75%");
        dispatch("sendRequest", serviceRequest);
    },

    waitForPrintJobSuccess: async function ({state, dispatch, commit}, response) {
        let printFolderUrlPart = "";

        if (state.printService !== "plotservice" && !state.serviceUrl.includes("/print/")) {
            printFolderUrlPart = "print/";
        }

        // Error processing...
        if (response.status === "error") {
            dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.print.waitForPrintErrorMessage"), {root: true});
            console.error("Error: " + response.error);
        }
        else if (response.done) {
            commit("setProgressWidth", "width: 100%");
            const index = response.downloadURL.lastIndexOf("/"),
                fileId = response.downloadURL.substr(index),
                fileSpecs = {
                    "index": response?.index,
                    "fileUrl": state.serviceUrl + printFolderUrlPart + state.printAppId + "/report" + fileId,
                    "filename": state.filename
                };

            dispatch("downloadFile", fileSpecs);
        }
        else {
            commit("setProgressWidth", "width: 80%");
            // The report is not ready yet. Check again in 2s.
            setTimeout(() => {
                const index = response.downloadURL.lastIndexOf("/"),
                    fileId = response.downloadURL.substr(index),
                    url = state.serviceUrl + printFolderUrlPart + state.printAppId + "/status" + fileId + ".json",
                    serviceRequest = {
                        "index": response.index,
                        "serviceUrl": url,
                        "requestType": "GET",
                        "onSuccess": "waitForPrintJobSuccess"
                    };

                dispatch("sendRequest", serviceRequest);
            }, 2000);
        }
    },

    /**
     * Starts the download from printfile,
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} fileSpecs The url to dwonloadfile and name
     * @returns {void}
     */
    downloadFile: function ({state, commit}, fileSpecs) {
        /**
         * @deprecated in the next major-release!
         * useProxy
         * getProxyUrl()
         */
        const fileUrl = state.useProxy ? getProxyUrl(fileSpecs.fileUrl) : fileSpecs.fileUrl;

        commit("setPrintStarted", false);
        commit("setPrintFileReady", true);

        // Radio trigger for external backbone modules.
        Radio.trigger("Print", "printFileReady", fileUrl);

        commit("setFileDownloadUrl", fileUrl);
        commit("setFilename", fileSpecs.filename);

        if (fileSpecs.index !== undefined) {
            commit("updateFileDownload", {
                index: fileSpecs.index,
                finishState: true,
                downloadUrl: fileUrl
            });
        }
    }
};
