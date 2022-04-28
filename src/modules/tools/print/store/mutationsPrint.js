import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import statePrint from "./statePrint";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(statePrint),

    /**
     * Adds a download file to the fileDownloads collection.
     * @param {Object} state Context object.
     * @param {Object} fileDownload The download file.
     * @returns {void}
     */
    addFileDownload: (state, fileDownload) => {
        state.fileDownloads.push(fileDownload);
    },

    /**
     * Join a download file with an existing download file by index..
     * @param {Object} state Context object.
     * @param {Object} fileDownload The download file.
     * @param {Number} fileDownload.index The print index.
     * @returns {void}
     */
    updateFileDownload: (state, fileDownload) => {
        const index = fileDownload.index;

        state.fileDownloads[index] = Object.assign(state.fileDownloads[index], fileDownload);
    },

    /**
     * Sets the state values for displaying an auto adjusted scale.
     * @param {Object} state Context object.
     * @param {Boolean} checkValue Value of the checkbox.
     * @returns {void}
     */
    setAutoAdjustScale: (state, checkValue) => {
        state.autoAdjustScale = checkValue;
        state.isScaleSelectedManually = false;
    }
};

export default mutations;
