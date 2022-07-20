import state from "../store/stateCompareFeatures";
import store from "../../../../app-store/index";
import SpecModel from "./../../print/utils/buildSpec";

/**
 * Helper Function to prepare the Pdf file from currently selected layer and its features on the comparison list.
 * @param {function} getResponse function that will get axios response
 * @returns {void}
 */
export async function preparePrint (getResponse) {
    const tableBody = await prepareTableBody(),
        pdfDef = {
            layout: "A4 Hochformat",
            outputFormat: "pdf",
            attributes: {
                title: i18next.t("common:modules.tools.compareFeatures.title"),
                datasource: [
                    {
                        table: {
                            columns: ["attr", "feature1", "feature2", "feature3"],
                            data: tableBody
                        }
                    }
                ]
            }
        },
        spec = SpecModel;
    let printJob = {};

    store.dispatch("Tools/Print/activatePrintStarted", true, {root: true});
    spec.setAttributes(pdfDef);

    printJob = {
        payload: encodeURIComponent(JSON.stringify(spec.defaults)),
        printAppId: "compareFeatures",
        currentFormat: "pdf",
        getResponse: getResponse
    };

    store.dispatch("Tools/Print/createPrintJob", printJob, {root: true});
}

/**
 * Prepares the table body which is used for printing the pdf file from comparison list.
 * It takes the preparedList from the state and converts it to a format, that is printable.
 * All fields that are undefined get changed to "-".
 * @returns {Array} tableBody with selected features from comparison list
 */
function prepareTableBody () {
    const tableBody = [],
        rowsToShow = state.numberOfAttributesToShow,
        features = state.preparedList;

    if (!state.hasMultipleLayers) {
        Object.values(features).forEach(feature => {
            Object.entries(feature).forEach(key => {
                tableBody.push(Object.values(key[1]).map(value => prettyValue(value)));
            });
        });
    }
    else {
        Object.values(features[state.selectedLayer]).forEach(feature => {
            tableBody.push(Object.values(feature).map(value => value === undefined ? "-" : value));
        });
    }
    if (!state.showMoreInfo) {
        return tableBody.slice(0, rowsToShow);
    }

    return tableBody;
}

/**
 * Prepare the value for pretty printing.
 * @param {String} value The value to print.
 * @returns {String} The pretty value.
 */
export function prettyValue (value) {
    if (value === undefined) {
        return "-";
    }
    else if (value.includes("|")) {
        return value.split("|").join("\n");
    }
    else if (value?.toLowerCase() === "true") {
        return i18next.t("common:modules.tools.compareFeatures.trueFalse.true");
    }
    else if (value?.toLowerCase() === "false" || value?.toLowerCase() === "no") {
        return i18next.t("common:modules.tools.compareFeatures.trueFalse.false");
    }
    return value;
}

export default {preparePrint, prettyValue};
