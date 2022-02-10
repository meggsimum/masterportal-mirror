>**[Return to the Masterportal documentation](doc.md)**.

[TOC]

# services.json

All services available for display in the Masterportal (WMS, WFS, [SensorThings-API](sensorThings.md), and more) are configured and maintained in this JSON file. The file is linked to from the *config.js* of each individual portal by the *layerConf* parameter. For an example, see the *services-internet.json* included in the *examples.zip* at *//examples/Basic/resources/*.

All layer information the portal needs to use the services is stored here. Configuration details differ between WMS, WFS, [SensorThings-API](sensorThings.md) and other services types. You may also use local GeoJSON files; see GeoJSON example.

***

## WMS layer

|Name|Required|Type|Default|Description|Example|
|----|--------|----|-------|-----------|-------|
|cache|no|Boolean||Is this layer part of a cached service? If `true`, this layer is preferred to layers that share the same metadata, but have `cache` set to `false`. This only works in portals with `"treeType": "default"` in their **[config.json](config.json.md)**. The parameter has no effects on other tree types.|`false`|
|datasets|no|**[datasets](#markdown-header-wms_wfs_datasets)**/Boolean||Metadata specification. All metadata the layer data is referenced here. On clicking the "i" button in the layer tree, the information is retrieved by the CSW interface and shown to the user. For this, the **[rest-services.json](rest-services.json.md)** has to provide the URL of the metadata catalog resp. its CSW interface. The values *kategorie_opendata*, *kategorie_inspire*, and *kategorie_organisation* are used for layer categorization if the **[config.json](config.json.md)** has `treeType` set to `"default"`. To remove the "i" button altogether, explicitly set `"datasets": false`.||
|featureCount|yes|String||Amount of features retrieved on GFI requests. Corresponds to the *GetFeatureInfo parameter "FEATURE_COUNT"*.|`"1"`|
|format|yes|String||Image format of tiles requested via *GetMap*. Must match one of the service's formats listed in *Capability/Request/GetMap/Format*.|`"image/jpeg"`|
|gfiAttributes|yes|String/**[gfiAttributes](#markdown-header-gfi_attributes)**||GFI attributes to be shown|`"ignore"`|
|gfiTheme|yes|String/Object||Display style of GFI information for this layer. Unless `"default"` is chosen, custom templates may be used to show GFI information in another format than the default table style.|`"default"`|
|gutter|no|String|`"0"`|Additionally loaded tile contents in border pixel width. Serves to avoid cut symbols on tile borders.|`"0"`|
|id|yes|String||Arbitrary id|`"8"`|
|infoFormat|no|String|"text/xml"|**[services.json](services.json.md)** value. WMS *GetFeatureInfo* response format. The formats: `"text/xml"`, `"text/html"` and `"application/vnd.ogc.gml"` are supported. When using `"text/html"`, the service response is checked and will only be used when it contains a fully valid and filled HTML table.|`"text/xml"`|
|layerAttribution|no|String|`"nicht vorhanden"`|Additional layer information to be shown in the portal's control element *LayerAttribution*, if configured to appear. If `"nicht vorhanden"` (technical key meaning "not available") is chosen, no layer attribution is shown.|`"nicht vorhanden"`|
|layers|yes|String||The service's layer name. Must match a name of the service's capabilities in *Layer/Layer/Name*.|`"1"`|
|legendURL|yes|String/String[]||_Deprecated, please use "legend"._ Link to static legend image. `"ignore"`: No image is retrieved, `""` (empty string): The service's *GetLegendGraphic* is called.|`"ignore"`|
|legend|no|Boolean/String/String[]||Value of the **[services.json](services.json.md)** file. URL to be used to request a static legend image. Use a boolean value to dynamically generate the legend from a WMS request or the WFS styling respectively. Use a string to link an image or a PDF file.|`false`|
|maxScale|yes|String||The layer is shown only up to this scale.|`"1000000"`|
|minScale|yes|String||The layer is shown only down to this scale.|`"0"`|
|name|yes|String||Arbitrary display name used in the layer tree.|`"Aerial View DOP 10"`|
|singleTile|no|Boolean||`true`: Request map as a single tile of the current view. `false`: Build map from multiple smaller tiles.|`false`|
|tilesize|yes|String||Tile height and width in pixels. Used if `singleTile` is `false`.|`"512"`|
|time|no|Boolean/**[time](#markdown-header-wms-layertime)**|false|If set to `true` or an object (**[time](#markdown-header-wms-layertime)**), the configured Layer is expected to be a WMS-T.|`false`|
|transparent|yes|Boolean||Whether the tile background should be transparent. Corresponds to the *GetMap* parameter *TRANSPARENT*.|`true`|
|typ|yes|String||Service type; in this case, "WMS". (**[WMTS docs](#markdown-header-wmts-layer)**, **[WFS docs](#markdown-header-wfs-layer)**, **[SensorThings-API docs](#markdown-header-sensor-layer)**)|`"WMS"`|
|url|yes|String||Service URL|`"https://geodienste.hamburg.de/HH_WMS_DOP10"`|
|useProxy|no|Boolean|`false`|_Deprecated in the next major release. *[GDI-DE](https://www.gdi-de.org/en)* recommends setting CORS headers on the required services instead._ Only used for GFI requests. The request will contain the requested URL as path, with dots replaced by underscores.|`false`|
|version|yes|String||Service version used for *GetMap* requests.|`"1.3.0"`|
|isSecured|no|Boolean|false|Displays whether the layer belongs to a secured service. (**[see below](#markdown-header-wms-layerissecured)**)|false|
|authenticationUrl|no|String||Additional url called to trigger basic authentication in the browser.|"https://geodienste.hamburg.de/HH_WMS_DOP10?VERSION=1.3.0&SERVICE=WMS&REQUEST=GetCapabilities"|
|layerSequence|no|Number||Number to determine the sequence of selected layers in treeType 'custom'. A Layer with sequence number 1 is always the top layer, etc. By default, Baselayer get a sequence number > 1000 and Fachdaten layer get a sequence number < 1000.|`1`|

**WMS example:**

```json
{
      "id" : "8",
      "name" : "Aerial View DOP 10",
      "url" : "https://geodienste.hamburg.de/HH_WMS_DOP10",
      "typ" : "WMS",
      "layers" : "1",
      "format" : "image/jpeg",
      "version" : "1.3.0",
      "singleTile" : false,
      "transparent" : true,
      "tilesize" : "512",
      "gutter" : "0",
      "minScale" : "0",
      "maxScale" : "1000000",
      "infoFormat": "text/html",
      "gfiAttributes" : "ignore",
      "gfiTheme" : "default",
      "layerAttribution" : "nicht vorhanden",
      "legend" : false,
      "cache" : false,
      "featureCount" : "1",
      "isSecured": true,
      "authenticationUrl": "https://geodienste.hamburg.de/HH_WMS_DOP10?VERSION=1.3.0&SERVICE=WMS&REQUEST=GetCapabilities",
      "layerSequence": 1,
      "datasets" : [
         {
            "md_id" : "25DB0242-D6A3-48E2-BAE4-359FB28491BA",
            "rs_id" : "HMDK/25DB0242-D6A3-48E2-BAE4-359FB28491BA",
            "md_name" : "Digitale Orthophotos 10cm - FHHNET",
            "bbox" : "461468.97,5916367.23,587010.91,5980347.76",
            "kategorie_opendata" : [
               "Sonstiges"
            ],
            "kategorie_inspire" : [
               "nicht INSPIRE-identifiziert"
            ],
            "kategorie_organisation" : "Landesbetrieb Geoinformation und Vermessung"
         }
      ]
   }
```

***

## WMS-Layer.isSecured ##

WMS layer belonging to a secured WMS service.

**CAUTION: If the layer belongs to a secured service, the following changes must be made to the service!**

* Two headers must be set based on the referer.
* The configuration for this must be done e.g. in the Apache web server.
* `Access-Control-Allow-Credentials: true`.
* Dynamic rewrite of the following HTTP header from: <br>
`Access-Control-Allow-Origin: *` <br>
to <br>
`Access-Control-Allow-Origin: URL of the accessing portal`.

***

## WMS-Layer.time ##

Possible configuration for the time related parameters of a WMS-T.
If a parameter is also present in the service, the definition in this config is used.

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|default|no|Number||Initial moment to be displayed for the WMS-T. **Beware**: If the configured value is not part of the time range of possible values, the default of the service is used instead.|`1970`|
|keyboardMovement|no|Number|`5`| Value in pixels that the swiper should be moved when using the arrow keys.|`5`|
|playbackDelay|no|Number|`1`|When using the playback function, this is the time in seconds which a moment should be shown before the rendering of the next moment is initiated.|`42`|

***

## WMTS layer

WMTS layers can be added by

* entering all the following WMTS parameters
* using OpenLayers' `optionsFromCapabilities` method (see second example below)

|Name|Required|Type|Default|Description|Example|
|----|--------|----|-------|-----------|-------|
|capabilitiesUrl|no|String||Service's capabilities URL|`"https://www.wmts.nrw.de/geobasis/wmts_nw_dtk/1.0.0/WMTSCapabilities.xml"`|
|coordinateSystem|yes|String||Layer's coordinate reference system|`"EPSG:3857"`|
|format|yes|String||Image format of layer tiles. Only required with parameter `requestEncoding` set to `"KVP"` ist.|`"image/png"`|
|id|yes|String||Arbitrary id|`"320"`|
|layers|yes|String||Layer name. Must match the name noted in the WMTS capabilities.|`"geolandbasemap"`|
|layerAttribution|no|String|`"nicht vorhanden"`|Additional layer information to be shown in the portal's control element *LayerAttribution*, if configured to appear. If `"nicht vorhanden"` (technical key meaning "not available") is chosen, no layer attribution is shown.|`"nicht vorhanden"`|
|legendURL|yes|String/String[]||_Deprecated, please use "legend"._ Link to static legend image. `"ignore"`: No image is retrieved, `""` (empty string): The service's *GetLegendGraphic* is called.|`"ignore"`|
|legend|no|String[]||Value of the **[services.json](services.json.md)** file. URL to be used to request a static legend image. Use a string[] to link an image or a PDF file.|`false`|
|matrixSizes|no|Number[][]|Number of tile rows and columns of the grid for each zoom level. The values here are the `TileMatrixWidth` and `TileMatrixHeight` advertised in the GetCapabilities response of the WMTS.|[[1, 1], [2, 2], [4, 4], [8, 8], [16, 16], [32, 32], [64, 64], [128, 128], [256, 256], [512, 512], [1024, 1024], [2048, 2048], [4096, 4096], [8192, 8192], [16384, 16384], [32768, 32768], [65536, 65536], [131072, 131072], [262144, 262144], [524288, 524288]]|
|maxScale|yes|String||The layer is shown only up to this scale.|`"1000000"`|
|minScale|yes|String||The layer is shown only down to this scale.|`"0"`|
|name|yes|String||Arbitrary display name used in the layer tree.|`"Geoland Basemap"`|
|optionsFromCapabilities|no|Boolean||If `true`, use the `getOptionsFromCapabilities` method for definitions. See following examples.|`true`|
|origin|yes|Number[]||Tile raster origin. Can be fetched from the WMTS capabilities; usually the extent's top left corner.|`[-20037508.3428, 20037508.3428]`|
|requestEncoding|yes|enum["KVP", "REST"]||WMTS service request encoding.|`"REST"`|
|resLength|yes|String||Length of resolution and matrixIds arrays. Required to configure the layer's maximum zoom level.|`"20"`|
|scales|no|Number[]|The scale defined for each zoom level. The values are the `ScaleDenominator` of each `TileMatrix` of the `TileMatrixSet` as advertised in the GetCapabilities response of the WMTS.|[559082264.029, 279541132.015, 139770566.007, 69885283.0036, 34942641.5018, 17471320.7509, 8735660.37545, 4367830.18773, 2183915.09386, 1091957.54693, 45978.773466, 272989.386733, 136494.693366, 68247.3466832, 34123.6733416, 17061.8366708, 8530.91833540, 4265.45916770, 2132.72958385, 1066.36479193]|
|style|no|String|"normal"|Name of the style. Must match the noted in the WMTS capabilities.|`"normal"`|
|tileMatrixSet|yes|String||Matrix set required to call the WMTS service. Not required when using `optionsFromCapabilities`, a fitting TileMatrixSet is injected then.|`"google3857"`|
|tilesize|yes|String||Tile height and width in pixels.|`"512"`|
|transparent|yes|Boolean||Whether the tile background should be transparent. Corresponds to the *GetMap* parameter *TRANSPARENT*.|`true`|
|typ|yes|String||Service type; in this case, "WMTS". (**[WMTS docs](#markdown-header-wmts-layer)**, **[WFS docs](#markdown-header-wfs-layer)**, **[SensorThings-API docs](#markdown-header-sensor-layer)**)|`"WMS"`|
|urls|yes|String[]/String||WMTS service URL. If only a single URL is given, it's internally transformed to an array.|`["https://maps1.wien.gv.at/basemap/geolandbasemap/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png", "https://maps2.wien.gv.at/basemap/geolandbasemap/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png", "https://maps3.wien.gv.at/basemap/geolandbasemap/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png", "https://maps4.wien.gv.at/basemap/geolandbasemap/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png", "https://maps.wien.gv.at/basemap/geolandbasemap/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png"]`|
|version|yes|String||Service version used for *GetMap* requests.|`"1.0.0"`|
|wrapX|no|Boolean|`false`|Whether world should be wrapped horizontally.|`true`|

**WMTS example 1:**

```json
{
   "id": "320",
   "name": "Geoland Basemap",
   "urls": [
      "https://maps1.wien.gv.at/basemap/geolandbasemap/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png",
      "https://maps2.wien.gv.at/basemap/geolandbasemap/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png",
      "https://maps3.wien.gv.at/basemap/geolandbasemap/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png",
      "https://maps4.wien.gv.at/basemap/geolandbasemap/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png",
      "https://maps.wien.gv.at/basemap/geolandbasemap/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png"
   ],
   "typ": "WMTS",
   "layer": "geolandbasemap",
   "version": "1.0.0",
   "format": "image/png",
   "style": "normal",
   "transparent": false,
   "tileSize": "256",
   "minScale": "0",
   "maxScale": "2500000",
   "tileMatrixSet": "google3857",
   "matrixSizes": [
       [1, 1], [2, 2],
       [4, 4], [8, 8],
       [16, 16], [32, 32],
       [64, 64], [128, 128],
       [256, 256], [512, 512],
       [1024, 1024], [2048, 2048],
       [4096, 4096], [8192, 8192],
       [16384, 16384], [32768, 32768],
       [65536, 65536], [131072, 131072],
       [262144, 262144], [524288, 524288]
   ],
   "coordinateSystem": "EPSG:3857",
   "layerAttribution": "nicht vorhanden",
   "legend": false,
   "cache": true,
   "wrapX": true,
   "origin": [
      -20037508.3428,
      20037508.3428
   ],
   "scales": [
       559082264.029, 279541132.015, 139770566.007, 69885283.0036,
       34942641.5018, 17471320.7509, 8735660.37545, 4367830.18773,
       2183915.09386, 1091957.54693, 45978.773466, 272989.386733,
       136494.693366, 68247.3466832, 34123.6733416, 17061.8366708,
       8530.91833540, 4265.45916770, 2132.72958385, 1066.36479193
   ],
   "resLength": "20",
   "requestEncoding": "REST"
}
```

**WMTS example 2 (`optionsFromCapabilities` method):**

```
{
  "id": "2020",
  "name": "EOC Basemap",
  "capabilitiesUrl": "https://tiles.geoservice.dlr.de/service/wmts?SERVICE=WMTS&REQUEST=GetCapabilities",
  "typ": "WMTS",
  "layers": "eoc:basemap",
  "optionsFromCapabilities": true
}

```

***

## WFS layer

|Name|Required|Type|Default|Description|Example|
|----|--------|----|-------|-----------|-------|
|datasets|yes|**[datasets](#markdown-header-wms_wfs_datasets)**[]/Boolean||Metadata specification. All metadata of the layer data is referenced here. By clicking the "i" button in the layer tree, the information is retrieved by the CSW interface and shown to the user. For this, the **[rest-services.json](rest-services.json.md)** has to provide the URL of the metadata catalog resp. its CSW interface. The values *kategorie_opendata*, *kategorie_inspire*, and *kategorie_organisation* are used for layer categorization if the **[config.json](config.json.md)** has `treeType` set to `"default"`. To remove the "i" button altogether, explicitly set `"datasets": false`.||
|featureNS|yes|String||Usually referenced in the WFS *GetCapabilities*' header. Used to resolve the namespace given in *FeatureType/Name*.|`"http://www.deegree.org/app"`|
|featureType|yes|String||Feature type to load. Must match a value of *FeatureTypeList/FeatureType/Name* in the *GetCapabilities* response. Provide without namespace.|`"bab_vkl"`|
|featurePrefix|no|String||Used to identify a *FeatureType* in the service.|
|gfiAttributes|yes|String/**[gfiAttributes](#markdown-header-gfi_attributes)**||GFI attributes to be shown.|`"ignore"`|
|id|yes|String/**[wfs_id](#markdown-header-wfs_id)**||Arbitrary id or an object with id and suffix|`"44"`|
|layerAttribution|no|String|`"nicht vorhanden"`|Additional layer information to be shown in the portal's control element *LayerAttribution*, if configured to appear. If `"nicht vorhanden"` (technical key meaning "not available") is chosen, no layer attribution is shown.|`"nicht vorhanden"`|
|legendURL|yes|String/String[]||_Deprecated, please use "legend"._ Link to static legend image. `"ignore"`: No image is retrieved, `""` (empty string): The service's *GetLegendGraphic* is called.|`"ignore"`|
|legend|no|Boolean/String/String[]||Value of the **[services.json](services.json.md)** file. URL to be used to request a static legend image. Use a boolean value to dynamically generate the legend from a WMS request or the WFS styling respectively. Use a string to link an image or a PDF file.|`false`|
|name|yes|String||Arbitrary display name used in the layer tree.|`"Traffic situation on freeways"`|
|typ|yes|String||Service type; in this case, "WFS". (**[WMS (see above)](#markdown-header-wms-layer)**, **[WMTS (see above)](#markdown-header-wmts-layer)**, and **[SensorThings-API (see below)](#markdown-header-sensor-layer)**)|`"WFS"`|
|url|yes|String||Service URL|`"https://geodienste.hamburg.de/HH_WFS_Verkehr_opendata"`|
|version|no|String||Service version to use in *GetFeature* requests.|`"1.1.0"`|
|altitudeMode|no|enum["clampToGround","absolute","relativeToGround"]|`"clampToGround"`|Height mode in 3D mode.|`"absolute"`|
|altitude|no|Number||Display height in 3D mode in meters. If an altitude is given, any existing z coordinate is overwritten. If no z coordinate exists, altitude is used as its value.|`527`|
|altitudeOffset|no|Number||Height offset for display in 3D mode in meters. If given, any existing z coordinates will be increased by this value. If no z coordinate exists, this value is used as z coordinate.|`10`|
|gfiTheme|yes|String/Object||Display style of GFI information for this layer. Unless `"default"` is chosen, custom templates may be used to show GFI information in another format than the default table style.|`"default"`|
|useProxy|no|Boolean|`false`|_Deprecated in the next major release. *[GDI-DE](https://www.gdi-de.org/en)* recommends setting CORS headers on the required services instead._ Only used for GFI requests. The request will contain the requested URL as path, with dots replaced by underscores.|`false`|
|wfsFilter|no|String||Set to use xml ressource as wfs filter, the content of the filter file will be sent to the wfs server as POST request (**[see below](#markdown-header-wfsfilter)**).|`"ressources/xmlFilter/filterSchulenStadtteilschulen"`|
|isSecured|no|Boolean|false|Displays whether the layer belongs to a secured service. (**[see below](#markdown-header-wms-layerissecured)**)|false|
|authenticationUrl|no|String||Additional url called to trigger basic authentication in the browser.|"https://geodienste.hamburg.de/HH_WMS_DOP10?SERVICE=WFS&VERSION=1.1.0&REQUEST=DescribeFeatureType"|
|propertyNames|no|Array||The attributes as PROPERTYNAME parameter to receive response from wfs layer |`["properties"]`|

**WFS example:**

```json

{
      "id" : "44",
      "name" : "Traffic situation on freeways",
      "url" : "https://geodienste.hamburg.de/HH_WFS_Verkehr_opendata",
      "typ" : "WFS",
      "featureType" : "bab_vkl",
      "format" : "image/png",
      "version" : "1.1.0",
      "featureNS" : "http://www.deegree.org/app",
      "gfiAttributes" : "showAll",
      "wfsFilter": "ressources/xmlFilter/filterSchulenStadtteilschulen",
      "layerAttribution" : "nicht vorhanden",
      "legend" : true,
      "isSecured": true,
      "propertyNames": [
          "bezirk_name",
          "stadtteil_name",
          "anzahl_sus_primarstufe",
          "geom"
      ],
      "authenticationUrl": "https://geodienste.hamburg.de/HH_WMS_DOP10?SERVICE=WFS&VERSION=1.1.0&REQUEST=DescribeFeatureType",
      "datasets" : [
         {
            "md_id" : "2FC4BBED-350C-4380-B138-4222C28F56C6",
            "rs_id" : "HMDK/6f62c5f7-7ea3-4e31-99ba-97407b1af9ba",
            "md_name" : "Verkehrslage auf Autobahnen (Schleifen) Hamburg",
            "bbox" : "461468.97,5916367.23,587010.91,5980347.76",
            "kategorie_opendata" : [
               "Transport und Verkehr"
            ],
            "kategorie_inspire" : [
               "nicht INSPIRE-identifiziert"
            ],
            "kategorie_organisation" : "Behörde für Wirtschaft, Verkehr und Innovation"
         }
      ]
   }
```

**WFS-T example:**

```json
{
    "id" : "1234",
    "name" : "WFSTLayer",
    "url" : "http://IP-Adresse/Beispiel/Pfad",
    "typ" : "WFS",
    "featureType" : "wfstBsp",
    "format" : "image/png",
    "version" : "1.1.0",
    "featureNS" : "http://beispiel.link.org/gmlsf",
    "featurePrefix" : "sf",
    "outputFormat" : "XML",
    "gfiAttributes" : "showAll",
    "layerAttribution" : "nicht vorhanden",
    "legend" : true,
    "datasets" : [],
    "propertyNames": [
        "bezirk_name",
        "stadtteil_name",
        "anzahl_sus_primarstufe",
        "geom"
    ]
  }
```

### wfsFilter

You can create an xml ressource using wfs standard to request your server with complex filters.
To learn more about wfs filter encoding see https://mapserver.org/de/ogc/filter_encoding.html .

Remember to use the correct feature namespace (see prop featureNS) for xmlns:app.



**Example**

A filter for primary schools with more than 2 parallel first classes in a file named "primary_schools_with_more_than_two_first_classes.xml".
Remember to add/remove namespaces (e.g. xmlns:wfs and xmlns:ogc) for your purpose.
If it doesn't work with the first try, go through your file - line for line - most of the time some prefix doesn't match a namespace or vice versa.

Config:

```json
{
    wfsFilter: "primary_schools_with_more_than_two_first_classes.xml"
}
```

Content of primary_schools_with_more_than_two_first_classes.xml:

```json
<?xml version="1.0" encoding="UTF-8"?>
<wfs:GetFeature service="WFS" version="1.1.0" xmlns:app="http://www.deegree.org/app" xmlns:wfs="http://www.opengis.net/wfs" xmlns:ogc="http://www.opengis.net/ogc">
    <wfs:Query typeName="app:schools">
        <ogc:Filter>
            <ogc:And>
                <ogc:PropertyIsEqualTo>
                    <ogc:PropertyName>app:schoolname</ogc:PropertyName>
                    <ogc:Literal>Primaryschool</ogc:Literal>
                </ogc:PropertyIsEqualTo>
                <ogc:PropertyIsGreaterThan>
                    <ogc:PropertyName>app:parallel_first_classes</ogc:PropertyName>
                    <ogc:Literal>2</ogc:Literal>
                </ogc:PropertyIsGreaterThan>
            </ogc:And>
        </ogc:Filter>
    </wfs:Query>
</wfs:GetFeature>
```




***

## wfs_id
If the layer id is in an object format, the content in the object should be in the format:

|Name|Required|Type|Default|Description|Example|
|----|--------|----|-------|-----------|-------|
|layerId|yes|String||Attribute value layerId.|`"1234567"`|
|suffix|yes|String||Attribute value suffix.|`"text"`|
**The layerId and suffix must be unique as a pair**

**wfs layer Id Object example:**

```json
{
   "id": {
        "layerId": "1234567",
        "suffix": "text"
   }
}
```

***

## WFS-Layer.isSecured ##
WFS layer belonging to a secured WFS service.

**CAUTION: If the layer belongs to a secured service, the following changes must be made to the service!**

* Two headers must be set based on the referer.
* The configuration for this must be done e.g. in the Apache web server.
* `Access-Control-Allow-Credentials: true`.
* Dynamic rewrite of the following HTTP header from: <br>
`Access-Control-Allow-Origin: *` <br>
to <br>
`Access-Control-Allow-Origin: URL of the accessing portal`.

**CAUTION: If the layer is also a WFS-T layer of a secured service, the following additional change must be made to the service!**

* A headers must be set based on the referer.
* The configuration for this must be done e.g. in the Apache web server.
* If no setting has yet been made for this header, the header must be set as follows to avoid any effects on other requests: `Access-Control-Allow-Headers: Content-Type, * `
* If settings have already been made for this header, the following entry must be added to the `Access-Control-Allow-Headers` header: `Content-Type`

***
## Vector Tile Layer

Please note the [VTL specification](https://docs.mapbox.com/vector-tiles/specification/#what-the-spec-doesnt-cover) on what VTL exactly is capable of.

|Name|Required|Type|Default|Description|Example|
|----|--------|----|-------|-----------|-------|
|minZoom|no|Number||The minimum zoom level|4|
|maxZoom|no|Number||The maximum zoom level|15|
|zDirection|no|Number|1|Specifies, if the resolutions of the service and the portal are different, in which direction the resolution should be used.|-1|
|datasets|no|**[datasets](#markdown-header-wms_wfs_datasets)**/Boolean||Metadata specification. All metadata of the layer data is referenced here. By clicking the "i" button in the layer tree, the information is retrieved by the CSW interface and shown to the user. For this, the **[rest-services.json](rest-services.json.md)** has to provide the URL of the metadata catalog resp. its CSW interface. The values *kategorie_opendata*, *kategorie_inspire*, and *kategorie_organisation* are used for layer categorization if the **[config.json](config.json.md)** has `treeType` set to `"default"`. To remove the "i" button altogether, explicitly set `"datasets": false`.||
|gfiAttributes|yes|String/**[gfiAttributes](#markdown-header-gfi_attributes)**||GFI attributes to be shown.|`"ignore"`|
|epsg|no|String|The portal's default EPSG code.|EPSG string used for checking the coordinate reference system. If the value does not match the VTL, a warning is shown. Vector tile services should offer the data in the target CRS for performance reasons. If `"EPSG:3857"` is set with neither `"extend"`, nor `"origin"`, `"resolutions"`, or `"tileSize"`, no *GridSet* is created. The OL default will be used instead.|`"EPSG:3857"`|
|extent|no|Number[4]||Required to define the VTC's *GridSet*. If not set, the portal's coordinate reference system's extent is used.|`[902186.674876469653, 7054472.60470921732, 1161598.35425907862, 7175683.41171819717]`|
|origin|no|Number[2]||Required to define the VTC's *GridSet*. If not set, the portal's coordinate reference system's top-left corner is used.|`[-9497963.94293634221, 9997963.94293634221]`|
|origins|no|Number[2][]||Required to define the VTC's *GridSet*. If `"origins"` is used, the parameter `"origin"` is ignored; else, `"origin"` is used.|`[[239323.44497139292, 9336416.0],[239323.44497139292, 9322080.0],[239323.44497139292, 9322080.0],[239323.44497139292, 9322080.0],[239323.44497139292, 9322080.0],[239323.44497139292, 9322080.0],[239323.44497139292, 9320288.0],[239323.44497139292, 9321005.0],[239323.44497139292, 9320646.0],[239323.44497139292, 9320467.0],[239323.44497139292, 9320288.0],[239323.44497139292, 9320109.0],[239323.44497139292, 9320145.0],[239323.44497139292, 9320109.0]]`|
|resolutions|no|Number[]||Required to define the VTC's *GridSet*. It not used, the portal's resolutions are used. Missing zoom levels are extrapolated only if the resolutions are explicitly specified. Therefore, only resolutions for which tiles exist may be specified.|`[78271.5169640117238, 39135.7584820058619, 19567.8792410029309, 9783.93962050146547, 4891.96981025073273, 2445.98490512536637, 1222.99245256268318, 611.496226281341592, 305.7481131406708, 152.8740565703354, 76.437028285167699, 38.2185141425838495, 19.1092570712919247, 9.55462853564596237, 4.77731426782298119, 2.38865713391149059, 1.1943285669557453]`|
|tileSize|no|Number|`512`|Required to define the size of a VTC tile.|`256`|
|id|yes|String||Arbitrary id|`"41"`|
|layerAttribution|no|String|`"nicht vorhanden"`|Additional layer information to be shown in the portal's control element *LayerAttribution*, if configured to appear. If `"nicht vorhanden"` (technical key meaning "not available") is chosen, no layer attribution is shown.|`"nicht vorhanden"`|
|transparency|no|number|`0`|Initial layer transparency, 0 to 100 (inclusive)|`0`|
|visibility|no|boolean|`false`|Whether the layer is initially active|`true`|
|maxScale|yes|String||The layer is shown only up to this scale.|`"1000000"`|
|minScale|yes|String||The layer is shown only down to this scale.|`"0"`|
|name|yes|String||Arbitrary display name used in the layer tree.|`"Traffic situation on freeways"`|
|vtStyles|no|vtStyle[]||See example and definition in **[config.json](config.json.md)**. Describes available styles usable with the *styleVT* tool.|see example below|
|typ|yes|String||Must be set to `"VectorTile"` for this layer.|`"VectorTile"`|
|url|yes|String||Service URL|`"https://example.com/3857/tile/{z}/{y}/{x}.pbf"`|
|useProxy|no|Boolean|`false`|_Deprecated in the next major release. *[GDI-DE](https://www.gdi-de.org/en)* recommends setting CORS headers on the required services instead._ Only used for GFI requests. The request will contain the requested URL as path, with dots replaced by underscores.|`false`|
|gfiTheme|yes|String/Object||Display style of GFI information for this layer. Unless `"default"` is chosen, custom templates may be used to show GFI information in another format than the default table style.|`"default"`|

**VectorTile example:**

```json

{
  "id": "UNIQUE_ID",
  "name": "Ein Vektortilelayername",
  "epsg": "EPSG:3857",
  "url": "https://example.com/3857/tile/{z}/{y}/{x}.pbf",
  "typ": "VectorTile",
  "transparency": 0,
  "visibility": true,
  "minScale": 4000,
  "maxScale": 200000,
  "legend": false,
  "gfiAttributes": "showAll",
  "gfiTheme": "default",
  "vtStyles": [
    {
      "id": "STYLE_1",
      "name": "Tagesansicht",
      "url": "https://example.com/3857/resources/styles/day.json",
      "defaultStyle": true
    },
    {
      "id": "STYLE_2",
      "name": "Nachtansicht",
      "url": "https://example.com/3857/resources/styles/night.json"
    }
  ]
}
```

***

## SensorLayer

A feature kann hold multiple Datastreams. For each Datastream, the latest obervation is added as a feature attribute as `"dataStream_[id]_[name]"`, where `id` is the Datastream's `@iot.id`.

The name is read from `datastream.properties.type`; if not available, `datastream.unitOfMeasurement.name` is used.

For more details, consider reading the [extensive SensorThings-API documentation.](sensorThings.md).

|Name|Required|Type|Default|Description|Example|
|----|--------|----|-------|-----------|-------|
|altitude|no|Number||Display height in 3D mode in meters. If an altitude is given, any existing z coordinate is overwritten. If no z coordinate exists, altitude is used as its value.|`527`|
|altitudeMode|no|enum["clampToGround","absolute","relativeToGround"]|`"clampToGround"`|Height mode in 3D mode.|`"absolute"`|
|altitudeOffset|no|Number||Height offset for display in 3D mode in meters. If given, any existing z coordinates will be increased by this value. If no z coordinate exists, this value is used as z coordinate.|`10`|
|epsg|no|String|`"EPSG:4326"`|SensorThings-API coordinate reference system|`"EPSG:4326"`|
|gfiAttributes|yes|String/**[gfiAttributes](#markdown-header-gfi_attributes)**||GFI attributes to be shown. Set to "ignore" to deactivate gfiTheme.|`"ignore"`|
|gfiTheme|yes|**[gfiTheme](#markdown-header-gfi_theme)**||Display style of GFI information for this layer. Unless `"default"` is chosen, custom templates may be used to show GFI information in another format than the default table style.|`"default"`|
|id|yes|String||Arbitrary id|`"999999"`|
|legend|no|Boolean/String/String[]||Value of the **[services.json](services.json.md)** file. URL to be used to request a static legend image. Use a boolean value to dynamically generate the legend from a WMS request or the WFS styling respectively. Use a string to link an image or a PDF file.|`false`|
|legendURL|yes|String/String[]||_Deprecated, please use "legend"._ Link to static legend image. `"ignore"`: No image is retrieved, `""` (empty string): The service's *GetLegendGraphic* is called.|`"ignore"`|
|loadThingsOnlyInCurrentExtent|no|Boolean|`false`|Whether Things are only to be fetched for the current extent. On changing the extent, another request is fired.|`true`|
|mqttOptions|no|**[mqttOptions](#markdown-header-sensorlayermqttoptions)**||mqtt web socket connection configuration||
|mqttQos|no|Number|2|Quality of service subscription level. For more information see **[sensorThings](sensorThings.md)**|0|
|mqttRh|no|Number|2|This option specifies whether retained messages are sent on subscription. For more information see **[sensorThings](sensorThings.md)**|0|
|name|yes|String||Arbitrary display name used in the layer tree.|`"Charging locations"`|
|noDataValue|no|String|`"no data"`|Placeholder for unavailable Observations to Datastreams.|`"no data"`|
|showNoDataValue|no|Boolean|`true`|Whether Datastreams should be given without Observations.|`true`|
|timezone|no|String|`"Europe/Berlin"`|`moment` time zone name used to convert a Sensor's PhaenomenonTime (UTC) to the client's time zone.|[Valid timezome documentation](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)|
|typ|yes|String||Service type; in this case, `"SensorThings"`. (**[WMS, see above](#markdown-header-wms-layer)**, **[WMTS, see above](#markdown-header-wmts-layer)**, and **[WFS, see above](#markdown-header-wfs-layer)**)|`"SensorThings"`|
|url|yes|String||Service URL; may be extended by `urlParameter`|`"https://51.5.242.162/itsLGVhackathon"`|
|urlParameter|no|**[urlParameter](#markdown-header-sensorlayerurlparameter)**||Query options specification. These modify the request to sensor data, e.g. with `"filter"` or `"expand"`.||
|useProxy|no|Boolean|`false`|_Deprecated in the next major release. *[GDI-DE](https://www.gdi-de.org/en)* recommends setting CORS headers on the required services instead._ Only used for GFI requests. The request will contain the requested URL as path, with dots replaced by underscores.|`false`|
|version|no|String|"1.1"|Service version used to request data.|`"1.0"`|
|intersect|no|Boolean|true|Setting if the sensor data is in intersect range or within range |`true`|

**Sensor example:**

```json

   {
      "id" : "999999",
      "name" : "Live - Charging locations",
      "typ" : "SensorThings",
      "version" : "1.0",
      "url" : "https://51.5.242.162/itsLGVhackathon",
      "intersect": true,
      "urlParameter" : {
         "root" : "Things",
         "filter" : "startswith(Things/name,'Charging')",
         "expand" : "Locations,Datastreams/Observations($orderby=phenomenonTime%20desc;$top=1)"
      },
      "epsg": "EPSG:4326",
      "gfiTheme" : "default",
      "gfiAttributes" : {
         "phenomenonTime" : "Letze Zustandsänderung",
         "state" : "Zustand",
         "plug" : "Stecker",
         "type" : "Typ",
         "dataStreamId" : "DataStreamID",
         "@Datastreams.0": {
            "name": "Datastreams.0",
            "type": "linechart",
            "query": "Observations?$filter=(resultTime gt now() sub duration'PT24H')&$orderby=phenomenonTime asc",
            "format": "HH:mm",
            "download": true,
            "options": {
             "pointRadius": 3
            }
         }
      },
      "mqttOptions" : {
          "host" : "https://localhost",
          "port": "1883"
      }
   }
```

## SensorLayer.mqttOptions ##

Used to configure the target of a mqtt web socket connection. If nothing is set, the portal tries to infer the parameters from the service URL.

|Name|Required|Type|Default|Description|Example|
|----|--------|----|-------|-----------|-------|
|host|no|String|https://localhost|the server to connect to, keep in mind that port and path are seperate parameters|`"https://www.example.com"`|
|port|no|String||the port to connect to, leave empty to use default by protocol|`"8883"`|
|path|no|String|/mqtt|the path on the server to connect to, keep in mind with Versions 3.1 or 3.1.1 to give a seperate rhPath if you want to simulate retained messaging|`"/mqtt"`|
|protocol|no|String|wss|the protocol to use|`"wss"`|
|mqttVersion|no|String|3.1.1|the mqtt version to use (3.1, 3.1.1 or 5.0) if any other is given, latest is used|`"3.1.1"`|
|rhPath|no|String||for mqttVersion 3.1 and 3.1.1 to simulate retained handling based on SensorThingsApi, hint: the topic will be put onto this url to call the SensorThingsApi via http|`"https://example.com/"`|

**Example mqttOptions:**
```json

    {
      "mqttOptions" : {
         "host" : "https://localhost",
         "port" : "8883",
         "path": "/mqtt",
         "protocol": "wss"
      }
   }
```

## SensorLayer.urlParameter ##

Enables filtering SensorThingsAPI requests.

|Name|Required|Type|Default|Description|Example|
|----|--------|----|-------|-----------|-------|
|expand|no|String/Array||See [full documentation](sensorThings.md)|`"Locations,Datastreams/Observations($orderby=phenomenonTime%20desc;$top=1)"`|
|filter|no|String||See [full documentation](sensorThings.md)|`"startswith(Things/name,'Charging')"`|
|root|no|String|"Things"|The root element in the URL to which the query is applied. possible are `"Things"` or `"Datastreams"`|"Datastreams"|

**urlParameter example:** Show all Things where the name starts with `"Charging"`, and all Datastreams belonging to those Things. Show each Datastream's latest Observation.

```json
{
    "urlParameter" : {
        "filter" : "startswith(Things/name,'Charging')",
        "expand" : "Locations,Datastreams/Observations($orderby=phenomenonTime%20desc;$top=1)",
        "root": "Things"
    }
}
```

**urlParameter example:** Show all Things where the name starts with `"Charging"`, and all Datastreams belonging to those Things where `"Lastenrad"` is part of the name. Show each Datastream's latest Observation and the Phaenomenon (ObversedProperty) that is observed. If available, the ObservedProperty will be used for dynamic attribute creation.

```json
{
    "urlParameter": {
        "filter": "startswith(Things/name,'Charging')",
        "expand": [
            "Locations",
            "Datastreams($filter=indexof(Datastream/name,'Lastenrad') ge 1)",
            "Datastreams/Observations($orderby=phenomenonTime%20desc;$top=1)",
        "Datastreams/ObservedProperty"
        ]
    }
}
```

***

## WMS_WFS_datasets

Metadata specification. All metadata of the layer data is referenced here. By clicking the "i" button in the layer tree, the information is retrieved by the CSW interface and shown to the user. For this, the **[rest-services.json](rest-services.json.md)** has to provide the URL of the metadata catalog resp. its CSW interface. The values *kategorie_opendata*, *kategorie_inspire*, and *kategorie_organisation* are used for layer categorization if the **[config.json](config.json.md)** has `treeType` set to `"default"`. To remove the "i" button altogether, explicitly set `"datasets": false`.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|md_id|no|String||Metadata record identifier|
|csw_url|no|String||Link to the CSW service. From this, the data that is displayed in the layer information is retrieved.|
|show_doc_url|no|String||Link to the entry in the metadata catalog. The link to the metadata entry of the layer is created from this URL and the `"md_id"`.|
|rs_id|no|String||Resource identifier of the metadata record.|
|md_name|no|String||Record name.|
|bbox|no|String||Record extension.|
|kategorie_opendata|no|String||Opendata category from the govdata.de code list.|
|kategorie_inspire|no|String||Inspire category from the Inspire code list, if available; if not, set to `"nicht Inspire-identifiziert"`.|
|kategorie_organisation|no|String||Organization name of the data holding body.|

**datasets example:**

```json
"datasets" : [
    {
        "md_id" : "9329C2CB-4552-4780-B343-0CC847538896",
        "csw_url" : "https://metaver.de/csw",
        "show_doc_url" : "https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid=",
        "rs_id" : "https://registry.gdi-de.org/id/de.hh/010d7370-5306-4b63-983b-59cdd6e94c3c",
        "md_name" : "Krankenhäuser Hamburg",
        "bbox" : "461468.968928975,5916367.22980651,587010.909598947,5980347.75579767",
        "kategorie_opendata" : [ "Gesundheit" ],
        "kategorie_inspire" : [ "Versorgungswirtschaft und staatliche Dienste" ],
        "kategorie_organisation" : "Behörde für Arbeit, Gesundheit, Soziales, Familie und Integration"
    }
]
```

***

## gfi_theme

This attribute may be either a string or an object. In case it's a string, the matching template will be used. In case it's an object, the following parameters are interpreted.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|name|yes|String||GFI template name|
|params|no|**[params](#markdown-header-gfi_theme_params)**||Template-specific attributes|

**gfiTheme example:**

```json
{
    "gfiTheme": {
        "name": "default",
        "params": {}
    }
}
```

***

## gfi_theme_params

Definition of template-specific parameters.

|Name|params|
|----|------|
|default|**[params](#markdown-header-gfi_theme_default_params)**|
|sensor|**[params](#markdown-header-gfi_theme_sensor_params)**|

***

## gfi_theme_default_params

Definition of parameters for GFI template `"default"`.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|iframe|no|**[iframe](#markdown-header-gfi_theme_default_params_iframe)**||Defines the size of the iframe. Only works if the infoFormat="text/html" is configured for the layer.|
|imageLinks|no|String/String[]|`["bildlink", "link_bild", "Bild", "bild"]`|Defines in which attribute an image reference is given. Attributes will be searched in given order, and the first hit will be used.|
|maxWidth|no|String|`"600px"`|Defines the max width of the gfi content. The max width must be at least 280px.|
|showFavoriteIcons|no|Boolean|`true`|Specifies whether an icon bar allowing tool access is to be displayed. The icons are only displayed if the corresponding tools are configured. Usable tools: `compareFeatures` (not yet implemented for WMS).|
|beautifyKeys|no|Boolean|true|Defines if the attribute keys are beautified (true) or not (false).|
|showObjectKeys|no|Boolean|false|Displays attribute keys and values of objects in the data if set to true.|


**gfiTheme example for template "Default":**

Example for show images in the gfi:
```json
{
    "gfiTheme": {
        "name": "default",
        "params": {
            "imageLinks": [
                "bildlink",
                "link_bild",
                "Bild",
                "bild",
                "My_image_tag"
            ],
            "maxWidth": "500px",
            "showFavoriteIcons": true,
            "beautifyKeys": true,
            "showObjectKeys": false
        }
    }
}
```

Example for set size of an iframe:
```json
{
    "gfiTheme": {
        "name": "default",
        "params": {
            "iframe": {
                "width": "800px",
                "height": "20vh"
            }
        }
    }
}
```

***

## gfi_theme_default_params_iframe

The GFI can be displayed as an iframe. Here you can define the size of the iframe.

Note: Only works if the infoFormat="text/html" is configured for the layer.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|height|no|String|"450px"|Width of the iframe.|
|width|no|String|"450px"|Height of the iframe.|

**Example for the size of an iframe:**
```json
{
    "iframe": {
        "width": "200px",
        "height": "200px"
    }
}
```


***

## gfi_theme_sensor_params

This theme allows the visualization of historical data regarding a SensorThings-API layer. For each configured Observation result an image is created. Therefore, this GFI theme is only usable for results providing a status; e.g., for charging stations such a status range is "free", "loading", "out of order".

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|charts|yes|**[charts](#markdown-header-gfi_theme_sensor_params_charts)**||Contains attributes for chart creation.|
|data|no|**[data](#markdown-header-gfi_theme_sensor_params_data)**||Data column names.|
|header|no|Object|`{"name": "Name", "description": "Beschreibung", "ownerThing": "Eigentümer"}`|Specifies which attributes are to be used for the headers. The display name of each attribute can be specified here, e.g. `"description"` may be displayed `"Arbitrary String"`.|
|historicalData|no|**[historicalData](#markdown-header-gfi_theme_sensor_params_historicalData)**||Indicates for which period the historical Observations should be requested.|
|beautifyKeys|no|Boolean|true|Defines if the attribute keys are beautified (true) or not (false).|
|showObjectKeys|no|Boolean|false|Displays attribute keys and values of objects in the data if set to true.|

**gfiTheme example for template "Sensor":**

```json
{
    "gfiTheme": {
        "name": "sensor",
        "params": {
            "header": {
                "name": "Name",
                "description": "Description",
                "ownerThing": "Owner"
            },
            "data": {
                "name": "Data",
                "firstColumnHeaderName": "Properties",
                "columnHeaderAttribute": "layerName"
            },
            "charts": {
                "hoverBackgroundColor": "rgba(0, 0, 0, 0.8)",
                "barPercentage": 1.1,
                "values": {
                    "available": {
                        "title": "Available",
                        "color": "rgba(0, 220, 0, 1)"
                    },
                    "charging": {
                        "title": "Charging",
                        "color": "rgba(220, 0, 0, 1)"
                    },
                    "outoforder": {
                        "title": "common:modules.tools.gfi.themes.sensor.chargingStations.outoforder",
                        "color": "rgba(175, 175, 175, 1)"
                    }
                }
            },
            "historicalData": {
                "periodLength": 3,
                "periodUnit": "month"
            },
            "beautifyKeys": true,
            "showObjectKeys": false
        }
    }
}
```

***

## gfi_theme_sensor_params_charts

Chart display parameters.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|values|yes|String[]/**[valuesObject](#markdown-header-gfi_theme_sensor_params_charts_valuesObject)**||Definition of which Observation Results are turned into charts. A separate tab will be created for each result. Results may be entered as array or object; when given as object, further attributes may be defined.|
|hoverBackgroundColor|no|String|`"rgba(0, 0, 0, 0.8)"`|Bar background color on hovering.|
|barPercentage|no|Number|`1.0`|Bar width.|

**Configuration example with array value:**
```json
{
    "charts": {
        "hoverBackgroundColor": "rgba(0, 0, 0, 0.8)",
        "barPercentage": 1.1,
        "values": [
            "available",
            "charging",
            "outoforder"
        ]
    }
}
```

**Configuration example with object value:**
```json
{
    "charts": {
        "hoverBackgroundColor": "rgba(0, 0, 0, 0.8)",
        "barPercentage": 1.1,
        "values": {
            "available": {
                "title": "Available",
                "color": "rgba(0, 220, 0, 1)"
            },
            "charging": {
                "title": "Charging",
                "color": "rgba(220, 0, 0, 1)"
            },
            "outoforder": {
                "title": "Out Of Order",
                "color": "rgba(175, 175, 175, 1)"
            }
        }
    }
}
```

***

## gfi_theme_sensor_params_charts_valuesObject

Layout definition for each result's chart.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|title|no|String||Chart image title. May also be set to a path in the translation files in `masterportal/locales`, which you may extend at your own discretion.|
|color|no|String|`"rgba(0, 0, 0, 1)"`|Bar color.|
|noticeText|no|String|""|Text that gives a hint about the data.|

```json
{
    "available": {
        "title": "Available",
        "color": "rgba(0, 220, 0, 1)",
        "noticeText": "Explanation of the available data."
    }
}
```

```json
{
    "charging": {
        "title": "common:modules.tools.gfi.themes.sensor.chargingStations.charging",
        "color": "rgba(220, 0, 0, 1)",
        "noticeText": "common:modules.tools.gfi.themes.sensor.sensorBarChart.noticeTextCharging"
    }
}
```

***

## gfi_theme_sensor_params_data

Data display configuration.

|Name|Required|Type|Default|Description|Example|
|----|--------|----|-------|-----------|-------|
|name|no|String||Tab name.|
|firstColumnHeaderName|no|String|`"Properties"`|Column title for attribute names.|
|columnHeaderAttribute|no|String|`"dataStreamName"`|Value column title.|

```json
{
    "data": {
        "name": "Data",
        "firstColumnHeaderName": "Properties",
        "columnHeaderAttribute": "layerName"
    }
}
```

***

## gfi_theme_sensor_params_historicalData

Configuration of historical data period to be request.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|name|no|String||Tab name.|
|periodLength|no|Number|`3`|Period length.|
|periodUnit|no|String|`"month"`|Unit for period. Use `"month"` or `"year"`.|

```json
{
    "historicalData": {
        "periodLength": 3,
        "periodUnit": "month"
    }
}
```

***

## gfi_attributes

Potentially cryptic service-side attribute names may be translated with these key-value pairs within the portal.

Other options:

* `"ignore"`: GFI requests disabled
* `"showAll"`: All GFI attributes are requested and shown as given

The portal excludes a set of standard attributes that have no information value to users. See **[config.js](config.js.md)** for details.

**gfiAttributes string example:**

```json
{
   "gfiAttributes": "showAll"
}
```

**gfiAttributes string example:**

```json
{
   "gfiAttributes": "ignore"
}
```

**gfiAttributes object example:**

```json
{
   "gfiAttributes": {
      "key1": "key shown in the portal 1",
      "key2": "key shown in the portal 2",
      "key3": "key shown in the portal 3"
   }
}
```

**gfiAttributes example object with [Objektpfadverweis](style.json.md#markdown-header-objektpfadverweise) (object path reference):**
```json
{
   "gfiAttributes": {
      "key1": "key shown in the portal 1",
      "key2": "key shown in the portal 2",
      "@Datastreams.0.Observations.0.result": "key shown in the portal 3"
   }
}

```

If the gfiAttributes are given as an object, a key's value may also be an object. In that case, the nested object defines a restriction for using that key.

|Name|Required|Type|Default|Description|Example|
|----|--------|----|-------|-----------|-------|
|name|yes|String||Name to be shown on an exact match.|`"Test"`|
|condition|yes|enum["contains", "startsWith", "endsWith"]||Condition checked on each feature attribute.|`"startsWith"`|
|type|no|enum["string", "date", "number", "boolean"]|`"string"`|If `"date"`, the portal will attempt to parse the attribute value to a date; If `"Number"`, the portal will attempt to parse the attribute value to with thousand seperator; If “boolean”, the portal will attempt to parse the attribute value to boolean value.|`"date"`|
|format|no|String/Object|`"YYYY-MM-DDTHH:mm:ss.SSSZ"/{"key": "value"}`|Data format.|`"DD.MM.YYY"`|
|prefix|no|String||Attribute value prefix.|Add string to value without whitespace `"https://"`|
|suffix|no|String||Attribute value suffix.|`"°C"`|

**gfiAttributes example object using `suffix` and `prefix` :**

```json
{
   "gfiAttributes": {
      "key1": "key shown in the portal 1",
      "key2": "key shown in the portal 2",
      "key3": {
         "name": "key shown in the portal 3",
         "condition": "contains",
         "suffix": "°C",
         "prefix": "https://"
      }
   }
}
```

**gfiAttributes example object using `type` and `format`:**

```json
{
   "gfiAttributes": {
      "key1": "key shown in the portal 1",
      "key2": "key shown in the portal 2",
      "key3": {
         "name": "key shown in the portal 3",
         "condition": "contains",
         "type": "date",
         "format": "DD.MM.YY"
      }
   }
}

```

**gfiAttributes example object using `number`:**

```json
{
   "gfiAttributes": {
      "key1": "key shown in the portal 1",
      "key2": "key shown in the portal 2",
      "key3": {
         "name": "key shown in the portal 3",
         "condition": "contains",
         "type": "number"
      }
   }
}

```

**gfiAttributes example object using `boolean` without `format`:**

```json
{
   "gfiAttributes": {
      "key1": "key shown in the portal 1",
      "key2": "key shown in the portal 2",
      "key3": {
         "name": "key shown in the portal 3",
         "condition": "contains",
         "type": "boolean"
      }
   }
}

```

**gfiAttributes example object using `boolean` with `format` in translation key:**

```json
{
   "gfiAttributes": {
      "key1": "key shown in the portal 1",
      "key2": "key shown in the portal 2",
      "key3": {
         "name": "key shown in the portal 3",
         "condition": "contains",
         "type": "boolean",
         "format": {
            "true": "common:modules.tools.gfi.boolean.yes",
            "false": "common:modules.tools.gfi.boolean.no"
         }
      }
   }
}

```

**gfiAttributes example object using `boolean` with `format` in normal text:**

```json
{
   "gfiAttributes": {
      "key1": "key shown in the portal 1",
      "key2": "key shown in the portal 2",
      "key3": {
         "name": "key shown in the portal 3",
         "condition": "contains",
         "type": "boolean",
         "format": {
            "true": "it is right",
            "false": "it is wrong"
         }
      }
   }
}

```

**gfiAttributes example object with [Objektpfadverweis](style.json.md#markdown-header-objektpfadverweise) (object path reference) key and object value:**

```json
{
   "gfiAttributes": {
      "key1": "key shown in the portal 1",
      "key2": "key shown in the portal 2",
      "@Datastreams.0.Observations.0.result": {
        "name": "Temperatur",
        "suffix": "°C"
      }
   }
}
```

***

## GeoJSON layer

|Name|Required|Type|Default|Description|Example|
|----|--------|----|-------|-----------|-------|
|gfiAttributes|yes|String/**[gfiAttributes](#markdown-header-gfi_attributes)**||GFI attributes to be shown.|`"ignore"`|
|id|yes|String||Arbitrary id|`"11111"`|
|layerAttribution|no|String|`"nicht vorhanden"`|Additional layer information to be shown in the portal's control element *LayerAttribution*, if configured to appear. If `"nicht vorhanden"` (technical key meaning "not available") is chosen, no layer attribution is shown.|`"nicht vorhanden"`|
|legendURL|yes|String/String[]||_Deprecated, please use "legend"._ Link to static legend image. `"ignore"`: No image is retrieved, `""` (empty string): The service's *GetLegendGraphic* is called.|`"ignore"`|
|legend|no|Boolean/String/String[]||Value of the **[services.json](services.json.md)** file. URL to be used to request a static legend image. Use a boolean value to dynamically generate the legend from a WMS request or the WFS styling respectively. Use a string to link an image or a PDF file.|`false`|
|name|yes|String||Arbitrary display name used in the layer tree.|`"local GeoJSON"`|
|typ|yes|String||Service type; in this case, `"GeoJSON"`. |`"GeoJSON"`|
|subTyp|no|enum["OpenSenseMap"]||SubType to fetch special data.|`"OpenSenseMap"`|
|url|yes|String||GeoJSON path/URL. The path must be given relative to the `index.html` file.|`"/myJsons/test.json"`|
|altitudeMode|no|enum["clampToGround","absolute","relativeToGround"]|`"clampToGround"`|Height mode in 3D mode.|`"absolute"`|
|altitude|no|Number||Display height in 3D mode in meters. If an altitude is given, any existing z coordinate is overwritten. If no z coordinate exists, altitude is used as its value.|`527`|
|altitudeOffset|no|Number||Height offset for display in 3D mode in meters. If given, any existing z coordinates will be increased by this value. If no z coordinate exists, this value is used as z coordinate.|`10`|
|gfiTheme|yes|String/Object||Display style of GFI information for this layer. Unless `"default"` is chosen, custom templates may be used to show GFI information in another format than the default table style.|`"default"`|

**GeoJSON layer example:**

```json

    {
      "id" : "11111",
      "name" : "lokale GeoJSON",
      "url" : "myJsons/test.json",
      "typ" : "GeoJSON",
      "gfiAttributes" : "showAll",
      "layerAttribution" : "nicht vorhanden",
      "legendURL" : "",
      "gfiTheme": "default"
   }
```

***

## Heatmap layer

|Name|Required|Type|Default|Description|Example|
|----|--------|----|-------|-----------|-------|
|id|yes|String||Arbitrary id|`"11111"`|
|layerAttribution|no|String|`"nicht vorhanden"`|Additional layer information to be shown in the portal's control element *LayerAttribution*, if configured to appear. If `"nicht vorhanden"` (technical key meaning "not available") is chosen, no layer attribution is shown.|`"nicht vorhanden"`|
|name|yes|String||Arbitrary display name used in the layer tree.|`"My heatmap layer"`|
|typ|yes|String||Service type; in this case, `"Heatmap"`. |`"Heatmap"`|
|attribute|no|String|`""`|Attribute name. Only features holding "key" and "value" will be used.|`"attr1"`|
|value|no|String|`""`|Attribute value. Only features holding "key" and "value" will be used.|`"val1"`|
|radius|no|Number|`10`|Radius of a heatmap feature.|`10`|
|blur|no|Number|`15`|Blur of heatmap features.|`15`|
|gradient|no|String[]|`["#00f", "#0ff", "#0f0", "#ff0", "#f00"]`|Heatmap color gradient.|`["#f00", "#0f0", "#00f"]`|
|dataLayerId|yes|String||Id of layer to use for heatmap features.|`"4321"`|

**Heatmap layer example:**

```json
{
    "id": "1234",
    "name": "Heatmap to vector layer 4321",
    "typ": "Heatmap",
    "attribute": "state",
    "value": "charging",
    "radius": 20,
    "blur": 30,
    "gradient": [
      "#ffffb2",
      "#fd8d3c",
      "#fd8d3c",
      "#f03b20",
      "#bd0026"
    ],
    "gfiAttributes": "ignore",
    "dataLayerId": "4321"
}
```

***

## 3D Object Layer TileSet

|Name|Required|Type|Default|Description|Example|
|----|--------|----|-------|-----------|-------|
|datasets|no|**[datasets](#markdown-header-wms_wfs_datasets)**/Boolean||Metadata specification. All metadata the layer data is referenced here. On clicking the "i" button in the layer tree, the information is retrieved by the CSW interface and shown to the user. For this, the **[rest-services.json](rest-services.json.md)** has to provide the URL of the metadata catalog resp. its CSW interface. The values *kategorie_opendata*, *kategorie_inspire*, and *kategorie_organisation* are used for layer categorization if the **[config.json](config.json.md)** has `treeType` set to `"default"`. To remove the "i" button altogether, explicitly set `"datasets": false`.||
|gfiAttributes|yes|String/**[gfiAttributes](#markdown-header-gfi_attributes)**||GFI attributes to be shown.|`"ignore"`|
|id|yes|String||Arbitrary id|`"44"`|
|layerAttribution|no|String|`"nicht vorhanden"`|Additional layer information to be shown in the portal's control element *LayerAttribution*, if configured to appear. If `"nicht vorhanden"` (technical key meaning "not available") is chosen, no layer attribution is shown.|`"nicht vorhanden"`|
|legendURL|yes|String/String[]||_Deprecated, please use "legend"._ Link to static legend image. `"ignore"`: No image is retrieved, `""` (empty string): The service's *GetLegendGraphic* is called.|`"ignore"`|
|legend|no|Boolean/String/String[]||Value of the **[services.json](services.json.md)** file. URL to be used to request a static legend image. Use a boolean value to dynamically generate the legend from a WMS request or the WFS styling respectively. Use a string to link an image or a PDF file.|`false`|
|name|yes|String||Arbitrary display name used in the layer tree.|`"Traffic situation on freeways"`|
|hiddenFeatures|no|Array||List of ids describing features to hide|`["id_1", "id_2"]`|
|typ|yes|String||Service type; in this case, `"TileSet3D"`.|`"TileSet3D"`|
|url|yes|String||Dienste URL|`"https://geodienste.hamburg.de/buildings_lod2"`|
|cesium3DTilesetOptions|no|**[cesium3DTilesetOptions](https://cesiumjs.org/Cesium/Build/Documentation/Cesium3DTileset.html)**||Cesium 3D tileset options directly forwarded to the cesium tileset object. E.g. `maximumScreenSpaceError` can be used for distance visibility.|
|useProxy|no|Boolean|`false`|_Deprecated in the next major release. *[GDI-DE](https://www.gdi-de.org/en)* recommends setting CORS headers on the required services instead._ Only used for GFI requests. The request will contain the requested URL as path, with dots replaced by underscores.|`false`|

**Tileset example:**

```json
{
    "id": "buildings",
    "name": "Buildings",
    "url": "https://geodienste.hamburg.de/b3dm_hamburg_lod2",
    "typ": "Tileset3D",
    "gfiAttributes": "showAll",
    "layerAttribution": "nicht vorhanden",
    "legend": false,
    "hiddenFeatures": ["id1", "id2"],
    "cesium3DTilesetOptions": {
        "maximumScreenSpaceError": 6
    },
    "datasets": [
        {
            "md_id": "2FC4BBED-350C-4380-B138-4222C28F56C6",
            "rs_id": "HMDK/6f62c5f7-7ea3-4e31-99ba-97407b1af9ba",
            "md_name": "LOD 2 Gebäude",
            "bbox": "461468.97,5916367.23,587010.91,5980347.76",
            "kategorie_opendata": [
                "LOD 2 Gebäude"
            ],
            "kategorie_inspire": [
                "LOD 2 Gebäude"
            ],
            "kategorie_organisation": "Behörde für Wirtschaft, Verkehr und Innovation"
        }
    ]
}
```

***

## Terrain3D Quantized Mesh Dataset

|Name|Required|Type|Default|Description|Example|
|----|--------|----|-------|-----------|-------|
|datasets|no|**[datasets](#markdown-header-wms_wfs_datasets)**/Boolean||Metadata specification. All metadata of the layer data is referenced here. By clicking the "i" button in the layer tree, the information is retrieved by the CSW interface and shown to the user. For this, the **[rest-services.json](rest-services.json.md)** has to provide the URL of the metadata catalog resp. its CSW interface. The values *kategorie_opendata*, *kategorie_inspire*, and *kategorie_organisation* are used for layer categorization if the **[config.json](config.json.md)** has `treeType` set to `"default"`. To remove the "i" button altogether, explicitly set `"datasets": false`.||
|id|yes|String||Arbitrary id|`"44"`|
|layerAttribution|no|String|`"nicht vorhanden"`|Additional layer information to be shown in the portal's control element *LayerAttribution*, if configured to appear. If `"nicht vorhanden"` (technical key meaning "not available") is chosen, no layer attribution is shown.|`"nicht vorhanden"`|
|legendURL|yes|String/String[]||_Deprecated, please use "legend"._ Link to static legend image. `"ignore"`: No image is retrieved, `""` (empty string): The service's *GetLegendGraphic* is called.|`"ignore"`|
|legend|no|Boolean/String/String[]||Value of the **[services.json](services.json.md)** file. URL to be used to request a static legend image. Use a boolean value to dynamically generate the legend from a WMS request or the WFS styling respectively. Use a string to link an image or a PDF file.|`false`|
|name|yes|String||Arbitrary display name used in the layer tree.|`"Charging locations"`|
|typ|yes|String||Service type; in this case, `"Terrain3D"`.|`"Terrain3D"`|
|url|yes|String||Service URL|`"https://geodienste.hamburg.de/terrain"`|
|cesiumTerrainProviderOptions|no|**[cesiumTerrainProviderOptions](https://cesiumjs.org/Cesium/Build/Documentation/CesiumTerrainProvider.html)**||Cesium TerrainProvider options directly forwarded to the Cesium TerrainProvider. E.g. `requestVertexNormals` can be used for object shading.|
|useProxy|no|Boolean|`false`|_Deprecated in the next major release. *[GDI-DE](https://www.gdi-de.org/en)* recommends setting CORS headers on the required services instead._ Only used for GFI requests. The request will contain the requested URL as path, with dots replaced by underscores.|`false`|

**Terrain example:**

```json
   {
      "id" : "buildings",
      "name" : "Terrain",
      "url" : "https://geodienste.hamburg.de/terrain",
      "typ" : "Terrain3D",
      "gfiAttributes" : "showAll",
      "layerAttribution" : "nicht vorhanden",
      "legend" : false,
      "cesiumTerrainProviderOptions": {
        "requestVertexNormals" : true
      },
      "datasets" : [
         {
            "md_id" : "2FC4BBED-350C-4380-B138-4222C28F56C6",
            "rs_id" : "HMDK/6f62c5f7-7ea3-4e31-99ba-97407b1af9ba",
            "md_name" : "Terrain",
            "bbox" : "461468.97,5916367.23,587010.91,5980347.76",
            "kategorie_opendata" : [
               "Terrain"
            ],
            "kategorie_inspire" : [
               "Terrain"
            ],
            "kategorie_organisation" : "Behörde für Wirtschaft, Verkehr und Innovation"
         }
      ]
   }
```

***

## Oblique Layer

|Name|Required|Type|Default|Description|Example|
|----|--------|----|-------|-----------|-------|
|datasets|no|**[datasets](#markdown-header-wms_wfs_datasets)**/Boolean||Metadata specification. All metadata of the layer data is referenced here. By clicking the "i" button in the layer tree, the information is retrieved by the CSW interface and shown to the user. For this, the **[rest-services.json](rest-services.json.md)** has to provide the URL of the metadata catalog resp. its CSW interface. The values *kategorie_opendata*, *kategorie_inspire*, and *kategorie_organisation* are used for layer categorization if the **[config.json](config.json.md)** has `treeType` set to `"default"`. To remove the "i" button altogether, explicitly set `"datasets": false`.||
|id|yes|String||Arbitrary id|`"44"`|
|layerAttribution|no|String|`"nicht vorhanden"`|Additional layer information to be shown in the portal's control element *LayerAttribution*, if configured to appear. If `"nicht vorhanden"` (technical key meaning "not available") is chosen, no layer attribution is shown.|`"nicht vorhanden"`|
|name|yes|String||Arbitrary display name used in the layer tree.|`"Charging locations"`|
|typ|yes|String||Service type; in this case, `"Oblique"`.|`"Oblique"`|
|hideLevels|no|Number||Amount of image levels of the image pyramid not to be shown.|`0`|
|minZoom|no|Number||Minimal zoom level 0 shows the complete oblique image.|`0`|
|terrainUrl|no|String||URL to the *Cesium Quantized Mesh Terrain* dataset.|`"https://geodienste.hamburg.de/terrain"`|
|resolution|no|Number||Resolution of oblique images in centimeters.|`10`|
|projection|yes|String||Projection of the oblique image layer.|`EPSG:25832`|
|url|yes|String||Service URL|`"https://geodienste.hamburg.de/oblique"`|
|useProxy|no|Boolean|`false`|_Deprecated in the next major release. *[GDI-DE](https://www.gdi-de.org/en)* recommends setting CORS headers on the required services instead._ Only used for GFI requests. The request will contain the requested URL as path, with dots replaced by underscores.|`false`|

**Oblique layer example:**

```json
   {
      "id" : "oblique",
      "name" : "Oblique",
      "url" : "https://geodienste.hamburg.de/oblique",
      "typ" : "Oblique",
      "gfiAttributes" : "showAll",
      "layerAttribution" : "nicht vorhanden",
      "legend" : false,
      "datasets" : [
         {
            "md_id" : "2FC4BBED-350C-4380-B138-4222C28F56C6",
            "rs_id" : "HMDK/6f62c5f7-7ea3-4e31-99ba-97407b1af9ba",
            "md_name" : "Oblique",
            "bbox" : "461468.97,5916367.23,587010.91,5980347.76",
            "kategorie_opendata" : [
               "Oblique"
            ],
            "kategorie_inspire" : [
               "Oblique"
            ],
            "kategorie_organisation" : "Behörde für Wirtschaft, Verkehr und Innovation"
         }
      ]
   }
```

***

## Entities Layer 3D

Used to display 3D models in Gltf or Glb format.

|Name|Required|Type|Default|Description|Example|
|----|--------|----|-------|-----------|-------|
|datasets|no|**[datasets](#markdown-header-wms_wfs_datasets)**/Boolean||Metadata specification. All metadata of the layer data is referenced here. By clicking the "i" button in the layer tree, the information is retrieved by the CSW interface and shown to the user. For this, the **[rest-services.json](rest-services.json.md)** has to provide the URL of the metadata catalog resp. its CSW interface. The values *kategorie_opendata*, *kategorie_inspire*, and *kategorie_organisation* are used for layer categorization if the **[config.json](config.json.md)** has `treeType` set to `"default"`. To remove the "i" button altogether, explicitly set `"datasets": false`.||
|id|yes|String||Arbitrary id|`"41"`|
|layerAttribution|no|String|`"nicht vorhanden"`|Additional layer information to be shown in the portal's control element *LayerAttribution*, if configured to appear. If `"nicht vorhanden"` (technical key meaning "not available") is chosen, no layer attribution is shown.|`"nicht vorhanden"`|
|name|yes|String||Arbitrary display name used in the layer tree.|`"Charging locations"`|
|typ|yes|String||Service type; in this case, `"Entities3D"`.|`"Entities3D"`|
|entities|yes|Array||Models to be shown|`[]`|
|useProxy|no|Boolean|`false`|_Deprecated in the next major release. *[GDI-DE](https://www.gdi-de.org/en)* recommends setting CORS headers on the required services instead._ Only used for GFI requests. The request will contain the requested URL as path, with dots replaced by underscores.|`false`|

**Entity options**

|Name|Required|Type|Default|Description|Example|
|----|--------|----|-------|-----------|-------|
|url|yes|String|`""`|Model URL|`"https://hamburg.virtualcitymap.de/gltf/4AQfNWNDHHFQzfBm.glb"`|
|attributes|no|Object|`{}`|Model attributes|`{"name": "test"}`|
|latitude|yes|Number||Model origin latitude in degree|`53.541831`|
|longitude|yes|Number||Model origin longitude in degree|`9.917963`|
|height|no|Number|`0`|Model origin height|`10`|
|heading|no|Number|`0`|Model origin rotation in degree|`0`|
|pitch|no|Number|`0`|Model pitch in degree|`0`|
|roll|no|Number|`0`|Model roll in degree|`0`|
|scale|no|Number|`1`|Model scale|`1`|
|allowPicking|no|Boolean|`true`|Whether model may be clicked for GFI|`true`|
|show|no|Boolean|`true`|Whether model should be visible (should be `true`)|`true`|

**Entities3D layer example:**

```json
   {
     "id": "gltfLayer",
     "name": "GltfLayer",
     "typ": "Entities3D",
     "layerAttribution": "nicht vorhanden",
     "legend": false,
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
     ],
     "datasets": [
       {
         "md_id": "A39B4E86-15E2-4BF7-BA82-66F9913D5640",
         "rs_id": "https://registry.gdi-de.org/id/de.hh/6D10BE89-636D-4359-8B27-4AB4DCA02F3A",
         "md_name": "Digitales Höhenmodell Hamburg DGM 1",
         "bbox": "461468.97,5916367.23,587010.91,5980347.76",
         "kategorie_opendata": [
           "Geographie, Geologie und Geobasisdaten"
         ],
         "kategorie_inspire": [
           "Höhe"
         ],
         "kategorie_organisation": "Landesbetrieb Geoinformation und Vermessung"
       }
     ]
   }
```

>**[Return to the Masterportal documentation](doc.md)**.
