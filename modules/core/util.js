import uniqueId from "../../src/utils/uniqueId.js";
import LoaderOverlay from "../../src/utils/loaderOverlay";

const Util = Backbone.Model.extend(/** @lends Util.prototype */{
    defaults: {
        config: "",
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH", "GEOM"],
        uiStyle: "DEFAULT",
        loaderOverlayTimeoutReference: null,
        loaderOverlayTimeout: 40,
        // the loaderOverlayCounter has to be set to 1 initialy, because it is shown on start and hidden at the end of app.js
        loaderOverlayCounter: 1,
        fadeOut: 2000
    },
    /**
     * @class Util
     * @extends Backbone.Model
     * @memberof Core
     * @constructs
     * @property {String} config="" todo
     * @property {String[]} ignoredKeys=["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH", "GEOM"] List of ignored attribute names when displaying attribute information of all layer types.
     * @property {String} uiStyle="DEFAULT" Controls the layout of the controls.
     * @property {String} loaderOverlayTimeoutReference=null todo
     * @property {String} loaderOverlayTimeout="20" Timeout for the loadergif.
     * @listens Core#RadioRequestUtilIsViewMobile
     * @listens Core#RadioRequestUtilIsApple
     * @listens Core#RadioRequestUtilIsAndroid
     * @listens Core#RadioRequestUtilIsOpera
     * @listens Core#RadioRequestUtilIsWindows
     * @listens Core#RadioRequestUtilIsChrome
     * @listens Core#RadioRequestUtilIsInternetExplorer
     * @listens Core#RadioRequestUtilIsAny
     * @listens Core#RadioRequestUtilGetUiStyle
     * @listens Core#RadioRequestUtilGetIgnoredKeys
     * @listens Core#RadioRequestUtilSort
     * @listens Core#RadioRequestUtilGetMasterPortalVersionNumber
     * @listens Core#RadioRequestUtilRenameKeys
     * @listens Core#RadioRequestUtilRenameValues
     * @listens Core#RadioRequestUtilDifferenceJs
     * @listens Core#RadioRequestUtilSortBy
     * @listens Core#RadioRequestUtilUniqueId
     * @listens Core#RadioTriggerUtilHideLoader
     * @listens Core#RadioTriggerUtilShowLoader
     * @listens Core#RadioTriggerUtilSetUiStyle
     * @listens Core#event:changeIsViewMobile
     * @fires Core#RadioTriggerIsViewMobileChanged
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core#RadioTriggerUtilHideLoader
     */
    initialize: function () {
        const channel = Radio.channel("Util");

        channel.reply({
            "isViewMobile": function () {
                return this.get("isViewMobile");
            },
            "getMasterPortalVersionNumber": this.getMasterPortalVersionNumber,
            "isApple": this.isApple,
            "isAndroid": this.isAndroid,
            "isOpera": this.isOpera,
            "isWindows": this.isWindows,
            "isChrome": this.isChrome,
            "isInternetExplorer": this.isInternetExplorer,
            "isAny": this.isAny,
            "getUiStyle": function () {
                return this.get("uiStyle");
            },
            "getIgnoredKeys": function () {
                return this.get("ignoredKeys");
            },
            "sort": this.sort,
            "convertArrayElementsToString": this.convertArrayElementsToString,
            "renameKeys": this.renameKeys,
            "renameValues": this.renameValues,
            "pickKeyValuePairs": this.pickKeyValuePairs,
            "groupBy": this.groupBy,
            "sortBy": this.sortBy,
            "uniqueId": this.uniqueId,
            "pick": this.pick,
            "omit": this.omit,
            "findWhereJs": this.findWhereJs,
            "whereJs": this.whereJs,
            "isEqual": this.isEqual,
            "differenceJs": this.differenceJs,
            "toObject": this.toObject,
            "isEmpty": this.isEmpty,
            "searchNestedObject": this.searchNestedObject
        }, this);

        channel.on({
            "hideLoader": this.hideLoader,
            "refreshTree": this.refreshTree,
            "showLoader": this.showLoader,
            "setUiStyle": this.setUiStyle
        }, this);

        // initial isMobileView setzen
        this.toggleIsViewMobile();

        this.listenTo(this, {
            "change:isViewMobile": function () {
                channel.trigger("isViewMobileChanged", this.get("isViewMobile"));
            }
        });

        $(window).on("resize", this.toggleIsViewMobile.bind(this));
    },

    /**
     * Returns current Master Portal Version Number
     * @returns {string} Masterportal version number
     */
    getMasterPortalVersionNumber: function () {
        return require("../../package.json").version;
    },

    /**
     * This sort function sorts arrays, objects and strings. This is a replacement for underscores sortBy
     * @param {(Array|Object|String)} [list=undefined] the array, object or string to sort
     * @param {(String|Number|Function)} [iteratee=undefined] may be a function (value, key, list) returning a number to sort by or the name of the key to sort objects with
     * @param {Object} [context=undefined] the context to be used for iteratee, if iteratee is a function
     * @returns {Array}  a new list as array
     */
    sortBy: function (list, iteratee, context) {
        let sortArray = list,
            mapToSort = [];

        if (sortArray === null || typeof sortArray !== "object" && typeof sortArray !== "string") {
            return [];
        }

        if (typeof sortArray === "string") {
            sortArray = sortArray.split("");
        }

        if (typeof iteratee !== "function") {
            if (!Array.isArray(sortArray)) {
                sortArray = Object.values(sortArray);
            }

            // it is important to work with concat() on a copy of sortArray
            return sortArray.concat().sort((a, b) => {
                if (a === undefined) {
                    return 1;
                }
                else if (b === undefined) {
                    return -1;
                }
                else if (iteratee !== undefined) {
                    if (typeof a !== "object" || !Object.prototype.hasOwnProperty.call(a, iteratee)) {
                        return 1;
                    }
                    else if (typeof b !== "object" || !Object.prototype.hasOwnProperty.call(b, iteratee)) {
                        return -1;
                    }
                    else if (a[iteratee] > b[iteratee]) {
                        return 1;
                    }
                    else if (a[iteratee] < b[iteratee]) {
                        return -1;
                    }

                    return 0;
                }
                else if (a > b) {
                    return 1;
                }
                else if (a < b) {
                    return -1;
                }

                return 0;
            });
        }

        if (!Array.isArray(sortArray)) {
            let key;

            for (key in sortArray) {
                mapToSort.push({
                    idx: iteratee.call(context, sortArray[key], key, list),
                    obj: sortArray[key]
                });
            }
        }
        else {
            mapToSort = sortArray.map((value, key) => {
                return {
                    idx: iteratee.call(context, value, key, list),
                    obj: value
                };
            }, context);
        }

        mapToSort.sort((a, b) => {
            if (a.idx > b.idx) {
                return 1;
            }
            else if (a.idx < b.idx) {
                return -1;
            }

            return 0;
        });

        return mapToSort.map((value) => {
            return value.obj;
        });
    },

    /**
     * Sorting alorithm that distinguishes between array[objects] and other arrays.
     * arrays[objects] can be sorted by up to 2 object attributes
     * @param {String} type Type of sortAlgorithm
     * @param {array} input array that has to be sorted
     * @param {String} first first attribute an array[objects] has to be sorted by
     * @param {String} second second attribute an array[objects] has to be sorted by
     * @returns {array} sorted array
     */
    sort: function (type, input, first, second) {
        let sorted = input;
        const isArray = Array.isArray(sorted),
            isArrayOfObjects = isArray ? sorted.every(element => typeof element === "object") : false;

        if (isArray && !isArrayOfObjects) {
            sorted = this.sortArray(sorted);
        }
        else if (isArray && isArrayOfObjects) {
            sorted = this.sortObjects(type, sorted, first, second);
        }

        return sorted;
    },

    /**
     * Sorts an array.
     * @param {Array} input array to sort.
     * @returns {Array} sorted array
     */
    sortArray: function (input) {
        return input.sort(this.sortAlphaNum);
    },

    /**
     * Sorting function for alphanumeric sorting. First sorts alphabetically, then numerically.
     * @param {*} a First comparator.
     * @param {*} b Secons comparator.
     * @returns {Number} Sorting index.
     */
    sortAlphaNum: function (a, b) {
        const regExAlpha = /[^a-zA-Z]/g,
            regExNum = /[^0-9]/g,
            aAlpha = String(a).replace(regExAlpha, ""),
            bAlpha = String(b).replace(regExAlpha, "");
        let aNum,
            bNum,
            returnVal = -1;

        if (aAlpha === bAlpha) {
            aNum = parseInt(String(a).replace(regExNum, ""), 10);
            bNum = parseInt(String(b).replace(regExNum, ""), 10);
            if (aNum === bNum) {
                returnVal = 0;
            }
            else if (aNum > bNum) {
                returnVal = 1;
            }
        }
        else {
            returnVal = aAlpha > bAlpha ? 1 : -1;
        }
        return returnVal;
    },

    /**
     * Sorting function for numalpha sorting. First sorts numerically, then alphabetically.
     * @param {*} a First comparator.
     * @param {*} b Secons comparator.
     * @returns {Number} Sorting index.
     */
    sortNumAlpha: function (a, b) {
        const regExAlpha = /[^a-zA-Z]/g,
            regExNum = /[^0-9]/g,
            aAlpha = String(a).replace(regExAlpha, ""),
            bAlpha = String(b).replace(regExAlpha, ""),
            aNum = parseInt(String(a).replace(regExNum, ""), 10),
            bNum = parseInt(String(b).replace(regExNum, ""), 10);
        let returnVal = -1;

        if (aNum === bNum) {
            if (aAlpha === bAlpha) {
                returnVal = 0;
            }
            else if (aAlpha > bAlpha) {
                returnVal = 1;
            }
        }
        else {
            returnVal = aNum > bNum ? 1 : -1;
        }

        return returnVal;
    },

    /**
     * Sorting Function to sort address.
     * Expected string format to be "STREETNAME HOUSENUMBER_WITH_OR_WITHOUT_SUFFIX, *"
     * @param {String} aObj First comparator.
     * @param {String} bObj Secons comparator.
     * @returns {Number} Sorting index.
     */
    sortAddress: function (aObj, bObj) {
        const a = aObj.name,
            b = bObj.name,
            aIsValid = this.isValidAddressString(a, ",", " "),
            bIsValid = this.isValidAddressString(b, ",", " "),
            aSplit = this.splitAddressString(a, ",", " "),
            bSplit = this.splitAddressString(b, ",", " "),
            aFirstPart = aIsValid ? aSplit[0] : a,
            aSecondPart = aIsValid ? aSplit[1] : a,
            bFirstPart = bIsValid ? bSplit[0] : b,
            bSecondPart = bIsValid ? bSplit[1] : b;
        let returnVal = -1;

        if (aFirstPart > bFirstPart) {
            returnVal = 1;
        }
        if (aFirstPart === bFirstPart) {
            returnVal = this.sortNumAlpha(aSecondPart, bSecondPart);
        }

        return returnVal;
    },

    /**
     * Splits the address string.
     * @param {String} string Address string.
     * @param {String} separator Separator to separate the Address and Housenumber from other info such as zipCode or City.
     * @param {String} lastOccurrenceChar Character to separate the streetname from the housenumber.
     * @returns {String[]} - Array containing the splitted parts.
     */
    splitAddressString: function (string, separator, lastOccurrenceChar) {
        const splitBySeparator = string.split(separator),
            splittedString = [];

        splitBySeparator.forEach(split => {
            const lastOccurrence = split.lastIndexOf(lastOccurrenceChar),
                firstPart = split.substr(0, lastOccurrence).trim(),
                secondPart = split.substr(lastOccurrence).trim();

            splittedString.push(firstPart);
            splittedString.push(secondPart);
        });
        return splittedString;
    },

    /**
     * Checks if address string is valid for address sorting.
     * The string gets splitted by "separator". The occurrence of the "lastOcccurrenceChar" is checked.
     * @param {String} string String to check.
     * @param {String} separator Separator to separate Address (streetname and housenumber) from additional information (postal code, etc.).
     * @param {String} lastOccurrenceChar Charactor to separate the streetname from the housenumber.
     * @returns {Boolean} - Flag if string is valid.
     */
    isValidAddressString: function (string, separator, lastOccurrenceChar) {
        let isValidAddressString = false;
        const separatedString = string.split(separator),
            firstPartOfSeparatedString = separatedString[0];

        if (string.indexOf(separator) !== -1 && firstPartOfSeparatedString && firstPartOfSeparatedString.indexOf(lastOccurrenceChar) !== -1) {
            isValidAddressString = true;
        }

        return isValidAddressString;
    },

    /**
     * Sorts array of objects basend on the given type.
     * @param {String} type Type of sort algorithm.
     * @param {Object[]} input Array with object to be sorted.
     * @param {String} first First attribute to sort by.
     * @param {String} second Second attribute to sort by.
     * @returns {Object[]} - Sorted array of objects.
     */
    sortObjects: function (type, input, first, second) {
        let sortedObj = input;

        if (type === "address") {
            sortedObj = this.sortObjectsAsAddress(sortedObj, first);
        }
        else {
            sortedObj = this.sortObjectsNonAddress(first, second, sortedObj);
        }

        return sortedObj;
    },

    /**
     * Sorts Objects not as address.
     * @param {String} first First attribute to sort by.
     * @param {String} second Second attribute to sort by.
     * @param {Object[]} [input=[]] Array with object to be sorted.
     * @returns {Object[]} - Sorted array of objects.
     */
    sortObjectsNonAddress: function (first, second, input = []) {
        const sortedOjectSecond = input.sort((elementA, elementB) => this.compareInputs(elementA, elementB, second)),
            sortedObjectFirst = sortedOjectSecond.sort((elementA, elementB) => this.compareInputs(elementA, elementB, first));

        return sortedObjectFirst;
    },

    /**
     * Compare two elements.
     * @param {object} elementA - The first object.
     * @param {object} elementB - The second object.
     * @param {string|number} value - value by sort.
     * @returns {number} Sort sequence in numbers
     */
    compareInputs: function (elementA, elementB, value) {
        const firstElement = isNaN(parseInt(elementA[value], 10)) ? elementA[value] : parseInt(elementA[value], 10),
            secondElement = isNaN(parseInt(elementB[value], 10)) ? elementB[value] : parseInt(elementB[value], 10);

        if (firstElement < secondElement) {
            return -1;
        }
        else if (firstElement > secondElement) {
            return 1;
        }

        return 0;
    },

    /**
     * Sorts array of objects as address using a special sorting alorithm
     * @param {Object[]} input Array with object to be sorted.
     * @returns {Object[]} - Sorted array of objects.
     */
    sortObjectsAsAddress: function (input) {
        return input.sort(this.sortAddress.bind(this));
    },

    /**
     * Searches the userAgent for the string android.
     * @return {Array|null} Returns an array with the results. Returns zero if nothing is found.
     */
    isAndroid: function () {
        return navigator.userAgent.match(/Android/i);
    },

    /**
     * Searches the userAgent for the string iPhone, iPod or iPad.
     * @return {Array|null} Returns an array with the results. Returns zero if nothing is found.
     */
    isApple: function () {
        return navigator.userAgent.match(/iPhone|iPod|iPad/i);
    },

    /**
     * Searches the userAgent for the string opera.
     * @return {Array|null} Returns an array with the results. Returns zero if nothing is found.
     */
    isOpera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
    },

    /**
     * Searches the userAgent for the string windows.
     * @return {Array|null} Returns an array with the results. Returns zero if nothing is found.
     */
    isWindows: function () {
        return navigator.userAgent.match(/IEMobile/i);
    },

    /**
     * Searches the userAgent for the string chrome.
     * @return {Array|null} Returns an array with the results. Returns zero if nothing is found.
     */
    isChrome: function () {
        let isChrome = false;

        if ((/Chrome/i).test(navigator.userAgent)) {
            isChrome = true;
        }
        return isChrome;
    },

    /**
     * todo
     * @returns {*} todo
     */
    isAny: function () {
        return this.isAndroid() || this.isApple() || this.isOpera() || this.isWindows();
    },

    /**
     * Searches the userAgent for the string internet explorer.
     * @return {Array|null} Returns an array with the results. Returns zero if nothing is found.
     */
    isInternetExplorer: function () {
        let ie = false;

        if ((/MSIE 9/i).test(navigator.userAgent)) {
            ie = "IE9";
        }
        else if ((/MSIE 10/i).test(navigator.userAgent)) {
            ie = "IE10";
        }
        else if ((/rv:11.0/i).test(navigator.userAgent)) {
            ie = "IE11";
        }
        return ie;
    },

    /**
     * shows the loader gif
     * @fires Core#RadioTriggerUtilHideLoader
     * @returns {void}
     */
    showLoader: function () {
        LoaderOverlay.show();
    },

    /**
     * hides the loder gif until the timeout has expired
     * @returns {void}
     */
    hideLoader: function () {
        LoaderOverlay.hide();
    },

    /**
     * Setter for attribute isViewMobile
     * @param {boolean} value visibility
     * @return {void}
     */
    setIsViewMobile: function (value) {
        this.set("isViewMobile", value);
    },

    /**
     * Toggled the isViewMobile attribute when the window width exceeds or falls below 768px
     * @return {void}
     */
    toggleIsViewMobile: function () {
        if (window.innerWidth >= 768) {
            this.setIsViewMobile(false);
        }
        else {
            this.setIsViewMobile(true);
        }
    },

    /**
     * replaces the names of object keys with the values provided.
     * @param {object} keysMap - keys mapping object
     * @param {object} obj - the original object
     * @returns {object} the renamed object
     */
    renameKeys: function (keysMap, obj) {
        return Object.keys(obj).reduce((acc, key) => {
            return {
                ...acc,
                ...{[keysMap[key] || key]: obj[key]}
            };
        },
        {});
    },

    /**
     * recursively replaces the names of object values with the values provided.
     * @param {object} valuesMap - values mapping object
     * @param {object} obj - the original object
     * @returns {object} the renamed object
     */
    renameValues: function (valuesMap, obj) {
        return Object.keys(obj).reduce((acc, key) => {
            if (obj[key]) {
                if (obj[key].constructor === Object) {
                    return {
                        ...acc,
                        ...{[key]: this.renameValues(valuesMap, obj[key])}
                    };
                }
            }
            return {
                ...acc,
                ...{[key]: valuesMap[obj[key]] || obj[key]}
            };
        },
        {});
    },

    /**
     * picks the key-value pairs corresponding to the given keys from an object.
     * @param {object} obj - the original object
     * @param {string[]} keys - the given keys to be returned
     * @returns {object} the picked object
     */
    pickKeyValuePairs: function (obj, keys) {
        const result = {};

        keys.forEach(function (key) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                result[key] = obj[key];
            }
        });

        return result;
    },

    /**
     * Groups the elements of an array based on the given function.
     * Use Array.prototype.map() to map the values of an array to a function or property name.
     * Use Array.prototype.reduce() to create an object, where the keys are produced from the mapped results.
     * @param {array} [arr=[]] - elements to group
     * @param {function} [fn=null] - reducer function
     * @returns {object} - the grouped object
     */
    groupBy: function (arr = [], fn = null) {
        return arr.map(typeof fn === "function" ? fn : val => val[fn]).reduce((acc, val, i) => {
            acc[val] = (acc[val] || []).concat(arr[i]);
            return acc;
        }, {});
    },

    /**
     * Generate a globally-unique id for client-side models or DOM elements that need one. If prefix is passed, the id will be appended to it.
     * @param {String} [prefix=""] prefix for the id
     * @returns {String}  a globally-unique id
     */
    uniqueId: function (prefix) {
        return uniqueId(prefix);
    },

    /**
     * Setter for uiStyle
     * @param {*} value todo
     * @returns {void}
     */
    setUiStyle: function (value) {
        this.set("uiStyle", value);
    },

    /**
     * sets the loaderOverlayCounter to a specific number
     * @param {Integer} value the value to set the loaderOverlayCounter to
     * @returns {Void}  -
     */
    setLoaderOverlayCounter: function (value) {
        this.set("loaderOverlayCounter", value);
    },

    /**
     * increments the loaderOverlayCounter
     * @pre the loaderOverlayCounter is n
     * @post the loaderOverlayCounter is n + 1
     * @returns {Void}  -
     */
    incLoaderOverlayCounter: function () {
        this.setLoaderOverlayCounter(this.get("loaderOverlayCounter") + 1);
    },

    /**
     * decrements the loaderOverlayCounter
     * @pre the loaderOverlayCounter is n
     * @post the loaderOverlayCounter is n - 1
     * @returns {Void}  -
     */
    decLoaderOverlayCounter: function () {
        this.setLoaderOverlayCounter(this.get("loaderOverlayCounter") - 1);
    },
    /**
     * Refresh LayerTree dependant on TreeType
     * supports light and custom
     * @returns {void}
     */
    refreshTree: () => {
        let collection = null;

        switch (Radio.request("Parser", "getTreeType")) {
            case "classic":
                collection = Radio.request("ModelList", "getCollection");

                collection.trigger("updateClassicTree");
                break;
            case "light":
                Radio.trigger("ModelList", "refreshLightTree");
                break;
            default:
                Radio.trigger("ModelList", "renderTree");
        }
    },

    /**
     * Return a copy of the object, filtered to only have values for the whitelisted keys
     * (or array of valid keys).
     * @param {Object} object - the object.
     * @param {Number[]|String[]} keys - the key(s) to search for.
     * @returns {Object} - returns the entry/entries with the right key/keys.
     */
    pick: function (object, keys) {
        return keys.reduce((obj, key) => {
            if (object && Object.prototype.hasOwnProperty.call(object, key)) {
                obj[key] = object[key];
            }
            return obj;
        }, {});
    },

    /**
     * Returns a copy of the object, filtered to omit the keys specified
     * (or array of blacklisted keys).
     * @param {Object} object - The object.
     * @param {Number[]|String[]|Boolean[]} blacklist - Blacklisted keys.
     * @returns {Object} - returns the entry/entries without the blacklisted key/keys.
     */
    omit: function (object, blacklist) {
        const keys = Object.keys(object ? object : {}),
            blacklistWithStrings = this.convertArrayElementsToString(blacklist),
            filteredKeys = keys.filter(key => !blacklistWithStrings.includes(key)),
            filteredObj = filteredKeys.reduce((result, key) => {
                result[key] = object[key];
                return result;
            }, {});

        return filteredObj;
    },

    /**
     * Converts elements of an array to strings.
     * @param {Number[]|String[]|Boolean[]} [array=[]] - Array with elements.
     * @returns {String[]} Array with elements as string.
     */
    convertArrayElementsToString: function (array = []) {
        const arrayWithStrings = [];

        for (const element of array) {
            arrayWithStrings.push(String(element));
        }
        return arrayWithStrings;
    },

    /** Looks through the list and returns the first value that matches all of the key-value pairs listed in properties
     * listed in hitId.
     * @param {Object[]} [list=[]] - the list.
     * @param {Object} properties property/entry to search for.
     * @returns {Object} - returns the first value/entry, that matches.
     */
    findWhereJs: function (list = [], properties = "") {
        return list.find(
            item => Object.keys(properties).every(
                key => item[key] === properties[key]
            )
        );
    },

    /**
     *  Looks through each value in the list, returning an array of all the values that matches the key-value pairs listed in properties
     * @param {Object[]} [list=[]] - the list.
     * @param {Object} properties property/entry to search for.
     * @returns {array} - returns an array of all the values that matches.
     */
    whereJs: function (list = [], properties = "") {
        return list.filter(
            item => Object.keys(properties).every(
                key => item[key] === properties[key]
            )
        );
    },

    /**
     * Looks through each value in the array a, returning an array of all the values that are not present in the array b
     * @param {array} [a=[]] - elements to check
     * @param {array} [b=[]] - elements to check
     * @returns {array} - returns diffrence between array a and b
     */
    differenceJs: function (a = [], b = []) {
        if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0) {
            return [];
        }
        if (b.length === 0) {
            return a;
        }
        return a.filter(e => !b.includes(e));
    },

    /**
     * Check if two objects are same
     * @param {Object} first the first object
     * @param {Object} second the second object
     * @returns {Boolean} true or false
     */
    isEqual: function (first, second) {
        // If the value of either variable is empty, we can instantly compare them and check for equality.
        if (first === null || first === undefined || second === null || second === undefined) {
            return first === second;
        }

        // If neither are empty, we can check if their constructors are equal. Because constructors are objects, if they are equal, we know the objects are of the same type (though not necessarily of the same value).
        if (first.constructor !== second.constructor) {
            return false;
        }

        // If we reach this point, we know both objects are of the same type so all we need to do is check what type one of the objects is, and then compare them
        if (first instanceof Function || first instanceof RegExp) {
            return first === second;
        }

        // Throught back to the equlity check we started with. Just incase we are comparing simple objects.
        if (first === second || first.valueOf() === second.valueOf()) {
            return true;
        }

        // If the value of check we saw above failed and the objects are Dates, we know they are not Dates because Dates would have equal valueOf() values.
        if (first instanceof Date) {
            return false;
        }

        // If the objects are arrays, we know they are not equal if their lengths are not the same.
        if (Array.isArray(first) && first.length !== second.length) {
            return false;
        }

        // If we have gotten to this point, we need to just make sure that we are working with objects so that we can do a recursive check of the keys and values.
        if (!(first instanceof Object) || !(second instanceof Object)) {
            return false;
        }

        // We now need to do a recursive check on all children of the object to make sure they are deeply equal
        const firstKeys = Object.keys(first),
            // Here we just make sure that all the object keys on this level of the object are the same.
            allKeysExist = Object.keys(second).every(
                i => firstKeys.indexOf(i) !== -1
            ),

            // Finally, we pass all the values of our of each object into this function to make sure everything matches
            allKeyValuesMatch = firstKeys.every(
                i => this.isEqual(first[i], second[i])
            );

        return allKeysExist && allKeyValuesMatch;
    },

    /**
     * Converts lists into objects
     * @param {Array} list to be converted
     * @param {Array} values the corresponding values of parallel array
     * @returns {Object} result
     */
    toObject: function (list, values) {
        const result = {};

        for (let i = 0, length = list.length; i < length; i++) {
            if (values) {
                result[list[i]] = values[i];
            }
            else {
                result[list[i][0]] = list[i][1];
            }
        }
        return result;
    },

    /**
     * Checks if value is an empty object or collection.
     * @param {Object} obj the object to be checked
     * @returns {boolean} true or false
     */
    isEmpty: function (obj) {
        return [Object, Array].includes((obj || {}).constructor) && !Object.entries(obj || {}).length;
    },

    /**
     * helper function to find a key in nested object
     * @param {object} obj object to search
     * @param {string} key name of key to search for
     * @return {mixed} returns value for the given key or null if not found
     */
    searchNestedObject: function (obj, key) {
        let result;

        if (obj instanceof Array) {
            for (let i = 0; i < obj.length; i++) {
                result = this.searchNestedObject(obj[i], key);
                if (result) {
                    break;
                }
            }
        }
        else {
            for (const prop in obj) {
                if (prop === key) {
                    return obj;
                }
                if (obj[prop] instanceof Object || obj[prop] instanceof Array) {
                    result = this.searchNestedObject(obj[prop], key);
                    if (result) {
                        break;
                    }
                }
            }
        }
        return result;
    }
});

export default Util;
