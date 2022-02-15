/**
 * Converts the given xml attr type of a feature/item and returns the javascript type.
 * @param {String} xmlAttrType the xml attribute type to convert
 * @returns {String} the javascript save type
 */
function convertAttrTypeXML (xmlAttrType) {
    if (
        xmlAttrType === "number"
        || xmlAttrType === "short"
        || xmlAttrType === "long"
        || xmlAttrType === "double"
        || xmlAttrType === "decimal"
        || xmlAttrType === "integer"
        || xmlAttrType === "float"
    ) {
        return "number";
    }
    if (xmlAttrType === "char" || xmlAttrType === "string") {
        return "string";
    }
    if (xmlAttrType === "bool" || xmlAttrType === "boolean") {
        return "boolean";
    }

    return xmlAttrType;
}

export {
    convertAttrTypeXML
};
