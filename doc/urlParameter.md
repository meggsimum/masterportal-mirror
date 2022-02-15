>[Return to the Masterportal documentation](doc.md)

# URL parameters

Special URL parameters exist to change configuration details or execute initial actions on opening the Masterportal. The URL parameter list begins with a `"?"`, and individual parameters are separated with `"&"` characters. The Parameters are not case sensitive.

**Example: [https://geoportal-hamburg.de/Geoportal/geo-online/?Map/layerIds=453,1731,2426&visibility=true,true,false&transparency=0,40,0&Map/center=[565874,5934140]&Map/zoomlevel=2](https://geoportal-hamburg.de/Geoportal/geo-online/?Map/layerIds=453,1731,2426&visibility=true,true,false&transparency=0,40,0&Map/center=[565874,5934140]&Map/zoomlevel=2 "Example URL with parameters set")**

## Parameter list

|Name|Description|Example|Alternative|
|----|-----------|-------|-----------|
|ALTITUDE|Only works when used in combination with `MAP/MAPMODE`. Sets the altitude in 3D mode.|`?Map/mapMode=3D&altitude=127`||
|BEZIRK|_Deprecated in 3.0.0. Please use `"ZOOMTOGEOMETRY"` instead._ |`?bezirk=wandsbek`||
|CENTER|Moves the view to center the given coordinate. If `PROJECTION` is given as parameter, the `CENTER` coordinates are expected to be given in it, and are translated to the map's coordinate reference system before usage. If `PROJECTION` is not given, the `CENTER` coordinates must be given in the map's configured coordinate reference system; see **[config.namedProjections.epsg](config.js.md)**.|`?center=553925,5931898`||
|MAP/CENTER|Moves the view to center the given coordinate. If `PROJECTION` is given as parameter, the `CENTER` coordinates are expected to be given in it, and are translated to the map's coordinate reference system before usage. If `PROJECTION` is not given, the `CENTER` coordinates must be given in the map's configured coordinate reference system; see **[config.namedProjections.epsg](config.js.md)**.|`?Map/center=[553925,5931898]`|`?center=[553925,5931898]` or `?center=553925,5931898|`
|CONFIG|Sets the configuration file to use. This is done by either providing an absolute URL (`http://...` resp. `https://...`) or a relative path. In the second case, the relative path is combined with the path given in the **[config.portalConf](config.js.md)**, and the resulting path must link to a config.json file.|`?config=../config.json`||
|CONFIGJSON|Sets the configuration file to use. This is done by either providing an absolute URL (`http://...` resp. `https://...`) or a relative path. In the second case, the relative path is combined with the path given in the **[config.portalConf](config.js.md)**, and the resulting path must link to a config.json file.|`?configJson=../config.json`||
|FEATUREID|Zooms to the features of a WFS configured via **[config.zoomtofeature](config.js.md)**.|`?featureid=18,26`|
|MAP/ZOOMTOFEATUREID|Zooms to the features of a WFS configured via **[config.zoomtofeature](config.js.md)**.|`?Map/zoomToFeatureId=18,26`|`?zoomToFeatureId=18,26`|
|FEATUREVIAURL|Creates the given features and adds them to a GeoJSON layer. A `layerId` should be given for each feature set, and each feature must provide the fields `coordinates` and `label`. The coordinates should match the respective *GeometryType* according to the [GeoJSON specification RFC7946](https://tools.ietf.org/html/rfc7946). The parameters also depend on the module's configuration in **[config.featureviaurl](config.js.md)**.|`&featureviaurl=[{"layerId":"42","features":[{"coordinates":[10,53.5],"label":"TestPunkt"}]}]`|
|HEADING|Only works when used in combination with `MAP/MAPMODE`. Sets the heading in 3D mode.|`?Map/mapMode=3D&heading=-1.2502079000000208`||
|HIGHLIGHTFEATURE|Describes a layer's feature that is to be highlighted. Layer and feature id are given separated by a comma.|`&highlightfeature=layerid,featureId`|
|MAP/HIGHLIGHTFEATURE|Describes a layer's feature that is to be highlighted. Layer and feature id are given separated by a comma. |`&Map/highlightfeature=layerid,featureId`||
|LNG|Sets the language, if configured in config.js|`?lng=en`|
|ISINITOPEN|The module matching the given id of the tool is opened initially. Please mind that only one of the windowed tools may be open at a time.|`&isinitopen=draw`|
|TOOLS/[tool-id]/ACTIVE=TRUE|The module matching the given id of the tool is opened initially. Please mind that only one of the windowed tools may be open at a time.|`?Tools/Draw/active=true`|`?Draw/active=true` or `?draw/active` or `?draw=true`|
|LAYERIDS|Overrides the initially visible layers. The effect depends on the **[config.Portalconfig.treeType](config.json.md)**. If set to `"light"`, layers are set visible *additionally*. In other trees, the base configuration is overwritten. This can be complemented with the `VISIBILITY` and `TRANSPARENCY` flags.|`&layerids=453,2128`|
|MAP/LAYERIDS|Overrides the initially visible layers. The effect depends on the **[config.Portalconfig.treeType](config.json.md)**. If set to `"light"`, layers are set visible *additionally*. In other trees, the base configuration is overwritten. This can be complemented with the `VISIBILITY` and `TRANSPARENCY` flags.|`&Map/layerids=453,2128`|
|MAP|Mapmode 2D shows the 2D map (as usual),mapmode 3D shows 3D map when starting masterportal.|`?map=3D`||
|MAP/MAPMODE|Mapmode 2D shows the 2D map (as usual),mapmode 3D shows 3D map when starting masterportal.|`?Map/mapMode=2D`|`?mapMode=2d` or `?mapMode=3D`
|MARKER|Sets a marker to the given coordinate and zooms to it. If `PROJECTION` is given as parameter, the marker coordinates are to be expected in that coordinate reference system and are translated before application. Else, the given coordinates must match the map's coordinate reference system. See **[config.namedProjections.epsg](config.js.md)**.|`&marker=565874,5934140`|
MAPMARKER|Sets a marker to the given coordinate and zooms to it. If `PROJECTION` is given as parameter, the marker coordinates are to be expected in that coordinate reference system and are translated before application. Else, the given coordinates must match the map's coordinate reference system. See **[config.namedProjections.epsg](config.js.md)**.|`?MapMarker=[565874,5934140]`|`?MapMarker=565874,5934140`|
|MDID|Activates the layer with the given metadata id. Only usable in tree mode `"default"`.|`&mdid=6520CBEF-D2A6-11D5-88C8-000102DCCF41`|
|MAP/MDID|Activates the layer with the given metadata id. Only usable in tree mode `"default"`.|`?Map/mdId=6E28E698-F4FA-4231-A8C5-CC44441FF2A7`|
|PROJECTION|Coordinate reference system EPSG code. Only works when used in combination with `MAP/ZOOMTOEXTENT`, `MAP/CENTER` and `MAPMARKER`, the coordinates of the Parameters are transformed to the projection. If not set, projection of the map is used. Does not set the projection of the map.|`&projection=EPSG:4326`|
|MAP/PROJECTION|Coordinate reference system EPSG code. Only works when used in combination with `MAP/ZOOMTOEXTENT`, `MAP/CENTER` and `MAPMARKER`, the coordinates of the Parameters are transformed to the projection. If not set, projection of the map is used. Does not set the projection of the map. |`?Map/projection=EPSG:4326`|
|QUERY|Starts an address search via the search slot with any string given. House numbers must be given separated with a comma.|`&query=Neuenfelder Straße,19`|
|SEARCH/QUERY|Starts an address search via the search slot with any string given. House numbers must be given separated with a comma.|`?Search/query=Neuenfelder Straße,19`|
|STARTUPMODUL|_Deprecated in major release 3.0.0. Please use the parameter `"TOOLS/[tool-id]/ACTIVE=TRUE"` instead_. |`?startupmodul=Draw`||
|STYLE|Activates a special UI variant. E.g. `simple` may be set to hide all UI elements in an iFrame scenario.|`?style=simple`|
|UISTYLE|Activates a special UI variant. E.g. `simple` may be set to hide all UI elements in an iFrame scenario.|`?uiStyle=simple`|
|TILT|Only works when used in combination with `MAP/MAPMODE`. Sets the tilt in 3D mode.|`?Map/mapMode=3D&tilt=45`||
|TRANSPARENCY|Only works when used in combination with `MAP/LAYERIDS`. Transparency can be set separated by commas from 0 to 100; the transparency will be applied to the `MAP/LAYERIDS` layer of the same index.|`?Map/layerids=453,2128&transparency=0,40`|
|VISIBILITY|Only works when used in combination with `MAP/LAYERIDS`. Visibility can be set separated by commas as true or false; the visibility will be applied to the `MAP/LAYERIDS` layer of the same index.|`?Map/layerids=453,2128&visibility=true,false`|
|ZOOMLEVEL|The initial zoom level is the given zoom level; see **[config.view.options](config.js.md)**.|`?zoomlevel=2`|
|MAP/ZOOMLEVEL|The initial zoom level is the given zoom level; see **[config.view.options](config.js.md)**.|`?Map/zoomLevel=7`|
|ZOOMTOEXTENT|Zooms to an extent. May be combined with projection.|`?zoomToExtent=510000,5850000,625000,6000000`|
|MAP/ZOOMTOEXTENT|Zooms to an extent. May be combined with projection.|`?Map/zoomToExtent=510000,5850000,625000,6000000`|
|ZOOMTOGEOMETRY|Zooms to a feature requested from a WFS. Allowed parameters depend on **[config.zoomToGeometry](config.js.md)**. As an alternative to the feature name, features may also be addressed by their `geometries` array index, starting at 1.|`?zoomToGeometry=bergedorf`|
|MAP/ZOOMTOGEOMETRY|Zooms to a feature requested from a WFS. Allowed parameters depend on **[config.zoomToGeometry](config.js.md)**. As an alternative to the feature name, features may also be addressed by their `geometries` array index, starting at 1.|`?Map/zoomToGeometry=bergedorf`|

