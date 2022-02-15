import {getByArraySyntax} from "../utils/fetchFirstModuleConfig";

export default {
    /**
     * Copies the the content of the given element to the clipboard if the browser accepts the command.
     * Solution for the weird behaviour on iOS from:
     * https://stackoverflow.com/questions/34045777/copy-to-clipboard-using-javascript-in-ios
     *
     * @param {Element} el element to copy,
     * @returns {void}
     */
    copyToClipboard ({dispatch}, el) {
        const oldReadOnly = el.readOnly,
            oldContentEditable = el.contentEditable,
            range = document.createRange(),
            selection = window.getSelection();

        el.readOnly = false;
        el.contentEditable = true;

        range.selectNodeContents(el);
        selection.removeAllRanges();
        if (!Radio.request("Util", "isInternetExplorer")) {
            selection.addRange(range);
        }
        // Seems to be required for mobile devices
        el.setSelectionRange(0, 999999);

        el.readOnly = oldReadOnly;
        el.contentEditable = oldContentEditable;

        try {
            document.execCommand("copy");
            dispatch("Alerting/addSingleAlert", {content: i18next.t("common:modules.util.copyToClipboard.contentSaved")}, {root: true});
        }
        catch (err) {
            dispatch("Alerting/addSingleAlert", {content: i18next.t("common:modules.util.copyToClipboard.contentNotSaved")}, {root: true});
            console.error(`CopyToClipboard: ${err}`);
        }
    },
    /**
     * Function to check if the deprecated parameters could be specified for more than one location e.g. they (location of the parameter or tool) have multiple possible paths.
    * Furthermore the function checks whether the given paths for the parameters are defined or undefined.
    * @param {Object} deprecatedPath an object with keys (dotted string as new path) and String[] as values, holding the old and deprecated paths
    * @param {Object} config - the config.json or config.js.
    * @returns {Object} - returns a new config (.json or .js) without the deprecated parameters. They were replaced by the actual ones.
    */
    checkWhereDeprecated (deprecatedPath, config) {
        let updatedConfig = config,
            parameters = {};

        Object.entries(deprecatedPath).forEach((entry) => {
            parameters = this.getDeprecatedParameters(entry, config);

            if (parameters !== undefined && parameters.output !== undefined) {
                updatedConfig = this.replaceDeprecatedCode(parameters, config);
            }
        });
        return updatedConfig;
    },

    /**
     * Function to determine:
     * Firstly: the path as dotted string (newSplittedPath).
     * Secondly: the output given by the config.json for the path with the deprecated parameter. (output)
     * Thirdly: the deprecated key/parameter itself. (deprecatedKey)
     * @param {[String, String[]]} [entry=[]] - Array with the single "steps" / elements of the deprecated path. entry[0] ist the new path, elem[1] is an array of old paths
     * @param {Object} [config={}] - The config.json or config.js.
     * @returns {Object} - returns an object with the three mentioned above parameters.
    */
    getDeprecatedParameters (entry = [], config = {}) {
        const newSplittedPath = entry[0].split(".");
        let oldSplittedPath = "",
            output = "",
            deprecatedKey = "",
            parameters;

        entry[1].forEach((oldPathes) => {
            oldSplittedPath = oldPathes.split(".");
            output = getByArraySyntax(config, oldPathes.split("."));
            if (output === undefined) {
                return;
            }
            deprecatedKey = oldSplittedPath[oldSplittedPath.length - 1];
            parameters = {
                "newSplittedPath": newSplittedPath,
                "oldSplittedPath": oldSplittedPath,
                "output": output,
                "deprecatedKey": deprecatedKey
            };
        });
        return parameters;
    },

    /**
     * Function to find and replace the old deprecated path.
     * Inserts the new and current key into the config instead of the deprecated parameter.
     * The deprecated parameter is deleted. The content is allocated to the new key.
     * @param {Object} parameters - contains the new current parameter to replace the deprecated parameter. Contains also an object which lists the path of the deprecated parameter, the output/content of the deprecated parameter and the deprecated parameter itself.
     * @param {Object} config - the config.json or config.js.
     * @returns {Object} - returns a updated config where the deprecated parameters are replaced by the new and current ones.
    */
    replaceDeprecatedCode (parameters, config) {
        const updatedConfig = {...config},
            output = parameters.output,
            deprecatedKey = parameters.deprecatedKey,
            splittedCurrentPath = parameters.newSplittedPath;
        let current = updatedConfig;

        splittedCurrentPath.forEach((element, index) => {
            if (index === splittedCurrentPath.length - 1 && output !== undefined) {
                current[element] = output;
                console.warn(parameters.deprecatedKey + " is deprecated. Instead, please use the following path/parameter: " + String(parameters.newSplittedPath).replace(/,/g, ".") + " in the config.json. For this session it is automatically replaced.");
            }
            else if (output === undefined) {
                return;
            }
            else {
                if (!current[element]) {
                    current[element] = {};
                }
                current = current[element];
            }
            delete current[deprecatedKey];
        });

        return updatedConfig;
    }
};
