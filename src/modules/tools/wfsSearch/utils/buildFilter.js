let likeFilterProperties = {
    wildCard: "*",
    singleChar: "#",
    escape: "!"
};

/**
 * Builds a XML filter based upon the literal structure defined in the config
 * and the given user inputs.
 *
 * @param {object} values The literals containing the values to be parsed.
 * @returns {XML[]} A filter to constrain returned features from the service.
 */
function buildFilter (values) {
    const filters = [];

    values.forEach(val => {
        if (val.clause) {
            const literals = buildFilter(val.clause.literals);

            if (literals?.length > 0) {
                if (literals.length === 1) {
                    filters.push(...literals);
                }
                else {
                    const currentFilter = literals.join("");

                    filters.push(val.clause.type === "and" ? `<ogc:And>${currentFilter}</ogc:And>` : `<ogc:Or>${currentFilter}</ogc:Or>`);
                }
            }
        }
        else if (val?.field?.value) {
            filters.push(buildXmlFilter(val.field));
        }
    });

    return filters;
}

/**
 * Builds a filter based upon the literal structure defined in the config
 * and the given user inputs.
 *
 * @param {object} values The literals containing the values to be parsed.
 * @returns {string} A filter to constrain returned features from the service.
 */
function buildStoredFilter (values) {
    let filter = "";

    values.forEach(val => {
        if (val.clause) {
            filter += buildStoredFilter(val.clause.literals);
        }
        else if (val.field) {
            const {fieldName, parameterIndex, value} = val.field,
                currentFieldName = typeof parameterIndex === "number" ? fieldName[parameterIndex] : fieldName;

            if (value) {
                filter += `&${currentFieldName}=${value}`;
            }
        }
    });

    return filter;
}

/**
 * Builds the XML filter for the given fieldName and value.
 *
 * @param {object} field The field for which the filter is build.
 * @returns {string} XML Filter.
 */
function buildXmlFilter (field) {
    const {fieldName, parameterIndex, type, value} = field,
        multipleValuesInField = typeof parameterIndex === "number",
        fieldType = multipleValuesInField ? type[parameterIndex] : type,
        currentFieldName = multipleValuesInField ? fieldName[parameterIndex] : fieldName,
        likeFilter = fieldType === "like",
        property = `<ogc:PropertyName>${currentFieldName}</ogc:PropertyName><ogc:Literal>${value}${likeFilter ? likeFilterProperties.wildCard : ""}</ogc:Literal>`;
    let likeFilterValues = "";

    if (likeFilter) {
        Object.entries(likeFilterProperties).forEach(([key, val]) => {
            likeFilterValues += `${key}="${encodeURIComponent(val)}" `;
        });
    }

    return likeFilter
        ? `<ogc:PropertyIsLike matchCase="false" ${likeFilterValues.slice(0, -1)}>${property}</ogc:PropertyIsLike>`
        : `<ogc:PropertyIsEqualTo matchCase="false">${property}</ogc:PropertyIsEqualTo>`;
}

/**
 * Sets the likeFilterProperties to the given value
 *
 * @param {object} properties The properties for the like filter in the way the service needs them.
 * @returns {void}
 */
function setLikeFilterProperties (properties) {
    likeFilterProperties = properties;
}

export {buildFilter, buildStoredFilter, buildXmlFilter, setLikeFilterProperties};
