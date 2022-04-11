/**
 * Splits all entries of the given list with the given limitor, creates a new array with unique single entries.
 * @info if no delimitor is given the list is returned as it is - in this instance no unique value list is created
 * @param {String[]} list a list of strings to be split
 * @param {String} delimitor the delimitor to split with or undefined if no split should be made
 * @returns {String[]} a new list with unique value
 */
export default function splitListWithDelimitor (list, delimitor) {
    if (!Array.isArray(list) || typeof delimitor !== "string") {
        return list;
    }
    const result = {};

    list.forEach(entry => {
        if (typeof entry !== "string") {
            result[entry] = true;
            return;
        }
        const parts = entry.split(delimitor);

        parts.forEach(part => {
            result[part] = true;
        });
    });
    return Object.keys(result);
}
