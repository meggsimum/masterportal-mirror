import {getGazetteerUrl} from "./gazetteerUrl";
import {searchTypes} from "./types";

// query-string snippet
const featureQuery = "?service=WFS&request=GetFeature&version=2.0.0";

/**
 * Encodes given string(s) to be usable as URI component.
 * @param {(string[]|string)} v value(s) to encode
 * @returns {(string[]|string)} encoded value(s)
 * @ignore
 */
export function encode (v) {
    return Array.isArray(v) ? v.map(encodeURIComponent) : encodeURIComponent(v);
}

/**
 * Builds the part of the url query where a stored query is addressed by id.
 * @param {string} key internal name for query froms searchTypes
 * @param {(string[]|string)} v string for single-value queries, string[] for multi-value queries, strings in order of appearance in URL
 * @returns {string} URL query part like "&StoryQuery_ID=queryName&param=value"
 * @ignore
 */
export function getIdQuery (key, v) {
    return {
        [searchTypes.STREET]: encodedValue => `&StoredQuery_ID=findeStrasse&strassenname=${encodedValue}`,
        [searchTypes.DISTRICT]: encodedValue => `&StoredQuery_ID=findeStadtteil&stadtteilname=${encodedValue}`,
        [searchTypes.PARCEL]: encodedValue => `&StoredQuery_ID=Flurstueck&gemarkung=${encodedValue[0]}&flurstuecksnummer=${encodedValue[1]}`,
        [searchTypes.STREET_KEY]: encodedValue => `&StoredQuery_ID=findeStrassenSchluessel&strassenschluessel=${encodedValue}`,
        [searchTypes.ADDRESS_AFFIXED]: encodedValue => `&StoredQuery_ID=AdresseMitZusatz&strassenname=${encodedValue[0]}&hausnummer=${encodedValue[1]}&zusatz=${encodedValue[2]}`,
        [searchTypes.ADDRESS_UNAFFIXED]: encodedValue => `&StoredQuery_ID=AdresseOhneZusatz&strassenname=${encodedValue[0]}&hausnummer=${encodedValue[1]}`,
        [searchTypes.HOUSE_NUMBERS_FOR_STREET]: encodedValue => `&StoredQuery_ID=HausnummernZuStrasse&strassenname=${encodedValue}`
    }[key](encode(v));
}

/**
 * Retrieves xml text for a gazetteer search.
 * @param {string} key internal name for query froms searchTypes
 * @param {(string[]|string)} value value to search for
 * @returns {Promise<string>} xhr response text
 * @ignore
 */
export function searchGazetteer (key, value) {
    return new Promise((resolve, reject) => {
        const url = getGazetteerUrl() + featureQuery + getIdQuery(key, value),
            xhr = new XMLHttpRequest();

        xhr.timeout = 6000;
        xhr.onload = () => resolve(xhr.responseText);
        xhr.onerror = (e) => reject(e);
        xhr.open("GET", url);
        xhr.send();
    });
}
