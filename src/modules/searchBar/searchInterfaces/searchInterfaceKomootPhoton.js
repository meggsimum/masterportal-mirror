import SearchInterface from "./searchInterface";

/**
 * The search interface to the koomot photon geocoder.
 * @param {String} serviceId Search service id. Resolved using the rest-services.json file.
 *
 * @param {String} [bbox="9.6,53.3,10.4,53.8"] Boundingbox of the search.
 * @param {String} [lang="de"] Language of the Komoot Search. Effects language specific locationnames (e.g. Countrynames) aus.
 * @param {Number} [lat=53.6] Latitude of the center for the search.
 * @param {Number} [limit=10] Maximum amount of requested unfiltered results.
 * @param {Number} [lon=10.0] Longtitude of the center for the search.
 * @param {String[]} [onClick=["setMarker", "zoomToFeature"]] Actions that are fired when clicking on the search result.
 * @param {String[]} [onHover=["setMarker"]] Actions that are fired when hovering on the search result.
 * @param {String} [osmTag] Filtering of OSM Tags.
 * @constructs
 * @extends SearchInterface
 * @returns {void}
 */
export default function SearchInterfaceKomootPhoton ({serviceId, bbox, limit, lang, lat, lon, onClick, onHover, osmTag} = {}) {
    SearchInterface.call(this, onClick || ["setMarker", "zoomToFeature"], onHover || ["setMarker"]);

    this.serviceId = serviceId;

    this.bbox = bbox || "9.6,53.3,10.4,53.8";
    this.lang = lang || "de";
    this.lat = lat || 53.6;
    this.limit = limit || 10;
    this.lon = lon || 10.0;
    this.osmTag = osmTag;
}

SearchInterfaceKomootPhoton.prototype = Object.create(SearchInterface.prototype);

/**
 * Search in komoot photon search interface.
 * @override
 * @param {String} searchInput The search input.
 * @returns {void}
 */
SearchInterfaceKomootPhoton.prototype.search = function (searchInput) {
    // Do something
    return searchInput; // Dummy for linter
};
