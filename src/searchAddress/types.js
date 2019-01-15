// enum-like object to avoid typos
export const searchTypes = {
    STREET: "street",
    DISTRICT: "district",
    PARCEL: "parcel",
    STREET_KEY: "streetKey",
    ADDRESS_AFFIXED: "addressAffixed",
    ADDRESS_UNAFFIXED: "addressUnaffixed",
    HOUSE_NUMBERS_FOR_STREET: "houseNumbersForStreet"
};

/**
* @typedef {Object} SearchResult
* @property {String} type which kind of hit this is
* @property {object} properties contents of the hit as parsed by xml2js - e.g. contains $ keys for xml attributes
* @property {object} geometry may be a point, a bbox, a polygon, ...
*/
