import SearchInterface from "./searchInterface";

/**
 * The search interface to the special wfs.
 * @constructs
 * @extends SearchInterface
 * @param {Object} definitions Special WFS search definitions.
 * @param {String} definitions.icon CSS glyphicon class of search results, shown before the result name.
 * @param {String} [definitions.geometryName] Geometry attribute name required for zoom functionality.
 * @param {String} [definitions.maxFeatures] Maximum amount of features to be returned.
 * @param {String} definitions.name Category name displayed in the suggestion list.
 * @param {String} definitions.namespaces XML name spaces to request `propertyNames` or `geometryName`. (`xmlns:wfs`, `xmlns:ogc`, and `xmlns:gml` are always used).
 * @param {String[]} definitions.propertyNames Array of attribute names to be searched.
 * @param {String} definitions.typeName The name of the WFS layer to be requested.
 * @param {String} definitions.url The WFS URL.
 *
 * @param {String} [icon="glyhicon-home"] Default icon used in the suggestion list.
 * @param {String} [geometryName="app:geom"] Geometry attribute name required for zoom functionality.
 * @param {Number} [maxFeatures=20] Maximum amount of features returned.
 * @param {String} [namespaces="xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml'"] XML name spaces to request `propertyNames` or `geometryName`.
 * @param {Object} [resultEvents] Actions that are executed when an interaction, such as hover or click, is performed with a result list item.
 * @param {String[]} [resultEvents.onClick=["highligtFeature", "setMarker", "zoomToFeature"]] Actions that are fired when clicking on a result list item.
 * @param {String[]} [resultEvents.onHover=["highligtFeature", "setMarker"]] Actions that are fired when hovering on a result list item.
 * @param {String} [searchInterfaceId="specialWfs"] The id of the service interface.
 * @param {Boolean} [useProxy=false] Defines whether the URL should be proxied.
 * @returns {void}
 */
export default function SearchInterfaceSpecialWfs ({definitions, icon, geometryName, maxFeatures, namespaces, resultEvents, searchInterfaceId, useproxy} = {}) {
    SearchInterface.call(this,
        "client",
        searchInterfaceId || "specialWfs",
        resultEvents || {
            onClick: ["highligtFeature", "setMarker", "zoomToFeature"],
            onHover: ["highligtFeature", "setMarker"]
        });

    this.definitions = definitions;

    this.icon = icon || "glyhicon-home";
    this.geometryName = geometryName || "app:geom";
    this.maxFeatures = maxFeatures || 20;
    this.namespaces = namespaces || "xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml'";
    this.useproxy = useproxy || false;
}

SearchInterfaceSpecialWfs.prototype = Object.create(SearchInterface.prototype);

/**
 * Search in special wfs search interface.
 * @override
 * @param {String} searchInput The search input.
 * @returns {void}
 */
SearchInterfaceSpecialWfs.prototype.search = function (searchInput) {
    // Do something
    return searchInput; // Dummy for linter
};
