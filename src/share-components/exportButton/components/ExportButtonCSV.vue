<script>
import axios from "axios";
import moment from "moment";
import {convertJsonToCsv} from "../../../utils/convertJsonToCsv.js";
import {
    createCsvBlob,
    downloadBlobPerNavigator,
    downloadBlobPerHTML5
} from "../utils/exportButtonUtils.js";

export default {
    name: "ExportButtonCSV",
    props: {
        /**
         * the title to use, can be an i18next string
         */
        title: {
            type: String,
            required: false,
            default: "common:button.download"
        },
        /**
         * first case: "data"
         * - hand over an Array of Arrays with any values [[1, 2], [3, 4]] to create a csv file "1,2\r\n3,4"
         * - or hand over an Array of Objects, using the keys as csv header [{a: 1, b: 2}, {a: 3, b: 4}] to create a csv file "a,b\r\n1,2\r\n3,4"
         * - if no filename is given using first case "data", the default filename is hard coded to "download" (+ postfixFormat)
         */
        data: {
            type: [Object, Boolean],
            required: false,
            default: false
        },
        /**
         * second case: "handler"
         * - hand over a handler to hand over data to as function(onsuccess) where the handler is called on export button click and onsuccess shall be called when the data with the available data as onsuccess(data)
         * e.g.: handler = onsuccess => {
         *   // do stuff and create the data here
         *   // than start download as csv file by handing over data to exportButton via onsuccess
         *   onsuccess(data);
         * }
         */
        handler: {
            type: [Function, Boolean],
            required: false,
            default: false
        },
        /**
         * third case: "url"
         * - give an url to download a csv file with and use filename to rename the file
         * - set filename to false to trigger a direct download of the csv file
         */
        url: {
            type: [String, Boolean],
            required: false,
            default: false
        },
        /**
         * the prefix to use for the filename, set to false to use filename of url download (third case) or "download" in first and second case
         * - in case of a given url, this will trigger download in the background and renaming of the file
         * - set postfixFormat to "" to use filename without postfixFormat
         * - set filename and postfixFormat to "" to download a file named ".csv"
         */
        filename: {
            type: [String, Boolean],
            required: false,
            default: false
        },
        /**
         * if a filename is given as any string, moment is used to create a postfix
         * - set the moment format here to alter the postfix
         * - will only be used if filename is set to string
         */
        postfixFormat: {
            type: String,
            required: false,
            default: "_YYYY-MM-DD_HH-mm-ss"
        }
    },
    data () {
        return {
            downloadDisabled: false
        };
    },
    methods: {
        /**
         * enables the button
         * @post the button is enabled
         * @returns {void}
         */
        enableDownload () {
            this.downloadDisabled = false;
        },
        /**
         * disables the button
         * @post the button is disabled
         * @returns {void}
         */
        disableDownload () {
            this.downloadDisabled = true;
        },
        /**
         * enables the button after a short timeout (for better ui)
         * @post the button is enabled after a short timeout
         * @returns {void}
         */
        enableDownloadAfterTimeout () {
            setTimeout(() => {
                this.downloadDisabled = false;
            }, 2200);
        },
        /**
         * handles the given error message according to portal standards
         * @post the error message is processed
         * @param {String} msg the error message to use on the console (alert uses standard from translation)
         * @returns {void}
         */
        handleDownloadError (msg) {
            console.warn(msg);
            this.$store.dispatch("Alerting/addSingleAlert", i18next.t("common:modules.exportButton.error.download"));
        },
        /**
         * triggers the download based on the given props
         * @post the download has been triggered or an error is processed
         * @returns {void}
         */
        download () {
            if (this.downloadDisabled) {
                return;
            }
            const filename = typeof this.filename === "string" ? this.createFilename(this.filename, this.postfixFormat) : false;

            this.disableDownload();

            if (typeof this.data === "object" && this.data !== null) {
                this.downloadWithData(this.data, filename);
            }
            else if (typeof this.handler === "function") {
                this.downloadWithHandler(this.handler, filename);
            }
            else if (typeof this.url === "string" && typeof filename === "string") {
                this.downloadWithUrl(this.url, filename);
            }
            else if (typeof this.url === "string") {
                window.location = this.url;
                this.enableDownloadAfterTimeout();
            }
            else {
                this.handleDownloadError("ExportButtonCSV: no data, handler or url was given to download something");
                this.enableDownload();
            }
        },
        /**
         * "downloads" the given json data
         * @param {Object} data the json data to download
         * @param {String} filename the filename to use
         * @returns {void}
         */
        downloadWithData (data, filename) {
            const csvText = convertJsonToCsv(data, error => {
                this.handleDownloadError(error);
            });

            this.fakeDownloadCsvText(csvText, filename ? filename : "download", error => {
                this.handleDownloadError(error);
            });
            this.enableDownloadAfterTimeout();
        },
        /**
         * "downloads" the data received by the given handler
         * @param {Function} handler the handler to use for receiving the data
         * @param {String} filename the filename to use
         * @returns {void}
         */
        downloadWithHandler (handler, filename) {
            this.handler(data => {
                this.downloadWithData(data, filename);
            });
        },
        /**
         * downloads data using the given url and starts the "download"
         * @param {String} url the url to receive the data with
         * @param {String} filename the filename to use
         * @returns {void}
         */
        downloadWithUrl (url, filename) {
            this.downloadUrl(url, csvText => {
                this.fakeDownloadCsvText(csvText, filename, error => {
                    this.handleDownloadError(error);
                });
                this.enableDownloadAfterTimeout();
            }, error => {
                this.handleDownloadError(error);
                this.enableDownload();
            });
        },
        /**
         * "downloads" the given csvText using navigator or html5
         * @post the given csvText is getting "fake"-downloaded
         * @param {String} csvText the text to download
         * @param {String} filename the filename to name the file with
         * @param {Function} onerror an error handler to call if something went wrong
         * @returns {Boolean} true if the download was successfull, false if not - see onerror for details
         */
        fakeDownloadCsvText (csvText, filename, onerror) {
            if (typeof csvText !== "string") {
                if (typeof onerror === "function") {
                    onerror("ExportButtonCSV: The given csv text is not a string.");
                }
                return false;
            }
            const blob = createCsvBlob(csvText);

            if (downloadBlobPerNavigator(blob, filename) || downloadBlobPerHTML5(blob, filename, onerror)) {
                return true;
            }

            if (typeof onerror === "function") {
                onerror("ExportButtonCSV: Neither navigator nor html5 technic available for download.");
            }

            return false;
        },
        /**
         * uses axios to load data from the given url
         * @post onsuccess is called with the received data or onerror is called when an error occured
         * @param {String} url the url to call
         * @param {Function} onsuccess the function to hand over the data to
         * @param {Function} onerror the handler to call on error
         * @returns {void}
         */
        downloadUrl (url, onsuccess, onerror) {
            axios.get(url)
                .then(response => {
                    if (!Object.prototype.hasOwnProperty.call(response, "data")) {
                        if (typeof onerror === "function") {
                            onerror("ExportButtonCSV: the called url generates no valid axios data attribute - " + url);
                            return;
                        }
                    }
                    if (typeof onsuccess === "function") {
                        onsuccess(response.data);
                    }
                })
                .catch(error => onerror(error));
        },
        /**
         * creates a filename using the given prefix and postfixFormat
         * @param {String} prefix the prefix to begin the filename with
         * @param {String} postfixFormat the format to hand over to moment to create the end of the filename with
         * @returns {String} a concatination of prefix and postfixFormat extended with ".csv" extension
         */
        createFilename (prefix, postfixFormat) {
            if (postfixFormat) {
                return String(prefix) + moment().format(String(postfixFormat)) + ".csv";
            }
            return String(prefix) + ".csv";
        }
    }
};
</script>

<template>
    <button
        v-if="!downloadDisabled"
        type="button"
        class="btn btn-primary exportButton"
        @click="download()"
    >
        <span
            id="bootstrap-icon"
            class="bootstrap-icon"
        >
            <i class="bi-cloud-arrow-down-fill" />
        </span>
        {{ $t(title) }}
    </button>
    <button
        v-else
        type="button"
        class="btn btn-primary exportButton"
        disabled
    >
        <span
            id="bootstrap-icon"
            class="bootstrap-icon spin-animation"
        >
            <i class="bi-cloud-arrow-down-fill" />
        </span>
        {{ $t(title) }}
    </button>
</template>

<style lang="scss" scoped>
    @keyframes exportButtonLoaderSpinAnimation {
        from {
            transform: rotate(0);
        }
        to {
            transform: rotate(360deg);
        }
    }

    .exportButton {
        outline:none;
    }
    .exportButton > .spin-animation {
        animation: exportButtonLoaderSpinAnimation 1s 0.1s ease-in-out infinite both;
    }
    .exportButton > .bi-cloud-arrow-down-fill {
        margin-right: 5px;
    }
</style>
