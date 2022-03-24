>**[Back to the Masterportal documentation](doc.md)**.

[TOC]

***

# config.json

The *config.json* file contains all configuration of the portal interface. It controls which elements are placed where on the menu bar, how the map is to be centered initially, and which layers are to be loaded. See **[this file for an example](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev/portal/basic/config.json)**.

The configuration is separated into two sections, **[Portalconfig](#markdown-header-Portalconfig)** and **[Themenconfig](#markdown-header-Themenconfig)**

```json
{
   "Portalconfig": {},
   "Themenconfig": {}
}
```

>Since the portals original language was German, some technical keys are still in German.

***

## Portalconfig

The section *Portalconfig* controls the following properties:

1. Title & logo (*portalTitle*)
2. Type of topic selection (*treeType*)
3. Initial map view settings (*mapView*)
4. Map view buttons and interactions (*controls*)
5. Menu entries and availability as well as order of tools (*menu*)
6. Type and properties of used search services (*searchBar*)
7. Deletability of topics (*layersRemovable*)

The configuration options listed in the following table exist:

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|portalTitle|no|**[portalTitle](#markdown-header-portalconfigportaltitle)**||The portal's title and further elements to be shown in the menu bar.|false|
|treeType|no|enum["light","default","custom"]|"light"|Decides the type of topic selection tree. You may choose between `"light"` (simple list), `"default"` (FHH-Atlas), and `"custom"` (layer list defined via JSON file).|false|
|singleBaselayer|no|Boolean|false|Specifies whether only one base layer may be active at any time. Only usable in combination with treeType `"custom"`.|false|
|Baumtyp|no|enum["light","default","custom"]|"light"|_Deprecated in 3.0.0. Please use `"treeType"` instead._|false|
|mapView|no|**[mapView](#markdown-header-portalconfigmapview)**||Defines the initial map view and a background shown when no layer is selected.|false|
|controls|no|**[controls](#markdown-header-portalconfigcontrols)**||Allows setting which interactions are active in the map.|false|
|menu|no|**[menu](#markdown-header-portalconfigmenu)**||Menu entries and their order are configured in this entry. The order of tools corresponds to the order in the object specifying them; see **[Tools](#markdown-header-portalconfigmenutools)**.|false|
|searchBar|no|**[searchBar](#markdown-header-portalconfigsearchbar)**||The search bar allows requesting information from various search services at once.|false|
|layersRemovable|no|Boolean|false|Defines whether layers may be removed from a portal during its run-time.|false|
|quickHelp|no|**[quickHelp](#markdown-header-portalconfigquickHelp)**||Configuration of new and manipulation of existing QuickHelp windows.|false|

***

### Portalconfig.searchBar

Search bar configuration.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|searchResultOrder|no|String[]|["common:modules.searchbar.type.address", "common:modules.searchbar.type.street", "common:modules.searchbar.type.parcel", "common:modules.searchbar.type.location", "common:modules.searchbar.type.district", "common:modules.searchbar.type.topic", "common:modules.searchbar.type.subject"]|Configuration of order of categories of displayed search results. The keys should be used from translation data.|false|
|bkg|no|**[bkg](#markdown-header-portalconfigsearchbarbkg)**||BKG search service configuration.|false|
|gazetteer|no|**[gazetteer](#markdown-header-portalconfigsearchbargazetteer)**||Gazetteer search service configuration.|false|
|gdi|no|**[gdi](#markdown-header-portalconfigsearchbargdi)**||GDI (elastic) search service configuration. _Deprecated in 3.0.0. Please use **[elasticSearch](#markdown-header-portalconfigsearchbarelasticsearch)** instead.|false|
|elasticSearch|no|**[elasticSearch](#markdown-header-portalconfigsearchbarelasticsearch)**||Elastic search service configuration.|false|
|osm|no|**[osm](#markdown-header-portalconfigsearchbarosm)**||OpenStreetMap (OSM) search service configuration.|false|
|komoot|no|**[komoot](#markdown-header-portalconfigsearchbarkomoot)**||Komoot Photon search service configuration.|false|
|locationFinder|no|**[locationFinder](#markdown-header-portalconfigsearchbarlocationfinder)**||LocationFinder search service configuration.|false|
|placeholder|no|String|"Suche"|Input text field placeholder shown when no input has been given yet.|false|
|recommendedListLength|no|Integer|5|Maximum amount of entries in the suggestion list.|false|
|quickHelp|no|Boolean|false|Defines whether the QuickHelp feature is offered for the search bar.|false|
|specialWFS|no|**[specialWFS](#markdown-header-portalconfigsearchbarspecialwfs)**||specialWFS search service configuration.|false|
|tree|no|**[tree](#markdown-header-portalconfigsearchbartree)**||Topic selection tree search configuration.|false|
|visibleWFS|no|**[visibleWFS](#markdown-header-portalconfigsearchbarvisiblewfs)**||Visible WFS layer search configuration.|false|
|visibleVector|no|**[visibleVector](#markdown-header-portalconfigsearchbarvisiblevector)**||Visible vector layer search configuration.|false|
|zoomLevel|no|Integer||On picking a search result, this is the maximum zoom level to be used on zooming to the chosen feature.|false|
|sortByName|no|Boolean|true|Defines whether search results are to be sorted alphanumerically.|false|
|selectRandomHits|no|Boolean|true|Is set `true`, the results are chosen randomly when the amount of hits exceeds `recommendedListLength`. If set `false`, the list of hits is cut when reaching `recomendedListLength`. This may result in only showing results of the service that first returned.|false|

***

#### Portalconfig.searchBar.bkg

[type:Extent]: # (Datatypes.Extent)

BKG search service configuration.

>**This requires a backend!**
>
>**To avoid openly using your BKG UUID, URLs ("bkg_geosearch" and "bkg_suggest" in this case) of the restServices should be caught and redirected in a proxy.**

**Example proxy configuration**
```
ProxyPass /bkg_geosearch http://sg.geodatenzentrum.de/gdz_geokodierung__[UUID]/geosearch
<Location /bkg_geosearch>
  ProxyPassReverse http://sg.geodatenzentrum.de/gdz_geokodierung__[UUID]/geosearch
</Location>

ProxyPass /bkg_suggest http://sg.geodatenzentrum.de/gdz_geokodierung__[UUID]/suggest
<Location /bkg_suggest>
  ProxyPassReverse http://sg.geodatenzentrum.de/gdz_geokodierung__[UUID]/suggest
</Location>
```


|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|epsg|no|String|"EPSG:25832"|EPSG code of the coordinate reference system to use.|false|
|extent|no|**[Extent](#markdown-header-datatypesextent)**|[454591, 5809000, 700000, 6075769]|Coordinate extent in which search algorithms should return.|false|
|filter|no|String|"filter=(typ:*)"|Filter string sent to the BKG interface.|false|
|geosearchServiceId|yes|String||Search service id. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|minChars|no|Integer|3|_Deprecated in 3.0.0. Please use "minCharacters"._|false|
|minCharacters|no|Integer|3|Minimum amount of characters required to start a search.|false|
|score|no|Number|0.6|Score defining the minimum quality of search results.|false|
|suggestCount|no|Integer|20|Suggestion amount.|false|
|suggestServiceId|yes|String||Suggestion service id. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|zoomToResult|no|Boolean|false|_Deprecated in 3.0.0. Please use "zoomToResultOnHover" or "zoomToResultOnClick"._ Defines whether a feature is zoomed to when hovering a result list entry.|false|
|zoomToResultOnHover|no|Boolean|false|Defines whether an address is zoomed to when hovering a result list entry.|false|
|zoomToResultOnClick|no|Boolean|true|Defines whether an address is zoomed to when clicking a result list entry.|false|
|zoomLevel|no|Number|7|Defines the zoom level to use on zooming to a result.|false|

**Example**
```json
{
    "bkg": {
        "minCharacters": 3,
        "suggestServiceId": "4",
        "geosearchServiceId": "5",
        "extent": [454591, 5809000, 700000, 6075769],
        "suggestCount": 10,
        "epsg": "EPSG:25832",
        "filter": "filter=(typ:*)",
        "score": 0.6,
        "zoomToResultOnHover": false,
        "zoomToResultOnClick": true,
        "zoomLevel": 10
    }
}
```

***

#### Portalconfig.searchBar.osm

OpenStreetMap search for city, street, and house number. Only executed on clicking the search icon or pressing enter since the amount of requests to the OSM search service is limited.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|minChars|no|Number|3|Minimum amount of characters required to start a search.|false|
|serviceId|yes|String||OSM search service id. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|limit|no|Number|50|Maximum amount of requested unfiltered results.|false|
|states|no|string|""|May contain federal state names with arbitrary separators. Names may also be used in English depending on whether the data has been added to the free open source project **[OpenStreetMap](https://www.openstreetmap.org)**.|false|
|classes|no|string|[]|May contain the classes to search for.|false|

**Example**

```json
{
    "osm": {
        "minChars": 3,
        "serviceId": "10",
        "limit": 60,
        "states": "Hamburg, Nordrhein-Westfalen, Niedersachsen, Rhineland-Palatinate Rheinland-Pfalz",
        "classes": "place,highway,building,shop,historic,leisure,city,county"
    }
}
```

***

#### Portalconfig.searchBar.komoot
Search with **[Komoot Photon](https://photon.komoot.io/)**.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minChars|no|Number|3|Minimum amount of characters required to start a search.|false|
|serviceId|yes|String||Komoot search service id. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|limit|no|Number|10|Maximum amount of requested unfiltered results.|false|
|lang|no|string|"de"|Language of the Komoot Search. Effects language specific locationnames (e.g. Countrynames) aus.|false|
|lat|no|Number||Latitude of the center for the search.|false|
|lon|no|Number||Longtitude of the center for the search.|false|
|bbox|no|string||Boundingbox of the search.|false|
|osm_tag|no|string||Filtering of OSM Tags (see https://github.com/komoot/photon#filter-results-by-tags-and-values).|false|
|searchOnEnter|no|Boolean|false|If `searchOnEnter` is set to `true`, searches will only start on clicking the search icon or pressing enter.|false|

**Example**

```
#!json

"komoot": {
    "minChars": 3,
    "serviceId": "10",
    "limit": 20,
    "lang": "de",
    "lat": 52.5,
    "lon": 13.4,
    "bbox": "12.5,52.05,14.05,52.75",
}
```

***

#### Portalconfig.searchBar.locationFinder

Search configuration to use a *ESRI CH LocationFinder*.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|incrementalSearch|no|Boolean|true|Defines whether autocomplete is enabled. If `incrementalSearch` is set to `false`, searches will only start on clicking the search icon or pressing enter, since there's a quota on requests.|false|
|serviceId|yes|String||Service id. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|classes|no|**[LocationFinderClass](#markdown-header-portalconfigsearchbarlocationfinderLocationFinderClass)**||May contain classes (with properties) to use in searches. If nothing is specified, all classes are considered valid.|false|
|useProxy|no|Boolean|false|_Deprecated in the next major release. [GDI-DE](https://www.gdi-de.org/en) recommends setting CORS headers on the required services instead of using proxies._ Defines whether a service URL should be requested via proxy. For this, dots in the URL are replaced with underscores.|false|
|spatialReference|no|String||Coordinate reference system to use for requests. By default, the value in `Portalconfig.mapView.epsg` is used.|false|

##### Portalconfig.searchBar.locationFinder.LocationFinderClass

Definition of classes to be taken into account for results.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|yes|String||Class name|false|
|icon|no|String|"glyphicon-road"|Class visualization by a glyphicon|false|
|zoom|no|String|"center"|Defines how to zoom to a hit on selection. If `center` is chosen, the center coordinate (`cx`, `cy`) is zoomed to and a marker is placed. If `bbox` is chosen, the LocationFinder's given BoundingBox (`xmin`, `ymin`, `xmax`, `ymax`) is zoomed to, and no marker is shown.|false|
|zoomLevel|no|Integer||Zoom level which is applied to the result view|false|

**Example**

```json
{
    "locationFinder": {
        "serviceId": "10",
        "classes": [
            {
                "name": "busstop",
                "icon": "glyphicon-record"
            },
            {
                "name": "address",
                "icon": "glyphicon-home",
                "zoomLevel": 5
            },
            {
                "name": "streetname",
                "zoom": "bbox"
            }
        ]
    }
}
```

***

#### Portalconfig.searchBar.gazetteer

Gazetteer search service configuration.

>**This requires a backend!**
>
>**A WFS's Stored Query is requested with predefined parameters.**

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|minChars|no|Integer|3|Minimum amount of characters required to start a search.|false|
|searchAddress|no|Boolean|false|Defines whether address search is active. For backward compatibility, if "searchAddress" is not configured, the "searchAddress" attribute is set to "true" when "searchStreets" and "searchHouseNumbers" are set to "true".|false|
|searchDistricts|no|Boolean|false|Defines whether district search is active.|false|
|searchHouseNumbers|no|Boolean|false|Defines whether house numbers should be searched for. Requires `searchStreets` to be set to `true`, too.|false|
|searchParcels|no|Boolean|false|Defines whether parcels search is active.|false|
|searchStreetKey|no|Boolean|false|Defines whether streets should be searched for by key.|false|
|searchStreet|no|Boolean|false|Defines whether street search is active. Precondition to set `searchHouseNumbers` to `true`.|false|
|serviceID|yes|String||Search service id. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|showGeographicIdentifier|no|Boolean|false|Specifies whether the attribute `geographicIdentifier` should be used to display the search result.|false|

**Example**

```json
{
    "gazetteer": {
        "minChars": 3,
        "serviceId": "6",
        "searchStreets": true,
        "searchHouseNumbers": true,
        "searchDistricts": true,
        "searchParcels": true,
        "searchStreetKey": true,
        "showGeographicIdentifier": false
    }
}
```

***

#### Portalconfig.searchBar.gdi

GFI search service configuration.

>Deprecated in 3.0.0. Please use **[elasticSearch](#markdown-header-portalconfigsearchbarelasticsearch)** instead.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|minChars|no|Integer|3|Minimum amount of characters required to start a search.|false|
|serviceID|yes|String||Search service id. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|sortByName|no|Boolean|false|Defines whether search results are to be sorted alphanumerically.|false|
|queryObject|yes|**[queryObject](#markdown-header-portalconfigsearchbargdiqueryobject)**||Query object read by the Elasticsearch model.|false|

**Example**

```json
{
    "gdi": {
        "minChars": 3,
        "serviceId": "elastic",
        "sortByName": false,
        "queryObject": {
            "id": "query",
            "params": {
                "query_string": "%%searchString%%"
            }
        }
    }
}
```

***

#### Portalconfig.searchBar.gdi.queryObject

Todo.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|id|yes|String|""|Todo|false|
|params|yes|**[params](#markdown-header-portalconfigsearchbargdiqueryobjectparams)**||Elasticsearch parameter object.|false|

***

#### Portalconfig.searchBar.gdi.queryObject.params
Todo

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|query_string|yes|String|"%%searchString%%"|Todo|false|

***

#### Portalconfig.searchBar.elasticSearch

Elasticsearch service configuration.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|minChars|no|Integer|3|Minimum amount of characters required to start a search.|false|
|serviceId|yes|String||Search service id. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|type|no|enum["POST", "GET"]|"POST"|Request type.|false|
|searchStringAttribute|no|String|"searchString"|Search string attribute name for `payload` object.|false|
|responseEntryPath|no|String|""|Response JSON attribute path to found features.|false|
|triggerEvent|no|**[triggerEvent](#markdown-header-portalconfigsearchbarelasticsearchtriggerevent)**|{}|Radio event triggered on mouse hover and click.|false|
|hitMap|no|**[hitMap](#markdown-header-portalconfigsearchbarelasticsearchhitmap)**||Object mapping result object attributes to keys.|true|
|hitType|no|String|"common:modules.searchbar.type.subject"|Search result type shown in the result list after the result name. Set to the translation key.|false|
|hitGlyphicon|no|String|"glyphicon-road"|CSS glyphicon class of search results, shown before the result name.|false|
|useProxy|no|Boolean|false|Defines whether the URL should be proxied.|false|

As an additional property, you may add `payload`. It is not required, and matches the **[CustomObject](#markdown-header-datatypescustomobject)** description. By default, it is set to the empty object `{}`. The object describes the payload to be sent as part of the request. It must provide the searchString attribute. For more info on usable attributes, see **[Elasticsearch Guide](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-search.html)**. This object can not be handled in the Admintool, since **[CustomObject](#markdown-header-datatypescustomobject)** is not yet supported.

**Example**

```json
{
    "elasticSearch": {
        "minChars": 3,
        "serviceId": "elastic_hh",
        "type": "GET",
        "payload": {
            "id": "query",
            "params": {
                "query_string": ""
            }
        },
        "searchStringAttribute": "query_string",
        "responseEntryPath": "hits.hits",
        "triggerEvent": {
            "channel": "Parser",
            "event": "addGdiLayer"
        },
        "hitMap": {
            "name": "_source.name",
            "id": "_source.id",
            "source": "_source"
        },
        "hitType": "common:modules.searchbar.type.subject",
        "hitGlyphicon": "glyphicon-list"
    }
}
```

***

#### Portalconfig.searchBar.elasticSearch.hitMap

Object mapping result object attributes to keys.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|yes|String/String[]|"name"|Attribute value will be mapped to the attribute key. Required to display results.|false|
|id|yes|String/String[]|"id"|Attribute value will be mapped to the attribute key. Required to display results.|false|
|coordinate|yes|String/String[]|"coordinate"|Attribute value will be mapped to the attribute key. Required to display a map marker.|false|

***

#### Portalconfig.searchBar.elasticSearch.triggerEvent

Radio event triggered on mouse hover and click.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|channel|yes|String||Channel addressed on mouse hover and click. The hit from the recommendedList will be sent as payload.|false|
|event|yes|String||Triggered event.|false|

***

#### Portalconfig.searchBar.specialWFS

WFS search function configuration. Requests features from a WFS. The service must be configured to allow WFS 2.0 requests.

For example, on entering "Kronenmatten" the service
https://geoportal.freiburg.de/geoportal_freiburg_de/wfs/stpla_bplan/wfs_mapfile/geltungsbereiche
will be requested with the following XML attached as payload, and the service will answer with an XML FeatureCollection. The collection features will then be offered as search results.

```xml
<?xml version='1.0' encoding='UTF-8'?>
<wfs:GetFeature service='WFS' xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml' traverseXlinkDepth='*' version='1.1.0'>
    <wfs:Query typeName='ms:geltungsbereiche'>
        <wfs:PropertyName>ms:planbez</wfs:PropertyName>
        <wfs:PropertyName>ms:msGeometry</wfs:PropertyName>
        <wfs:maxFeatures>20</wfs:maxFeatures>
        <ogc:Filter>
            <ogc:PropertyIsLike matchCase='false' wildCard='*' singleChar='#' escapeChar='!'>
                <ogc:PropertyName>ms:planbez</ogc:PropertyName>
                <ogc:Literal>*Kronenmatten*</ogc:Literal>
            </ogc:PropertyIsLike>
        </ogc:Filter>
    </wfs:Query>
</wfs:GetFeature>
```

The WFS 2.0 query is dynamically created by the Masterportal. No stored query configuration is required in the service.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|minChars|no|Integer|3|Minimum amount of characters required to start a search.|false|
|glyphicon|no|String|"glyhicon-home"|Default glyphicon used in the suggestion list. Overwritable by a **[definition](#markdown-header-portalconfigsearchbarspecialwfsdefinition)**.|false|
|maxFeatures|no|Integer|20|Maximum amount of features returned. Overwritable by a **[definition](#markdown-header-portalconfigsearchbarspecialwfsdefinition)**.|false|
|timeout|no|Integer|6000|Service request timeout in ms.|false|
|definitions|no|**[definition](#markdown-header-portalconfigsearchbarspecialwfsdefinition)**[]||Special WFS search definitions.|false|

**Example**

```json
{
    "specialWFS": {
        "minChars": 5,
        "timeout": 10000,
        "definitions": [
            {
                "url": "/geodienste_hamburg_de/MRH_WFS_Rotenburg",
                "typeName": "app:mrh_row_bplan",
                "propertyNames": ["app:name"],
                "name": "B-Plan",
                "namespaces": "xmlns:app='http://www.deegree.org/app'"
            },
            {
                "url": "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
                "typeName": "app:prosin_imverfahren",
                "propertyNames": ["app:plan"],
                "geometryName": "app:the_geom",
                "name": "im Verfahren",
                "namespaces": "xmlns:app='http://www.deegree.org/app'"
            }
        ]
    }
}
```

***

#### Portalconfig.searchBar.specialWFS.definition

SpecialWFS search definition configuration.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|url|no|String||WFS URL. Depending on your proxy configuration, the relative URL from the portal server must be given.|false|
|name|no|String||Category name displayed in the suggestion list.|false|
|glyphicon|no|String|"glyhicon-home"|CSS glyphicon class of search results, shown before the result name.|false|
|typeName|no|String||The name of the WFS layer to be requested.|false|
|propertyNames|no|String[]||Array of attribute names to be searched.|false|
|geometryName|no|String|"app:geom"|Geometry attribute name required for zoom functionality.|false|
|maxFeatures|no|Integer|20|Maximum amount of features to be returned.|false|
|namespaces|no|String||XML name spaces to request `propertyNames` or `geometryName`. (`xmlns:wfs`, `xmlns:ogc`, and `xmlns:gml` are always used.)|false|
|data|no|String||_Deprecated in 3.0.0._ Filter parameter for WFS requests.|false|

**Example**

```json
{
    "url": "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
    "typeName": "app:prosin_imverfahren",
    "propertyNames": ["app:plan"],
    "geometryName": "app:the_geom",
    "name": "im Verfahren"
}
```

***

#### Portalconfig.searchBar.tree

Searching all topic selection tree layers.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|minChars|no|Integer|3|Minimum amount of characters required to start a search.|false|

**Example**

```json
{
    "tree": {
        "minChars": 5
    }
}
```

***

#### Portalconfig.searchBar.visibleWFS

Visible WFS search configuration. _Deprecated in 3.0.0. Please use **[visibleVector](#markdown-header-portalconfigsearchbarvisiblevector)** instead._

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|minChars|no|Integer|3|Minimum amount of characters required to start a search.|false|

**Example**

```json
{
    "visibleWFS": {
        "minChars": 3
    }
}
```

***

#### Portalconfig.searchBar.visibleVector

Visible vector layer search configuration. For all vector layers supposed to be searchable, set the **[searchField](#markdown-header-themenconfiglayervector)** attribute in the layer definition object "Fachdaten".

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|minChars|no|Integer|3|Minimum amount of characters required to start a search.|false|
|layerTypes|no|enum["WFS", "GeoJSON"]|["WFS"]|Vector layer types to be used.|true|
|gfiOnClick|no|Boolean|false|Opens the GetFeatureInfo (gfi) window on clicking a search result.|false|

**Example**

```json
{
    "visibleVector": {
        "minChars": 3,
        "layerTypes": ["WFS", "GeoJSON"]
    }
}
```

***

### Portalconfig.controls

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|attributions|no|**[attributions](#markdown-header-portalconfigcontrolsattributions)**|false|Additional layer information to be shown in the portal.|false|
|fullScreen|no|Boolean|false|Allows the user to view the portal in full screen mode, that is, without the browser's tabs and address bar, by clicking a button. A second click on the element returns the view back to normal.|false|
|mousePosition|no|Boolean|false|Display mouse pointer coordinates.|false|
|orientation|no|**[orientation](#markdown-header-portalconfigcontrolsorientation)**||The orientation control uses the browser's geolocation feature to determine the user's coordinates.|false|
|zoom|no|Boolean|false|Defines whether zoom buttons should be displayed.|false|
|overviewmap|no|**[overviewMap](#markdown-header-portalconfigcontrolsoverviewmap)**|false|_Deprecated in 3.0.0. Please use `overviewMap` instead._|false|
|overviewMap|no|**[overviewMap](#markdown-header-portalconfigcontrolsoverviewmap)**|false|Overview map.|false|
|totalview|no|**[totalView](#markdown-header-portalconfigcontrolstotalview)**|false|_Deprecated in 3.0.0. Please use "totalView" instead._|false|
|totalView|no|**[totalView](#markdown-header-portalconfigcontrolstotalview)**|false|Offers a button to return to the initial view.|false|
|button3d|no|Boolean|false|Defines whether a 3D mode switch button is shown.|false|
|orientation3d|no|Boolean|false|Defines whether the 3D mode is to show a navigation element inspired by the *classical compass winds*.|false|
|freeze|no|Boolean|false|Whether a "lock view" button is shown. Within the `TABLE` style, this element is part of the tool window.|false|
|backforward|no|**[backForward](#markdown-header-portalconfigcontrolsbackforward)**|false|_Deprecated in 3.0.0. Please use "backForward" instead._|false|
|backForward|no|**[backForward](#markdown-header-portalconfigcontrolsbackforward)**|false|Shows buttons to jump to previous and next map views.|false|

***

#### Portalconfig.controls.attributions

The entry `attributions` may be of type boolean or object. If of type boolean, the flag decides whether available attributions are shown. When of type object, the following attributes may be set:

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|isInitOpenDesktop|no|Boolean|true|Defines whether the attributions are open initially in desktop mode.|false|
|isInitOpenMobile|no|Boolean|false|Defines whether the attributions are open initially in mobile mode.|false|

**Boolean example**

```json
{
    "attributions": true
}
```

**Object example**

```json
{
    "attributions": {
        "isInitOpenDesktop": true,
        "isInitOpenMobile": false
    }
}
```

***

#### Portalconfig.controls.orientation

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|zoomMode|no|enum["once", "always"]|"once"|The user's location is determined and a marker turned on or off. This requires providing the portal via **https**. Modes: *once* zooms to the user's location once, *always* zooms to the user position on each activation.|false|
|poiDistances|no|Boolean/Integer[]|true|Defines whether the feature "Close to me", which shows a list of nearby points of interest, is provided. If an array is configured, multiple such lists with the given distance in meters are offered. When simply setting `poiDistances: true`, the used distances are `[500,1000,2000]`.|false|

**Example using type boolean poiDistances**

```json
{
    "orientation": {
        "zoomMode": "once",
        "poiDistances": true
    }
}
```

**Example using type number[] porDistances**

```json
{
    "orientation": {
        "zoomMode": "once",
        "poiDistances": [500, 1000, 2000, 5000]
    }
}
```

***

#### Portalconfig.controls.overviewMap

[type:LayerId]: # (Datatypes.LayerId)

The attribute overviewMap may be of type boolean or object. If of type boolean, an overview map is shown with a default configuration. When of type object, the following attributes may be set:

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|resolution|no|Integer||_Deprecated in 3.0.0._ Defines the overview map resolution. If not set, the map section displayed is changed on zoom automatically.|
|baselayer|no|LayerId||_Deprecated in 3.0.0. Please use `layerId` instead._ Allows using a different layer for the overview map element. The value must be an id from the `services.json` used in the portal's `config.js` parameter `layerConf`.|
|layerId|no|LayerId||Allows using a different layer for the overview map element. The value must be an id from the `services.json` used in the portal's `config.js` parameter `layerConf`.|
|isInitOpen|no|Boolean|true|Defines whether the overview map is initially closed or opened.|

**Example using type object overviewMap**

```json
{
    "overviewMap": {
        "resolution": 305.7487246381551,
        "layerId": "452",
        "isInitOpen": false
    }
}
```

**Example using type boolean overviewMap**

```json
{
    "overviewMap": true
}
```

***

#### Portalconfig.controls.totalView

The attribute totalView may be of type boolean or object. If of type boolean, it shows a button using the default configuration that allows the user to switch back to the initial view. When of type object, the following attributes may be set:

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|glyphicon|no|String|"glyphicon-fast-backward"|Allows changing the button's glyphicon.|false|
|tableGlyphicon|no|String|"glyphicon-home"|Allows changing the list item's glyphicon in `TABLE` style.|false|

**Example using type object totalView**

```json
{
    "totalView" : {
        "glyphicon": "glyphicon-step-forward",
        "tableGlyphicon": "glyphicon-step-forward"
    }
}
```

**Example using type boolean totalView**

```json
{
    "totalView": true
}
```

***

#### Portalconfig.controls.backForward

The attribute backForward may be of type boolean or object. If of type boolean, it shows a button using the default configuration that allows the user to switch back and forth between view states. When of type object, the following attributes may be set:

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|glyphiconFor|no|String||Allows changing the glyphicon on the forward button.|false|
|glyphiconBack|no|String||Allows changing the glyphicon on the backwards button.|false|

**Example using type object backForward**

```json
{
    "backForward" : {
        "glyphiconFor": "glyphicon-fast-forward",
        "glyphiconBack": "glyphicon-fast-backward"
    }
}
```

**Example using type boolean backForward**

```json
{
    "backForward": true
}
```

***

### Portalconfig.portalTitle

The menu bar allows showing a portal name and portal image if sufficient horizontal space is available. The elements are not shown in mobile mode.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|title|no|String|"Master"|Portal name.|false|
|logo|no|String||Path to an external image file. If no image is set, the title will be shown without an accompanying logo.|false|
|link|no|String|"https://geoinfo.hamburg.de"|URL of an external website to link to.|false|
|tooltip|no|String||_Deprecated in 3.0.0. Please use `toolTip` instead._ Shown on hovering the portal logo.|false|
|toolTip|no|String|"Landesbetrieb Geoinformation und Vermessung"|Shown on hovering the portal logo.|false|

**Example**

```json
{
    "portalTitle": {
        "title": "Master",
        "logo": "https://geodienste.hamburg.de/lgv-config/img/hh-logo.png",
        "link": "https://geoinfo.hamburg.de",
        "toolTip": "Landesbetrieb Geoinformation und Vermessung"
    }
}
```

***

### Portalconfig.mapView

[type:Extent]: # (Datatypes.Extent)
[type:Coordinate]: # (Datatypes.Coordinate)

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|backgroundImage|no|String|"https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev/doc/config.json.md#markdown-header-portalconfigmapview"|Path to an alternative background image.|false|
|startCenter|no|**[Coordinate](#markdown-header-datatypescoordinate)**|[565874, 5934140]|Initial center coordinate.|false|
|extent|no|**[Extent](#markdown-header-datatypesextent)**|[510000.0, 5850000.0, 625000.4, 6000000.0]|Map extent - map may not be moved outside these boundaries.|false|
|resolution|no|Float|15.874991427504629|The initial map resolution from the `options` element. Used in preference to `zoomLevel`.|false|
|startZoomLevel|no|Integer||The initial map zoom level from the `options` element. If `resolutions` is set, this is ignored.|false|
|zoomLevel|no|Integer||Deprecated in 3.0.0 Please use "startZoomLevel".|false|
|epsg|no|String|"EPSG:25832"|Coordinate reference system EPSG code. The code must be defined as a `namedProjection`.|false|
|options|no|[option](#markdown-header-portalconfigmapviewoption)[]|[{"resolution":66.14579761460263,"scale":250000,"zoomLevel":0}, {"resolution":26.458319045841044,"scale":100000,"zoomLevel":1}, {"resolution":15.874991427504629,"scale":60000,"zoomLevel":2}, {"resolution": 10.583327618336419,"scale":40000,"zoomLevel":3}, {"resolution":5.2916638091682096,"scale":20000,"zoomLevel":4}, {"resolution":2.6458319045841048,"scale":10000,"zoomLevel":5}, {"resolution":1.3229159522920524,"scale":5000,"zoomLevel":6}, {"resolution":0.6614579761460262,"scale":2500,"zoomLevel":7}, {"resolution":0.2645831904584105,"scale": 1000,"zoomLevel":8}, {"resolution":0.13229159522920521,"scale":500,"zoomLevel":9}]|Available scale levels and their resolutions.|false|

**Example**

```json
{
    "mapView": {
        "backgroundImage": "https://geodienste.hamburg.de/lgv-config/img/backgroundCanvas.jpeg",
        "startCenter": [561210, 5932600],
        "options": [
            {
                "resolution": 611.4974492763076,
                "scale": 2311167,
                "zoomLevel": 0
            },
            {
                "resolution": 305.7487246381551,
                "scale": 1155583,
                "zoomLevel": 1
            },
            {
                "resolution": 152.87436231907702,
                "scale": 577791,
                "zoomLevel": 2
            },
            {
                "resolution": 76.43718115953851,
                "scale": 288896,
                "zoomLevel": 3
            },
            {
                "resolution": 38.21859057976939,
                "scale": 144448,
                "zoomLevel": 4
            },
            {
                "resolution": 19.109295289884642,
                "scale": 72223,
                "zoomLevel": 5
            },
            {
                "resolution": 9.554647644942321,
                "scale": 36112,
                "zoomLevel": 6
            },
            {
                "resolution": 4.7773238224711605,
                "scale": 18056,
                "zoomLevel": 7
            },
            {
                "resolution": 2.3886619112355802,
                "scale": 9028,
                "zoomLevel": 8
            },
            {
                "resolution": 1.1943309556178034,
                "scale": 4514,
                "zoomLevel": 9
            },
            {
                "resolution": 0.5971654778089017,
                "scale": 2257,
                "zoomLevel": 10
            }
        ],
        "extent": [510000.0, 5850000.0, 625000.4, 6000000.0],
        "resolution": 15.874991427504629,
        "zoomLevel": 1,
        "epsg": "EPSG:25832"
    }
}
```

***

#### Portalconfig.mapView.option

An option defines a zoom level. Each zoom level is defined by resolution, scale number, and a unique zoom level. The higher the zoom level, the smaller the scale and the closer you have zoomed.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|resolution|yes|Number||Zoom level definition's resolution.|false|
|scale|yes|Integer||Zoom level definition's scale.|false|
|zoomLevel|yes|Integer||Zoom level definition's zoom level.|false|

**mapView option example**

```json
{
    "resolution": 611.4974492763076,
    "scale": 2311167,
    "zoomLevel": 0
}
```

***

### Portalconfig.quickHelp

For a detailed documentation of the QuickHelp window see **[the QuickHelp documentation](quickHelp.md)** .

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|configs|yes|**[configs](#markdown-header-portalconfigquickhelpconfigs)**|{"search": true, "tree": true}|The configuration for existing as well as new QuickHelp windows.|false|

```json
{
    "Portalconfig": {
        "quickHelp": {
            "configs": {}
        }
    }
}
```

#### Portalconfig.quickHelp.configs

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|search|no|**[search](#markdown-header-portalconfigquickhelpconfigssearch)**|true|Configuration of the QuickHelp window of the SearchBar.|false|
|tree|no|**[tree](#markdown-header-portalconfigquickhelpconfigstree)**|true|Configuration of the QuickHelp window of the topic tree.|false|

```json
{
    "Portalconfig": {
        "quickHelp": {
            "configs": {
                "search": true,
                "tree": true
            }
        }
    }
}
```

##### Portalconfig.quickHelp.configs.search

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|title|no|String|""|The title/heading of the QuickHelp window.|false|
|content|no|**[section](#markdown-header-portalconfigquickhelpconfigssearchsection)**[]|[]|The collection of contents or manipulations as an array.|false|

```json
{
    "Portalconfig": {
        "quickHelp": {
            "configs": {
                "search": {
                    "title": "A new title for this QuickHelp window",
                    "content": []
                }
            }
        }
    }
}
```

##### Portalconfig.quickHelp.configs.search.section

A section is an object with a title and a list of paragraphs.
A section can be manipulated using "before", "after" and "hide" keywords.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|title|no|String|""|The title/heading of the section.|false|
|list|no|**[paragraph](#markdown-header-portalconfigquickhelpconfigssearchsectionparagraph)**[]|[]|An array of paragraphs or images of the QuickHelp section.|false|
|before|no|String||A Section Key before which this new section should be hooked.|false|
|after|no|String||A Section Key behind which this new section should be hooked.|false|
|hide|no|String||A Section Key that leads to the hiding/removal of an existing section addressed with the Section Key.|false|

```json
{
    "Portalconfig": {
        "quickHelp": {
            "configs": {
                "search": {
                    "title": "A new title for this QuickHelp window",
                    "content": [
                        {
                            "title": "Title of the new section",
                            "list": []
                        }
                    ]
                }
            }
        }
    }
}
```

##### Portalconfig.quickHelp.configs.search.section.paragraph

A paragraph in the sense of the QuickHelp configuration is an object or string that exactly describes the content at that point.
There are two types of paragraph elements.


**The paragraph text element**

Can also be created as a pure translation key (string) and will then be converted to a paragraph element of type "text/plain".
Pure text can also be specified, but then it is mandatory under the text key of the object (pure text is not possible as a pure string).


**The paragraph image element**

Can also be specified as a plain image name (string), in which case the imgPath configured in config.js would be automatically added as its base path.
Configure as an object to specify external images with imgPath as url and imgName as name of the image.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|text|no|String|""|The text as Translation Key or pure text.|false|
|type|no|String|"text/plain"|The text type. If "text/html" is specified, the given text will be rendered as html code.|false|
|imgName|no|String|""|The name of the image to display.|false|
|imgPath|no|String|""|The path to the image if omitted is taken imgPath from config.js.|false|

```json
{
    "Portalconfig": {
        "quickHelp": {
            "configs": {
                "search": {
                    "title": "A new title for this QuickHelp window",
                    "content": [
                        {
                            "title": "Title of the new section",
                            "list": [
                                {
                                    "text": "This is the first paragraph.",
                                    "type": "text/plain"
                                },
                                {
                                    "imgName": "allgemein.png",
                                    "imgPath": "https://geodienste.hamburg.de/lgv-config/img/"
                                },
                                {
                                    "text": "This is the second <i>paragraph</i> with html content.",
                                    "type": "text/html"
                                }
                            ]
                        },
                        {
                            "after": "generalInfo",
                            "title": "Title of a new section after generalInfo",
                            "list": [
                                {
                                    "text": "This is a paragraph.",
                                    "type": "text/plain"
                                }
                            ]
                        },
                        {"hide": "generalInfo"}
                    ]
                }
            }
        }
    }
}
```

#### Portalconfig.quickHelp.configs.tree

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|title|no|String|""|The title/heading of the QuickHelp window.|false|
|content|no|**[section](#markdown-header-portalconfigquickhelpconfigstreesection)**[]|[]|The collection of contents or manipulations as an array.|false|

```json
{
    "Portalconfig": {
        "quickHelp": {
            "configs": {
                "tree": {
                    "title": "A new title for this QuickHelp window",
                    "content": []
                }
            }
        }
    }
}
```

##### Portalconfig.quickHelp.configs.tree.section

A section is an object with a title and a list of paragraphs.
A section can be manipulated using "before", "after" and "hide" keywords.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|title|no|String|""|The title/heading of the section.|false|
|list|no|**[paragraph](#markdown-header-portalconfigquickhelpconfigstreesectionparagraph)**[]|[]|An array of paragraphs or images of the QuickHelp section.|false|
|before|no|String||A Section Key before which this new section should be hooked.|false|
|after|no|String||A Section Key behind which this new section should be hooked.|false|
|hide|no|String||A Section Key that leads to the hiding/removal of an existing section addressed with the Section Key.|false|

```json
{
    "Portalconfig": {
        "quickHelp": {
            "configs": {
                "tree": {
                    "title": "A new title for this QuickHelp window",
                    "content": [
                        {
                            "title": "Title of the new section",
                            "list": []
                        }
                    ]
                }
            }
        }
    }
}
```

##### Portalconfig.quickHelp.configs.tree.section.paragraph

A paragraph in the sense of the QuickHelp configuration is an object or string that exactly describes the content at that point.
There are two types of paragraph elements.


**The paragraph text element**

Can also be created as a pure translation key (string) and will then be converted to a paragraph element of type "text/plain".
Pure text can also be specified, but then it is mandatory under the text key of the object (pure text is not possible as a pure string).


**The paragraph image element**

Can also be specified as a plain image name (string), in which case the imgPath configured in config.js would be automatically added as its base path.
Configure as an object to specify external images with imgPath as url and imgName as name of the image.


|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|text|no|String|""|The text as Translation Key or pure text.|false|
|type|no|String|"text/plain"|The text type. If "text/html" is specified, the given text will be rendered as html code.|false|
|imgName|no|String|""|The name of the image to display.|false|
|imgPath|no|String|""|The path to the image if omitted is taken imgPath from config.js.|false|

```json
{
    "Portalconfig": {
        "quickHelp": {
            "configs": {
                "tree": {
                    "title": "A new title for this QuickHelp window",
                    "content": [
                        {
                            "title": "Title of the new section",
                            "list": [
                                {
                                    "text": "This is the first paragraph.",
                                    "type": "text/plain"
                                },
                                {
                                    "imgName": "allgemein.png",
                                    "imgPath": "https://geodienste.hamburg.de/lgv-config/img/"
                                },
                                {
                                    "text": "This is the second <i>paragraph</i> with html content.",
                                    "type": "text/html"
                                }
                            ]
                        },
                        {
                            "before": "generalInfo",
                            "title": "Title of a new section before generalInfo",
                            "list": [
                                {
                                    "text": "This is a paragraph.",
                                    "type": "text/plain"
                                }
                            ]
                        },
                        {"hide": "generalInfo"}
                    ]
                }
            }
        }
    }
}
```

***

### Portalconfig.menu

This field allows creating and ordering menu entries. The order of tools corresponds to the entry order within the *config.json* file.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|ansichten|no|**[ansichten](#markdown-header-portalconfigmenuansichten)**||Preconfigured map view in 2D and 3D mode|false|
|info|no|**[info](#markdown-header-portalconfigmenuinfo)**||Menu folder containing **[tools](#markdown-header-portalconfigmenutools)** or **[staticlinks](#markdown-header-portalconfigmenustaticlinks)**.|false|
|tools|no|**[tools](#markdown-header-portalconfigmenutools)**||Menu folder containing tools.|false|
|tree|no|**[tree](#markdown-header-portalconfigmenutree)**||Representation and position of the topic selection tree.|false|

***

#### Portalconfig.menu.ansichten

Configuration options for map views.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|yes|String||Name of the map views in the menu.|false|
|glyphicon|no|String|"glyphicon-list"|Glyphicon of the map views in the menu.|false|
|children|no|**[children](#markdown-header-portalconfigmenuansichtenchildren)**|false|Configurations of any number of map views.|false|

***

#### Portalconfig.menu.ansichten.children

Configuration options for map views.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|view|no|**[view](#markdown-header-portalconfigmenuansichtenchildrenview)**||Configuration of a single map view.|false|

***

#### Portalconfig.menu.ansichten.children.view

Configuration options for a map view.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|yes|String||Map view name.|false|
|type|yes|String||Type of map view, must always be "viewpoint".|false|
|glyphicon|no|String||Glyphicon of the map view in the menu.|false|
|center|no|Number[]||Coordinate at which the map view is centered.|false|
|zoomLevel|no|Number||Zoom level of the map view.|false|
|altitude|no|Number||Altitude of the camera in meters. Used only for map views in 3D mode.|false|
|heading|no|Number||Heading of the camera in Radiant. Used only for map views in 3D mode.|false|
|tilt|no|Number||Tilt of the camera in radians. Used only for map views in 3D mode.|false|

**Example of a map view for 2D and 3D mode**
```
#!json
"ansichten": {
    "name": "translate#common:menu.views.name",
    "glyphicon": "glyphicon-list",
    "children": {
        "view": {
            "name": "translate#common:menu.views.view01",
            "type": "viewpoint",
            "glyphicon": "glyphicon-screenshot",
            "center": [
                564028.7954571751,
                5934555.967867207
            ],
            "zoomLevel": 7.456437968949651,
            "altitude": 272.3469798217454,
            "heading": -0.30858728378862876,
            "tilt": 0.9321791580603296
        }
    }
}
```

***

#### Portalconfig.menu.legend

Legend configuration options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|yes|String||Legend name.|false|
|glyphicon|no|String|"glyphicon-book"|Legend glyphicon.|false|
|showCollapseAllButton|no|Boolean|false|Option to en-/disable all legends.|false|
|showLegend|no|Boolean|false|Option to display the legend when starting the portal|false|

***

#### Portalconfig.menu.info

[inherits]: # (Portalconfig.menu.folder)

This is a menu tab typically containing links (`staticlinks`) to external information sources. It may also contain tools (`tools`).

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|children|no|**[children](#markdown-header-portalconfigmenuinfochildren)**||Menu tab children configuration.|false|

***

##### Portalconfig.menu.info.children

[type:staticlink]: # (Portalconfig.menu.staticlinks.staticlink)

List of tools (`tools`) or links (`staticlinks`) appearing in the menu tab `info`.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|staticlinks|no|**[staticlink](#markdown-header-portalconfigmenustaticlinks)**[]||Configuration object creating links in the menu tab.|false|

***

#### Portalconfig.menu.tree
Hier können die Menüeinträge und deren Anordnung konfiguriert werden. Die Reihenfolge der Werkzeuge ergibt sich aus der Reihenfolge in der *Config.json*.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|yes|String||Name des Themenbaumes.|false|
|glyphicon|no|String||CSS Klasse des glyphicons.|false|
|isInitOpen|no|Boolean|false|Gibt an ob der Themenbaum initial geöffnet ist.|false|

***

#### Portalconfig.menu.folder

[type:tool]: # (Portalconfig.menu.tool)
[type:staticlinks]: # (Portalconfig.menu.staticlinks)

A folder object defined by a name, glyphicon, and its children.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|yes|String||Folder's menu name.|false|
|glyphicon|yes|String|"glyphicon-folder-open"|CSS glyphicon class shown in front of the folder name.|false|
|children|no|**[tool](#markdown-header-portalconfigmenutool)**/**[staticlinks](#markdown-header-portalconfigmenustaticlinks)**||Folder child elements.|false|

**Example**

```json
{
    "tools":{
        "name": "Werkzeuge",
        "glyphicon": "glyphicon-wrench",
        "children": {
            "legend": {
                "name": "Legende",
                "glyphicon": "glyphicon-book"
            }
        }
    }
}
```

***

### Portalconfig.menu.tools

[inherits]: # (Portalconfig.menu.folder)
[type:tool]: # (Portalconfig.menu.tool)

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|children|no|**[children](#markdown-header-portalconfigmenutoolschildren)**||Tool configuration.|false|

***

#### Portalconfig.menu.tools.children

[type:tool]: # (Portalconfig.menu.tool)
[type:compareFeatures]: # (Portalconfig.menu.tool.compareFeatures)
[type:contact]: # (Portalconfig.menu.tool.contact)
[type:coordToolkit]: # (Portalconfig.menu.tool.coordToolkit)
[type:draw]: # (Portalconfig.menu.tool.draw)
[type:featureLister]: # (Portalconfig.menu.tool.featureLister)
[type:filter]: # (Portalconfig.menu.tool.filter)
[type:filterGeneral]: # (Portalconfig.menu.tool.filterGeneral)
[type:gfi]: # (Portalconfig.menu.tool.gfi)
[type:layerClusterToggler]: # (Portalconfig.menu.tool.layerClusterToggler)
[type:layerSlider]: # (Portalconfig.menu.tool.layerSlider)
[type:legend]: # (Portalconfig.menu.legend)
[type:measure]: # (Portalconfig.menu.tool.measure)
[type:parcelSearch]: # (Portalconfig.menu.tool.parcelSearch)
[type:print]: # (Portalconfig.menu.tool.print)
[type:routing]: # (Portalconfig.menu.tool.routing)
[type:saveSelection]: # (Portalconfig.menu.tool.saveSelection)
[type:searchByCoord]: # (Portalconfig.menu.tool.searchByCoord)
[type:shadow]: # (Portalconfig.menu.tool.shadow)
[type:styleWMS]: # (Portalconfig.menu.tool.styleWMS)
[type:supplyCoord]: # (Portalconfig.menu.tool.supplyCoord)
[type:resetTree]: # (Portalconfig.menu.tool.resetTree)
[type:virtualcity]: # (Portalconfig.menu.tool.virtualcity)
[type:wfsSearch]: # (Portalconfig.menu.tool.wfsSearch)
[type:wfst]: # (Portalconfig.menu.tool.wfst)

List of all configurable tools. Each tool inherits the properties of **[tool](#markdown-header-portalconfigmenutool)** and can (or must, respectively) provide the defined attributes as mentioned in that definition.
Alternatively, also the paths **Portalconfig.menu.info**, **Portalconfig.menu.simulation** or **Portalconfig.menu.utilities** can be used to hold tool configs.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|addWMS|no|**[tool](#markdown-header-portalconfigmenutool)**||This tool allows loading specific WMS layers. This is done by providing a URL. All the service's layers are retrieved and offered in the layer tree in section "External technical data". Using this tool is only compatible with the `treeType` "custom" or "default".|true|
|bufferAnalysis|no|**[tool](#markdown-header-portalconfigmenutool)**||This buffer analysis allows the selection of a source layer, a buffer radius and a target layer. The chosen buffer radius will then be shown around features of the selected source layer. At the moment a target layer is selected, only the features of this layer will be shown, if they are outside the buffer radii. It is also possible to invert the result. In this case the resulting features will only be show if they are inside the radii.|false|
|compareFeatures|no|**[compareFeatures](#markdown-header-portalconfigmenutoolcomparefeatures)**||Offers a comparison option for vector features. The getFeatureInfo (GFI) window will offer a clickable star symbol to put elements on the comparison list. Works when used together with the GFI theme **Default**.|false|
|contact|no|**[contact](#markdown-header-portalconfigmenutoolcontact)**||The contact form allows users to send messages to a configured mail address. For example, this may be used to allow users to submit errors and suggestions.|false|
|coord|no|**[tool](#markdown-header-portalconfigmenutool)**||_Deprecated in 3.0.0. Please use `supplyCoord` instead._ Tool to read coordinates on mouse click. When clicking once, the coordinates in the view are frozen and can be copied on clicking the displaying input elements to the clipboard, i.e. you can use them in another document/chat/mail/... with `Strg+V`.|false|
|coordToolkit|no|**[tool](#markdown-header-portalconfigmenutool)**||Coordinate query: Tool to read coordinates on mouse click. When clicking once, the coordinates in the view are frozen and can be copied on clicking the displaying input elements to the clipboard, i.e. you can use them in another document/chat/mail/... with `Strg+V`. Coordinate search:search for coordinates with switchable coordinate reference system. The tool will zoom to any given coordinate and set a marker on it. The coordinate systems are obtained from config.js.|false|
|draw|no|**[draw](#markdown-header-portalconfigmenutooldraw)**||The draw tool allows painting points, lines, polygons, circles, double circles, and texts to the map. You may download these drawing as KML, GeoJSON, or GPX.|false|
|extendedFilter|no|**[tool](#markdown-header-portalconfigmenutool)**||_Deprecated in 3.0.0. Please use "filter" instead._ Dynamic filtering of WFS features. This requires an `extendedFilter` configuration on the WFS layer object.|false|
|featureLister|no|**[featureLister](#markdown-header-portalconfigmenutoolfeaturelister)**||Lists all features of a vector layer and highlights the feature over whose name the mouse is located.|false|
|fileImport|no|**[tool](#markdown-header-portalconfigmenutool)**||Import KML, GeoJSON, and GPX files with this tool.|false|
|filter|no|**[filter](#markdown-header-portalconfigmenutoolfilter)**||Allows filtering WFS vector data.|false|
|filterGeneral|no|**[filterGeneral](#markdown-header-portalconfigmenutoolfiltergeneral)**||Configuration for an advanced filter for WFS vector layers.|false|
|gfi|no|**[gfi](#markdown-header-portalconfigmenutoolgfi)**||Via  getFeatureInfo (GFI) information to arbitrary layers can be requested. For WMS, the data is fetched with a GetFeatureInfo request. Vector data (WFS, Sensor, GeoJSON, etc.) is already present in the client and will be shown from the already fetched information.|false|
|kmlimport|no|**[tool](#markdown-header-portalconfigmenutool)**||_Deprecated in 3.0.0. Please use `fileImport` instead._|false|
|layerClusterToggler|no|**[tool](#markdown-header-portalconfigtoollayerClusterToggler)**||_This tool allows a cluster layers to be active and deactive together._|false|
|layerSlider|no|**[layerSlider](#markdown-header-portalconfigmenutoollayerslider)**||The layerSlider tool allows showing arbitrary services in order. This can e.g. be used to show aerial footage from multiple years in succession.|false|
|legend|no|**[legend](#markdown-header-portalconfigmenulegend)**||The legend for all visible layers is displayed here.|false|
|measure|no|**[measure](#markdown-header-portalconfigmenutoolmeasure)**||Allows measuring areas and distances in the units m/km resp. m²/km².|false|
|parcelSearch|no|**[parcelSearch](#markdown-header-portalconfigmenutoolparcelsearch)**||_Deprecated in the next major release. Please use `wfsSearch` instead._ The parcel search tool allows searching for parcels by district and parcel number. Many German administrative units feature a tripartite order, hence the tool offers searching by "Gemarkung" (district), "Flur" (parcel) (not used in Hamburg), and "Flurstück" (literally "parcel piece").|false|
|print|no|**[print](#markdown-header-portalconfigmenutoolprint)**||Printing module that can be used to export the map's current view as PDF.|false|
|routing|no|**[routing](#markdown-header-portalconfigmenutoolrouting)**||Routing module to create routes and isochrones.|false|
|saveSelection|no|**[saveSelection](#markdown-header-portalconfigmenutoolsaveselection)**||Tool that allows saving the map's current state as sharable URL. This will list all currently visible layers in order, transparency, and visibility, as well as saving the center coordinate.|false|
|searchByCoord|no|**[searchByCoord](#markdown-header-portalconfigmenutoolsearchbycoord)**||_Deprecated in 3.0.0. Please use "coordToolkit" instead._ Coordinate search with switchable coordinate reference system. The tool will zoom to any given coordinate and set a marker on it.|false|
|selectFeatures|no|**[tool](#markdown-header-portalconfigmenutool)**||Allows selecting a set of vector features by letting the user draw a box on the map. Features in that box will be displayed with GFI information.|false|
|shadow|no|**[shadow](#markdown-header-portalconfigmenutoolshadow)**||Configuration object for the 3D mode shadow time.|false|
|styleWMS|no|**[styleWMS](#markdown-header-portalconfigmenutoolstylewms)**||Classification of WMS services. This tool is used in the commute portal of MRH (Metropolregion Hamburg, en.: Metropolitan area Hamburg). With a mask, classifications can be defined. The GetMap request will have an SLD body as payload, used by the server to render. The WMS service now delivers its tiles in the defined classifications and colors.|true|
|styleVT|no|**[tool](#markdown-header-portalconfigmenutool)**||Style selection for VT services. Allows switching between styles of a Vector Tile Layer that provides multiple stylings via the `services.json` file.|false|
|supplyCoord|no|**[tool](#markdown-header-portalconfigmenutool)**||_Deprecated in 3.0.0. Please use "coordToolkit" instead._ Tool to read coordinates on mouse click. When clicking once, the coordinates in the view are frozen and can be copied on clicking the displaying input elements to the clipboard, i.e. you can use them in another document/chat/mail/... with `Strg+V`.|false|
|resetTree|no|**[tool](#markdown-header-portalconfigmenutool)**||Tool to reset tree. Clicking on Tool name in the menu under Tools resets the tree.|false|
|virtualcity|no|**[virtualcity](#markdown-header-portalconfigmenutoolvirtualcity)**||*virtualcityPLANNER* planning viewer|false|
|wfsFeatureFilter|no|**[tool](#markdown-header-portalconfigmenutool)**||_Deprecated in 3.0.0. Please use `filterGeneral` instead._ Filters WFS features. This required configuring `"filterOptions"` on the WFS layer object.|false|
|wfsSearch|no|**[wfsSearch](#markdown-header-portalconfigmenutoolwfssearch)**||Makes it possible to create a form to query WFS layers using filters. It is possible to either use a stored query (WFS@2.0.0) or define the query using the defined parameters (WFS@1.1.0).|false|
|wfst|no|**[wfst](#markdown-header-portalconfigmenutoolwfst)**||WFS-T module to visualize, create, update, and delete features.|false|

***

#### Portalconfig.menu.tool

A tool's attribute key defines which tool is loaded. Each tool provides at least the following attributes. To see further configuration options, please visit the **[tools](#markdown-header-portalconfigmenutools)** section.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|active|no|Boolean|false|Whether the tool is open initially.|false|
|glyphicon|no|String||CSS glyphicon class. Glyphicon is shown before the tool name.|false|
|isVisibleInMenu|no|Boolean|true|If true, the tool is listed in the menu.|false|
|keepOpen|no|Boolean|false|Whether the tool remains open parallel to other tools.|false|
|name|yes|String||Name displayed in the menu.|false|
|onlyDesktop|no|Boolean|false|Whether the tool should only be visible in desktop mode.|false|
|renderToWindow|no|Boolean|true|Whether the tool should be displayed in the movable widget element.|false|
|resizableWindow|no|Boolean|false|Whether the tool window can be minimized/restored.|false|

**Example**

```json
{
    "legend":{
        "name": "Legende",
        "glyphicon": "glyphicon-book"
    }
}
```

***

#### Portalconfig.menu.tool.gfi

[inherits]: # (Portalconfig.menu.tool)

Displays information to a clicked feature by firing a *GetFeatureInfo* or *GetFeature* request, respectively using the loaded data on vector layers.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|yes|String||Name displayed in the menu.|false|
|centerMapToClickPoint|no|Boolean|false|If true, centers any clicked feature on the map. Only relevant if the `desktopType` attribute is "detached".|false|
|glyphicon|no|String|"glyphicon-info-sign"|CSS glyphicon class. Glyphicon is shown before the tool name.|false|
|active|no|Boolean|true|Whether GFI is active initially.|false|
|desktopType|no|String|"detached"|Used to choose a GFI template in desktop mode. If using "attached", the GFI will be positioned next to the feature. Using "detached" will place a marker on the feature and create the GFI window to the right of the map.|false|
|centerMapMarkerPolygon|no|Boolean|false|Specification of whether the clicked feature is used to get the center coordinate or the actually clicked coordinate is used.|false|
|highlightVectorRules|no|**[highlightVectorRules](#markdown-header-portalconfigmenutoolgfihighlightvectorrules)**||Rule definition to override the styling of clicked vector data.|false|

**Examples**

```json
{
    "gfi":{
        "name": "Request information",
        "glyphicon": "glyphicon-info-sign",
        "active": true,
        "centerMapMarkerPolygon": true,
        "highlightVectorRules": {
            "fill": {
                "color": [215, 102, 41, 0.9]
            },
            "image": {
                "scale": 1.5
            },
            "stroke": {
                "width": 4
            },
            "text": {
                "scale": 2
            }
        }
    }
}
```

```json
{
    "gfi": {
        "name": "Request information",
        "glyphicon": "glyphicon-info-sign",
        "active": true,
        "centerMapMarkerPolygon": true
    }
}
```

***

##### Portalconfig.menu.tool.gfi.highlightVectorRules

Configuration list to overwrite vector styles on gfi requests.
Hint: highlighting only works if there is a styleId in config.json configured for the layer.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|fill|no|**[fill](#markdown-header-portalconfigmenutoolgfihighlightvectorrulesfill)**||Settable field: `color`|false|
|image|no|**[image](#markdown-header-portalconfigmenutoolgfihighlightvectorrulesimage)**||Settable field: `scale`|false|
|stroke|no|**[stroke](#markdown-header-portalconfigmenutoolgfihighlightvectorrulesstroke)**||Settable field: `width`|false|
|text|no|**[text](#markdown-header-portalconfigmenutoolgfihighlightvectorrulestext)**||Settable field: `scale`|false|

***

##### Portalconfig.menu.tool.gfi.highlightVectorRules.fill

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|color|no|Float[]|[255, 255, 255, 0.5]|RGBA value|false|

```json
{
    "fill": { "color": [215, 102, 41, 0.9] }
}
```

***

##### Portalconfig.menu.tool.gfi.highlightVectorRules.image
|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|scale|no|Float|1|Scale number|false|

```json
{
    "image": { "scale": 1.5 }
}
```

***

##### Portalconfig.menu.tool.gfi.highlightVectorRules.stroke
|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|width|no|Integer|1|Stroke line width|false|

```json
{
    "stroke": { "width": 4 }
}
```

***

##### Portalconfig.menu.tool.gfi.highlightVectorRules.text
|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|scale|no|Float|1|Text scale number|false|

```json
{
    "text": { "scale": 2 }
}
```

***

#### Portalconfig.menu.tool.filter

[inherits]: # (Portalconfig.menu.tool)

The filter tool offers a range of options to filter vector data.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|allowMultipleQueriesPerLayer|no|Boolean|false|Defines whether selecting only filters the chosen layers or if filter options regarding deselected layers are retained.|false|
|deactivateGFI|no|Boolean|false|If set `true`, the filter tool deactivates gfi requests while open.|false|
|isGeneric|no|Boolean|false|Whether filters can be created dynamically. Not yet implemented.|false|
|minScale|no|Integer||Minimum zoom level the filter zooms to when displaying filter results.|false|
|liveZoomToFeatures|no|Boolean|false|Defines whether the filter immediately zooms to filter results.|false|
|predefinedQueries|no|[predefinedQuery](#markdown-header-portalconfigmenutoolfilterpredefinedquery)[]||Filter query definition.|false|
|saveToUrl|no|Boolean|true|Saves the current filter result to the URL, allowing to save it to e.g. your bookmarks.|false|

**Example**

This example uses Hamburg's school and hospital layers, hence a lot of German technical keys are in use.

```json
{
    "filter":{
        "name": "Filter",
        "glyphicon": "glyphicon-filter",
        "deactivateGFI": false,
        "isGeneric": false,
        "isInitOpen": false,
        "allowMultipleQueriesPerLayer": false,
        "predefinedQueries": [
            {
                "layerId": "8712",
                "isActive": false,
                "isSelected": false,
                "name": "Grundschulen",
                "predefinedRules": [
                    {
                        "attrName": "kapitelbezeichnung",
                        "values": ["Grundschulen", "Langformschulen"]
                    }
                ],
                "attributeWhiteList": ["bezirk", "stadtteil", "schulform", "ganztagsform", "anzahl_schueler", "schwerpunktschule", "bilingual"]
            },
            {
                "layerId": "8712",
                "isActive": false,
                "isSelected": false,
                "name": "Stadtteilschulen",
                "predefinedRules": [
                    {
                        "attrName": "kapitelbezeichnung",
                        "values": ["Stadtteilschulen", "Langformschulen"]
                    }
                ],
                "attributeWhiteList": ["bezirk", "stadtteil", "schulform", "ganztagsform", "anzahl_schueler", "schwerpunktschule", "fremdsprache", "fremdsprache_mit_klasse", "schulische_ausrichtung"]
            },
            {
                "layerId": "8712",
                "isActive": false,
                "isSelected": false,
                "name": "Gymnasien",
                "info": "Sie finden berufliche Gymnasien ab der Klassenstufe 11 bei den Beruflichen Schulen.",
                "predefinedRules": [
                    {
                        "attrName": "kapitelbezeichnung",
                        "values": ["Gymnasien"]
                    }
                ],
                "attributeWhiteList": ["bezirk", "stadtteil", "schulform", "ganztagsform", "anzahl_schueler", "fremdsprache", "fremdsprache_mit_klasse", "schulische_ausrichtung"]
            },
            {
                "layerId": "8712",
                "isActive": false,
                "isSelected": false,
                "name": "Sonderschulen",
                "predefinedRules": [
                    {
                        "attrName": "kapitelbezeichnung",
                        "values": ["Sonderschulen"]
                    }
                ],
                "attributeWhiteList": ["bezirk", "stadtteil", "ganztagsform", "foerderart", "abschluss"]
            },
            {
            "layerId": "1711",
            "isActive": true,
            "isSelected": true,
            "name": "Krankenhäuser",
            "predefinedRules": [],
            "attributeWhiteList": ["teilnahme_geburtsklinik", "teilnahme_notversorgung"]
            }
        ]
    }
}
```

***

#### Portalconfig.menu.tool.filter.predefinedQuery

Object defining a filter query.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|layerId|yes|String||Layer id; must be configured in the `Themenconfig`.|false|
|isActive|no|Boolean|false|Defines whether this filter should be applied initially.|false|
|isSelected|no|Boolean|false|Defines whether this filter should be shown initially.|false|
|searchInMapExtent|no|Boolean|false|Defines whether the filter is only applied to features within the map's current view.|false|
|info|no|String||Short information text shown above the filter options.|false|
|predefinedRules|no|**[predefinedRule](#markdown-header-portalconfigmenutoolfilterpredefinedquerypredefinedrule)**[]||Filter rule that pre-filters the data.|true|
|attributeWhiteList|no|String[]/**[attributeWhiteListObject](#markdown-header-portalconfigmenutoolfilterpredefinedqueryattributewhitelistobject)**[]||Whitelist for applicable attributes.|true|
|snippetType|no|String||Attribute data type. When not defined, the data type is inferred. In exceptional cases, this can be overwritten manually, e.g. with "checkbox-classic". This is required on the touch tablet portal version of the DIPAS project.|true|
|useProxy|no|Boolean|false|_Deprecated in the next major release. [GDI-DE](https://www.gdi-de.org/en) recommends setting CORS headers on the required services instead of using proxies._ Defines whether the service URL should be requested via proxy. In that case, dots in the URL are replaced with underscores.|false|

**Example**

```json
{
    "layerId": "8712",
    "isActive": false,
    "isSelected": false,
    "name": "Grundschulen",
    "predefinedRules": [
        {
            "attrName": "kapitelbezeichnung",
            "values": ["Grundschulen", "Langformschulen"]
        }
    ],
    "attributeWhiteList": ["bezirk", "stadtteil", "schulform", "ganztagsform", "anzahl_schueler", "schwerpunktschule", "bilingual"]
}
```

***

#### Portalconfig.menu.tool.filter.predefinedQuery.predefinedRule

Filter rule always applied to pre-filter data.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|attrName|yes|String||Attribute name used for pre-filtering.|false|
|values|yes|String[]||Attribute value expected when pre-filtering.|false|

**Example**

```json
{
    "attrName": "kapitelbezeichnung",
    "values": ["Grundschulen", "Langformschulen"]
}
```

***

#### Portalconfig.menu.tool.filter.predefinedQuery.attributeWhiteListObject

This key may have as value either a string representing the attribute name or an object. When given as an object, the attributes to be filtered can be renamed in the process. In that case, the key is the original attribute name, and the value the new name.

An AttributeWhiteList as an object allows a slider to be used as a filter for selecting a start and end time.
The prerequisite for this is that a start and end time exist in a certain format as an attribute.
Furthermore the start time should be defined in the object with the key "name", the end time with the key "attrNameUntil" and the format of the attributes with the key "format".
The last step to use the slider as a date filter is to define the key "type" as "date".

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|yes|String||Attribute name.|false|
|matchingMode|no|enum["AND", "OR"]|"OR"|Logical connection of multiple attribute values (on multiple choices) within an attribute.|false|
|displayName|no|String||Name of the filter.|true|
|attrNameUntil|no|String||Names of the attribute that will be used as the end time for the slider filter.|true|
|format|no|String||Format of date.|true|
|type|no|enum["integer", "searchInMapExtent", "date"]||Type of attribute.|true|

**String example**
```
#!json
"Grundschulen"
```

**Object example**
```
#!json
{
    "name": "Grundschulen",
    "matchingMode": "AND"
}
```

***

**Object example for Date-Slider as filter**

```
#!json

"attributeWhiteList": [
  {
    "name": "baubeginn",
    "displayName": "Baustelle",
    "attrNameUntil": "bauende",
    "matchingMode": "OR",
    "format": "DD.MM.YYYY",
    "type": "date"
  }
```

***

#### Portalconfig.menu.tool.filterGeneral

[inherits]: # (Portalconfig.menu.tool)

The filter tool offers a range of options to filter vector data.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|layerSelectorVisible|no|Boolean|true|To display a selector for the layers. Put to `false` to show without selector.|false|
|multiLayerSelector|no|Boolean|true|If layerSelectorVisible true, wether one can open multiple sections of the selector at the same time.|false|
|liveZoomToFeatures|no|Boolean|true|Defines whether the filter immediately zooms to filter results.|false|
|minScale|no|Integer|5000|Minimum zoom level the filter zooms in when displaying filter results.|false|
|layers|no|[filterLayer](#markdown-header-portalconfigmenutoolfiltergeneralfilterlayer)[]|[]|Configuration of layers to be filtered. Can be an array of plain layer ids also - if so the layer and all snippets are identified automatically.|false|

**Example**

The following example uses only a layer id to generate the filter automatically.

```json
{
    "filterGeneral":{
        "active": false,
        "name": "Filter",
        "glyphicon": "glyphicon-filter",
        "renderToWindow": false,
        "deactivateGFI": false,
        "layerSelectorVisible": false,
        "layers": [
            {
                "layerId": "8712"
            }
        ]
    }
}
```

***

#### Portalconfig.menu.tool.filterGeneral.filterLayer

An object to define a layer to filter with.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|layerId|no|String||The layer id of the layer to filter. Must be configured in the `Themenconfig`.|false|
|title|no|String||The title to use for the selector (if layerSelectorVisible true). Can be a translation key also. If not set, the layerId will be used by default.|false|
|category|no|String||Instead of a `title`. If set, an additional parameter `layers` is expected as [filterLayer](#markdown-header-portalconfigmenutoolfiltergeneralfilterlayer)[] with the same rules applied as described here. The parameters `description` and `shortDescription` are applied as described, when using category (see examples).|false|
|description|no|String|""|A description of the layer, displayed when the selector is opened or no layerSelectorVisible is set to `false`. Can be a translation key also.|false|
|shortDescription|no|String|""|The shorter version of the description, displayed under the selector title only if layerSelectorVisible is `true` and the selector is closed. Can be a translation key also.|false|
|active|no|Boolean|false|Set to `true` to let the layer selector be initialy opened - only if layerSelectorVisible is set to `true`. If multiLayerSelector is set to `false` and more than one filter layer has set active to `true`, the last filter layer with active `true` is initialy opened.|false|
|strategy|no|String||There are two filter strategies: `passive` - a filter button is used. And `active` - the filter will be triggered immediately by any choice made. Passive strategy is used by default.|false|
|searchInMapExtent|no|Boolean|false|Set to `true` to activate a generic checkbox, where you can set the filtering to `only filter in current browser extent`. If the extent checkbox is checked, automatic zooming is disabled. Make sure to set [loadingStrategy](#markdown-header-themenconfiglayervector) to `all` to avoid weird effects when zooming out after filtering in extent.|false|
|searchInMapExtentInfo|no|Boolean|true|A little icon is shown right hand side of the checkbox. Clicking the icon, a standard description is shown. Set to `false` to disable this feature. Set to a individual text to use an own description or use a translation key.|false|
|showHits|no|Boolean|true|After filtering, the hits are displayed. Set to `false` to not show the hits.|false|
|snippetTags|no|Boolean|true|After filtering the current setting is displayed as tags. Set to `false` to turn of this feature.|false|
|labelFilterButton|no|String|"common:modules.tools.filterGeneral.filterButton"|If strategy is set to `passive` only: The text of the filter button. Can be a translation key.|false|
|paging|no|Number|1000|The filter will load features into the map in chunks. Paging is the chunk size. If the chunk size is set too low, the filtering will be slowed down. Set the chunk size too high, the loading of the chunk will slow the filtering down. Try it out to find your fastes setup.|false|
|extern|no|Boolean|false|When set to `true`, filtering is done on the server side. Useful for big sets of data that can't be loaded into the browser at once. Remember to set the **[isNeverVisibleInTree](#markdown-header-themenconfiglayer)** flag of the layer to `true` to avoid loading of the whole data set by user click on its entry in the tree.|false|
|snippets|no|[snippets](#markdown-header-portalconfigmenutoolfiltergeneralfilterlayersnippets)[]|[]|Configuration of snippets to adjust the filtering. Can be a minimalistic array of attribute names. Can be left empty to use the automatic identification of all snippets possible.|false|

**Example**

In this example one snippet is set with only an attrName. The snippet type is detected automatically. See [filterLayerSnippets](#markdown-header-portalconfigmenutoolfilterfilterlayersnippets) for the advanced configuration of snippets.

```json
{
    "layerId": "8712",
    "title": "Schools",
    "strategy": "active",
    "searchInMapExtent": true,
    "searchInMapExtentInfo": true,
    "showHits": true,
    "shortDescription": "School master data and pupil numbers of Hamburg schools",
    "description": "School master data and pupil numbers of Hamburg schools",
    "snippetTags": true,
    "paging": 100,
    "snippets": [
        {
            "attrName": "rebbz_homepage"
        }
    ]
}
```

**Example**

In this example the parameter `category` is used instead of `title` to move the layers back into an additional selector with two more selectors in it.

```json
{
    "category": "Schools and Hospitals",
    "shortDescription": "Numbers of Hamburg schools and hospitals",
    "description": "Numbers of Hamburg schools and hospitals",
    "layers": [
        {
            "layerId": "8712",
            "title": "Schools",
            "strategy": "active",
            "searchInMapExtent": true,
            "searchInMapExtentInfo": true,
            "showHits": true,
            "shortDescription": "School master data and pupil numbers of Hamburg schools",
            "description": "School master data and pupil numbers of Hamburg schools",
            "snippetTags": true,
            "paging": 100,
            "snippets": [
                {
                    "attrName": "rebbz_homepage"
                }
            ]
        },
        {
            "layerId": "8713",
            "title": "Hospitals",
            "snippetTags": true,
            "paging": 100,
            "snippets": [
                {
                    "attrName": "hospital_name"
                }
            ]
        }
    ]
}
```

***

#### Portalconfig.menu.tool.filterGeneral.filterLayer.snippets

An object defining a single snippet.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|attrName|yes|String||The attribute name used for filtering. Can be an array of two strings also if a range with start and end point should be filtered (array only for types: `sliderRange` and `dateRange` - see example).|false|
|title|no|String||The title of the snippet. Can be a translation key. If left away the attrName is used. Set to `false` to avoid displaying at all.|false|
|info|no|String||An info text or translation key. If set, a little icon will shown right hand side of the snippet. Can be set to `true` to display a default text for the snippet type.|false|
|type|no|String||The type of this snippet. Can be one of the following: `checkbox`, `dropdown`, `text`, `slider`, `sliderRange`, `date`, `dateRange`. Will be indentified automatically if left away, following a data type rule: boolean becomes `checkbox`, string becomes `dropdown`, number becomes `sliderRange`, unknown becomes `text`.|false|
|operator|no|String||The operator to connect the set value to the value in the database. Can be one of the following - depending if it makes sense for the type and is available for the used interface: `INTERSECTS`, `BETWEEN`, `EQ`, `IN`, `STARTSWITH`, `ENDSWITH`, `NE`, `GT`, `GE`, `LT`, `LE`. If left away, defaults are: boolean becomes `EQ`, string becomes `EQ`, number becomes `BETWEEN`, unknown becomes `EQ`.|false|
|visible|no|Boolean|true|The snippet is visible. Set to `false` to hide the snippet: This gives you the power to use `prechecked` as an `always rule` to force filtering of a fixed attrName and value.|false|
|prechecked|no|String[]||Initially checked value. For `dropdown`, `sliderRange` and `dateRange` an array of values, for checkbox a boolean, for slider a number, for text a string and for date a string (following the set `format`). If `visible` is set to `false`, value set by prechecked are forced for filtering.|false|
|value|no|String[]||Initially set value. If not set, automatic identification is used for `dropdown`, `slider(Range)` and `date(Range)`. In case of `checkbox` this is used as translation of the value if the value in database is not a boolean value (e.g. ["Yes", "No"] - see example).|false|
|format|no|String|"YYYY-MM-DD"|For type `date` and `dateRange` only: The format the date is stored in the database. Leave empty for ISO8601.|false|
|minValue|no|Number||For type `slider(Range)` and `date(Range)` only: The minimum value as number or date string. Leave empty for automatic identification of boundaries.|false|
|maxValue|no|Number||For type `slider(Range)` and `date(Range)` only: The maximum value as number or date string. Leave empty for automatic identification of boundaries.|false|
|display|no|String|"default"|For type `dropdown` only: If set to `list`, instead of a dropdown a simple list is shown.|false|
|autoInit|no|Boolean|true|For type `dropdown` only: If set to `false`: Turns off the automatic identification of value (in case of `dropdown`) or minValue/maxValue (in case of `slider(Range)` and `date(Range)`.|false|
|placeholder|no|String|""|For type `dropdown` only: The placeholder to use. Can be a translation key.|false|
|multiselect|no|Boolean|true|For type `dropdown` only: Selection of multiple entries. Set to `false` to switch to single select.|false|
|addSelectAll|no|Boolean|false|For type `dropdown` with `multiselect: true` only: Adds an additional entry on top of the list to select/deselect all entries.|false|
|renderIcons|no|String|"none"|For type `dropdown` with `display: "list"` only: If set to `fromLegend` icons will be placed left hand side of each entry. Icons are taken from legend. Use an object with attrNames as keys and imagePath as value {attrName: imagePath} to manually set images (see example).|false|

**Example**

Example for a text snippet. A input box with placeholder will be shown for filtering free text.

```json
{
    "title": "Description of school",
    "attrName": "school_description",
    "type": "text",
    "operator": "IN",
    "placeholder": "Search in description"
}
```

**Example**

Example for a checkbox snippet. A checkbox is shown to search for "Oui" in the database if checked. The checkbox is checked by default.

```json
{
    "title": "A l'option végétalienne ?",
    "attrName": "vegan_option",
    "type": "checkbox",
    "operator": "EQ",
    "value": ["Oui", "Non"],
    "prechecked": true
}
```

**Example**

Example for a dropdown snippet. A simple dropdown with single select and placeholder is used.

```json
{
    "title": "District",
    "attrName": "city_district",
    "type": "dropdown",
    "multiselect": false,
    "placeholder": "Choose a district"
}
```

**Example**

Example for a dropdown snippet. A dropdown with multiselect and select all option, manually set icons, info, fixed value and prechecked. Displayed as list.

```json
{
    "title": "District",
    "attrName": "city_district",
    "info": "Some districts of London.",
    "type": "dropdown",
    "display": "list",
    "multiselect": true,
    "addSelectAll": true,
    "value": [
        "Whitehall and Westminster",
        "Piccadilly and St James's",
        "Soho and Trafalgar Square",
        "Covent Garden and Strand",
        "Bloomsbury and Fitzrovia"
    ],
    "prechecked": [
        "Piccadilly and St James's",
        "Soho and Trafalgar Square"
    ],
    "renderIcons": {
        "Whitehall and Westminster": "https://example.com/img/whitehall.png",
        "Piccadilly and St James's": "https://example.com/img/piccadilly.png",
        "Soho and Trafalgar Square": "https://example.com/img/soho.png",
        "Covent Garden and Strand": "https://example.com/img/covent.png",
        "Bloomsbury and Fitzrovia": "https://example.com/img/bloomsbury.png"
    },
    "placeholder": "Choose a district"
}
```

**Example**

Example for a slider snippet. A slider for a single digit and a less or equals operator. With minValue and maxValue to avoid automatic identification of boundaries.

```json
{
    "title": "First classes",
    "attrName": "number_of_first_classes",
    "type": "slider",
    "operator": "LE",
    "minValue": 1,
    "maxValue": 5
}
```

**Example**

Example for a slider range snippet. A slider range without minValue and maxValue to use automatic identification of boundaries.

```json
{
    "title": "Angle d'inclinaison du toit du garage",
    "attrName": "angle",
    "type": "sliderRange",
    "operator": "BETWEEN"
}
```

**Example**

Example for a slider range snippet. A slider range with two attrName for min and max. With minValue and max Value to avoid automatic identification of boundaries.

```json
{
    "title": "Angle d'inclinaison du toit du garage",
    "attrName": ["angle_minimal", "angle_maximal"],
    "type": "sliderRange",
    "operator": "BETWEEN",
    "minValue": 0,
    "maxValue": 90
}
```

**Example**

Example for a date snippet. A date picker for a single date with minValue and maxValue to avoid automatic identification of boundaries.

```json
{
    "title": "Birthday",
    "attrName": "birthday",
    "type": "date",
    "format": "YYYY-MM-DD",
    "minValue": "2000-01-01",
    "maxValue": "2022-12-31"
}
```

**Example**

Example for a date range snippet. A date range with two attrName for min and max. With a special date format. Uses intersects operator, without minValue and maxValue to use automatic identification of boundaries.

```json
{
    "title": "Bauzeit der Autobahnen",
    "attrName": ["autobahn_baubeginn", "autobahn_bauende"],
    "type": "dateRange",
    "operator": "INTERSECTS",
    "format": "DD.MM.YY"
}
```

***

#### Portalconfig.menu.tool.compareFeatures

[inherits]: # (Portalconfig.menu.tool)

This tool allows comparing vector features.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|numberOfFeaturesToShow|no|Integer|3|Maximum amount of features selectable for comparison.|false|
|numberOfAttributesToShow|no|Integer|12|Maximum amount of attributes initially shown. If more attributes are available, they can be  shown and hidden by clicking a button.|false|

**Example**

```json
{
    "compareFeatures": {
        "name": "Vergleichsliste",
        "glyphicon": "glyphicon-th-list",
        "numberOfFeaturesToShow": 5,
        "numberOfAttributesToShow": 10
    }
}
```

***

#### Portalconfig.menu.tool.parcelSearch

[inherits]: # (Portalconfig.menu.tool)

Parcel search.

>**This requires a backend!**
>
>**Depending on your configuration, special stored queries of a WFS are requested with given parameters.**

Example request: **https://geodienste.hamburg.de/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0&&StoredQuery_ID=Flurstueck&gemarkung=0601&flurstuecksnummer=00011**

>Deprecated in the next major release. Please use **[wfsSearch](#markdown-header-portalconfigmenutoolwfssearch)** instead.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|serviceId|yes|String||Id of the service to request. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|storedQueryId|yes|String||Id of the stored query to use.|true|
|configJSON|yes|String||Path to the configuration file holding districts. **[Example file](https://geodienste.hamburg.de/lgv-config/gemarkungen_hh.json)**.|false|
|parcelDenominator|no|Boolean|false|Flag defining whether parcel denominators are used as a level. (Hamburg special: As a city state, Hamburg has no parcel denominators.)|false|
|styleId|no|String||Allows choosing a style id from the `style.json` file to overwrite the map marker default style.|false|
|zoomLevel|no|Number|7|Defines to which zoom level the tool should zoom.|false|

**Example**

```json
{
    "parcelSearch": {
        "name": "Flurstückssuche",
        "glyphicon": "glyphicon-search",
        "serviceId": "6",
        "storedQueryID": "Flurstueck",
        "configJSON": "https://geodienste.hamburg.de/lgv-config/gemarkungen_hh.json",
        "parcelDenominator": false,
        "styleId": "flaecheninfo"
    }
}
```

***

#### Portalconfig.menu.tool.saveSelection

[inherits]: # (Portalconfig.menu.tool)

Tool to save the current map content as a url.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|simpleMap|no|Boolean|false|Adds a SimpleMap URL to the component. When calling this URL, the menu bar, layer tree, and map controls are deactivated.|false|

***

#### Portalconfig.menu.tool.resetTree

[inherits]: # (Portalconfig.menu.tool)

Reset the theme tree.

|Name|Required|Type|Default|Description|Expert|
|----|-------------|---|-------|------------|------|
|resetTree|no|Boolean|false|Tool to reset tree. Click on the tool name in the menu under Tools to reset the tree.|false|

***

#### Portalconfig.menu.tool.searchByCoord

[inherits]: # (Portalconfig.menu.tool)

Coordinate search.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|zoomLevel|no|Number|7|Defines to which zoom level the tool should zoom.|false|

**Example**

```json
{
    "searchByCoord": {
        "name": "Flurstückssuche",
        "glyphicon": "glyphicon-record",
        "zoomLevel": 7
    }
}
```

***

#### Portalconfig.menu.tool.print

[inherits]: # (Portalconfig.menu.tool)

Print module, configurable for 2 print services: *High Resolution PlotService* and *MapfishPrint 3*. Printing vector tile layers is not supported, since the print services themselves do not support it. Should users try to print such layers, a warning will be shown.

>**This requires a backend!**
>
>**A [Mapfish-Print3](https://mapfish.github.io/mapfish-print-doc), or *HighResolutionPlotService* is required as backend.**

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|mapfishServiceId|yes|String||_Deprecated in 3.0.0._ Print service id. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|printServiceId|yes|String||Print service id. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|printService|no|String|"mapfish"|Flag determining which print service is in use. `plotservice` activates the *High Resolution PlotService*, if the parameter is not set, *Mapfish 3* is used.|false|
|printAppCapabilities|no|String|"capabilities.json"|path for the configuration of the print service|false|
|currentLayoutName|no|String|""|Defines which layout is the default layout on opening the print tool, e.g. "A4 portrait format". If the given layout is not available oder none is provided, the first layout mentioned in the Capabilities is used.|false|
|printAppId|no|String|"master"|Print service print app id. This tells the print service which template(s) to use.|false|
|filename|no|String|"report"|Print result file name.|false|
|title|no|String|"PrintResult"|Document title appearing as header.|false|
|isLegendSelected|no|Boolean|false|Defines whether a checkbox to print the legend is offered. Only used for print services supporting legend printing (Mapfish Print 3).|false|
|legendText|no|String|"Mit Legende"|Descriptive text for the legend print checkbox.|false|
|dpiForPdf|no|Number|200|DPI resolution for the map in the PDF file.|false|
|capabilitiesFilter|no|**[capabilitiesFilter](#markdown-header-portalconfigmenutoolprintcapabilitiesfilter)**||Filter for the response of the configured print service. Possible keys are layouts and outputFormats.|false|
|defaultCapabilitiesFilter|no|**[capabilitiesFilter](#markdown-header-portalconfigmenutoolprintcapabilitiesfilter)**||If there is no key set in capabilitiesFilter, the key from this object is taken.|false|
|useProxy|no|Boolean|false|_Deprecated in the next major release. [GDI-DE](https://www.gdi-de.org/en) recommends setting CORS headers on the required services instead of using proxies._ Defines whether a service URL should be requested via proxy. For this, dots in the URL are replaced with underscores.|false|
|printMapMarker|nein|Boolean|false|If set to true, map markers visible in the print image section will be printed. They may obstruct the view to interesting information. Note to developers: This feature does not work in development mode since MapFish is not able to retrieve files stores in localhost, and the mapMarker belongs to the build folder.|false|

**High Resolution PlotService example configuration**

```json
{
    "print": {
        "name": "Karte drucken",
        "glyphicon": "glyphicon-print",
        "mapfishServiceId": "123456",
        "filename": "Print",
        "title": "My Title",
        "printService": "plotservice",
        "printAppCapabilities": "info.json",
        "version" : "HighResolutionPlotService"
    }
}
```

**MapfishPrint3 example configuration**

```json
{
    "print": {
        "name": "Karte drucken",
        "glyphicon": "glyphicon-print",
        "mapfishServiceId": "mapfish_printservice_id",
        "printAppId": "mrh",
        "filename": "Print",
        "title": "Mein Titel"
    }
}
```

### Portalconfig.menu.tool.print.capabilitiesFilter
List of layouts and formats that filters the response from the print service in the respective category.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|layouts|no|String[]||Array of layouts should shown in the UI.|false|
|outputFormats|no|String[]||Array of formats should shown in the UI.|false|

**Beispiel capabilitiesFilter:**
```json
{
    "capabilitiesFilter": {
        "layouts": ["A4 Hochformat", "A3 Hochformat"],
        "outputFormats": ["PDF"]
    }
}
```

***

#### Portalconfig.menu.tool.draw

[inherits]: # (Portalconfig.menu.tool)

Module used to draw features on the map. This includes points, which may also be represented by symbols, and (double) circles, polygons, polylines, and text.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|yes|String||Tool name in the menu.|false|
|iconList|no|**[icon](#markdown-header-portalconfigmenutooldrawicon)**[]|[{"id": "iconPoint", "type": "simple_point", "value": "simple_point"}, {"id": "yellow pin", "type": "image", "scale": 0.5, "value": "https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png"}]|List of symbols the user may choose from to draw colored symbols or dots. Images may be used, too, as shown in the example.|false|
|drawSymbolSettings|no|**[drawSymbolSet](#markdown-header-portalconfigmenutooldrawdrawsymbolset)**|{"color": [55, 126, 184, 1], "opacity": 1}|Pre-configuration for symbol drawing.|false|
|drawLineSettings|no|**[drawLineSet](#markdown-header-portalconfigmenutooldrawdrawlineset)**|{"strokeWidth": 1, "opacityContour": 1, "colorContour": [0, 0, 0, 1]}|Pre-configuration for line drawing.|false|
|drawCurveSettings|no|**[drawCurveSet](#markdown-header-portalconfigmenutooldrawdrawcurveset)**|{"strokeWidth": 1, "opacityContour": 1, "colorContour": [0, 0, 0, 1]}|Pre-configuration for freehand drawing.|false|
|drawAreaSettings|no|**[drawAreaSet](#markdown-header-portalconfigmenutooldrawdrawareaset)**|{"strokeWidth": 1, "color": [55, 126, 184, 1], "opacity": 1, "colorContour": [0, 0, 0, 1], "opacityContour": 1}|Pre-configuration for area drawing.|false|
|drawCircleSettings|no|**[drawCircleSet](#markdown-header-portalconfigmenutooldrawdrawcircleset)**|{"circleMethod": "interactive", "unit": "m", "circleRadius": null, "strokeWidth": 1, "color": [55, 126, 184, 1], "opacity": 1, "colorContour": [0, 0, 0, 1], "opacityContour": 1, "tooltipStyle": {"fontSize": "16px", "paddingTop": "3px", "paddingLeft": "3px", "paddingRight": "3px", "backgroundColor": "rgba(255, 255, 255, .9)"}}|Pre-configuration for circle drawing.|false|
|drawDoubleCircleSettings|no|**[drawDoubleCircleSet](#markdown-header-portalconfigmenutooldrawdrawdoublecircleset)**|{"circleMethod": "defined", "unit": "m", "circleRadius": 0, "circleOuterRadius": 0, "strokeWidth": 1, "color": [55, 126, 184, 1], "opacity": 1, "colorContour": [0, 0, 0, 1], "outerColorContour": [0, 0, 0, 1], "opacityContour": 1}|Pre-configuration for double circle drawing.|false|
|writeTextSettings|no|**[writeTextSet](#markdown-header-portalconfigmenutooldrawwritetextset)**|{"text": "", "fontSize": 10, "font": "Arial", "color": [55, 126, 184, 1], "opacity": 1}|Pre-configuration for text writing.|false|
|download|no|**[download](#markdown-header-portalconfigmenutooldrawdownload)**|{"preSelectedFormat": "KML"}|Pre-configuration for download.|false|

**Example**

```
#!json
{
    "draw": {
        "name": "Draw / Write",
        "glyphicon": "glyphicon-pencil",
        "iconList": [
            {
                "id": "iconPoint",
                "type": "simple_point",
                "value": "simple_point"
            },
            {
                "id": "iconMeadow",
                "type": "image",
                "scale": 0.8,
                "value": "meadow.png"
            },
            {
                "id": "yellow pin",
                "type": "image",
                "scale": 0.5,
                "value": "https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png"
            }
        ],
        "drawDoubleCircleSettings": {
            "circleRadius": 1500,
            "circleOuterRadius": 3000,
            "strokeWidth": 3,
            "color": [55, 126, 184, 0],
            "opacity": 0,
            "colorContour": [228, 26, 28, 1],
            "opacityContour": 1,
            "tooltipStyle": {
                "fontSize": "14px",
                "paddingTop": "3px",
                "paddingLeft": "3px",
                "paddingRight": "3px",
                "backgroundColor": "rgba(255, 255, 255, .9)"
            }
        }
    }
}
```

***

#### Portalconfig.menu.tool.draw.icon

Dot object consisting of text, type, and value.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|id|yes|String||Symbol text displayed in the select menu. The id has to be defined in the locale file (usually `common`) as `modules.tools.draw.iconList` child. The following entry should begin with `icon` and contain a representative description. If the key is not found, the `id` will appear as string on the user interface.|false|
|caption|no|String||_Deprecated in 3.0.0._ Symbol text displayed in the select menu. Unlike `id`, not only the id itself, but the whole path (`modules.tools.draw.iconList` + id) has to be given.|false|
|type|yes|enum["image", "simple_point"]||Object type to be drawn. If `image` is chosen, the PNG or SVG file from the `value` path is drawn. By default, images are to be placed in the `/img/tools/draw/` directory and should have a height and width of 96px to scale correctly. Alternatively, a working `scale` factor must be defined. The key `simple_point` will draw a simple point.|false|
|scale|no|number||Scale factor for images.|false|
|value|yes|String||Value of the object to be drawn. If no path or URL is set, a file name is expected, and the *config.js* entry `wfsImgPath` is expected to be the file's location.|false|

**Example**

```json
{
    "iconList": [
        {
            "id": "iconPoint",
            "type": "simple_point",
            "value": "simple_point"
        },
        {
            "id": "iconMeadow",
            "type": "image",
            "scale": 0.8,
            "value": "meadow.png"
        },
        {
            "id": "yellow pin",
            "type": "image",
            "scale": 0.5,
            "value": "https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png"
        }
    ]
}
```

***


#### Portalconfig.menu.tool.draw.drawSymbolSet

Object to change the drawing tool's configured point symbol default value.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|color|yes|Number[]|[55, 126, 184, 1]|The pre-configured color of the symbol as RGB color. The alpha channel value is used for point coloring.|false|
|opacity|yes|Number|1|The pre-configured transparency of symbols, given in range [0..1] for point data.|false|


**Example**

```json
{
    "color": [55, 126, 184, 1],
    "opacity": 1
}
```

***

#### Portalconfig.menu.tool.draw.drawLineSet

Object to change the drawing tool's configured line default value.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|strokeWidth|yes|Number|1|Pre-configured stroke width of lines in pixels.|false|
|colorContour|yes|Number[]|[0, 0, 0, 1]|Pre-configured line color in RGBA.|false|
|opacityContour|yes|Number|1|Pre-configured line transparency in range [0..1].|false|

**Example**

```json
{
    "strokeWidth": 1,
    "opacityContour": 1,
    "colorContour": [0, 0, 0, 1]
}
```

***

#### Portalconfig.menu.tool.draw.drawCurveSet

Object to change the drawing tool's configured freehand drawing default value.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|strokeWidth|yes|Number|1|Pre-configured stroke width of lines in pixels.|false|
|colorContour|yes|Number[]|[0, 0, 0, 1]|Pre-configured line color in RGBA.|false|
|opacityContour|yes|Number|1|Pre-configured line transparency in range [0..1].|false|

**Example**

```json
{
    "strokeWidth": 1,
    "opacityContour": 1,
    "colorContour": [0, 0, 0, 1]
}
```

***

#### Portalconfig.menu.tool.draw.drawAreaSet

Object to change the drawing tool's configured area default value.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|strokeWidth|yes|Number|1|Pre-configured stroke width of area borders in pixels.|false|
|color|yes|Number[]|[55, 126, 184, 1]|Pre-configured area color in RGBA.|false|
|opacity|yes|Number|1|Pre-configured area transparency in range [0..1].|false|
|colorContour|yes|Number[]|[0, 0, 0, 1]|Pre-configured area border color in RGBA.|false|
|opacityContour|yes|Number|1|Pre-configured area border transparency in range [0..1].|false|

**Example**

```json
{
    "strokeWidth": 1,
    "color": [55, 126, 184, 1],
    "opacity": 1,
    "colorContour": [0, 0, 0, 1],
    "opacityContour": 1
}
```

***

#### Portalconfig.menu.tool.draw.drawCircleSet

Object to change the drawing tool's configured circle default value.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|circleMethod|yes|String|"interactive"|Pre-configured method of circle drawing. `"interactive"`: freehand, `"defined"`: by entering fixed values|false|
|unit|yes|String|"m"|Pre-configured unit regarding the circle's Radius `circleRadius` when `"defined"` is chosen as `circleMethod`.|false|
|circleRadius|yes|Number|0|Pre-configured circle Radius when `"defined"` is chosen as `circleMethod`.|false|
|strokeWidth|yes|Number|1|Pre-configured stroke width of circle border in pixels.|false|
|color|yes|Number[]|[55, 126, 184, 1]|Pre-configured circle color in RGBA.|false|
|opacity|yes|Number|1|Pre-configured circle transparency in range [0..1].|false|
|colorContour|yes|Number[]|[0, 0, 0, 1]|Pre-configured circle border color in RGBA.|false|
|opacityContour|yes|Number|1|Pre-configured circle border transparency in range [0..1].|false|
|tooltipStyle|no|String|{}|Pre-configured style for tooltip.|false|

**Example**

```
#!json
{
    "circleMethod": "interactive",
    "unit": "m",
    "circleRadius": 0,
    "strokeWidth": 1,
    "color": [55, 126, 184, 1],
    "opacity": 1,
    "colorContour": [0, 0, 0, 1],
    "opacityContour": 1
}
```

***

#### Portalconfig.menu.tool.draw.drawDoubleCircleSet

Object to change the drawing tool's configured circle default value.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|circleMethod|yes|String|"defined"|Pre-configured method of circle drawing. `"interactive"`: freehand, `"defined"`: by entering fixed values|false|
|unit|yes|String|"m"|Pre-configured unit regarding the circle's radius `circleRadius` and `circleOuterRadius` when `"defined"` is chosen as `circleMethod`.|false|
|circleRadius|yes|Number|0|Pre-configured inner circle radius when `"defined"` is chosen as `circleMethod`.|false|
|circleOuterRadius|yes|Number|0|Pre-configured outer circle radius when `"defined"` is chosen as `circleMethod`.|false|
|strokeWidth|yes|Number|1|Pre-configured stroke width of circle border in pixels.|false|
|color|yes|Number[]|[55, 126, 184, 1]|Pre-configured circle color in RGBA.|false|
|opacity|yes|Number|1|Pre-configured double circle transparency in range [0..1].|false|
|colorContour|yes|Number[]|[0, 0, 0, 1]|Pre-configured inner circle border color in RGBA.|false|
|outerColorContour|yes|Number[]|[0, 0, 0, 1]|Pre-configured outer circle border color in RGBA.|false|
|opacityContour|yes|Number|1|Pre-configured circle border transparency in range [0..1].|false|

**Example**

```json
{
    "circleMethod": "defined",
    "unit": "m",
    "circleRadius": 0,
    "circleOuterRadius": 0,
    "strokeWidth": 1,
    "color": [55, 126, 184, 1],
    "opacity": 1,
    "colorContour": [0, 0, 0, 1],
    "opacityContour": 1
}
```

***

#### Portalconfig.menu.tool.draw.writeTextSet

Object to change the drawing tool's configured text default value.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|text|yes|String|""|Pre-configured text.|false|
|fontSize|yes|Number|10|Pre-configured font size.|false|
|font|yes|String|"Arial"|Pre-configured font. Restricted to `"Arial"`, `"Calibri"`, and `"Times New Roman"`.|false|
|color|yes|Number[]|[55, 126, 184, 1]|Pre-configured font color in RGBA.|false|
|opacity|yes|Number|1|Pre-configured font transparency in range [0..1].|false|

**Example**

```json
{
    "text": "",
    "fontSize": 10,
    "font": "Arial",
    "color": [55, 126, 184, 1],
    "opacity": 1
}
```

***

#### Portalconfig.menu.tool.draw.download

Object to change the drawing tool's download preselected format. It should be one of "KML", "GEOJSON" and "GPX".

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|preSelectedFormat|no|String|"KML"|Pre-configured pre-selected form.|false|

**Example**

```json
{
    "preSelectedFormat": "KML"
}
```

***

#### Portalconfig.menu.tool.featureLister

[inherits]: # (Portalconfig.menu.tool)

Module that displays vector features. Hovering over a feature in the list highlights the feature on the map.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|maxFeatures|no|Integer|20|Amount of features to display initially. More features of the same amount can be revealed by clicking a button.|false|
|highlightVectorRulesPolygon|no|**[highlightVectorRulesPolygon](#markdown-header-portalconfigmenutoolfeaturelisterhighlightvectorrulespolygon)**||Specify the fill color and outline color and stroke width for highlighting the polygon features.|false|
|highlightVectorRulesPointLine|no|**[highlightVectorRulesPointLine](#markdown-header-portalconfigmenutoolfeaturelisterhighlightvectorrulespointline)**||Specify outline color and stroke width for highlighting lines and scale factor for highlighting points.|false|

**Example**

```json
{
    "featureLister": {
        "name": "List",
        "glyphicon": "glyphicon-menu-hamburger",
        "maxFeatures": 10,
        "highlightVectorRulesPolygon": {
        "fill": {
            "color": [255, 0, 255, 0.9]
        },
        "stroke": {
            "width": 4,
            "color": [0, 0, 204, 0.9]
        }
    },
    "highlightVectorRulesPointLine": {
        "stroke": {
            "width": 8,
            "color": [255, 0, 255, 0.9]
        },
        "image": {
            "scale": 2
        }
    }
}
```

##### Portalconfig.menu.tool.featureLister.highlightVectorRulesPolygon

Specify the fill color and outline color and stroke width for highlighting the polygon features.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|fill|no|**[fill](#markdown-header-portalconfigmenutoolfeaturelisterhighlightvectorrulespolygonfill)**||Possible setting: color|false|
|stroke|no|**[stroke](#markdown-header-portalconfigmenutoolfeaturelisterhighlightvectorrulespolygonstroke)**||Possible setting: width|false|

***

##### Portalconfig.menu.tool.featureLister.highlightVectorRulesPolygon.fill
|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|color|no|Float[]|[255, 255, 255, 0.5]|Possible setting: color (RGBA)|false|

```json
"fill": { "color": [215, 102, 41, 0.9] }
```

***

##### Portalconfig.menu.tool.featureLister.highlightVectorRulesPolygon.stroke
|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|width|no|Integer|1|Possible setting: width|false|
|color|no|Float[]|[255, 255, 255, 0.5]|Possible setting: color (RGBA)|false|

```json
"stroke": { "width": 4 , "color": [255, 0, 255, 0.9]}
```

***


##### Portalconfig.menu.tool.featureLister.highlightVectorRulesPointLine

Specify outline color and stroke width for highlighting lines and scale factor for highlighting points.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|stroke|no|**[stroke](#markdown-header-portalconfigmenutoolfeaturelisterhighlightvectorrulespointlinestroke)**||Possible setting: width|false|
|image|no|**[image](#markdown-header-portalconfigmenutoolfeaturelisterhighlightvectorrulespointlineimage)**||Possible setting: scale|false|

***

##### Portalconfig.menu.tool.featureLister.highlightVectorRulesPointLine.stroke
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|width|no|Integer|1|Possible setting: width|false|
|color|no|Float[]|[255, 255, 255, 0.5]|Possible setting: color (RGBA)|false|

```json
"stroke": { "width": 4 , "color": [255, 0, 255, 0.9]}
```

***

##### Portalconfig.menu.tool.featureLister.highlightVectorRulesPointLine.image
|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|scale|no|Integer|1.5|Possible setting: scale|false|

```json
"image": { "scale": 2}
```

***

#### Portalconfig.menu.tool.measure

[inherits]: # (Portalconfig.menu.tool)

The measure tool allows measuring distances and areas. This includes the specification of measurement inaccuracies.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|earthRadius|no|Number|6378137|Earth radius in meters. Please mind that the earth radius should be chosen in accordance with the reference ellipsoid. E.g., GRS80 should be used for ETRS89 (EPSG:25832).|false|
|measurementAccuracy|no|String|"meter"|Indicates how accurately the measurement result is displayed for m and m². Options are "decimeter" for one decimal place. "meter" for no decimal place. And "dynamic" for one decimal place for results smaller 10m / 10m² and no decimal place for results greater or equal 10m / 10m².|false|

**Example**

```json
{
    "measure": {
        "name": "translate#common:menu.tools.measure",
        "earthRadius": 6378137,
        "measurementAccuracy": "dynamic"
    }
}
```

#### Portalconfig.menu.tool.contact

[inherits]: # (Portalconfig.menu.tool)

The contact form allows users to send messages to a configured mail address.

>**This requires a backend!**
>
>**Contact uses an SMTP server and calls its sendmail.php.**

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|serviceId|yes|String||Email service id. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|serviceID|no|String||_Deprecated in the next major release. Please use **serviceId** instead._ Email service id. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|from|yes|**[email](#markdown-header-portalconfigmenutoolcontactemail)**[]||Email sender. Please mind our **[hints regarding E-Mail safety](#markdown-header-hints-regarding-e-mail-safety)**.|false|
|to|yes|**[email](#markdown-header-portalconfigmenutoolcontactemail)**[]||Recipient of the E-Mail. Please mind our **[hints regarding E-Mail safety](#markdown-header-hints-regarding-e-mail-safety)**.|false|
|closeAfterSend|no|Boolean|false|Flag determining if the contact window should be closed after successfully sending a message.|false|
|contactInfo|no|String||Additional text shown above the contact form.|false|
|deleteAfterSend|no|Boolean|false|Flag determining whether the contact form is emptied after successfully sending a message.|false|
|includeSystemInfo|no|Boolean|false|Flag determining if the senders system information should be included in the E-Mail.|false|
|locationOfCustomerService|no|String|"de"|The country the customer service is based in. The parameter is used for the date in the ticketId.|false|
|maxLines|no|Number|5|Amount of lines (height) for the textArea of the form|false|
|showPrivacyPolicy|no|Boolean|false|Flag determining if a checkbox should be displayed for agreeing to the privacy policy.|false|
|privacyPolicyLink|no|String|"https://www.masterportal.org/datenschutz.html"|Link to the full privacy policy. Should be given if `showPrivacyPolicy` is set to true.|false|
|subject|no|String||The subject to be used for the E-Mail.|false|
|withTicketNo|no|Boolean|true|Whether successfully sending a email retrieves a ticket number for the user.|false|

**Example**

```json
{
    "contact": {
        "name": "common:menu.contact",
        "glyphicon": "glyphicon-envelope",
        "serviceId": "123",
        "from": [
            {
                "email": "lgvgeoportal-hilfe@gv.hamburg.de",
                "name":"LGVGeoportalSupport"
            }
        ],
        "to": [
            {
                "email": "lgvgeoportal-hilfe@gv.hamburg.de",
                "name":"LGVGeoportalSupport"
            }
        ],
        "includeSystemInfo": true,
        "closeAfterSend": true,
        "deleteAfterSend": true,
        "withTicketNo": false
    }
}
```

>Hints regarding E-Mail safety

The unchecked usage of *sender (FROM)*, *recipient (TO)*, *copy (CC)*, and *blind copy (BCC)* by the SMTP server is hereby **expressly discouraged** for security reasons. The unchecked usage of the customer email as a *reply to (REPLY-TO)* by the SMTP server is warned against.

We strongly recommend setting *FROM* and *TO* manually on the SMTP server without offering an option for external configuration.

>For security reasons, *Sender (FROM)* and *Empfänger (TO)* sent by the Masterportal to the SMTP server may not be used as an email's FROM and TO without further checks. This would create a security breach that allows sending malicious emails with manipulated FROM and TO by the SMTP server. Should you need the configuration in the Masterportal anyway (as in the example above), the parameters *from* and *to* may be used after checking them against a **whistelist** on the SMTP server, preventing sending to or from email addresses not mentioned on the list.

We recommend not automatically setting the customer's email address in *CC* (or *BCC*).

>For security reasons, the user may not be automatically set as *Copy (CC)* or *Blind Copy (BCC)* of an email. Such an automatism would allow sending malicious emails by entering a foreign mail address via the SMTP server.

We strongly recommend to manually remove *CC* and *BCC* on the SMTP server.

>There must be no option to set *Copy (CC)* or *Blind Copy (BCC)* via the Masterportal. Such a feature could be misused to send malicious emails via the SMTP server.

We warn against automatically setting the customer email as *REPLY-TO*.

>The unchecked copying of data to email headers is warned against depending on the security level (resp. age) of the SMTP server, since the risk of *Carriage Return* and *Line Feed* injections may lead to e.g. allowing *REPLY-TO* from the email header line to be escaped to ultimately manipulate the email header itself. (Example: "test@example.com\r\nBCC:target1@example.com,target2@example.com,(...),target(n)@example.com"). In a more abstract case, UTF attacks may be possible, where normally harmless UTF-16 or UTF-32 characters may change the email header's behavior when interpreted as ANSI or UTF-8, having a comparable effect.

***

#### Portalconfig.menu.tool.contact.email

E-Mail object containing a mail address, and a display name.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|email|no|String||E-Mail address.|false|
|name|no|String||Display name.|false|

**Example**

```json
{
    "email": "lgvgeoportal-hilfe@gv.hamburg.de",
    "name":"LGVGeoportalHilfe"
}
```

***

#### Portalconfig.menu.tool.layerClusterToggler

[inherits]: # (Portalconfig.menu.tool)

The layer cluster toggler tool allows to activate and deactivate cluster layers together

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|yes|String|"additional:addons.menu.tools.layerClusterToggler.name"|Name displayed in the tool.|false|
|glyphicon|yes|String|"glyphicon-education"|glyphicon displayed in the tool menu|false|
|clusterList|yes|**[clusterList](#markdown-header-portalconfigmenutoollayerClusterTogglerclusterList)**[]|[]|Array of layer id objects or layer id string.|false|

**Example**

```json
{
    "layerClusterToggler": {
        "name": "translate#additional:addons.menu.tools.layerClusterToggler.name",
        "glyphicon": "glyphicon-education",
        "clusterList": ["8712", "21067"]
    }
}
```

***

#### Portalconfig.menu.tool.layerClusterToggler.clusterList

[inherits]: # (Portalconfig.menu.tool)

Defines a cluster of layer

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|layerId|yes|String||ID of the service to be shown in the portal. This layer ID *MUST* be configured as part of the *Themenconfig*!|false|
|suffix|yes|String||Suffix of layer. This Suffix *MUST* be configured as part of the *Themenconfig*|false|

**Example**

```json
{
    "layerClusterToggler": {
        "name": "translate#additional:addons.menu.tools.layerClusterToggler.name",
        "glyphicon": "glyphicon-education",
        "clusterList": [
            "8712",
            "8713",
            {
                "layerId": "21067",
                "suffix": "90012"
            },
            {
                "layerId": "21067",
                "suffix": "90013"
            },
            {
                "layerId": "21067",
                "suffix": "90014"
            },
            {
                "layerId": "21067",
                "suffix": "90015"
            }
        ]
    }
}
```

***

#### Portalconfig.menu.tool.layerSlider

[inherits]: # (Portalconfig.menu.tool)

The layer slider tool allows showing multiple layers in a row. This may e.g. be used to animate a time series of aerial imagery.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|title|no|String|"common:modules.tools.layerSlider.title"|Name displayed in the tool.|false|
|timeInterval|no|Integer|2000|Time in ms until the next layer is shown.|false|
|layerIds|yes|**[layerId](#markdown-header-portalconfigmenutoollayersliderlayerid)**[]|[]|Array of layer information objects.|false|
|sliderType|no|enum["player","handle"]|"player"|Layer slider type. `""player"` shows start, pause, and stop buttons, while `"handle"` uses a switch. In the latter case, layer transparency is adjusted additionally.|false|

**Example**

```json
{
    "layerSlider": {
        "name": "Timeline",
        "glyphicon": "glyphicon-film",
        "title": "Example WMS simulation",
        "sliderType": "player",
        "timeInterval": 2000,
        "layerIds": [
            {
                "title": "Service 1",
                "layerId": "123"
            },
            {
                "title": "Service 2",
                "layerId": "456"
            },
            {
                "title": "Service 3",
                "layerId": "789"
            }
        ]
    }
}
```

***

#### Portalconfig.menu.tool.layerSlider.layerId

Defines a layer slider layer.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|title|yes|String||Service name to be shown in the portal.|false|
|layerId|yes|String||ID of the service to be shown in the portal. This layer ID *MUST* be configured as part of the *Themenconfig*!|false|

**Example**

```json
{
    "title": "Service 1",
    "layerId": "123"
}
```

***

#### Portalconfig.menu.tool.virtualcity

[inherits]: # (Portalconfig.menu.tool)

The virtualcity tool allows showing plans from the *virtualcityPLANNER* service in the Masterportal. The *virtualcityPLANNER* plans must be *public* to be available in this tool.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|serviceId|yes|String||Service ID. Resolved using the **[rest-services.json](rest-services.json.md)** file.|
|useProxy|no|Boolean|false|_Deprecated in the next major release. [GDI-DE](https://www.gdi-de.org/en) recommends setting CORS headers on the required services instead of using proxies._ Defines whether a service URL should be requested via proxy. For this, dots in the URL are replaced with underscores.|false|

**Example**

```json
{
    "title": "virtualcityPLANNER",
    "serviceId": "1"
}
```

#### Portalconfig.menu.tool.shadow

[inherits]: # (Portalconfig.menu.tool)

The shadow tool provides a UI element to define a point in time. By using sliders and date pickers, you may enter it in a 30-minute grid. The chosen time allows rendering the shadows of all 3D objects in 3D mode by simulating the sun's position. By pulling the sliders or selecting a different date, a new sun position is calculated immediately. By default, the tool starts with the current time, which can be overwritten in the parameters.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|shadowTime|no|**[shadowTime](#markdown-header-portalconfigmenutoolshadowshadowtime)**||Default time the tool is started with. Recognizes "month", "day", "hour", and "minute".|
|isShadowEnabled|no|Boolean|false|Default shadow value. `true` immediately renders shadows, `false` requires a manual confirmation.|


**Example**

```json
{
    "shadowTime": {
        "month": "6",
        "day": "20",
        "hour": "13",
        "minute": "0"
    },
    "isShadowEnabled": true
}
```

***

#### Portalconfig.menu.tool.shadow.shadowTime

Todo.

|Name|Required|Type|Default|Beschreibung|
|----|--------|----|-------|------------|
|month|no|String||month|
|day|no|String||day|
|hour|no|String||hour|
|minute|no|String||minute|

**Example**
```json
{
    "month": "6",
    "day": "20",
    "hour": "13",
    "minute": "0"
}
```

***

#### Portalconfig.menu.tool.styleWMS

[inherits]: # (Portalconfig.menu.tool)

WMS service classification. This tool is used in the MRH (Metropolregion Hamburg, en.: Metropolitan area Hamburg) commute portal. With a mask, classifications can be defined. The GetMap request will have an SLD body as payload, used by the server to render. The WMS service now delivers its tiles in the defined classifications and colors.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|useProxy|no|Boolean|false|_Deprecated in the next major release. [GDI-DE](https://www.gdi-de.org/en) recommends setting CORS headers on the required services instead of using proxies._ Defines whether a service URL should be requested via proxy. For this, dots in the URL are replaced with underscores.|false|

***

#### Portalconfig.menu.tool.wfsSearch

[inherits]: # (Portalconfig.menu.tool)

Makes it possible to create a form to query WFS layers using filters through a separate interface.
It is assumed that a stored query is used when using a WFS@2.0.0. When using a WFS@1.1.0, it is assumed that the way the WFS should be filtered is defined through the configuration.

Multiple formulars (**[SearchInstances](#markdown-header-portalconfigmenutoolwfssearchsearchinstance)**) can be defined, which will be selectable through a dropdown menu.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|instances|yes|**[searchInstance](#markdown-header-portalconfigmenutoolwfssearchsearchinstance)**[]||Array of `searchInstances`. A singular **[searchInstance](#markdown-header-portalconfigmenutoolwfssearchsearchinstance)** corresponds to its own search form.|false|
|zoomLevel|no|Number|5|Defines to which zoom level the tool should zoom. Should a chosen feature not fit the zoom level, a fitting zoom level is chosen automatically.|false|
|resultsPerPage|no|Number|0|The search result list will at most show this amount of results at a time. Further results will be offered on separate result pages. 0 means showing all at the same time.|false|

**Example**

```json
{
    "wfsSearch": {
        "instances": [
            {
                "requestConfig": {
                    "layerId": "1234"
                },
                "selectSource": "https://geoportal-hamburg.de/lgv-config/gemarkungen_hh.json",
                "literals": [
                    {
                        "clause": {
                            "type": "and",
                            "literals": [
                                {
                                    "field": {
                                        "type": "equal",
                                        "fieldName": "gemarkung",
                                        "inputLabel": "District",
                                        "options": ""
                                    }
                                },
                                {
                                    "field": {
                                        "type": "equal",
                                        "fieldName": "flur",
                                        "inputLabel": "Cadastral District",
                                        "options": "flur"
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    }
}
```

***

#### Portalconfig.menu.tool.wfsSearch.searchInstance

A singular instance of the WFS Search which will be selectable through a dropdown in the tool.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|literals|yes|**[literal](#markdown-header-portalconfigmenutoolwfssearchsearchinstanceliteral)**[]||Array of `literals`.|true|
|requestConfig|yes|**[requestConfig](#markdown-header-portalconfigmenutoolwfssearchsearchinstancerequestconfig)**||An object, which mainly contains the id of the service (`layerId` or `restLayerId`) that is supposed to be requested. If a WFS@2.0.0 will be used, the `storedQueryId` needs to be provided as well. Additionally, further options for requests can be set.|false|
|selectSource|no|String||Optional Url leading to the expected options for the different inputs. See **[https://geoportal-hamburg.de/lgv-config/gemarkungen_hh.json]** for an example.|false|
|suggestions|no|**[suggestions](#markdown-header-portalconfigmenutoolwfssearchsearchinstancesuggestions)**||If given, the service will be queried whenever a user inserts values into an input field to suggest a value.|false|
|title|yes|String||Title of the search instance to be displayed in a dropdown inside the tool.|false|
|userHelp|no|String||Information text regarding the search form to be displayed to the user. If not given, it will be generated from the structure of the config. May be a locale key. If the value explicitly set to `hide`, no information regarding the structure of the form will be displayed.|false|
|resultDialogTitle|no|String||Heading of the result list. If not configured the name `WFS search` will be displayed. May be a translation key.|false|
|resultList|yes|**[resultList](#markdown-header-portalconfigmenutoolwfssearchsearchinstanceresultlist)**||Settings for the output of the found features in the result list.|true|

**Example**

```json
{
    "requestConfig": {
        "layerId": "1234"
    },
    "resultList": {
        "schulname": "School name",
        "abschluss": "Degree"
    },
    "selectSource": "https://geoportal-hamburg.de/lgv-config/gemarkungen_hh.json",
    "title": "Parcel Search",
    "literals": [
        {
            "clause": {
                "type": "and",
                "literals": [
                    {
                        "field": {
                            "type": "equal",
                            "fieldName": "gemarkung",
                            "inputLabel": "District",
                            "options": ""
                        }
                    },
                    {
                        "field": {
                            "type": "equal",
                            "fieldName": "flur",
                            "inputLabel": "Cadastral District",
                            "options": "flur"
                        }
                    }
                ]
            }
        }
    ]
}
```

***

#### Portalconfig.menu.tool.wfsSearch.searchInstance.literal

A `literal` can either have the parameter `clause`, or the parameter `field`. If both are set, the `clause`-part will be ignored.
However, a `field` needs to be wrapped inside a `clause` (as seen in most examples).

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|clause|yes|**[clause](#markdown-header-portalconfigmenutoolwfssearchsearchinstanceliteralclause)**||Defines the way multiple `literals` should be queried together. Can be seen as a group of `literals`.|true|
|field|no|**[field](#markdown-header-portalconfigmenutoolwfssearchsearchinstanceliteralfield)**||Representation for the selection field of a service value for the user.|true|

**Examples**

```json
{
    "clause": {
        "type": "and",
        "literals": [
            {
                "field": {
                    "type": "equal",
                    "fieldName": "gemarkung",
                    "inputLabel": "District",
                    "options": ""
                }
            },
            {
                "field": {
                    "type": "equal",
                    "fieldName": "flur",
                    "inputLabel": "Cadastral District",
                    "options": "flur"
                }
            }
        ]
    }
}
```

```json
{
    "field": {
        "type": "equal",
        "fieldName": "rivers",
        "inputLabel": "Rivers",
        "options": [
            {
                "id": "0",
                "displayName": "Elbe"
            },
            {
                "id": "1",
                "displayName": "Moselle"
            },
            {
                "id": "2",
                "displayName": "Rhine"
            }
        ]
    }
}
```

***

#### Portalconfig.menu.tool.wfsSearch.searchInstance.literal.clause

[type:literal]: # (Portalconfig.menu.tool.wfsSearch.searchInstance.literal)

A `clause` defines the way multiple `literals` should be queried together.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|literals|yes|**[literal](#markdown-header-portalconfigmenutoolwfssearchsearchinstanceliteral)**[]||Array of `literals`.|true|
|type|yes|enum["and", "or"]||The way the `literals` in this `clause` should be queried together.|false|

**Example**

```json
{
    "clause": {
        "type": "and",
        "literals": [
            {
                "field": {
                    "type": "equal",
                    "fieldName": "gemarkung",
                    "inputLabel": "District",
                    "options": ""
                }
            },
            {
                "field": {
                    "type": "equal",
                    "fieldName": "flur",
                    "inputLabel": "Cadastral District",
                    "options": "flur"
                }
            }
        ]
    }
}
```

***

#### Portalconfig.menu.tool.wfsSearch.searchInstance.literal.field

A `field` represents the selection field for a value in the service.

It is possible to use a `field` for multiple search parameters. To do this, each parameter needs to be an array where each element of the array corresponds to a single parameter of the service.
A configuration like

```json
{
    "field": {
        "type": ["equal", "like"],
        "fieldName": ["flst", "gmkr"],
        "inputLabel": ["Parcel", "Communal district number"]
    }
}
```

would create a single `field` with which the user can decide whether he wants to use the input field to search for a `Parcel` or a `Communal district number` by selecting the value through a dropdown.
If the values are not an array, a label for the `field` will be shown instead of the dropdown.

If the parameter `options` is set, a select field is used, otherwise a simple text input.
If `options` is a String, it is important that the order of the Fields corresponds to the order of the objects in the external source (`selectSource`).
Assume the source looks like this:

```json
{
    "one": {
        "foo": {
            "id": "foo_one",
            "bar": ["f1_bar_one", "f1_bar_two"]
        }
    },
    "two": {
        "foo": {
            "id": "foo_two",
            "bar": ["f2_bar_one", "f2_bar_two"]
        }
    }
}
```

Then the order of the config should look like this:

```json
{
    "clause": {
        "type": "and",
        "literals": [
            {
                "field": {
                    "type": "equal",
                    "fieldName": "objects",
                    "inputLabel": "Objects",
                    "options": ""
                }
            },
            {
                "field": {
                    "type": "equal",
                    "fieldName": "foo",
                    "inputLabel": "Foo",
                    "options": "foo"
                }
            },
            {
                "field": {
                    "type": "equal",
                    "fieldName": "bar",
                    "inputLabel": "Bar",
                    "options": "foo.bar"
                }
            }
        ]
    }
}
```

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|defaultValue|no|String/String[]||If the field is not `required`, this value will be used on sending.|false|
|fieldName|yes|String/String[]||The wfs service parameter name for the comparison.|false|
|inputLabel|yes|String/String[]||Label for the UI element. May be a locale key.|false|
|inputPlaceholder|no|String/String[]||Placeholder for the UI element; only used if `options` is not set. Should contain example data. May be a locale key.|false|
|inputTitle|no|String/String[]||Value to be shown when hovering the UI element. May be a locale key.|false|
|required|no|Boolean/Boolean[]|false|Whether the field has to be filled.|false|
|options|no|String/**[option](#markdown-header-portalconfigmenutoolwfssearchsearchinstanceliteralfieldoption)**[]/String[]||If `options` is an array (irrelevant if of strings or **[options](#markdown-header-portalconfigmenutoolwfssearchsearchinstanceliteralfieldoption)**), the given values are used for selection. These options may either match **[option](#markdown-header-portalconfigmenutoolwfssearchsearchinstanceliteralfieldoption)** or are plain values (`String` / `Number`). In the latter case, the plain value is used as both id and `displayName`. <br /> If it is a String, there are different possibilities: <ul><li>If the String is empty, the keys of **[selectSource](#markdown-header-portalconfigmenutoolwfssearchsearchinstance)** are used.</li><li>If the String is not empty, it is assumed that another field with `options=""` exists; otherwise the field is disabled. It is also assumed that the String represents an array in **[selectSource](#markdown-header-portalconfigmenutoolwfssearchsearchinstance)** providing further options.</li></ul> **Note**: It is also possible to declare the `options` as a multidimensional array **[option](#markdown-header-portalconfigmenutoolwfssearchsearchinstanceliteralfieldoption)**[][]. However, this can't be used as a parameter for Masterportal Admin. This should be used if an **[option](#markdown-header-portalconfigmenutoolwfssearchsearchinstanceliteralfieldoption)**[] is wanted for a `field` that uses multiples parameters.|true|
|type|no|enum["equal", "like"]/enum["equal", "like"][]||Required for usage with WFS@1.1.0. The `type` declared how the field should be compared to the value in the service.|false|
|usesId|no|Boolean/Boolean[]|false|Only relevant if the Parameters `options` is set and an empty String (root element). Determines whether the key of the object of the external source should be used as a value for the query or if the object has an Id which should be used.|false|

**Example**

```json
{
    "field": {
        "type": "equal",
        "fieldName": "rivers",
        "inputLabel": "Rivers",
        "options": [
            {
                "displayName": "Elbe",
                "fieldValue": "0"
            },
            {
                "displayName": "Moselle",
                "fieldValue": "1"
            },
            {
                "displayName": "Rhine",
                "fieldValue": "2"
            }
        ]
    }
}
```

***

#### Portalconfig.menu.tool.wfsSearch.searchInstance.literal.field.option

A selectable option for a queryable parameter.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|displayName|no|String||Value to be displayed for the value. May be a locale key. If not set, the `id` will be shown.|false|
|fieldValue|yes|String||Value that is supposed to be sent to the service.|false|

**Example**

```json
{
    "fieldValue": "elbe",
    "displayName": "Elbe"
}
```

***

#### Portalconfig.menu.tool.wfsSearch.searchInstance.resultList

Settings for the output of the found features in the result list.

By specifying `showAll` all attributes of the found features are displayed in their original form.

By using an Object, a key of the Object must represent one of the attributes of the feature,
and the corresponding value defines the textual output of that attribute.

**Examples**:

```json
{
    "resultList": "showAll"
}
```

```json
{
    "resultList": {
        "schulname": "School name",
        "abschluss": "Degree"
    }
}
```

***

#### Portalconfig.menu.tool.wfsSearch.searchInstance.requestConfig

Information about the WFS service that is supposed to be requested.
Either `layerId` or `restLayerId` need to be present. If `layerId` is chosen, the layer needs to be configured in the **[config.json](config.json.md)**.
If both are defined `restLayerId` is used.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|gazetteer|no|**[gazetteer](#markdown-header-portalconfigmenutoolwfssearchsearchinstancerequestconfiggazetteer)**||Declares whether the used WFS service is a WFS-G, which needs to be parsed differently.|false|
|layerId|no|String||Id of the WFS service that should be queried. Information is fetched from **[services.json](services.json.md)**.|false|
|likeFilter|no|**[likeFilter](#markdown-header-portalconfigmenutoolwfssearchsearchinstancerequestconfiglikefilter)**|{"wildCard": "*", "singleChar": "#", "escape": "!"}|The configuration of the service for the like filter.|true|
|maxFeatures|no|Number/String|8|Maximum amount of features that are supposed to be returned from the service. Alternatively, the String `showAll` can be assigned to `maxFeatures` to load all features.|false|
|restLayerId|no|String||Id of the WFS service that should be queried. Information is fetched from **[rest-services.json](rest-services.json.md)**.|false|
|storedQueryId|no|String||The id of the Stored Query of the WFS that should be used to query the service. If this field is set, it is assumed that a WFS@2.0.0 is used.|false|

**Example**

```json
{
    "requestConfig": {
        "restLayerId": "1234",
        "storedQueryId": "Flurstuecke"
    }
}
```

***

#### Portalconfig.menu.tool.wfsSearch.searchInstance.requestConfig.likeFilter

Values inside a filter for a WFS service can be compared with an `equal` or a `like`.
If the comparison should be with a `like` then the filter needs additional properties. These may vary in value and property definition.
For the documentation, it is assumed that the properties are called `wildCard`, `singleChar` and `escape`; variations like e.g. `wildCard`, `single` and `escape` are possible and need to be configured in line with the service.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|wildCard|yes|String|"*"|The wildcard value for the like filter.|true|
|singleChar|yes|String|"#"|The single character value for the like filter.|true|
|escape|yes|String|"!"|The escape character value for the like filter.|true|

***

#### Portalconfig.menu.tool.wfsSearch.searchInstance.requestConfig.gazetteer

Parameters that are exclusively needed for using a WFS-G (Gazetteer).

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|namespaces|yes|String/String[]||The namespaces need to be provided.|false|
|memberSuffix|yes|enum["member","featureMember"]||The suffix of the featureType needs to be specified.|false|

**Example**

```json
{
    "gazetteer": {
        "namespaces": [
            "http://www.adv-online.de/namespaces/adv/dog",
            "http://geodienste.hamburg.de/dog_gages/services/wfs_dog?SERVICE=WFS&VERSION=2.0.0&REQUEST=DescribeFeatureType&OUTPUTFORMAT=application/gml+xml;+version=3.2&TYPENAME=dog:Flurstueckskoordinaten&NAMESPACES=xmlns(dog,http://www.adv-online.de/namespaces/adv/dog)"
        ],
        "memberSuffix": "memberSuffix"
    }
}
```


***

#### Portalconfig.menu.tool.wfsSearch.searchInstance.suggestions

Configuration for the suggestions of the user input.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|featureType|no|String||If given, the query will be sent with this featureType instead of the one configured for the service itself. Only usable if the layer was defined in the **[services.json](services.json.md)**.|false|
|length|no|Number|3|The query is triggered when the length of the input is at least as long as this parameter.|false|

***

#### Portalconfig.menu.tool.wfst

[inherits]: # (Portalconfig.menu.tool)

WFS-T module to visualize (*GetFeature*), create (*insert*), update (*update*), and delete (*delete*) features of a Web Feature Service (*WFS*). To use this tool, a WFS-T layer must be provided. See `services.json.md`.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|name|yes|String||Tool name shown in the portal.|
|layerIds|yes|String[]||Array of layer ids.|false|
|toggleLayer|no|Boolean|false|Whether layer feature stay visible when adding a new feature.|
|layerSelect|no|String|"aktueller Layer:"|Option to change the layer selection label.|
|pointButton|no|[Button](#markdown-header-portalconfigmenutoolwfstButton)[]|false|Configuration of which layers allow creating points and what label the button should have.|
|lineButton|no|[Button](#markdown-header-portalconfigmenutoolwfstButton)[]|false|Configuration of which layers allow creating lines and what label the button should have.|
|areaButton|no|[Button](#markdown-header-portalconfigmenutoolwfstButton)[]|false|Configuration of which layers allow creating areas and what label the button should have.|
|edit|no|[EditDelete](#markdown-header-portalconfigmenutoolwfsteditdelete)|false|Whether the edit button should be shown, and if, with which label.|
|delete|no|[EditDelete](#markdown-header-portalconfigmenutoolwfsteditdelete)|false|Whether the delete button should be shown, and if, with which label.|
|useProxy|no|Boolean|false|_Deprecated in the next major release. [GDI-DE](https://www.gdi-de.org/en) recommends setting CORS headers on the required services instead of using proxies._ Defines whether a service URL should be requested via proxy. For this, dots in the URL are replaced with underscores.|false|

**Example**

```json
{
    "wfst": {
        "name": "WFS-T Tool",
        "glyphicon": "glyphicon-globe",
        "layerIds": ["1234", "5678"],
        "toggleLayer": true,
        "layerSelect": "TestLayer",
        "pointButton": [
            {
                "layerId":"1234",
                "caption": "Point test",
                "show": true
            },
            {
                "layerId": "5678",
                "show": true
            }
        ],
        "lineButton": false,
        "areaButton": [
            {
                "layerId": "4389",
                "show": false
            }
        ],
        "edit": "Edit",
        "delete": true
    }
}
```

***

#### Portalconfig.menu.tool.wfst.Button

The attributes `pointButton`/`lineButton`/`areaButton` may be of type boolean or object. When of type boolean, it decides whether the create function is available to all layers. Else, the following attributes may be provided:

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|layerId|yes|String||Layer to be configured.|false|
|show|yes|Boolean|true|Whether the button is available.|false|
|caption|no|String|"Erfassen"|Button text. If no value is given, the Masterportal will use, depending on the type of button, "Punkt erfassen", "Linie erfassen", or "Fläche erfassen".|false|

**Examples**

```json
{
    "pointButton": true
}
```

```
#!json
{
    "layerId": "1234",
    "show": true,
    "caption": "Point test"
}
```

```json
{
    "layerId": "5678",
    "show": true
}
```

```json
{
    "layerId": "5489",
    "show": false
}
```

***

#### Portalconfig.menu.tool.wfst.EditDelete

The attributes `edit` and `delete` may be of type boolean or string. If of type boolean, it indicates whether the respective function is available. When of type string, it is offered with the string as its label.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|edit|yes|Boolean|true|Whether to show the edit button.|false|
|edit|yes|String|"Geometrie bearbeiten"|Edit button label.|false|
|delete|yes|Boolean|true|Whether to show the delete button.|false|
|delete|yes|String|"Geometrie löschen"|Delete button label.|false|

**Examples**

```json
{
    "edit": true
}
```

```json
{
    "edit": "Editieren"
}
```

***

#### Portalconfig.menu.tool.coordToolkit

[inherits]: # (Portalconfig.menu.tool)
Coordinates tool. To display the height above sea level in addition to the 2 dimensional coordinates, a 'heightLayerId' of a WMS service that provides the height must be specified. The format XML is expected and the attribute for the heights is expected under the value of the parameter 'heightElementName'.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|heightLayerId|no|String||Coordinate query: Id of the WMS layer that provides the height in XML format. If not defined, then no height is displayed.|false|
|heightElementName|no|String||Coordinate query: The element name under which the height in the XML is searched.|false|
|heightValueWater|no|String||Coordinate query: the value in the element defined under "heightElementName" supplied by the WMS for an unmeasured height in the water area, it will display the internationalized text "Water surface, no heights available" under the key "common:modules.tools.coordToolkit.noHeightWater" in the interface. If this attribute is not specified, then the text provided by the WMS will be displayed.|false|
|heightValueBuilding|no|String||Coordinate query: the value in the element defined under "heightElementName" supplied by the WMS for a non-measured height in the building area, it will display the internationalized text "Building area, no heights available" under the key "common:modules.tools.coordToolkit.noHeightBuilding" in the interface. If this attribute is not specified, then the text provided by the WMS will be displayed.|false|
|zoomLevel|no|Number|7|Coordinate search: Specifies the zoom level to which you want to zoom.|false|
|showCopyButtons|no|Boolean|true|Switch to show or hide the buttons for copying the coordinates.|false|
|delimiter|no|String|"Pipe-Symbol"|Delimiter of the coordinates when copying the coordinate pair|false|



**Example**
```
#!json
 "coordToolkit": {
            "name": "translate#common:menu.tools.coordToolkit",
            "glyphicon": "glyphicon-globe",
            "zoomLevel": 5,
            "heightLayerId" : "19173",
            "heightElementName": "value_0",
            "heightValueWater": "-20",
            "heightValueBuilding": "200",
            "delimiter": "-",
            "showCopyButtons": true
          }
```

***

#### Portalconfig.menu.tool.routing

[inherits]: # (Portalconfig.menu.tool)

Routing-tool. Enables user to plan routes between multiple points with multiple options to choose from. In addition users can create isochrones. Both functions are available with mass requests for specific use cases.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|activeRoutingToolOption|no|String|"DIRECTIONS"|Which routing tool should be open.|false|
|routingToolOptions|no|String[]|[ ]|Which routing tool should be enabled. ("DIRECTIONS", "ISOCHRONES")|false|
|download|no|**[download](#markdown-header-portalconfigmenutoolroutingdownload)**||Downloadoptions|false|
|geosearch|no|**[geosearch](#markdown-header-portalconfigmenutoolroutinggeosearch)**||Geosearchoptions|false|
|geosearchReverse|no|**[geosearchReverse](#markdown-header-portalconfigmenutoolroutinggeosearchreverse)**||Geosearchreverseoptions|false|
|directionsSettings|no|**[directionsSettings](#markdown-header-portalconfigmenutoolroutingdirectionssettings)**||Directionsoptions|false|
|isochronesSettings|no|**[isochronesSettings](#markdown-header-portalconfigmenutoolroutingisochronessettings)**||Isochronesoptions|false|


**Example**
```
#!json
{
    "routing": {
        "name": "translate#common:menu.tools.routing",
        "glyphicon": "glyphicon-road",
        "activeRoutingToolOption": "DIRECTIONS",
        "routingToolOptions": ["DIRECTIONS", "ISOCHRONES"],
        "download": {
            "filename": "",
            "format": "GEOJSON"
        },
        "geosearch": {
            "minChars": 3,
            "limit": 10,
            "type": "BKG",
            "serviceId": "bkg_geosearch"
        },
        "geosearchReverse": {
            "distance": 1000,
            "filter": "",
            "type": "BKG",
            "serviceId": "bkg_suggest"
        },
        "directionsSettings": {
            "type": "ORS",
            "serviceId": "bkg_ors",
            "speedProfile": "CAR",
            "preference": "RECOMMENDED",
            "styleRoute": {
                "fillColor": [255, 44, 0],
                "width": 6,
                "highlightColor": [255, 255, 255],
                "highlightWidth": 9,
                "partHighlightColor": [255, 255, 255],
                "partHighlightWidth": 3
            },
            "styleWaypoint": {
                "lineColor": [255, 127, 0],
                "lineWidth": 4,
                "fillColor": [255, 127, 0],
                "textFillColor": "#000",
                "textLineColor": "#fff",
                "textLineWidth": 3,
                "opacity": 0.3,
                "radius": 8
            },
            "styleAvoidAreas": {
                "lineColor": [0, 127, 255],
                "lineWidth": 2,
                "fillColor": [0, 127, 255],
                "opacity": 0.3,
                "pointRadius": 8,
                "pointLineWidth": 4
            },
            "batchProcessing": {
                "enabled": false,
                "active": false,
                "limit": 1000,
                "maximumConcurrentRequests": 3
            }
        },
        "isochronesSettings": {
            "type": "ORS",
            "serviceId": "bkg_ors",
            "speedProfile": "CAR",
            "isochronesMethodOption": "TIME",
            "distanceValue": 30,
            "minDistance": 1,
            "maxDistance": 400,
            "timeValue": 30,
            "minTime": 1,
            "maxTime": 180,
            "intervalValue": 15,
            "minInterval": 3,
            "maxInterval": 30,
            "styleCenter": {
                "lineColor": [255, 127, 0],
                "lineWidth": 4,
                "fillColor": [255, 127, 0],
                "opacity": 0.3,
                "radius": 8
            },
            "styleIsochrones": {
                "lineWidth": 2,
                "opacity": 0.65,
                "startColor": [66, 245, 78],
                "endColor": [245, 66, 66]
            },
            "batchProcessing": {
                "enabled": false,
                "active": false,
                "limit": 1000,
                "maximumConcurrentRequests": 3
            }
        }
    }
}
```

***

#### Portalconfig.menu.tool.routing.download

Routing-tool download options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|fileName|no|String||Default filename for the download.|false|
|format|no|String|"GEOJSON"|Which format should be selected by default. ("GEOJSON", "KML", "GPX")|false|

**Example**
```
#!json
{
    "download": {
        "filename": "",
        "format": "GEOJSON"
    }
}
```

***

#### Portalconfig.menu.tool.routing.geosearch

Routing-tool geosearch options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|minChars|no|Number|3|Minimum amount of characters before sending a request to an external service.|false|
|limit|no|Number|10|Maximale amount of characters for the search.|false|
|type|yes|String||Which type of the geosearch should be used. ("BKG", "NOMINATIM")|false|
|serviceId|yes|String||Which service should be used for the geosearch.|false|

**Example**
```
#!json
{
    "geosearch": {
        "minChars": 3,
        "limit": 10,
        "type": "BKG",
        "serviceId": "bkg_geosearch"
    }
}
```

***

#### Portalconfig.menu.tool.routing.geosearchReverse

Routing-tool geosearch reverse options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|distance|no|Number|1000|Search radius in meter for the external service.|false|
|filter|no|String||Additional filter used in the query.|false|
|type|yes|String||Which type of geosearch reverse should be used. ("BKG", "NOMINATIM")|false|
|serviceId|yes|String||Which service should be used for the geosearch reverse.|false|

**Example**
```
#!json
{
    "geosearchReverse": {
        "distance": 1000,
        "filter": "",
        "type": "BKG",
        "serviceId": "bkg_suggest"
    }
}
```

***

#### Portalconfig.menu.tool.routing.directionsSettings

Routing-tool directions options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|type|yes|String||Which type of service should be used for the request. ("ORS")|false|
|serviceId|yes|String||Which service should be used for the request.|false|
|speedProfile|no|String|"CAR"|Which speed profile should be selected by default.|false|
|preference|no|String|"RECOMMENDED"|Which type of directions should be used by default.|false|
|styleRoute|no|**[styleRoute](#markdown-header-portalconfigmenutoolroutingdirectionssettingsstyleroute)**||Stylerouteoptions|false|
|styleWaypoint|no|**[styleWaypoint](#markdown-header-portalconfigmenutoolroutingdirectionssettingsstylewaypoint)**||Stylewaypointoptions|false|
|styleAvoidAreas|no|**[styleAvoidAreas](#markdown-header-portalconfigmenutoolroutingdirectionssettingsstyleavoidareas)**||Styleavoidareasoptions|false|
|batchProcessing|no|**[batchProcessing](#markdown-header-portalconfigmenutoolroutingdirectionssettingsbatchprocessing)**||Batchprocessingoptions|false|

**Example**
```
#!json
{
    "directionsSettings": {
        "type": "ORS",
        "serviceId": "bkg_ors",
        "speedProfile": "CAR",
        "preference": "RECOMMENDED",
        "styleRoute": {
            "fillColor": [255, 44, 0],
            "width": 6,
            "highlightColor": [255, 255, 255],
            "highlightWidth": 9,
            "partHighlightColor": [255, 255, 255],
            "partHighlightWidth": 3
        },
        "styleWaypoint": {
            "lineColor": [255, 127, 0],
            "lineWidth": 4,
            "fillColor": [255, 127, 0],
            "textFillColor": "#000",
            "textLineColor": "#fff",
            "textLineWidth": 3,
            "opacity": 0.3,
            "radius": 8
        },
        "styleAvoidAreas": {
            "lineColor": [0, 127, 255],
            "lineWidth": 2,
            "fillColor": [0, 127, 255],
            "opacity": 0.3,
            "pointRadius": 8,
            "pointLineWidth": 4
        },
        "batchProcessing": {
            "enabled": false,
            "active": false,
            "limit": 1000,
            "maximumConcurrentRequests": 3
        }
    }
}
```

***

#### Portalconfig.menu.tool.routing.directionsSettings.styleRoute

Routing-tool directions route style options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|fillColor|no|Number[]|[255, 44, 0]|Which color should be used to fill.|false|
|width|no|Number|6|How thick should the line be displayed.|false|
|highlightColor|no|Number[]|[255, 255, 255]|Which color should be used to highlight the route.|false|
|highlightWidth|no|Number|9|How thick should the highlighting line be displayed.|false|
|partHighlightColor|no|Number[]|[255, 255, 255]|Which color should be used when highlighting part of the route.|false|
|highlightWidth|no|Number|9|How thick should the highlighting part of the route be displayed.|false|

**Example**
```
#!json
{
    "styleRoute": {
        "fillColor": [255, 44, 0],
        "width": 6,
        "highlightColor": [255, 255, 255],
        "highlightWidth": 9,
        "partHighlightColor": [255, 255, 255],
        "partHighlightWidth": 3
    }
}
```

***

#### Portalconfig.menu.tool.routing.directionsSettings.styleWaypoint

Routing-tool directions waypoint style options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|lineColor|no|Number[]|[255, 127, 0]|Which color should be used for the border.|false|
|lineWidth|no|Number|4|How thick should the border be.|false|
|fillColor|no|Number[]|[255, 127, 0]|Which color should be used to fill.|false|
|textFillColor|no|String|"#000"|Which color should be used for the text.|false|
|textLineColor|no|String|"#fff"|Which color should be used for the text background.|false|
|textLineWidth|no|Number|3|How big should the text be displayed.|false|
|opacity|no|Number|0.3|How transparent should the fill color be displayed.|false|
|radius|no|Number|8|How big should the waypoint be displayed.|false|

**Example**
```
#!json
{
    "styleWaypoint": {
        "lineColor": [255, 127, 0],
        "lineWidth": 4,
        "fillColor": [255, 127, 0],
        "textFillColor": "#000",
        "textLineColor": "#fff",
        "textLineWidth": 3,
        "opacity": 0.3,
        "radius": 8
    }
}
```

***

#### Portalconfig.menu.tool.routing.directionsSettings.styleAvoidAreas

Routing-tool directions avoid areas style options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|lineColor|no|Number[]|[0, 127, 255]|Which color should be used for the border.|false|
|lineWidth|no|Number|2|How thick should the border be.|false|
|fillColor|no|Number[]|[0, 127, 255]|Which color should be used to fill.|false|
|opacity|no|Number|0.3|How transparent should the fill color be displayed.|false|
|pointRadius|no|Number|8|How big should the corner points be displayed.|false|
|pointLineWidth|no|Number|4|How big should the border of the corner points be displayed.|false|

**Example**
```
#!json
{
    "styleAvoidAreas": {
        "lineColor": [0, 127, 255],
        "lineWidth": 2,
        "fillColor": [0, 127, 255],
        "opacity": 0.3,
        "pointRadius": 8,
        "pointLineWidth": 4
    }
}
```

***

#### Portalconfig.menu.tool.routing.directionsSettings.batchProcessing

Routing-tool directions batch processing options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|enabled|no|Boolean|false|If the batch processing should be enabled for the user.|false|
|active|no|Boolean|false|If the batch processing is active by default.|false|
|limit|no|Number|1000|The maximum amount of rows allowed in the csv file.|false|
|maximumConcurrentRequests|no|Number|3|The maximum concurrent requests allowed to be made by the batch processing task handler.|false|

**Example**
```
#!json
{
    "batchProcessing": {
        "enabled": false,
        "active": false,
        "limit": 1000,
        "maximumConcurrentRequests": 3
    }
}
```

***

#### Portalconfig.menu.tool.routing.isochronesSettings

Routing-tool isochrones options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|type|yes|String||Which type of service should be used for the request. ("ORS")|false|
|serviceId|yes|String||Which service should be used for the request.|false|
|speedProfile|no|String|"CAR"|Which speed profile should be selected by default.|false|
|isochronesMethodOption|no|String|"TIME"|Which method should be selected by default.|false|
|distanceValue|no|Number|30|Which distance value in km should be selected by default.|false|
|minDistance|no|Number|1|Which minimal distance value in km should be used.|false|
|maxDistance|no|Number|400|Which maximum distance value in km should be used.|false|
|timeValue|no|Number|30|Which time value in min should be selected by default.|false|
|minTime|no|Number|1|Which minimal time value in min should be used.|false|
|maxTime|no|Number|180|Which maximum time in min should be used.|false|
|intervalValue|no|Number|15|Which interval value in km/min should be used by default.|false|
|minInterval|no|Number|1|Which minimal interval value in km/min should be used.|false|
|maxInterval|no|Number|30|Which maximum interval value in km/min should be used.|false|
|styleCenter|no|**[styleCenter](#markdown-header-portalconfigmenutoolroutingisochronessettingsstylecenter)**||Stylecenteroptions|false|
|styleIsochrones|no|**[styleIsochrones](#markdown-header-portalconfigmenutoolroutingisochronessettingsstyleisochrones)**||Styleisochronesoptions|false|
|batchProcessing|no|**[batchProcessing](#markdown-header-portalconfigmenutoolroutingisochronessettingsbatchprocessing)**||Batchprocessingoptions|false|


**Example**
```
#!json
{
    "isochronesSettings": {
        "type": "ORS",
        "serviceId": "bkg_ors",
        "speedProfile": "CAR",
        "isochronesMethodOption": "TIME",
        "distanceValue": 30,
        "minDistance": 1,
        "maxDistance": 400,
        "timeValue": 30,
        "minTime": 1,
        "maxTime": 180,
        "intervalValue": 15,
        "minInterval": 3,
        "maxInterval": 30,
        "styleCenter": {
            "lineColor": [255, 127, 0],
            "lineWidth": 4,
            "fillColor": [255, 127, 0],
            "opacity": 0.3,
            "radius": 8
        },
        "styleIsochrones": {
            "lineWidth": 2,
            "opacity": 0.65,
            "startColor": [66, 245, 78],
            "endColor": [245, 66, 66]
        },
        "batchProcessing": {
            "enabled": false,
            "active": false,
            "limit": 1000,
            "maximumConcurrentRequests": 3
        }
    }
}
```

***

#### Portalconfig.menu.tool.routing.isochronesSettings.styleCenter

Routing-tool isochrones centers style options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|lineColor|no|Number[]|[255, 127, 0]|Which color should be used for the border.|false|
|lineWidth|no|Number|4|How thick should the border be displayed.|false|
|fillColor|no|Number[]|[255, 127, 0]|Which color should be used to fill.|false|
|opacity|no|Number|0.3|How transparent should the fill color be displayed.|false|
|radius|no|Number|8|How big should the waypoint be displayed.|false|

**Example**
```
#!json
{
    "styleCenter": {
        "lineColor": [255, 127, 0],
        "lineWidth": 4,
        "fillColor": [255, 127, 0],
        "opacity": 0.3,
        "radius": 8
    }
}
```

***

#### Portalconfig.menu.tool.routing.isochronesSettings.styleIsochrones

Routing-tool isochrones style options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|lineWidth|no|Number|2|How thick should the lines be displayed.|false|
|opacity|no|Number|0.65|How transparent the fill color is displayed.|false|
|startColor|no|Number[]|[66, 245, 78]|The starting color for the fill color interpolation calculation.|false|
|endColor|no|Number[]|[245, 66, 66]|The end color for the fill color interpolation calculation.|false|

**Example**
```
#!json
{
    "styleIsochrones": {
        "lineWidth": 2,
        "opacity": 0.65,
        "startColor": [66, 245, 78],
        "endColor": [245, 66, 66]
    }
}
```

***

#### Portalconfig.menu.tool.routing.isochronesSettings.batchProcessing

Routing-tool isochrones batch processing options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|enabled|no|Boolean|false|If the batch processing should be enabled for the user.|false|
|active|no|Boolean|false|If the batch processing is active by default.|false|
|limit|no|Number|1000|The maximum amount of rows allowed in the csv file.|false|
|maximumConcurrentRequests|no|Number|3|The maximum concurrent requests allowed to be made by the batch processing task handler.|false|

**Example**
```
#!json
{
    "batchProcessing": {
        "enabled": false,
        "active": false,
        "limit": 1000,
        "maximumConcurrentRequests": 3
    }
}
```

***

### Portalconfig.menu.staticlinks

The staticlinks array contains objects either describing links to other web resources or triggers of defined events.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|staticlinks|no|**[staticlink](#markdown-header-portalconfigmenustaticlinksstaticlink)**[]||Static link array.|false|


**onClickTrigger example**

```json
{
    "staticlinks": [
        {
            "name": "Alert",
            "glyphicon": "glyphicon-globe",
            "onClickTrigger": [
                {
                    "channel": "Alert",
                    "event": "alert",
                    "data": "Hello World!"
                }
            ]
        }
    ]
}
```

***

#### Portalconfig.menu.staticlinks.staticlink
Ein Staticlink-Objekt enthält folgende Attribute.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|yes|String||Menu name of the link.|false|
|glyphicon|no|String|"glyphicon-globe"|CSS glyphicon class of link, shown before its name.|false|
|url|no|String||URL to open in a new tab.|false|
|onClickTrigger|no|**[onClickTrigger](#markdown-header-portalconfigmenustaticlinksstaticlinkonclicktrigger)**[]||Array of onClickTrigger events.|false|

**URL example**

```json
{
    "name": "Hamburg",
    "glyphicon": "glyphicon-globe",
    "url": "http://www.hamburg.de"
}
```

**onClickTrigger example**
```json
{
    "name": "Alert",
    "glyphicon": "glyphicon-globe",
    "onClickTrigger": [
        {
            "channel": "Alert",
            "event": "alert",
            "data": "Hello World!"
        }
    ]
}
```

***

#### Portalconfig.menu.staticlinks.staticlink.onClickTrigger

Defines an event trigger, possibly containing a payload.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|channel|yes|String||Radio channel name.|false|
|event|yes|String||Radio channel's event name of the event to be triggered.|false|
|data|no|String/Boolean/Number||Payload to be sent along.|false|

**Example**

```json
{
    "channel": "Alert",
    "event": "alert",
    "data": "Hello World!"
}
```

***

## Themenconfig

The `Themenconfig` entry defines the contents and their order in the topic selection. Depending on your `treeType` configuration, the [Fachdaten](#markdown-header-themenconfigfachdaten) section may also contain folder structures.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|Hintergrundkarten|yes|**[Hintergrundkarten](#markdown-header-themenconfighintergrundkarten)**||Background map definition.|false|
|Fachdaten|no|**[Fachdaten](#markdown-header-themenconfigfachdaten)**||Technical data definition.|false|
|Fachdaten_3D|no|**[Fachdaten_3D](#markdown-header-themenconfigfachdaten_3d)**||Technical data definition used in 3D mode.|false|
|Fachdaten_Zeit|no|**[Fachdaten_Zeit](#markdown-header-themenconfigfachdaten_zeit)**||Definition of WMS-T layers in their own folder.|false|

**Example**

```json
{
    "Themenconfig": {
        "Hintergrundkarten": {},
        "Fachdaten": {},
        "Fachdaten_3D": {},
        "Fachdaten_Zeit": {}
    }
}
```

***

### Themenconfig.Hintergrundkarten

[type:Layer]: # (Themenconfig.Layer)
[type:GroupLayer]: # (Themenconfig.GroupLayer)
[type:Ordner]: # (Themenconfig.Ordner)

Background map definition.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|no|String|"Hintergrundkarten"|For `treeType` `default` and `custom`, name of the background map button area.|false|
|Layer|yes|**[Layer](#markdown-header-themenconfiglayer)**/**[GroupLayer](#markdown-header-themenconfiggrouplayer)**[]||Layer definition.|false|
|Ordner|no|**[Ordner](#markdown-header-themenconfigordner)**[]||Folder definition.|false|

**Example**

```json
{
    "Hintergrundkarten": {
        "name": "My background maps",
        "Layer": [
            {
                "id": "123"
            }
        ]
    }
}
```

***

### Themenconfig.Fachdaten

[type:Layer]: # (Themenconfig.Layer)
[type:GroupLayer]: # (Themenconfig.GroupLayer)
[type:Ordner]: # (Themenconfig.Ordner)

Technical data definition.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|no|String|"Fachdaten"|For `treeType` `default` and `custom`, name of the technical data button area.|false|
|Layer|yes|**[Layer](#markdown-header-themenconfiglayer)**/**[GroupLayer](#markdown-header-themenconfiggrouplayer)**[]||Layer definition.|false|
|Ordner|no|**[Ordner](#markdown-header-themenconfigordner)**[]||Folder definition.|false|

**Example**

```json
{
    "Fachdaten": {
        "name": "My technical data",
        "Layer": [
            {
                "id": "123"
            }
        ]
    }
}
```

***

### Themenconfig.Fachdaten_3D

[type:Layer]: # (Themenconfig.Layer)

3D data definition for the 3D mode in `treeType` `custom` and `default`. Only shown when 3D mode is active.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|no|String|"3D Daten"|Name of the 3D data button area.|false|
|Layer|yes|**[Layer](#markdown-header-themenconfiglayer)**[]||3D layer definition.|false|

**Example**

```json
{
    "Fachdaten_3D": {
        "name": "My technical 3D data",
        "Layer": [
            {
            "id": "12883"
            }
        ]
    }
}
```

***

### Themenconfig.Fachdaten_Zeit

[type:Layer]: # (Themenconfig.Layer)

Definition for WMS-T layers `treeType` `custom` and `default`. The layers can also be defined under **[Fachdaten](#markdown-header-themenconfigfachdaten)**.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|no|String|"common:tree.subjectDataTime"|Name of the WMS-T layer button area.|false|
|Layer|yes|**[Layer](#markdown-header-themenconfiglayer)**[]||WMS-T layer definition.|false|

**Example**

```json
{
    "Fachdaten_Zeit": {
        "name": "My Time Series",
        "Layer": [
            {
              "id": "my_wms_time"
            }
        ]
    }
}
```

***

### Themenconfig.Ordner

[type:Layer]: # (Themenconfig.Layer)
[type:GroupLayer]: # (Themenconfig.GroupLayer)
[type:Ordner]: # (Themenconfig.Ordner)

Folder definition. Folders may also be nested. Folders can be configured below the "Fachdaten" and "Hintergrundkarten".

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|Titel|yes|String||Folder title.|false|
|Layer|yes|**[Layer](#markdown-header-themenconfiglayer)**/**[GroupLayer](#markdown-header-themenconfiggrouplayer)**[]||Layer definition.|false|
|Ordner|no|**[Ordner](#markdown-header-themenconfigordner)**[]||Folder definition.|false|
|isFolderSelectable|no|Boolean|false|Defines whether all layers of a folder can be de-/activated at once by using a checkbox. Only works if treetype="custom". If no flag is set, the global flag in  `config.js` parameter `tree.isFolderSelectable` is used.|false|
|invertLayerOrder|no|Boolean|false|Defines wheather the order of layers added to the map should be invert when clicking the folder.|false|

**Example Fachdaten-folder with one layer**

```json
{
    "Fachdaten": {
        "Ordner": [
            {
                "Titel": "My folder",
                "Layer": [
                    {
                        "id": "123"
                    }
                ]
            }
        ]
    }
}
```
**Example Hintergrundkarten-folder with 2 layers**

```json
{
    "Hintergrundkarten":{
        "Ordner": [{
            "Titel": "Maps",
            "isFolderSelectable": false,
            "Layer": [
                {
                    "name": "Aerial view",
                    "id": "123",
                    "visibility": true
                },
                {
                    "name": "City map",
                    "id": "456"
                }
            ]
        }]
    }
}
```

**Example Hintergrundkarten-folder, next to it are configured layers**

```json
{
    "Hintergrundkarten":{
        "Ordner": [{
            "Titel": "Maps",
            "isFolderSelectable": false,
            "Layer": [
                {
                    "name": "Aerial view",
                    "id": "123",
                    "visibility": true
                },
                {
                    "name": "City map",
                    "id": "456"
                }
            ]
        }],
        "Layer": [{
            "name": "Old map",
            "id": "789"
        },
            ...
        ]
    }
}
```

**Example Fachdaten-folder with a sub-folder that contains a layer**

```json
{
    "Fachdaten": {
        "Ordner": [
            {
                "Titel": "My first folder",
                "isFolderSelectable": true,
                "Ordner": [
                    {
                        "Titel": "My second folder",
                        "Layer": [
                            {
                                "id": "123"
                            }
                        ]
                    }
                ]
            }
        ]
    }
}
```

**Example Fachdaten-folder with a sub-folder holding a layer, where the first folder also has a layer defined**

```json
{
    "Fachdaten": {
        "Ordner": [
            {
                "Titel": "My first folder",
                "Ordner": [
                    {
                        "Titel": "My second folder",
                        "Layer": [
                            {
                                "id": "123"
                            }
                        ]
                    }
                ],
                "Layer": [
                    {
                        "id": "456"
                    }
                ]
            }
        ]
    }
}
```

**Example Fachdaten-folder with an inverted order of layers**

In this example layer 123 will be added to the map first. This leads to 456 being above 123.

```json
{
    "Fachdaten": {
        "Ordner": [
            {
                "Titel": "My folder",
                "invertLayerOrder": true,
                "Layer": [
                    {
                        "id": "123"
                    },
                    {
                        "id": "456"
                    }
                ]
            }
        ]
    }
}
```


***

### Themenconfig.GroupLayer

[type:Layer]: # (Themenconfig.Layer)
[type:Extent]: # (Datatypes.Extent)

Group layer definition. Multiple ways to define group layers exist. Most attributes are defined in the **[services.json](services.json.md)**, but may be overwritten in the layer definition.

Also, type-specific attributes for **[WMS](#markdown-header-themenconfiglayerwms)** and **[VTS](#markdown-header-themenconfiglayervector)** exist.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|id|yes|String/String[]||Layer ID(s). Resolved using the **[services.json](services.json.md)** file.|false|
|children|no|**[Layer](#markdown-header-themenconfiglayer)**[]||When used, a group layer containing an arbitrary amount of layers is created. In that case, the unique `id` has to be chosen by you.|false|
|name|no|String||Layer name.|false|
|transparency|no|Integer|0|Layer transparency.|false|
|visibility|no|Boolean|false|Layer visibility.|false|
|supported|no|String[]|["2D", "3D"]|List of modes the layer may be used in.|false|
|layerAttribution|no|String||**[services.json](services.json.md)** value. HTML string shown when the layer is active.|false|
|legendURL|no|String||**[services.json](services.json.md)** value. URL used to request the legend graphic. _Deprecated, please use "legend" instead._|false|
|legend|no|Boolean/String||**[services.json](services.json.md)** value. URL used to request the legend graphic. Use `true` to dynamically generate the legend from a WMS request or the styling. If of type string, it's expected to be a path to an image or a PDF file.|false|
|maxScale|no|String||**[services.json](services.json.md)** value. Maximum scale in which the layer is still shown.|false|
|minScale|no|String||**[services.json](services.json.md)** value. Minimum scale in which the layer is still shown.|false|
|autoRefresh|no|Integer||Automatically reload layer every `autoRefresh` ms. Minimum value is 500.|false|
|isNeverVisibleInTree|no|Boolean|false|If `true`, the layer is never visible in the topic selection tree.|false|
|urlIsVisible|no|Boolean|true|Whether the service URL should be shown in the layer information window.|false|

**Example**

```json
{
    "id": "myId",
    "name": "myGroupLayer",
    "children": [
        {
            "id": "123",
            "name": "myLayer_1"
        },
        {
            "id": "456",
            "name": "myLayer_2"
        }
    ]
}
```

***

### Themenconfig.Layer

[type:Extent]: # (Datatypes.Extent)
[type:Entity3D]: # (Themenconfig.Layer.Entity3D)
[type:WMS]: # (Themenconfig.Layer.WMS)

Layer definition. Multiple ways to define layers exist. Most attributes are defined in the **[services.json](services.json.md)**, but may be overwritten in the layer definition.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|id|yes|String/String[]||Layer ID(s). Resolved using the **[services.json](services.json.md)** file. Please mind that the given IDs **MUST** refer to the same URL, that is, use the same service. When configuring an array of IDs, setting `minScale` and `maxScale` of each layer is required to be in the `services.json`.|false|
|name|no|String||Layer name.|false|
|entities|yes|**[Entity3D](#markdown-header-themenconfiglayerentity3d)**[]||Models to be shown.|false|
|transparency|no|Integer|0|Layer transparency.|false|
|visibility|no|Boolean|false|Layer visibility.|false|
|supported|no|String[]|["2D", "3D"]|List of modes the layer may be used in.|false|
|layerAttribution|no|String||**[services.json](services.json.md)** value. HTML string shown when the layer is active.|false|
|legendURL|no|String||**[services.json](services.json.md)** value. URL used to request the legend graphic. _Deprecated, please use "legend" instead._|false|
|legend|no|Boolean/String||**[services.json](services.json.md)** value. URL used to request the legend graphic. Use `true` to dynamically generate the legend from a WMS request or the styling. If of type string, it's expected to be a path to an image or a PDF file.|false|
|maxScale|no|String||**[services.json](services.json.md)** value. Maximum scale in which the layer is still shown.|false|
|minScale|no|String||**[services.json](services.json.md)** value. Minimum scale in which the layer is still shown.|false|
|autoRefresh|no|Integer||Automatically reload layer every `autoRefresh` ms. Minimum value is 500.|false|
|isNeverVisibleInTree|no|Boolean|false|If `true`, the layer is never visible in the topic selection tree.|false|
|urlIsVisible|no|Boolean|true|Whether the service URL should be shown in the layer information window.|false|

**Example with one ID**

```json
{
    "id": "123"
}
```

**Example with an array of IDs**

```json
{
    "id": ["123", "456", "789"],
    "name": "my test layer"
}
```

***

#### Themenconfig.Layer.WMS

[inherits]: # (Themenconfig.Layer)

List of typical WMS attributes.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|no|String/String[]||Layer name. If the attribute `styles` is configured, `name` must be of type String[].|false|
|attributesToStyle|no|String[]||Attribute array by which the WMS is styled. Required by the **[tool](#markdown-header-portalconfigmenutools)** `styleWMS`.|false|
|extent|no|**[Extent](#markdown-header-datatypesextent)**|[454591, 5809000, 700000, 6075769]|Only relevant for 3D mode. Extent of the layer. If not specified, it will be used Extent of the MapView.|false|
|featureCount|no|Integer|1|Amount of feature to be returned at maximum on a *GetFeatureInfo* request.|false|
|geomType|no|String||Geometry type of WMS data. Currently, only `"polygon"` is supported. Required by the **[tool](#markdown-header-portalconfigmenutools)** `styleWMS`.|false|
|styleable|no|Boolean||Whether the `styleWMS` tool may use this layer. Required by the **[tool](#markdown-header-portalconfigmenutools)** `styleWMS`.|true|
|gfiAsNewWindow|no|**[gfiAsNewWindow](#markdown-header-themenconfiglayerwmsgfiAsNewWindow)**|null|Relevant if `"text/html"` is used.|true|
|styles|no|String[]||Will be sent to the server if defined. The server will interpret and apply these styles and return the corresponding styled tiles.|true|

**Example**

```json
{
    "id": "123456",
    "name": "MyWMSLayerName",
    "transparency": 0,
    "visibility": true,
    "supported": ["2D"],
    "extent": [454591, 5809000, 700000, 6075769],
    "layerAttribution": "MyBoldAttribution for layer 123456",
    "legend": "https://myServer/myService/legend.pdf",
    "maxScale": "100000",
    "minScale": "1000",
    "autoRefresh": "10000",
    "isNeverVisibleInTree": false,
    "attributesToStyle": ["MyFirstAttr"],
    "featureCount": 2,
    "geomType": "geometry",
    "gfiAsNewWindow": {
        "name": "_blank",
        "specs": "width=800,height=700"
    },
    "styleable": true,
    "styles": ["firstStyle", "secondStyle"]
}
```

***

#### Themenconfig.Layer.WMS.gfiAsNewWindow

The parameter `gfiAsNewWindow` is only in use when `infoFormat` is set to `"text/html"`.

This feature allows opening WMS HTML responses in their own window or tab rather than in an iFrame or GFI. To open HTML contents in a standard browser window, set the empty object `{}` instead of `null`.

You may change the opening behaviour by setting the parameter `name`:

**Note on SSL encryption**

If `gfiAsNewWindow` is not defined, it's applied with default values when the called URL is not SSL-encrypted (HTTPS).

Due to the *No Mixed Content* policy of all modern browsers, unencrypted content may not be displayed in an iFrame. Please mind that automatic forwarding (e.g. in Javascript) in iFrames to an insecure HTTP connection (without SSL) is not automatically recognized and may be prevented by the browser.

For such cases, define `gfiAsNewWindow` manually as described above.

|Name|Required|Type|Default|Description|Expert|
|----|-------------|---|-------|------------|------|
|name|yes|enum["_blank_","_self_"]|"_blank"|`"_blank"` opens a new browser tab or window (depending on browser) with the specified HTML content. The window appearance can be changed with the `specs` parameter. `"_self"` opens the specified HTML content within the current browser window.|true|
|specs|no|String||You may add an arbitrary amount of comma-separated properties like `{"specs": "width=800,height=700"}`. For more options, please read the documentation regarding `javascript` and `window.open`: [W3 Schools: Met win open](https://www.w3schools.com/jsref/met_win_open.asp) (German), [JavaScript Info: Popup windows](https://javascript.info/popup-windows) (English), [MDN: Window open](https://developer.mozilla.org/en-US/docs/Web/API/Window/open) (English)|true|

**Example**

```
#!json
{
    "id": "123456",
    // (...)
    "gfiAsNewWindow": {
        "name": "_blank",
        "specs": "toolbar=yes,scrollbars=yes,resizable=yes,top=0,left=500,width=800,height=700"
    },
    // (...)
}
```

***

#### Themenconfig.Layer.Tileset

[inherits]: # (Themenconfig.Layer)

List of attributes typically used for tilesets.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|hiddenFeatures|no|String[]|[]|List of IDs to be hidden in the plane.|
|**[cesium3DTilesetOptions](https://cesiumjs.org/Cesium/Build/Documentation/Cesium3DTileset.html)**|no|**[cesium3DTilesetOption](#markdown-header-themenconfiglayertilesetcesium3dtilesetoption)**||Cesium 3D tileset options directly forwarded to the *Cesium tileset object*. E.g. `maximumScreenSpaceError` is relevant to the visibility.|

**Example**

```json
{
    "id": "123456",
    "name": "TilesetLayerName",
    "visibility": true,
    "hiddenFeatures": ["id1", "id2"],
    "cesium3DTilesetOptions" : {
        "maximumScreenSpaceError" : 6
    }
}
```

***

#### Themenconfig.Layer.Tileset.cesium3DTilesetOption

Todo

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|maximumScreenSpaceError|no|Number||Todo|

**Example**

```json
{
    "cesium3DTilesetOptions": {
        "maximumScreenSpaceError": 6
    }
}
```

***

#### Themenconfig.Layer.Terrain

[inherits]: # (Themenconfig.Layer)

List of attributes typically used for *Terrain*.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|**[cesiumTerrainProviderOptions](https://cesiumjs.org/Cesium/Build/Documentation/CesiumTerrainProvider.html)**|no|**[cesiumTerrainProviderOption](#markdown-header-themenconfiglayerterraincesiumterrainprovideroption)**[]||Cesium TerrainProvider options directly forwarded to the *Cesium TerrainProvider* E.g. `requestVertexNormals` is used for object surface shading.|

**Example**

```json
{
    "id": "123456",
    "name": "TerrainLayerName",
    "visibility": true,
    "cesiumTerrainProviderOptions": {
        "requestVertexNormals" : true
    }
}
```

***

#### Themenconfig.Layer.Terrain.cesiumTerrainProviderOption

Todo

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|requestVertexNormals|no|Boolean||Todo|

**Example**

```json
{
    "cesiumTerrainProviderOptions": {
        "requestVertexNormals" : true
    }
}
```

***

#### Themenconfig.Layer.Entity3D

List of attributes typically used for *Entities 3D*.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|url|yes|String|""|Model URL, e.g. `"https://hamburg.virtualcitymap.de/gltf/4AQfNWNDHHFQzfBm.glb"`.|false|
|attributes|no|**[Attribute](#markdown-header-themenconfiglayerentities3dattribute)**||Model attributes, e.g. `{"name": "test"}`.|false|
|latitude|yes|Number||Model origin latitude in degrees. Example: `53.541831`|false|
|longitude|yes|Number||Model origin longitude in degrees. Example: `9.917963`|false|
|height|no|Number|0|Model origin height. Example: `10`|false|
|heading|no|Number|0|Model rotation in degrees. Example: `0`|false|
|pitch|no|Number|0|Model pitch in degrees. Example: `0`|false|
|roll|no|Number|0|Model roll in degrees. Example: `0`|false|
|scale|no|Number|1|Model scale. Example: `1`|false|
|allowPicking|no|Boolean|true|Whether the model may be clicked for GFI. Example: `true`|false|
|show|no|Boolean|true|Whether the model should be shown. Should be `true`. Example: `true`|false|

**Example**

```json
{
    "id": "123456",
    "name": "EntitiesLayerName",
    "visibility": true,
    "entities": [
       {
         "url": "https://hamburg.virtualcitymap.de/gltf/4AQfNWNDHHFQzfBm.glb",
         "attributes": {
           "name": "Fernsehturm.kmz"
         },
         "latitude": 53.541831,
         "longitude": 9.917963,
         "height": 10,
         "heading": -1.2502079000000208,
         "pitch": 0,
         "roll": 0,
         "scale": 5,
         "allowPicking": true,
         "show": true
       }
    ]
}
```

***

#### Themenconfig.Layer.Entity3D.Attribute

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|no|String|""|Todo|false|

**Example**

```json
{
   "name": "Fernsehturm.kmz"
}
```

***

#### Themenconfig.Layer.StaticImage

[inherits]: # (Themenconfig.Layer)
[type:Extent]: # (Datatypes.Extent)

This type allows loading images as georeferenced map layers. Supported formats are `jpeg` and `png`.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|id|yes|String||ID required to be unique.|false|
|typ|yes|String|"StaticImage"|Sets the layer type to `StaticImage`, meaning static images will be displayed as layers.|false|
|url|yes|String|"https://meinedomain.de/bild.png"|Link to the image that is to be shown as layer.|false|
|name|yes|String|"Static Image Name"|Topic selection tree layer name.|false|
|extent|yes|**[Extent](#markdown-header-datatypesextent)**|[560.00, 5950.00, 560.00, 5945.00]|Georeferences the image. The coordinates are expected to be in EPSG:25832, and refer to the top-left and bottom-right image corner.|false|

**Example**

```json
{
    "id": "12345",
    "typ": "StaticImage",
    "url": "https://www.w3.org/Graphics/PNG/alphatest.png",
    "name": "Test PNG file",
    "visibility": true,
    "extent": [560296.72, 5932154.22, 562496.72, 5933454.22]
}
```

***

#### Themenconfig.Layer.Vector

[inherits]: # (Themenconfig.Layer)

List of attributes typically used in vector layers. Vector layers are WFS, GeoJSON (EPSG:4326 only), [SensorLayer](sensorThings.md), and Vector Tile Layer.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|clusterDistance|no|Integer||All features within this pixel radius are clustered to a single feature.|false|
|extendedFilter|no|Boolean||Defines whether the **[tool](#markdown-header-portalconfigmenutools)** `extendedFilter` may use this layer.|false|
|filterOptions|no|**[filterOption](#markdown-header-themenconfiglayervectorfilteroption)**[]||Filter options required by **[tool](#markdown-header-portalconfigmenutools)** `wfsFeatureFilter`.|false|
|mouseHoverField|no|String/String[]||Attribute name or array thereorf to be shown on mouse hovering a feature.|false|
|nearbyTitle|no|String/String[]||Attribute name or array of features to be shown on nearby search results.|false|
|additionalInfoField|no|String|"name"|Feature's attribute name to use in the search bar's hit list. Should this attribute not exist in a hit feature, the layer name is used instead.|false|
|styleId|no|String||Style ID. Resolved using the **[style.json](style.json.md)** file.|false|
|styleGeometryType|no|String/String[]||WFS style geometry type to reduce visible features to the ones sharing the given geometry types. **[More information](style.json.md#markdown-header-abbildungsvorschriften)**.|false|
|hitTolerance|no|String||Click tolerance for hits in pixels when firing a *GetFeatureInfo* request.|false|
|vtStyles|no|**[vtStyle](#markdown-header-themenconfiglayervectorvtstyle)**[]||Choosable external style definitions. Only available in a *Vector Tile Layer*.|false|
|useMpFonts|no|Boolean|true|Only available in a *Vector Tile Layer*. Switch to overwrite Fontstacks of external style definitions, to assure needed fonts are available. If set to false, used fonts need to be added separately e.g. via '<link rel=stylesheet ...>' in index.html |false|
|loadingStrategy|no|String|"bbox"|Strategy function for loading features. Possible values are "bbox" or "all". **[More information](https://openlayers.org/en/latest/apidoc/module-ol_loadingstrategy.html)**.|false|

**Example**

```
#!json
{
    "id": "123456",
    "name": "MyVectorLayerName",
    "transparency": 0,
    "visibility": true,
    "supported": ["2D"],
    "extent": [454591, 5809000, 700000, 6075769],
    "layerAttribution": "MyBoldAttribution for layer 123456",
    "legend": "https://myServer/myService/legend.pdf",
    "maxScale": "100000",
    "minScale": "1000",
    "autoRefresh": "10000",
    "isNeverVisibleInTree": false,
    "clusterDistance": 60,
    "extendedFilter": true,
    "loadingStrategy": "all",
    "filterOptions": [
        {
            "fieldName": "myFirstAttributeToFilter",
            "filterName": "Filter_1",
            "filterString": ["*", "value1", "value2"],
            "filterType": "combo"
        },
        {
            "fieldName": "mySecondAttributeToFilter",
            "filterName": "Filter_2",
            "filterString": ["*", "value3", "value4"],
            "filterType": "combo"
        }
    ],
    "mouseHoverField": "name",
    "nearbyTitle": "name",
    "searchField": "name",
    "styleId": "123456",
    "hitTolerance": 50
},
{
    "id" : "11111",
    "name" : "local GeoJSON",
    "url" : "portal/master/test.json",
    "typ" : "GeoJSON",
    "gfiAttributes" : "showAll",
    "layerAttribution" : "nicht vorhanden",
    "legend" : true
}
```

***

#### Themenconfig.Layer.Vector.filterOption

Filter options used by the **[tool](#markdown-header-portalconfigmenutools)** `wfsFeatureFilter`.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|fieldName|yes|String||Attribute name to filter by.|false|
|filterName|yes|String||Filter name in the tool.|false|
|filterString|yes|String[]||Array of attribute names filtering by is enabled. Using `"*"` will allow all values.|false|
|filterType|yes|String||Filter type. Only `"combo"` is supported.|false|

**Example**

```json
{
    "fieldName": "myFirstAttributeToFilter",
    "filterName": "Filter_1",
    "filterString": ["*", "value1", "value2"],
    "filterType": "combo"
}
```

#### Themenconfig.Layer.Vector.vtStyle

Style definitions. Available for *Vector Tile Layers* only.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|id|yes|String||Cross-service unique id.|false|
|name|yes|String||Display name, e.g. used in the selection tool.|false|
|url|yes|String||URL to load a style from. The linked JSON *must* match the [Mapbox style specification](https://docs.mapbox.com/mapbox-gl-js/style-spec/).|false|
|defaultStyle|no|String||If set `true`, this style is used initially; if no field is set `true`, the first style is used.|false|

**Example**

```json
{
    "id": "UNIQUE_ID",
    "name": "Red lines",
    "url": "https://example.com/asdf/styles/root.json",
    "defaultStyle": true
}
```

***

# Datatypes

This chapter defines expected data types.

## Datatypes.Coordinate

A coordinate is an array of two numbers. The first represents the easting, the second the northing.

**Example integer coordinate**

```json
[561210, 5932600]
```

**Example float coordinate**

```json
[561210.1458, 5932600.12358]
```

***

## Datatypes.Extent

An extent is an array of four numbers describing a rectangular scope. The rectangle is constructed from the "lower left" and "upper right" corner, so the scheme used is `[Easting lower left, Northing lower left, Easting upper right, Northing upper right]`, or `[minx, miny, maxx, maxy]`.

**Example extent**

```json
[510000.0, 5850000.0, 625000.4, 6000000.0]
```

***

## Datatypes.CustomObject

An object containing the required contents. Parameters depend on configuration, usage, and backend components.

***

## Datatypes.LayerId

A string that refers to a layer id from the services-internet.json. In the example, the ID "1711" is used to refer to the layer "Krankenhäuser" in the services-internet.json of the city of Hamburg.

**Example LayerId**
```json
"1711"
```

***
