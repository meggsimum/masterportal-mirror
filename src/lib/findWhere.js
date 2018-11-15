/**
 * Returns first entry where condition is met.
 * @param {Array} array - array to return first element meeting condition of
 * @param {function} condition - boolean function
 * @returns {*} first array entry that meets condition, else null
 * @ignore
 */
function findWhere (array, condition) {
    for (let i = 0; i < array.length; i++) {
        if (condition(array[i])) {
            return array[i];
        }
    }

    return null;
}

export default findWhere;
