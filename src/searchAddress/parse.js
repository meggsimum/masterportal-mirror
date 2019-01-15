import xml2js from "xml2js";

import {searchTypes} from "./types";

/**
 * Flattens xml2js result a little to avoid unnecessary one-element arrays.
 * NOTE currently keeping special properties ($, _) of xml2js to keep attributes.
 * @param {*} a anything
 * @returns {*} a's first element if one-element array, else a
 * @ignore
 */
function flatten (a) {
    if (Array.isArray(a) && a.length === 1) {
        return flatten(a[0]);
    }
    return a;
}

/**
 * Recursively searches an object for a key.
 * Since parsed XML tends to contain extra arrays, those are stepped into.
 * @param {(object|Array)} o object to deep-search for key
 * @param {string} key key to search for
 * @returns {*} value behind key
 * @ignore
 */
function findKey (o, key) {
    if (Array.isArray(o)) {
        return o.map(x => findKey(x, key)).filter(x => x)[0];
    }
    if (typeof o !== "object") {
        return null;
    }
    if (typeof o[key] !== "undefined") {
        return o[key];
    }
    return Object.keys(o).map(oKey => findKey(o[oKey], key)).filter(x => x)[0];
}

/**
 * Simply copies over all properties it can find.
 * @param {object} entry xml2js-parsed result entry
 * @returns {object} copied and flattened properties
 * @ignore
 */
function getAllPropertiesFlat (entry) {
    const properties = {
        objectType: Object.keys(entry)[0]
    };

    Object.keys(entry[properties.objectType][0]).forEach(propertyName => {
        properties[propertyName] = flatten(entry[properties.objectType][0][propertyName]);
    });

    return properties;
}

/**
 * Parses result entries; uses type-specific rules to determine name/geometry.
 * @param {object} entry xml2js-parsed result entry
 * @param {string} type type string
 * @returns {SearchResult} parsed search result for districts
 * @ignore
 */
function parseEntry (entry, type) {
    const searchResult = {
            type,
            properties: getAllPropertiesFlat(entry)
        },
        pos = findKey(searchResult.properties, "pos")[0],
        posList = findKey(searchResult.properties, "posList")[0];

    // setting name
    switch (type) {
        case searchTypes.DISTRICT:
            searchResult.name = searchResult.properties.geographicIdentifier._;
            break;
        case searchTypes.STREET_KEY:
        case searchTypes.STREET:
            searchResult.name = searchResult.properties.strassenname;
            break;
        case searchTypes.PARCEL:
            searchResult.name = `${searchResult.properties.gemarkung}/${searchResult.properties.flurstuecksnummer}`;
            break;
        case searchTypes.HOUSE_NUMBERS_FOR_STREET:
            // house number like "11a" as name is not very telling - use "Streetname 11a" and save "11a" separately in properties
            searchResult.properties.hausnummerkomplett = `${searchResult.properties.hausnummer._}${searchResult.properties.hausnummernzusatz
                ? searchResult.properties.hausnummernzusatz._
                : ""}`;
            searchResult.name =
                searchResult.properties.geographicIdentifier._.split(searchResult.properties.hausnummerkomplett)[0] +
                searchResult.properties.hausnummerkomplett;
            break;
        case searchTypes.ADDRESS_AFFIXED:
            searchResult.name = `${searchResult.properties.strassenname._} ${searchResult.properties.hausnummer._}${searchResult.properties.hausnummernzusatz
                ? searchResult.properties.hausnummernzusatz._
                : ""}`;
            break;
        case searchTypes.ADDRESS_UNAFFIXED:
            searchResult.name = `${searchResult.properties.strassenname._} ${searchResult.properties.hausnummer._}`;
            break;
        default:
            searchResult.name = null;
            console.error(`Unknown type in searchAddress.parse: '${type}'. Could not set name.`);
            break;
    }

    // setting geometry
    switch (type) {
        case searchTypes.DISTRICT:
        case searchTypes.STREET_KEY:
        case searchTypes.STREET:
            // favour polygon where it's available
            searchResult.geometry = {
                type: posList ? "Polygon" : "Point",
                coordinates: (posList || pos).split(" ")
            };
            break;
        case searchTypes.PARCEL:
        case searchTypes.HOUSE_NUMBERS_FOR_STREET:
        case searchTypes.ADDRESS_AFFIXED:
        case searchTypes.ADDRESS_UNAFFIXED:
            // for these, all polygon points are identical - using point is more clear
            searchResult.geometry = {
                type: "Point",
                coordinates: pos.split(" ")
            };
            break;
        default:
            searchResult.geometry = null;
            console.error(`Unknown type in searchAddress.parse: '${type}'. Could not set geometry.`);
            break;
    }

    return searchResult;
}

/**
 * Parses gazetteer xml to search objects.
 * @param {string} key internal name for query froms searchTypes
 * @param {string} xmlString gazetteer answer as xml string
 * @returns {Promise<SearchResult[]>} parsed response
 * @ignore
 */
export function parse (key, xmlString) {
    return new Promise((resolve, reject) => {
        // tag processor "stripPrefix" removes e.g. "dog:" prefix on properties
        xml2js.parseString(xmlString, {tagNameProcessors: [xml2js.processors.stripPrefix]},
            (err, source) => {
                if (err) {
                    reject(err);
                    return;
                }

                try {
                    const searchResults = source.FeatureCollection.member
                        ? source.FeatureCollection.member
                            .map(entry => parseEntry(entry, key))
                            .sort((a, b) => a.name.localeCompare(b.name))
                        : [];

                    resolve(searchResults);
                }
                catch (e) {
                    reject(e);
                }
            });
    });
}
