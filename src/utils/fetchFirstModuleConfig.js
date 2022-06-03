/**
 * Retrieves a value from an object by dot or array syntax, like this:
 *  - const ex = {drinks: {milk: {fresh: "tasty"}}};
 *  - getByDotSyntax(ex, "drinks.milk.fresh") === "tasty"
 *  - getByDotSyntax(ex, ["drinks", "milk", "fresh"]) === "tasty"
 *  - getByDotSyntax(ex, ["drinks", "milk.fresh"]) === "tasty"
 *  - getByDotSyntax(ex, ["drinks", ["milk", "fresh"]]) === "tasty"
 *  - getByDotSyntax(ex, ["drinks", ["milk.fresh"]]) === "tasty"
 *
 * @Todo Needs to be a helper, should not be here
 * @param {Object} obj - The object to search in
 * @param {(String|String[])} path - string or array of strings with the key
 * @param {String} separator - Charactor to separate multiple keys
 * @returns {*}  Retrieved value or undefined, if nothing found
 */
function getByDotSyntax (obj, path, separator = ".") {
    const pathArray = createKeyPathArray(path, separator);

    if (pathArray === false) {
        console.warn("Invalid path parameter given for \"getByDotSyntax()\":", path);
        return undefined;
    }

    return getByArraySyntax(obj, pathArray);
}

/**
 * Retrieves a value from an object by array syntax, like this:
 *  - const ex = {drinks: {milk: {fresh: "tasty"}}};
 *  - getByArraySyntax(ex, ["drinks", "milk", "fresh"]) === "tasty"
 *
 * @param {Object} obj - The object to search in
 * @param {String[]} pathArray - Array with path keys
 * @returns {*}  Retrieved value or undefined, if nothing found
 */
function getByArraySyntax (obj, pathArray) {
    if (!Array.isArray(pathArray)) {
        return undefined;
    }
    const step = pathArray.shift();

    if (obj instanceof Object === false || obj[step] === undefined) {
        return undefined;
    }

    if (pathArray.length === 0) {
        return obj[step];
    }

    return getByArraySyntax(obj[step], pathArray);
}

/**
 * Creates flat array of strings out of a variety of possible path arrays or strings.
 *  - createKeyPathArray("drinks.milk.fresh")
 *  - createKeyPathArray(["drinks", "milk", "fresh"])
 *  - createKeyPathArray(["drinks", "milk.fresh"])
 *  - createKeyPathArray(["drinks", ["milk", "fresh"]])
 *  - createKeyPathArray(["drinks", ["milk.fresh"]])
 * all return ["drinks", "milk, "fresh"]
 *
 * If Arrays dont contain Strings or Arrays, it returns false.
 * If Strings start or end with the separator, it returns false.
 *
 * @param {String|String[]} path string or array of strings with the key path
 * @param {String} separator Charactor to separate multiple keys
 * @returns {String[]|Boolean} Array of path strings or false
 */
function createKeyPathArray (path, separator = ".") {
    let result = [];

    if (typeof path === "string") {
        result = path.split(separator);

        for (const pathPart1 of result) {
            if (pathPart1 === "") {
                return false;
            }
        }

        return result;
    }
    else if (!Array.isArray(path)) {
        return false;
    }

    for (const pathPart2 of path) {
        const resultRec = createKeyPathArray(pathPart2, separator);

        if (resultRec === false) {
            return false;
        }

        result = [...result, ...resultRec];
    }

    return result;
}

/**
 * Deep merges module config objects into the module's state.
 * Module configs must be objects.
 * Module must have default values for those properties.
 *
 * @param {Object} context - The store's context
 * @param {String[]} configPaths - Array of paths to search for in root state
 * @param {String} moduleName - Name of the module
 * @param {Boolean} [recursiveFallback=true] - (optional) determines whether the fallbackOption is executed
 * @returns {Boolean} true, if successfully merged
 */
function fetchFirstModuleConfig (context, configPaths, moduleName, recursiveFallback = true) {
    if (context?.state instanceof Object === false) {
        console.warn("fetchFirstModuleConfig: The given context is missing a state:", context);
        return false;
    }
    else if (typeof context?.rootGetters?.toolConfig !== "function") {
        console.warn("fetchFirstModuleConfig: The given context is missing the toolConfig function of rootGetters:", context);
        return false;
    }
    else if (!Array.isArray(configPaths)) {
        console.warn("fetchFirstModuleConfig: The given configPaths must be an array, but none is given:", configPaths);
        return false;
    }
    const missingSources = [],
        missingDefaultValue = [],
        // no real config-params, e.g. added during parsing: must not be in state as default
        defaultsNotInState = ["i18nextTranslate", "useConfigName", "type", "parentId", "onlyDesktop"],
        state = context.state[moduleName] || context.state;

    let source,
        success = false;

    for (const path of configPaths) {
        source = getByDotSyntax(context.rootState, path);

        if (source === undefined) {
            missingSources.push(createKeyPathArray(path));
            continue;
        }

        // Config Source must be an object in order to set those into the module state
        if (source instanceof Object === false || Array.isArray(source)) {
            console.error("The config for \"" + moduleName + "\" is not an object and thereby ignored.", source);
            console.warn("Path to the defective config:", createKeyPathArray(path));
            continue;
        }

        // Check for missing default value in module state
        for (const sourceProp in source) {
            if (!defaultsNotInState.includes(sourceProp) && state[sourceProp] === undefined) {
                missingDefaultValue.push(sourceProp);
            }
        }

        if (missingDefaultValue.length > 0) {
            console.warn("Default value were not found in module \"" + moduleName + "\". Those are taken from config now, but are not expected to have any effect.", missingDefaultValue);
            console.warn("Path to the module:", createKeyPathArray(path));
        }

        // only use the first found config
        break;
    }

    if (!source && recursiveFallback) {
        source = context.rootGetters.toolConfig(moduleName);
    }

    if (source) {
        context.state = deepMerge(source, state);
        success = true;
    }

    return success;
}

/**
 * Deep merges one object into another. If given source param is no object or an Array, nothing happens.
 * @param {Object} source - Source object to merge into target object
 * @param {Object} target - Target object that will be modified
 * @returns {Object} - The resulting merged object
 */
function deepMerge (source, target) {
    if (source instanceof Object === false) {
        return target;
    }

    if (target instanceof Object === false) {
        if (Array.isArray(source)) {
            return [...source];
        }
        return {...source};
    }
    if (Array.isArray(target)) {
        target.splice(0, target.length, ...source);
        return target;
    }

    for (const key in source) {
        if (source[key] instanceof Object === false) {
            target[key] = source[key];
        }
        else {
            target[key] = deepMerge(source[key], target[key]);
        }
    }

    return target;
}

export {
    getByDotSyntax,
    getByArraySyntax,
    createKeyPathArray,
    fetchFirstModuleConfig,
    deepMerge
};

