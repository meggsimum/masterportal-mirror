/**
 * Adds an asterix to the end of the given String if not already present.
 *
 * @param {string} val The value to check.
 * @returns {string} The given value with a single asterix at the end.
 */
function addStar (val) {
    return val.endsWith("*") ? val : val + "*";
}

/**
 * Recursively creates a logical representation of the literals as an array to be later parsed to a String.
 *
 * @param {Object[]} stateLiterals Literals from the state. This is the root element.
 * @param {?(Object[])} [literals = null] Literals from the clause of the current function call.
 * @param {String[]} [userHelp = []] The current values collected for the representation of the literals.
 * @returns {String[]} The information of regarding the logical dependency of the elements of the current clause.
 */
function createLiteralStructure (stateLiterals, literals = null, userHelp = []) {
    const lit = literals === null ? stateLiterals : literals;

    for (const literal of lit) {
        const {field, clause} = literal;

        if (field) {
            userHelp.push(field.inputLabel);
            continue;
        }

        userHelp.push(clause.type, "(");
        createLiteralStructure(stateLiterals, clause.literals, userHelp);
        userHelp.push(")");
    }

    return userHelp;
}

/**
 * Creates a String representation for the built literals structure.
 * TODO: Write unit tests for this function when replaceAll is supported by mocha.
 *
 * @param {Object[]} literals The literals for which the structure is built and which are parsed.
 * @returns {String} String representation for the structure of the given literal.
 */
export function createUserHelp (literals) {
    const and = i18next.t("common:modules.tools.wfsSearch.userHelp.and"),
        or = i18next.t("common:modules.tools.wfsSearch.userHelp.or"),
        structure = createLiteralStructure(literals);
    let userHelp = "",
        marker = "";

    for (const el of structure) {
        if (el === "and" || el === "or") {
            marker = el;
            continue;
        }
        if (el !== "(" && el !== ")") {
            userHelp += `${el} ${marker} `;
            continue;
        }

        if (el === ")" && marker !== "") {
            userHelp = userHelp.substring(0, userHelp.length - (marker.length + 2));
            marker = "";
        }

        userHelp += el;
    }

    return userHelp
        .replaceAll(" and ", ` ${and} `)
        .replaceAll(" or ", ` ${or} `)
        .replaceAll(")(", `) ${and} (`)
        .replaceAll(",", " / ")
        .replaceAll("*", "");
}

/**
 * Recursively adds unique ids to the clauses and fields to be able to properly update the values set for a field.
 * Also prepares the list of required fields.
 *
 * @param {Object[]} stateLiterals The literals set in the state.
 * @param {?(Object[])} [literals = null] As the structure is recursively traversed, this value is an inner array of the stateLiterals.
 * @param {String} [clauseId = ""] The id of an outer clause.
 * @param {Object} [requiredValues = {}] The values required to be set by the user.
 * @returns {Object} Returns the current values for the required fields.
 */
export function prepareLiterals (stateLiterals, literals = null, clauseId = "", requiredValues = {}) {
    const lit = literals === null ? stateLiterals : literals,
        idPrefix = clauseId ? clauseId + "+" : "wfsSearch-";

    lit.forEach((literal, i) => {
        if (literal.field) {
            literal.field.id = `${idPrefix}field-${i}`;
            literal.field.value = null;

            if (literal.field.required) {
                requiredValues[literal.field.id] = null;

                literal.field.inputLabel = typeof literal.field.inputLabel === "object"
                    ? literal.field.inputLabel.map(label => addStar(label))
                    : addStar(literal.field.inputLabel);
            }
            if (literal.clause) {
                delete literal.clause;
            }
        }
        else {
            const id = `${idPrefix}clause-${i}`;

            literal.clause.id = id;
            prepareLiterals(stateLiterals, literal.clause.literals, id, requiredValues);
        }
    });

    return requiredValues;
}

/**
 * Recursively updates the values of a field.
 *
 * @param {String} id Unique Id of the field.
 * @param {String} value New value to be set on the field.
 * @param {Object[]} stateLiterals The literals set in the state.
 * @param {Object} requiredValues The fields that are required to be set.
 * @param {Number} [parameterIndex] If multiple parameters can be chosen from one Field, the value needs to set on the parameter that is currently selectable.
 * @param {?(Object[])} [literals = null] As the structure is recursively traversed, this value is an inner array of the stateLiterals.
 * @returns {Object} Returns the current values for the required fields.
 */
export function fieldValueChanged (id, value, stateLiterals, requiredValues, parameterIndex, literals = null) {
    const arr = literals || stateLiterals;

    arr.forEach(literal => {
        if (literal.clause) {
            fieldValueChanged(id, value, stateLiterals, requiredValues, parameterIndex, literal.clause.literals);
        }
        else if (literal.field) {
            const fieldRequired = Array.isArray(literal.field.required) ? literal.field.required[parameterIndex] : literal.field.required;

            if (literal.field.id === id) {
                literal.field.value = value;

                if (fieldRequired) {
                    requiredValues[id] = value;
                }
                if (Array.isArray(literal.field.required)) {
                    literal.field.parameterIndex = parameterIndex;
                }
            }
        }
    });

    return requiredValues;
}

/**
 * Resets all the values of the literals of the current searchInstance.
 *
 * @param {Object[]} instanceLiterals The literals of the current searchInstance.
 * @param {?(Object[])} [literals = null] As the structure is recursively traversed, this value is an inner array of the instanceLiterals.
 * @returns {void}
 */
export function resetFieldValues (instanceLiterals, literals = null) {
    const arr = literals || instanceLiterals;

    arr.forEach(literal => {
        if (literal.clause) {
            resetFieldValues(instanceLiterals, literal.clause.literals);
        }
        else if (literal.field) {
            literal.field.value = "";
        }
    });
}
