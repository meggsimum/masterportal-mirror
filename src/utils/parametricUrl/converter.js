import {getProjections} from "masterportalapi/src/crs";

/**
 *  Converts a boolean string to a boolean.
 * @param {String} string representation of a boolean as string
 * @returns {boolean} the converted string
 */
function convertStringToBoolean (string) {
    let toCheck = string;

    if (typeof string === "string") {
        toCheck = toCheck.toLowerCase().trim();
    }
    switch (toCheck) {
        case "yes": case "true": return true;
        case "no": case "false": return false;
        default: return string;
    }
}

/**
 * Converts an array string to an array.
 * @param {String} string array as string (a valid JSON string)
 * @returns {Array} the converted array
 */
function convertStringToArray (string) {
    if (typeof string === "string") {
        if (string.charAt(0) === "[" && string.charAt(string.length - 1) === "]") {
            return JSON.parse(string);
        }
        const index = string.indexOf(",");

        if (index > -1) {
            return string.split(",").map(val => {
                const parsed = parseFloat(val, 10),
                    isEmptyString = typeof val === "string" && val.trim() === "";

                if (isNaN(parsed) && !isEmptyString) {
                    return convertStringToBoolean(val);
                }
                else if (isNaN(parsed)) {
                    return val;
                }
                return parsed;
            });
        }
    }
    return string;
}

/**
 * Returns the projection object to given EPSG code.
 * @param {String} string EPSG code of the projection
 * @returns {Object} projection object to given EPSG code
 */
function findProjection (string) {
    return getProjections().find(proj => proj.name === "http://www.opengis.net/gml/srs/epsg.xml#" + string.split(":")[1]);
}
/**
     * Parse parameter to search in searchbar.
     * @param {string} query - The Searchquery.
     * @returns {void}
     */
export function parseQuery (query) {
    let initString = "";

    if (query.indexOf(" ") >= 0 || query.indexOf("-") >= 0) {
        initString = convertInitialLettersToUppercase(query, " ");
        initString = convertInitialLettersToUppercase(initString, "-");
    }
    else {
        initString = query.substring(0, 1).toUpperCase() + query.substring(1);
    }
    return initString;
}

/**
     * convert all initial letters to uppercase letters
     * @param {string} [words=""] - Words with lettes.
     * @param {string} [separator=" "] - Separator for split words.
     * @returns {string} convertet Letters.
     */
function convertInitialLettersToUppercase (words = "", separator = " ") {
    const split = words.split(separator);
    let initString = "";

    split.forEach(splitpart => {
        initString += splitpart.substring(0, 1).toUpperCase() + splitpart.substring(1) + separator;
    });

    return initString.substring(0, initString.length - 1);
}
/**
 * Special converting for urlParam 'transparency'. Parses strings to numbers.
 * @param  {Array} transparency containing strings to parse
 * @returns {Array} the parsed strings in an array
 */
export function convertTransparency (transparency) {
    if (transparency === null || transparency === "") {
        return "";
    }
    return transparency.split(",").map(val => {
        const factor = Math.pow(10, 0);

        return Math.round(val * factor) / factor;
    });
}
/**
 * Special converting for a comma separated string.
 * @param  {String} string containing comma separated values
 * @returns {Array} the trimmed strings in an array
 */
export function convertToStringArray (string) {
    if (string === null || string === "") {
        return "";
    }
    return string.split(",").map(val =>val.trim());
}
/**
 * Converts a string to boolean or array.
 * @param {String} string to convert to boolean or array
 * @returns {*} the converted string
 */
export function convert (string) {
    let ret = string;

    if (typeof string === "string" && string.startsWith("EPSG")) {
        return findProjection(string);
    }
    ret = convertStringToBoolean(string);
    if (typeof ret === "boolean") {
        return ret;
    }
    ret = convertStringToArray(string);
    if (Array.isArray(ret)) {
        return ret;
    }
    return string;
}
