import isObject from "isObject";

/**
 * Looks through the given list and returns the first value that matches all of the key value pairs of properties.
 * @param {Object[]} list A list of objects to look through.
 * @param {Object} properties An object to match with all key value pairs.
 * @returns {Object} Returns the first object in list which matches all given properties.
 */
function findWhereJs (list, properties) {
    if (!Array.isArray(list) || !isObject(properties)) {
        return undefined;
    }
    return list.find(item => {
        if (!isObject(item)) {
            return undefined;
        }
        return Object.keys(properties).every(key => {
            return item[key] === properties[key];
        });
    });
}

export default findWhereJs;
