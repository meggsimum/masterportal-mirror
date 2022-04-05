/**
 * uses the given path to go into the given object and returns the value found at the end
 * @info arrays can be accessed by using a number as index (e.g. "@Test.0.test")
 * @param {Object} obj an object or array to search through
 * @param {String} path the path to follow through the given object
 * @param {String} [prefix="@"] the prefix to use to recognize the string as path to follow
 * @param {String} [delimitor="."] the delimitor to use
 * @param {Number} [depthBarrier=20] the depth barrier to avoid infinit recurtions
 * @returns {*} any value found at the end or undefined if nothing was found
 */
function getValueFromObjectByPath (obj, path, prefix = "@", delimitor = ".", depthBarrier = 20) {
    if (
        typeof obj !== "object"
        || obj === null
        || typeof path !== "string"
        || (
            typeof prefix === "string"
            && path.substr(0, prefix.length) !== prefix
        )
    ) {
        return undefined;
    }
    const pathParts = getPathPartsFromPath(typeof prefix === "string" ? path.substring(prefix.length) : path, delimitor),
        len = pathParts.length;
    let value = obj,
        depth = 0;

    for (let i = 0; i < len; i++) {
        if (typeof value !== "object" || value === null) {
            return undefined;
        }
        value = value[pathParts[i]];
        depth++;
        if (typeof value === "undefined" || depth > depthBarrier) {
            return undefined;
        }
    }
    return value;
}

/**
 * gets the parts of the given path splitted by ".", ignoring escaped "."
 * @param {String} path the path to split
 * @param {String} [delimitor="."] the delimitor to use
 * @returns {String[]} the resulting parts of the path
 */
function getPathPartsFromPath (path, delimitor = ".") {
    const len = path.length,
        result = [];
    let letter = "",
        word = "";

    for (let i = 0; i < len; i++) {
        letter = path[i];

        if (letter === "\\") {
            i++;
            letter = path[i];
        }
        else if (letter === delimitor) {
            result.push(word);
            word = "";
            continue;
        }
        word += letter;
    }

    if (word) {
        result.push(word);
    }
    return result;
}

export {getValueFromObjectByPath, getPathPartsFromPath};
