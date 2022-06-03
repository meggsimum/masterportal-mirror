import store from "../app-store";
import isObject from "./isObject";

/**
 * Compares the reference string and compared string with locales and options
 * @param {String} referenceStr the reference string
 * @param {String} compareString the compared string
 * @param {String} locale value to specify what language to use for comparison
 * @param {Object} options object containing arguments that allow to further specify the behaviour of the method
 * @returns {Number} A negative number if referenceStr occurs before compareString; positive if the referenceStr occurs after compareString; 0 if they are equivalent.
 */
export default function localeCompare (referenceStr, compareString, locale, options) {
    let localeCode = locale,
        optionsParams = options;

    if (!localeCompareSupportsLocales()) {
        return String(referenceStr).localeCompare(String(compareString));
    }

    if (typeof localeCode !== "string") {
        localeCode = store.getters["Language/currentLocale"];
    }

    if (!isObject(optionsParams)) {
        optionsParams = {};
    }

    return String(referenceStr).localeCompare(String(compareString), localeCode, optionsParams);
}

/**
 * Checks if browser support for extended arguments "locales" and "options"
 * @returns {Boolean} true if browser support for extended arguments.
 */
function localeCompareSupportsLocales () {
    try {
        "foo".localeCompare("bar", "i");
    }
    catch (e) {
        return e.name === "RangeError";
    }
    return false;
}
