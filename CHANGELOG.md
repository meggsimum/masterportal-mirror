# Changelog Masterportal
 All important changes in this project are stored in this file.

[Semantic versioning](https://semver.org/spec/v2.0.0.html) is used.

## Known Issues
- 3D: The position indicator inside of a 3D object vanishes when clicking on the object.

---

## Unreleased - in development
### Added
- Issue #530: New checkbox for the print module to disable the auto adjustment of the print mask scale
- WfsSearch result list can now use pagination by filling the resultsPerPage parameter.
- Adds a bitbucket pipeline to run `npm audit` automatically.
- Module `filterGeneral`: wfs filter via server (aka `external wfs filtering`) added
- Added a `showGeographicIdentifier` attribute to be able to use the `geographicIdentifier` to display the gazetteer search result.
- Searchbar: Added a `showGeographicIdentifier` attribute to be able to use the `geographicIdentifier` to display the gazetteer search result.
- Added new layer type OAF (OGCApiFeatures)
- Added "application/json" as supported WMS *GetFeatureInfo* response format
- Added the possibility to load controls as addons, see [description](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev/doc/addOnsVue.md).

### Changed
- Issue #674, #676: addWMS tool and orientation control are now using the CRS of the map instead of hard coded CRS
- Migrated the tool featureLister from Backbone to Vue.
- Issue #684: The download of the draw tool now supports the projection of the map
- Issue #610: Refactor Elastic Search: The CreateHit() function has been modified to allow the Glyphicon and HitType to be assigned from the backend.
- The following NPM packages are updated:
    - jsdoc: 3.6.7 to 3.6.10
    - masterportalapi: 1.10.0 to 2.0.0 (is now loaded via npm and the notation has changed)
- Searchbar:
    - Search results of elasticSearch are now displayed in the search bar in the order they come from the server.
    - The Gazetteer search is now performed via the MasterportalAPI. A new attribute `searchAddress` has been introduced.
    - Addresses pasted with `copy & paste` or the url parameter `query` are now executed directly on exactly one search hit in the gazetteer.
    - The `recommendedList` is now sorted by the attribute `searchResultOrder`.
- Parametric URL: For the URL parameters `QUERY` and `SEARCH/QUERY` the house numbers must now be separated with a blank. This way the call in the URL is always the same as the displayed search result.
- Issue #551: Tools `coordToolKit` and `supplyCoord` are no longer usable in 3d mode due to [limitations of ol-cesium](https://openlayers.org/ol-cesium/apidoc/index.html#limitations).
- The function `makeOberstufenprofileBold` used by the `comparisonList` and `featureLister` is provided as a util named `toBold` now.
- Issue #636: The WMS layer respects crs code at rawlayer. The WMS request now contains the attribute CRS. If not available, projection of the map is used.

### Deprecated

### Removed
- Removed hardcoded LayerIds for 3D support in wms.js. Setting has to be done now via services.json attribute notSupportedIn3D.
- Searchbar: Configuration option of `namespace` was removed from gazetteer search, because masterportalAPI removes namespace from search hits.

### Fixed
- Issue #714: The configuration for the orientation control now accepts "poiDistances":true again. Also fixed a bug with features which have geometry type circle.
- Issue #605: Draw Tool fixed to support not using simple_point as first item of iconList.
- Issue #733, #680, #683: transparency setting has no visible effect in treeType custom
- Issue #701: Secured WMS GFI requests now work. Previously, authorization failed.
- Issue #700: Print tool now updates layout name on initialization.
- Issue #581: Print tool now features a flag "printMapMarker" to optionally print map markers.
- Print will now use serviceUrl when generated
- Issue #696: Draw tool now undoes and redoes drawn features in correct order
- Gfi now remembers position and rotation in dipas
- Issue #740: Adding `name` to `Fachdaten_Zeit` or `Fachdaten_3d` in `config.json` now successfully changes the name of the folder in the layerTree.
- Fix some vulnerabilities in dependencies.
- Issue #710: Routing tool's configuration may be outside the tools sub-menu now.
- Issue #746: Fix issue with playback function of timeSlider (WMS-T) not properly stopping after it reached the end of the time series.
- Issue #708: When adding a new WMS-T Layer previous added WMS-T layer will be removed
- Issue #747: The auto refresh now also works for wms layer again.
- Issue #731: Printing of measured lines works for all cases.
- Categories can be changed in the topic tree even if the topic is closed.
- Issue #745 The TimeSlider will now use the passed playBackDelay.
- Fix loadingParams in oaf.js createLayer - in case of no value undefined is now returned. For the mpAPI it is necessary to return undefined instead of an empty string or null.

---

## v2.19.0 - 2022-03-02
### Added
- The gazetteer search function now supports changing the namespace by configuration.
- Issue #690: Documentation for the menu item `ansichten` (map view points) has been added.
- Issue #685:
  - Dimension/Extent name to use can now be overridden (default is `"time"`).
  - The Extent.default value `"current"` can now be interpreted.
  - The time field of WMS requests is now filled with ISO 8601 timestamps of same precision as Extent specification.
- It is now possible to configure a loading strategy for a wfs layer (default is bbox).
- A new filter module called `filterGeneral` to replace of the `filter` module with a more catchy configuration, new features and new UI.

### Changed
-  Default for isFolderSelectable is true. Overwriteable in config.js (globally) oder config.json(folder specific). Applies only for treeType="custom". In treeType="default" the top folders als not selectable and the child folders are selectable.
-  Print uses formatList from statePrint, instead of all formats from mapfish Server.
-  The following NPM packages are updated:
    - mocha: 9.1.4 to 9.2.0
    - mochapack: 2.1.2 to 2.1.4
    - masterportalAPI: v1.9.0
- The version of node was updated, must be >= 16.13.2 < 17.
- The version of npm  was also updated, must be >= 8.1.2 < 9. (The node and npm versions are still mandatory via .npmrc.).
- Issue #685: Changes WMS-T TimeSlider layout to accomodate larger timestamps.
- Outsourced drawTypeOptions from constantsDraw.js into its own file
- The vectorTile Layer is now refactored to src/core.
- The 3D terrain layer is refactored. It is no longer a Backbone-model.The terrain layer uses the masterportalAPI's terrain layer on creation.
- The 3D tileset layer is refactored. It is no longer a Backbone-model.The tileset layer uses the masterportalAPI's tileset layer on creation.
- Path updated in map and map3d because abstraction in masterportalAPI changed to maps and moved into src
- Checking the allowed version for wfs layers has been moved to the masterportalAPI.
- Migrated the parsing of `rest-services.json` from Backbone to Vue. Backbone components using RestReader are connected using RadioBridge.
- Routing tool: german translation of recommended route was corrected.
- The action Map/HighlightFeature now works for more than one feature, via removeHighlightFeature(feature) an individual highlighting can be removed, or all if no argument is given

### Fixed
- Occasional language name "DE-DE" in the footer was changed to "DE".
- Issue #483/Issue #687: Fixed responsiveness when switching between mobile and desktop
- Issue #694: Folder with subfolders are also selectable. (Internal flag "isLeafFolder" removed)
- Issue #695: Optimised order in if clause. First use "show_doc_url" in layers metadata, then check if service based on the config.js's metaDataCatalogueId exists. otherwise throw console.warn
- Issue #666: The elastic search query string replacement function will now only take effect
  when the configured key did not contain an object.
- Issue #668: `layerInformation` shows legend information only if legendURL is not ignored.
- Config parameters that are an array completely overwrite the default values of the associated array in the store.
- Issue #666: Elastic Search requests utilizing "POST" methods were fixed.
- The GFI is now always shown as selected in the menu when it is enabled.
- Issue #689: `layerSlider` in Handle mode, the layer is now also displayed at the end of the bar.
- A few translation errors were adjusted in config.json.md and config.json.en.md.
- Issue #685:
  - WMS-T now works with all ISO 8601 timestamps (i.e. "2022", "2022-01-26T00:00:00.000Z", and all precision grades in between) as specified by OGC.
  - WMS-T now dynamically finds a layer's Extent/Dimension in GetCapabilities Response (position was hard-wired previously).
- Tool Routing: Exported routes now inherit the style from route view.
- Folder expand/collapse works in background maps, if treetype is 'custom'.
- Issue #637, Issue #656: If background maps are configured in folder structures, then when such a background map is activated, no more subject data are overlaid.
- Tool print: printing of the measurement result is fixed.
- Tools Draw and File import: Exported and re-imported drawn circles are now editable with the expected behaviour.
- Newsfeed:
    - Alert now also works with portal calls with index.html and url parameter.
    - News is now displayed in an iframe. If no third party cookies are allowed by the browser, no confirm is possible, because it is not allowed to store in localstorage.
    - Added the possibility to scroll in the alert.
- Issue #671: Tool print: once selected scale is not set back on move print cutout.
- Fix loadingParams in wfs.js createLayer - in case of no value undefined is now returned. For the mpAPI it is necessary to return undefined instead of an empty string or null.

---

## v2.18.0 - 2022-02-03
### Added
- Package vue-multiselect: 2.1.6 is installed.
- Vector Tiles:
    - For vector tiles layers that are not in EPSG:3587, the default Mapbox resolutions are now used as fallback.
    - In addition, a minimum and maximum zoom level can be configured.
    - The `zDirection` can be used to specify, if the resolutions of the service and the portal are different, in which direction the resolution should be used.
- Added WFS functions (GetFeature and DescribeFetureType) to the api folder to query the WFS-Requests in one place.
- The VectorBaseLayer is refactored. It is no longer a Backbone-model. The VectorBaseLayer uses the masterportalAPI's vectorBase layer on creation.
- The elastic search is now refactored.

### Changed
- It is now possible to display layers at scales smaller than 1:1 000 000.
- Migrated the layer GeoJSON from Backbone.js to Vue.js environment.
- The following NPM packages are updated:
    - @babel/core: 7.16.0 to 7.16.12
    - @babel/eslint-parser: 7.16.0 to 7.16.5
    - @babel/preset-env": 7.16.0 to 7.16.11
    - @masterportal/mpconfigparser: 1.1.2 to 1.2.0
    - @sinonjs/fake-timers: 7.1.2 to 8.1.0
    - @vue/test-utils": 1.2.2 to 1.3.0
    - axios: 0.21.1 to 0.25.0
    - css-loader: 1.0.0 to 1.0.1
    - dotenv: 10.0.0 to 11.0.0
    - eslint: 7.31.0 to 8.7.0 (In this context the code was adapted to new linter rules)
    - eslint-plugin-chai-friendly: 0.7.1 to 0.7.2
    - eslint-plugin-vue: 7.14.0 to 8.3.0 (In this context the code was adapted to new linter rules)
    - eslint-plugin-vuejs-accessibility: 1.1.0 to 1.1.1
    - html2canvas: 1.1.3 to 1.4.0
    - husky: 7.0.1 to 7.0.4
    - i18next: 20.3.3 to 21.6.7
    - i18next-browser-languagedetector: 6.1.2 to 6.1.3
    - i18next-http-backend: 1.2.6 to 1.3.2
    - imports-loader: 1.0.0 to 1.2.0
    - inquirer: 8.1.2 to 8.2.0
    - jsts: 2.7.1 to 2.8.1
    - masterportalAPI: v1.8.0 (This also raised ol to version 6.11.0)
    - mocha: 9.1.3 to 9.1.4
    - mock-local-storage: 1.1.17 to 1.1.19
    - moment-timezone: 0.5.33 to 0.5.34
    - mqtt: 4.2.8 to 4.3.4
    - node-fetch: 2.6.1 to 3.1.0
    - regenerator-runtime: 0.13.7 to 0.13.9
    - replace-in-file: 6.2.0 to 6.3.2
    - sass: 1.44.0 to 1.45.2
    - selenium-webdriver: 4.1.0 to 4.1.1
    - sinon: 11.1.1 to 12.0.1
    - vue-loader: 15.9.6 to 15.9.8
    - webpack-cli: 3.3.11 to 3.3.12
    - webpack-dev-server: 3.11.0 to 3.11.3
    - zip-a-folder: 1.1.0 to 1.1.3
- The version of node was updated, must be >= 14.18.3 < 15.
  The version of npm  was also updated, must be >= 6.14.15 < 7. The file .npmrc was added to set "engine-strict=true", as a result, the npm version and the node version are mandatory. (It is planed that node will be updated to LTS in version 16).
- Migrated the module mapView from Backbone to Vue.
- Migrated the module vectorBaseLayer from Backbone to Vue. The VectorBaseLayer uses the masterportalAPI's vectorBase layer on creation.
- Issue #655: A parameter "zoomLevel" was added to the WfsSearch tool. This feature was not implemented for WfsSearch, but available in the previously used tool parcelSearch. The field has been added to WfsSearch to work in the same fashion. For this, the ListItem.vue was changed to allow configuration of the zoom level via prop. It defaults to the previously fixed value.
- Issue #486: WMS GFI can now show responses without tbody.
- The Vue component `Tool` has been renamed to `ToolTemplate` due to a new linter rule.

### Deprecated

### Removed
- The following NPM packages are removed:
    - mocha-loader
    - ol-mapbox-style (Is loaded via ol)
    - polyfill-object.fromentries
    - whatwg-fetch

### Fixed
- Issue #661: `print` downloadlink is now created for serviceUrls with structure `https://baseurl/printfolder/` or `https://baseurl/printfolder/print/`.
- Issue #679: `saveSelection` is now configurable again within the layer tree.
- Fixed spelling of `DIRECTIONS` in documentation for routing tool.
- Tool CoordToolkit: Labeling of longitude and latitude corrected if long/lat is selected as projection system.
- Fixed issue #672: layerAttribution not working correctly if layer is not initially visible
- Issue #673: LayerSlider: The progress bar is now displayed correctly with more than 10 configured layers.
- 3D: terrain and background layer are displayed correctly. Loading portal in 3D by url parameters was fixed.
- Issue #655: Only first namespace in WfsSearch was interpreted. Now, all configured namespaces are used.

---
## v2.17.1 - 2022-01-011
### Changed
- The MasterportalAPI version is updated to v1.7.1. This fixes reading of WFS-Layer, the WFS version is taken into account when generating the WFS format.

---
## v2.17.0 - 2022-01-05
### Added
- Added style.json parameter "rotation" to wfs features with iconPointStyle, if the parameter is not given it will fall back to standard alignment.
- Added the possibility to configure a predefined order of selected layers.
- Feature: List component supports onRowClick callback
- The following NPM packages are added:
    - dependencies:
        - "bootstrap-sass"
- Extended CSW processing for download links in layerInformation by CSW 2.0.2 standard.
- The tool "featureLister" has been extended and now also highlights lines and polygons on mouse-over over the feature name.
- Added the possibility to use the High Resolution Plot Service

### Changed
- Migrated the map from Backbone.js to Vue.js environment.
- Migrated the layer wmsTime and WMTS from Backbone.js to Vue.js environment.
- WfsSearch:
    - Update documentation.
        - Change parameter `wfsSearch.searchInstance.requestConfig.gazetteer` from a `Boolean` to an `Object`. Move parameters `namespaces` and `memberSuffix` to that Object.
        - Change parameter `nameSpaces` to `namespaces` to be inline with the rest of the configuration.
    - Allow parameter `namespaces` to also be a single String instead of always expecting an array.
- Switched CSS Preprocessor from LESS to SCSS. Edited Webpack Config, renamed .less files to .scss files including renaming of variables and mixins to match scss syntax. Edited vue components to use scss. Edited backbone modules to use scss files. Edited docs accordingly.
- The following NPM packages are changed:
  - devDependencies:
    "less" => "sass", "less-loader => "sass-loader"
- The WFSLayer is refactored. It is no longer a Backbone-model. The WFSLayer uses the masterportalAPI's wfs layer on creation.
- The following NPM packages are updated:
    - @masterportal/mpconfigparser: 1.1.2 to version 1.2.0
    - masterportalAPI: 1.6.1 to version 1.7.0
    - selenium-webdriver: 4.0.0 version to 4.1.0
- The elastic search now reads out all attributes of a found layer and takes them into account when processing the layer.
- CoordToolkit:
    - Added Buttons to copy one coordinate or both of them with a configurable delimiter. The visibility of the buttons is also configurable.
    - Removed copy of coordinates if click in input-field.

### Deprecated
- Parametric URL: all deprecation-warnings are removed, besides STARTUPMODUL and BEZIRK.

### Removed
- WMS-layer: Hamburgensie for web_atlasde has been removed.
- AddWMS: HH-specific WMS-URL example has been removed.

### Fixed
- WfsSearch:
    - Add namespace to the filter as otherwise the features are not properly filtered.
    - Fix reset UI button.
    - Add missing error translation for wrong config.
- SelectFeatures:
- The 'Select Features' tool can now also be used to select lines.
- Print:
    - The canvas is now drawn on the top layer after a new layer is switched on in the topic tree.
    - When printing is opened initially, the canvas is now always drawn on the top layer.
    - Grouplayer legends are now printable.
- Parametric URL:
    - Layers can be loaded by mdid value.
- Topic tree:
    - In the "light" type topic tree, layers loaded via url parameters are now sorted correctly.
    - Expanding transparency under 'Subject data' and 'Selected topics' now synchronous.
    - Only the selected cog will rotate.
    - The layer order is now preserved in all trees when switching on and off.
- ObliqueMap:
    - All layers that are not of type "Oblique" are not visible.
    - An error that occurred after turning the oblique map on and off is fixed.

---

## v2.16.2 - 2021-12-09
### Fixed
- Clustered features are displayed correctly.

---

## v2.16.1 - 2021-12-08
### Removed
- Remove the unnecessary alert for the parametricUrl.

### Fixed
- Set the library core-js to the version 3.15.2 to fix iterations of DOM elements.
- Fixed the parser function which convert xml to json.
- Fix WMS requests from degree services by renaming parameter `SESSIONID` to `CACHEID`.

---

## v2.16.0 - 2021-12-01
### Added
- The library "svg-url-loader" was added to package.json devDependencies.
- Added the new Tool `Routing`.
- Searchbar: An option "sortByName" in gdi to config if the rearching results from elastic sorted alphanumerically or not.
- Parametric URL: An alert has been added which displays the new notation of a parameterized call.
- Handling of polygons with holes to WKT geometry parsing.

### Changed
- The following NPM packages are updated:
    - @babel/core": 7.14.6 to 7.16.0
    - @babel/eslint-parser: 7.14.7 to 7.16.0
    - @babel/preset-env: 7.14.7 to 7.16.0
    - @vue/test-utils: 1.2.1 to 1.2.2
    - babel-loader: 8.2.2 to 8.2.3
    - eslint-plugin-vuejs-accessibility: 0.7.1 to 1.1.0
    - mocha: 9.0.2 to 9.1.3
    - selenium-webdriver: 4.0.0-beta.4 to version 4.0.0
- The MasterportalAPI version is updated to v1.6.0. This also raised ol to version 6.9.0.
- WMSLayer and GroupLayer are refactored. They are no longer Backbone-models. WMSLayer uses the masterportalAPI's wms layer on creation.
- 2D-map is removed from vuex store. Maps are now stored in a collection. Creation of 2D-map and 3D-map use masterportalAPI's abstraction layer.
- Print formats only contain working formats now.
- QuickHelp: moved to Vue and refactored, can now be manipulated for search, tree and routing, new QuickHelp windows can be configured. See new quickHelp.md documentation for more details.
- Migrated the layerSlider tool from Backbone.js to Vue.js.

### Removed
- The module CLICKCOUNTER is removed.
- The library "olcs" was removed from the package.json.

### Fixed
- Tool Print:
    - Fixed wrong order of features in created print-map.
    - If tool was activated by url parameter, print-mask is now visible and scales are selectable
- Adding a File with other coordinate system may work now if the coordinate system in the JSON is EPSG 25832/4326 or can successfully be mapped to EPSG
- Issue #654: WFS Layers didn't get displayed as group layers
- Light-tree: Layers that are only selectable in certain zoom levels are now also grayed out directly after startup.
- Tool wfsSearch: Zoom to a hit in the result list works now again
- Sidebar: If a tool was activated by url parameter and user opens second tool, the first tool is closed now
- Searchbar: Searches that deliver only a single search result can now be selected with `Enter`.
- Handling of Multipolygons in WKT geometry parsing
- GFI: in the iframe the content is now displayed again when using the `desktopType` `attached`.
- GFI for theme datatable is displayed. Resolution at wms layer is set correctly.

---

## v2.15.0 - 2021-11-03
### Added
- gfiAttributes: Adding Boolean type in gfi Attributes so that the original text can be parsed to be more understandable.
- layerInformation: Adding a parameter to globally toggle the display of the service url for all layers at the same time.
- measure: Adding a parameter to define with which decimal accuracy the measurement result is displayed.
- Tools: Adding a new tool `resetTree` in addons.
- Tools: Adding a new tool `layerClusterToggler` to enable the cluster layers to be active and deactive together.
- Menu: Adding transparency bar for all the layes in menu tree.
- A locale file for the Turkish language was added.

### Changed
- Coding-Conventions: For unittests in Vue (/src/...) the vast majority of test-folders are called "tests", going back to a mutual understanding of folder naming. Please use "tests" for your unit or e2e tests in Vue in the future.
- Migrated the print Tool from Backbone.js to Vue.js. It is now also possible to create multiple prints in parallel.

### Deprecated

### Removed
- src/utils function isArrayOfStrings is removed, use one liner .every(v => typeof v === "string") instead in the future.
- The libraries `d3.js` and `d3-scale-chromatic` were removed from the package.json.
- The module `graph` which is based on d3.js has been removed. Now the library`charts.js` is used.

### Fixed
- The portalTitle in the config.json without a logo is rendered correctly.
- Loading layerIds in combination with a config via the url now also works with the treetype 'custom' in the config.
- When changing the coordinate system in the Coordinates tool, the incorrect recalculation of the coordinates was corrected: Default values of the coordinate search are now the values of the map center. An error in the display of the coordinate systems (EPSG-code was shown twice) was also fixed.
- The search in the coordinates tool now also works with different map projections of the masterportal view.
- Fixed missing highlighting in years 2010-2014 and remove of highlighting when selecting another year in addon boris.
- For long lists the compare-feature-window provides now a scrollbar.

---

## v2.14.0 - 2021-10-06
### Added
- Add possibility to test end2end-tests with `MicrosoftEdge` driver.
- VTC-Layer supports Sprites and Fonts in Styledefinitions.
- Embedded nav into header tag.
- Added the new Tool `WfsSearch`.
- EsLint Plugin for a11y in Vue files.
- New parameter "searchResultOrder" for ranking category of searching result.
- New csv specialized export button "ExportButtonCSV" is now integrated in Vue.js.
- Function in src/utils/translateKeyWithPlausibilityCheck.js to prevent a text with ":" in it to be recognized as translation key.
- Migrated the Parametric URL from Backbone.js to Vue.js. Previous parameters are supported up to version 3.0.0, see also doc/urlParameter.md.

### Changed
- Accessibility: Changed contrast ratio > 3:1 in all tools, themes, etc.
- Moved SensorThingsMqtt and SensorThingsHttp to /src/utils, complete refactoring of SensorThingsMqtt, there are no changes in handling SensorThingsMqtt.
- Changed anchor from div to main class and footer from div to footer class.
- Pulled footer out of elements on map and made it part of App.vue.
- Moved convertArrayOfObjectsToCsv to /src/utils/convertJsonToCsv.js with refactoring, removed convertArrayOfObjectsToCsv Event from Radio.
- The scale display of the map has now new scale steps: above 10.000 it is rounded to five hundreds (e.g. 10250 -> "1 : 10.500"), scale of 1.000 up to 10.000 is rounded to its fifties (e.g. 1025 -> "1 : 1.050").
- Searchbar topics are now configurable with i18next.

### Removed
- SensorThingsHttp: the option to use onprogress event when calling get or getInExtent is removed. The onprogress technic uses the addition "&$count=true" at the STA url to calculate the progress. This addition to the url slowes down the FROST server significantly and is therefore not longer supported.
- The url parameter CLICKCOUNTER was removed.

### Fixed
- Draw tool: fixed an issue (Bitbucket: #638) with resaving draw files.
- Print tool: fixed an issue when printing a styled WFS layer with a `labelField` in its style. Before, this lead to the same label being printed for every feature.
- STA Mqtt: "WebSocket connection to 'wss://localhost/mqtt' failed" is fixed with refactoring of SensorThingsMqtt.
- AddWMS tool: WMS services can be added again. Tool adapted to modified parser method.
- Minor fixes in all Vue files for a11y errors from new EsLint plugin.
- LayerInformation: setting the title directly from Metadata without translation.
- CoordToolkit: projection name is shown correctly if no title is defined.

---

##  v2.13.1 - 2021-09-03
### Fixed
- Downgrade the follow npm packages to fix the compass in 3D mode:
 - css-loader from 4.3.0 to 1.0.0
 - file-loader from 6.2.0 to 2.0.0

---

##  v2.13.0 - 2021-09-01
### Added
- Migrated the Parametric URL from Backbone.js to Vue.js. Previous parameters are supported up to version 3.0.0, see also doc/urlParameter.md.
- Autocomplete functionality for the contact tool.
- A library for standard colors and barrier free colors "src/utils/colors.js" to use within javascript, with initial colors/colorsets: MP standard blue; MP standard red; Color Universal Design by "J*Fly data depository for Drosophila reserchers" (https://jfly.uni-koeln.de/color/ - 7 colors); three additional color sets "Hamburg blue scheme" (10 colors), "blue scheme plus" (10 colors) and "traffic light scheme" (7 colors) contributed by the IfBQ of Hamburg Town.
- Issue #631: Adds a tutorial to use the remote interface in an iFrame.
- Added the possibility to configure the size of the iframe in GFI when using the gfiTheme `default` on a layer in config.json. Works only in conjunction with the `infoFormat: "text/html"`.
- Added possibility in GFI theme Default to configure `max-width` in config.json.
- New Searchbar-Module for Komoot Photon.
- A flag "beautifyKeys" for gfi params to enable/disable the beautifyKeys function in default gfi theme.
- A flag "showObjectKeys" for gfi params to display attribute keys and values of objects in default gfi theme.
- Added a new type for filter attributeWhitelist "date", which uses a slider for a date range. Use "format" to specify date format and "attrNameUntil" for a different attribute to be the end date of your range.
- Added the new layer type 'WMS-T' along with its manipulation functionalities 'TimeSlider' and 'LayerSwiper'.

### Changed
- Modal dialogues are now marked as alerts so that screenreaders pick them up on appearing.
- LayerInformation now shows message in case the MetaData couldn't be loaded
- Footer allows additionally to open vue tools besides backbone tools.
- changed contrasts of elements in footer, filter and the mouse position widget for better accessability
- Accessibility: Keyboard navigation for tools
  - You can reach every opened tool via keyboard (TAB-key) direct after the top menu row
  - After opening a tool the focus is set to the first control (if any available)
  - LayerInfo and Quickhelp are toggleable (on/off)
    - LayerInfo via the info menu icon (theme menu)
    - Quickhelp via the question icon in the searchbar (top menu)
- GFI: order of Gfis is reversed now, so that the top layer ones come first
- NPM packages https-proxy-agent, vue-loader, vue-template-compiler are moved from dependencies to devDependencies in package.json.
- In the default GFI theme, images that are in the tag `"Bild"` or `"bild"` of a WMS GetFeatureInfo are now rendered as images by default.
- Images from google-maps or -earth (gstatic.com) from KML files are now requested via a reverse proxy, since no CORS is set up there.
- The MasterportalAPI version is updated to v1.5.0. This also raised ol to version 6.6.1
- The following NPM packages are updated:
  - dependencies:
    axios: 0.19.0 to version 0.21.1
    backbone.radio: 1.x to version 2.x
    bootstrap-datepicker: 1.8.x to version 1.9.x
    core-js: 3.10.1 to version 3.15.2
    dom-parser: 0.1.5 to version 0.1.6
    html2canvas: 1.0.0-rc.5 to version 1.1.3
    i18next: 19.0.1 to version 20.3.3
    i18next-browser-languagedetec to versionr: 4.0.1 to version 6.1.2
    i18next-http-backend: 1.0.8 to version 1.2.6
    imports-loader: 0.8.0 to version 1.0.0
    moment-timezone: 0.5.28 to version 0.5.33
    mqtt: 4.x to version 4.2.8
    object-hash: 2.0.3 to version 2.2.0
    ol-mapbox-style: 6.3.2 to version 6.4.1
    olcs: 2.12.0 to version 2.13.0
    vue: 2.6.11 to version 2.6.14
    vuex: 3.1.2 to version 3.6.2

  - devDependencies:
    @babel/core: 7.13.15 to version 7.14.6
    @babel/eslint-parser: 7.14.3 to version 7.14.7
    @babel/preset-env: 7.13.15 to version 7.14.7
    @intlify/vue-i18n-loader: 0.6.1 to version 2.1.2
    @masterportal/mpconfigparser: 1.1.1 to version 1.1.2
    @vue/test-utils: 1.0.2 to version 1.2.1
    canvas: 2.6.1 to version 2.8.0
    chai: 4.1.1 to version 4.3.4
    css-loader: 1.0.0 to version 4.3.0
    dotenv: 8.2.0 to version 10.0.0
    eslint: 7.28.0 to version 7.31.0
    eslint-plugin-vue: 7.11.1 to version 7.14.0
    file-loader: 2.0.0 to version 6.2.0
    fs-extra: 9.0.0 to version 10.0.0
    husky: 4.3.8 to version 7.0.1
    https-proxy-agent: 3.0.0 to version 5.0.0
    inquirer: 6.2.0 to version 8.1.2
    jaguarjs-jsdoc: 0.0.1 to version 1.1.0
    jsdoc: 3.6.3 to version 3.6.7
    jsdom-global: 3.0.2 to version 14.0.0
    less: 3.9.0 to version 4.1.1
    less-loader: 4.1.0 to version 7.3.0
    mocha: 6.2.0 to version 9.0.2
    mocha-loader: 2.0.0 to version 3.0.0
    mock-local-storage: 1.1.15 to version 1.1.17
    null-loader: 4.0.0 to version 4.0.1
    regenerator-runtime: 0.11.0 to version 0.13.7
    replace-in-file: 6.0.0 to version 6.2.0
    sinon: 7.3.2 to version 11.1.1
    sinon-chai: 3.3.0 to version 3.7.0
    vue-template-compiler: 2.6.10 to version 2.6.14
    whatwg-fetch: 3.0.0 to version 3.6.2
    xmlserializer: 0.6.1 to version 0.6.1
    zip-a-folder: 0.0.12 to version 1.1.0

### Removed
- Remove the module cookie, because this is only used in an addon.

### Fixed
- The legend now always renders in the map region even when the sidebar is open. Also, the small optical offset in the menu bar at the legend entry has been removed.
- Layers in the default tree that are grouped by metadata and start with numbers (e.g. 100 Jahre Stadtgrün) can now be opened again.
- The alerting modal now has a padding again.
- Fixed a warning in the console when loading addons.
- When closing the "Draw/Write" tool via the cross, an error no longer occurs.
- Coordinates tool: after switching to 3D mode and back to 2D mode, errors no longer occur.
- Coordinates tool: WGS 84(long/lat) coordinate system: there is no "E" at the end of the Latitude field.
- When starting the 3D map, all tools that do not support 3D mode are closed.
- 3D map: Tools that do not support 3D mode are no longer displayed in the footer.
- Issue #637: Background maps in folder structure no longer overlay subject topics when background map is activated later. Occurred only with treetype custom.
- Coordinates tool: Validation was corrected
- Coordinates tool: EPSG code for coordinate system ETRS89/UTM 32N is shown correct in selectbox
- Opening a tool by footer-link will close a visible tool in sidebar.

---

## v2.12.1 - 2021-08-12
### Fixed
- Drawn content can be printed again.
-	Footer allows additionally to open vue tools besides backbone tools
-	Fixed active graphicalSelect during tool change in addon sdpDownload.

---

## v2.12.0 - 2021-08-04
### Added
- Start of a calendar library "src/utils/calendar.js" with the first function "getPublicHolidays" to get a list of german public holidays using gaussian easter algorithm and advent algorithm.
- Adds the documentation for the datasets attributes `csw_url` and `show_doc_url` in the services.json.md.
- A new Tool named coordToolkit is available. It contains the functionality of the tools supplyCord and searchByCoord. Both provide the same projections configured under the key "namedProjections" in config.js.

### Changed
- The version of the package selenium-webdriver was updated to version 4.0.0-beta.3.
- changed LayerInformation from backbone to vue
- Changed anchor from div to main class and footer from div to footer class
- The GFI in attached mode now dynamically adjusts its size to the content.
- Migrated the CompareFeatures Tool from Backbone.js to Vue.js.
- Accessibility: Implemented keyboard navigation in menu (top-level and themes).
  - implemented keyboard navigation with arrows and tab
  - make all action widgets (checkboxes, icon-buttons, etc) tabable
  - make action execution possible on focused element with space and enter key
  - introduced :hover-color on all focusable elements
  - highlight current focused widget
  - preserve current focus after action execution

### Deprecated
- Tool searchByCoord is deprecated in 3.0.0. Please use "coordToolkit" instead.
- Tool supplyCoord is deprecated in 3.0.0. Please use "coordToolkit" instead.

### Removed
- Support of End2End tests for `Browserstack` has been removed.Instead `saucelabs` is used.

### Fixed
- BG-1541 further metadata link is set on MetaDataCatalogueID from rootgetters now, default is 2
- Labels of VTC-Layer-Objects aren't cut off anymore.
- Issue #626: The Legend menu item is placed according to the order of the menu items in config.json.
- Issue #628: The Legend menu item is now translated correctly again and works as usual after a translation.
- In the layerslider tool, the attribute title can now be overwritten again in config.json.
- Issue #629: In the GFI theme default, the tag name for URLs to images can now be overridden again. In addition, "image" has been added to the defaults.

---

## v2.11.0 - 2021-07-07
### Added
- Add possibility to test end2end-tests with `MicrosoftEdge` driver.
- VTC-Layer supports Sprites and Fonts in Style definitions.

### Changed
- The version of the package selenium-webdriver was updated to version 4.0.0-beta.4.
- Changed LayerInformation from backbone to Vue.
- MasterportalAPI is updated to v1.4.0. The new version brings OpenLayers v6.5.0 with WFS 2.0.0 support to the Masterportal.
- The package eslint was updated to version 7.28.0.
- The package eslint-plugin-chai-friendly was updated to version 0.7.1.
- The package eslint-plugin-vue was updated to version 7.11.1.
- The package eslint-plugin-you-dont-need-lodash-underscore was updated to version 6.12.0.

### Fixed
- Styled Vector Layers with multiple conditions can now be printed.
- Further metadata link is set on MetaDataCatalogueID from rootGetters now, default is 2.
- Labels of VTC-Layer-Objects aren't cut off anymore.
- Issue #602: further metadata link is set on MetaDataCatalogueID from rootGetters now, default is 2.
- Issue #615: parsing of the DescribeFeatureType of a WFS has been extended so that it also satisfies a different interpretation of the schema description. As a result, elements in the legend are displayed in the order specified in the style.json.
- Issue #623: filter error in connection with provided vectorStyles is fixed.
- Style configuration is provided for dataStreams with result 0.
- Seamless map panning in the oblique aerial views is possible in all directions again.

---

## v2.10.0 - 2021-06-02
### Added
- A locale file for Portuguese language was added.
- New WFS Layer attribute "wfsFilter" in configuration to filter the data from wfs layer.
- Added possibility in gfiTheme sensor to display an explanation text for the data.
- Spanish is available as a new language selection.
- New recommended eslint rules were introduced by updates of the eslint packages.

### Changed
- The Id in config.json for every layer could be in an object format, to allow any number of menu entries with the same layer id.
- New Parameter propertyNames could be added in config.json for WFS layer to receive filtered response.
- The documentation for WMTS layers, legend field has been adapted. Only one specification in a string[] is possible.
- The translation for the url in the staticlink in config.json has been removed.
- Issue #617: Update description of the attribute '"extent"' for layer configurations in config.json.md.

### Fixed
- Now Sensor Layer will show 0 if the dataValue is 0 and not "no data".
- In GFI the layerTitle was shortened in case it contains a colon.
- The GFI is now active if this is configured and no other active tool explicitly prevents this.
- Issue #616: Fixed a bug where the live zoom in the tool filter did not take into account the configured minScale.
- Fixed an error that caused the historical data in the gfiTheme sensor to not be formatted correctly at times.
- Issue #618: now the line breaks for long search results.

---

## v2.9.1 - 2021-05-25
### Fixed
- Fixed no data in gfi theme of verkehrs layers in geo-online.

---

## v2.9.0 - 2021-05-05
### Added
- New attribute `nearbyTitle` implemented in config.json for the title in the list of nearby search results.
- Add @babel/eslint-parser to the package.json.
- Added the new tool `BufferAnalysis`.

### Changed
- Renamed the folders `library` and `util` -> `utils`, `test` -> `tests` and `ressources` -> `resources`.
- Tool addons are now also written in config.json in camelCase.
- colorTools are renamed into convertColor (src/utils/convertColor).
- Updates the core-js and babel dependencies in the package.json.
- Update the dependency caniuse-lite.
- The module addGeoJSON switched from backbone to vue and is provided as a util now.
- The loading image is now displayed longer when switching to map mode: Oblique (max. 80000ms).

### Deprecated
- colorArrayToRgb (src/utils/colorArrayToRgb) is deprecated. Use convertColor (src/utils/convertColor) instead.

### Removed
- remove babel-eslint from the package.json
- Documentation files in German language have been removed. From now on the documentation will only be maintained in English. The only exception is config.json.de.md, because a German language file is necessary for the mp-admin.

### Fixed
- Fixed a bug that prevented the gfi of a wms from being requested via a reverseproxy.
- Printing wfs cluster features and features with multiple styles.
- If the transparency of a layer is defined as string, it will be parsed to an integer now.
- When clicking on layers of type TERRAIN3D, TILESET3D or OBLIQUE in the search, a query is now displayed that can be used to switch to the respective map mode.
- Fixed a bug that for the gfi in infoFormat "text/html" did not execute the script part when starting the iFrame.
- Fixed an issue in searchbar, that after finding a result and zooming to it the 3D mode couldn't be activated anymore
- Fixed an issue in fileImport that when the imported KML File is missing the isVisible setting the feature wouldn't be displayed when printing

---

## v2.8.0 - 2021-04-07
### Added
- External WMS Layers with version lower than 1.3.0 can also be imported.
- Added possibility to prepend prefix to GFI attribute.
- WMTS Layers can now be printed with MapFish.
- The user can search visible wfs features by clicking a position on the map by clicking the "Nearby button" on the controls
- The user can search visible wfs features after searching an address from search field by clicking the "Nearby button" on the controls

### Changed
- The tool AddWMS switched from backbone to vue module.
- Consolidate the mqttOptions in the layer sensor with the documentation (services.json.md).
- In config.json.md, the attribute `isActive` was changed to `active` in Portalconfig.menu.tool.gfi.
- Legends are only printed from layers that are switched visible.
- Layers of type `SensorThings` are now automatically displayed in the default topic tree. The attribute `related_wms_layers` can be used to hide related layers of type `WMS`.

### Removed
- SensorThings address tab in layerInformation removed.
- The print module for using mapfishprint v2 has been removed. In this case the attribute `proxyurl` has been removed too
- The vector style module for using the style_v2.json has been removed. In this case the atteibute `useVectorStyleBeta` has been removed too.

### Fixed
- GFI of type text/html now also loads css files of the body.
- Show metadata if the MD_Identification node is implemented as MD_DataIdentification or SV_ServiceIdentification.
- Fixed a bug that made single layer info legend appear multiple times when activating additional layers while opened.
- Printing of tooltip of measure-tool works: The tooltip of the measure tool is no longer implemented as an overlay, it is created now as vectorlayer.
- Printing of big amount of features now works.
- Removed a bug causing an irritating map focus after using BKG search and leave search field

---

## v2.7.2 - 2021-03-09
### Fixed
- SensorThings: Fix the bug where initially data has not been fetched, resulting display of "no data" on mousehover.

---

## v2.7.1 - 2021-03-05
### Fixed
- The representation in the legend has been corrected.

---

## v2.7.0 - 2021-03-03
### Added
- Integration and use of WMS-services secured via User / Password (HTTP-Basic). Thy are marked in the topic tree by lock symbol.
- On draw tool Double Circle configuration available in config.json
- On draw tool Tooltip and Tooltip style configuration available in config.json
- On tools Imported Layer in theme tree integrated function under Addons
- On tools Geometrie/Gebäude Analyse funtion on tools under Addons
- On tools Taktische Zeichen on tools under Addons
- Added the parameters 'contactInfo', 'includeSystemInfo', 'locationOfCustomerService', 'maxLines', 'showPrivacyPolicy' and 'subject' to the configuration of the contact tool.

### Changed
- The language of the changelog has been changed to English.
- Migrated the SearchByCoord Tool from Backbone.js to Vue.js.
- The measure tool has been migrated to Vue.
- Migrated the Download Tool from Backbone.js to Vue.js and integrated it into the Draw Tool.
- Migrated the SaveSelection Tool from Backbone.js to Vue.js. It also no longer has a Radio channel.
- copyToClipboard is now a reusable action and can no longer be triggered through the Radio.
- Migrated the Contact Tool from Backbone.js to Vue.js. In doing so, the functionality of the config parameter 'deleteAfterSend' was split into two parameters; 'closeAfterSend' and 'deleteAfterSend'.
- Migrated the StyleVT Tool from Backbone.js to Vue.js.
- WPS migrated to Vue.js.

### Deprecated
- Deprecated the parameter 'serviceID' for the contact tool; 'serviceId' should be used instead.
- Migrated the SaveSelection Tool from Backbone.js to Vue.js. It also no longer has a Radio channel.
- copyToClipboard is now a reusable action and can no longer be triggered through the Radio.
- Deprecated the parameter `simpleMap` in the config.js and moved its configuration to the `saveSelection` tool in the config.json.

### Removed
- The routing-tool was removed.

### Fixed
- If the Save selection tool is not configured, the button for it is no longer displayed in the topic tree.
- Various bugfixes.

---

## v2.6.3 - 2021-02-12
### Fixed
- Mehrere Darstellungsfehler bei den Layern "Dauerzählstellen (Rad) Hamburg" und "Verkehrsdaten Rad (Infrarotdetektoren) Hamburg" wurden behoben.
- Ein Fehler wurde behoben, durch den bei Maßstabbeschränkten Layern beim Drucken Warnungen ausgegeben wurden,
- obwohl alles in Ordnung war.

---

## v2.6.2 - 2021-02-10
### Changed
- Der Download im Druckmodul wird nun ohne ein Popup durchgeführt. Somit kann der Ausdruck auch mit einem aktiven Popup Blocker heruntergeladen werden.
- Die Italienische Sprachdatei wurde erweitert und angepasst.
- Die Angabe der restrictedAlerts im Alerting Modul ist nun nicht mehr Case-Sensitive
- Die Anzeige der Schrägluftbilder wird im Internet Explorer 11 nicht mehr unterstützt, es erscheint eine Meldung mit dem Vorschlag für diese Funktionalität einen aktuellen Browser zu nutzen.
- Die Beschreibung des Attributes "infoFormat" wurde aus der config.json.md in die services.json.md verschoben.
- Die Angabe von gfiAttributes ist jetzt case-insensitive.
- Im SensorLayer lässt sich das Laden der Observations über retained message nun in der config.json aus- bzw. einschalten.
- Daten aus der SensorThings-API lassen sich nun auch mittles Datastreams als Wurzelelment laden.
- Beim verschieben der Karte werden Features aus der SensorThings-API nun ohne Anzeige des Loaders direkt nachgeladen.

### Fixed
- Ein Fehler wurde behoben, der beim Öffnen des Themenbaumes zu langen Ladezeiten führte.
- Ein Download-Link wurde hinzugefügt, da manche Browser den automatischen Download blockieren.
- Das Alerting Modul ignoriert Groß- und Kleinschreibung beim Filtern der URLs.
- Im Werkzeug WFST wurden einige Bugs behoben. Unter anderem wurden bei Meldungen keine Buttons mehr angezeigt.
- Ein Fehler wurde behoben, der bei geclusterten Features vom Layertyp Sensor dazu führte, dass die Clusterung in einigen Fällen beim Hereinzoomen nicht aufgelöst wurde.
- In bestimmten Fällen wurde beim Drucken eine falsche Url erstellt.
- Bei D3 Grafiken wurden bei der linken Achsen Beschriftung die Tausender Trennzeichen in Anführungszeichen dargestellt.
- Ein Fehler wurde behoben, der auftrat wenn ein Layer angeschaltet wurde, der verschiedene Sonderzeichen im Namen enthielt.
- Wenn der MapMarker in Kombination mit einer Projektion als URL Parameter angegeben wird, wird der MapMarker nun korrekt projiziert.
- Ein Fehler wurde behoben der dazu führte, dass die Legende im Menü angezeigt wurde, auch wenn diese nicht konfiguriert war.
- 3D: Das GFI von Gebäuden zeigt wieder alle verfügbaren Attribute an und das GFI für Brückenflächen wird wieder angezeigt.
- Ein Fehler wurde behoben der verhindert hat, dass eine Get Feature Info für WMS vom Mapserver mit dem "infoFormat": "application/vnd.ogc.gml" angezeigt wurde.
- Wenn Layer über die Url als Parameter selektiert wurden und die Transparenz nicht übergeben wurde, war deren Transparenz im Themenbaum nicht einstellbar, das ist behoben.
- Das Drucken eines Ausschnitts in dem der MapMarker sichtbar ist funktioniert jetzt. Der MapMarker wird im Druck nicht dargestellt.
- Bei der WFS-Suche wurde der Such-Begriff bei der Anfrage fälschlicherweise kodiert, das wurde beseitigt.
- Eine Meldung wurde im IE11 hinzugefügt, dass die Schrägluftbilder nicht unterstützt werden.
- Bei der Legende waren einige Bilder verschwommen dargestelt.

---

## v2.6.1 - 2021-01-07
### Added
- Eine Sprachdatei für Italienisch wurde hinzugefügt.

### Fixed
- Ein Fehler wurde behoben der verhindert hat, dass das Portal vollständig geladen wurde, wenn eine portalLanguage konfiguriert war.
- Die Beschreibung des Attributes portalLanguage wurde aus der doc/config.json.md vollständig enfernt, da die Sprache in der config.js konfiguriert werden muss.
- Die Scale Werte für die Maßstabsanzeige werden nun wieder aus der config.json bzw. aus den Defaults übernommen und angezeigt.
- Ein Fehler wurde beseitigt, der auftrat, wenn zuerst nach einer Kita und danach nach einem Bebauungsplan gesucht wurde.
- Wenn im Maßstab 1:500 gedruckt werden soll, dann wird eine Warnung angezeigt, die die nicht druckbaren Layer nennt. Die Kartenansicht im Browser ändert sich nicht.

---

## v2.6.0 - 2020-12-17
### Added
- Neue Konfigurationsmöglichkeiten für "highlightVectorRules" hinzugefügt.
- Ein neues Tool "Alerting" wurde hinzugefügt.
- i18n wurde für zahlreiche Stellen angepasst.
- Neues Modul "Confirm Action" hinzugefügt.
- RemoteInterface wurde für Vue hinzugefügt.
- Es ist nun möglich, mithilfe des "Datei-Import" Tools eigene GPX und GeoJSON Dateien darzustellen.
- Es gibt nun ein Werkzeug um Daten und Geometrien von Web Feature Services (WFS) zu verändern, mittels WFS Transaction (WFS-T).
- Das Zeichenmodul wurde erweitert, um beim Zeichnen von Punkten verschiedene Glyphicons zu verwenden.
- Es können nun Web Map Tile Services (WMTS) als Layer eingebunden werden.
- Das neue Styling wurde um die Möglichkeit erweitert, die Attribute scalingAttribute und labelAttribute zu konfigurieren.
- Die “gfiAttribute”-keys können jetzt auch Objektpfade sein, analog zum neuen Styling.
- Der Pfad zu den Sprachdateien ist jetzt in der config.js konfigurierbar und kann jetzt eine Funktion, einen Pfad oder ein Url enthalten.
- Es wurde die Möglichkeit hinzugefügt über die URL Features zu übergeben, welche dann in einem GeoJSON-Layer dargestellt werden.
- Es können nun Vector Tile Layer (VTL) als Layer eingebunden werden.
- Für VTL wurde ein Tool hergestellt, mit dem zwischen externen Styles gewechselt werden kann.
- Ein Tool zur vektordienstübergreifenden Auswahl von Features mittels einer aufziehbaren Box wurde hinzugefügt. Das Tool zeigt Feature-Eigenschaften an und bietet eine Zoomfunktion auf sie an.
- Das Tool filter kann nun auch geclusterte Vektordienste filtern.
- Hinzufügen einer zentralen Prüfinstanz, die deprecated Code sucht und ersetzt.
- Im Informationsfenster eines Layers wird ein Hinweistext bez. des Datei-Typs angezeigt, falls im Reiter"Datensatz herunterladen" mehrere Dateien angezeigt werden.
- Highlight von Vector Features ist nach vue umgezogen und konsolidiert. Der Parameter highlightVectorRules beim GFI wird nur vom neuen VectorStylye Version 3 unterstützt.
- Der Parameter allowMultipleQueriesPerLayer, der im Tool Filter ermöglicht, dass mehrere Layer gleichzeitg gefiltert werden können, wurde in der Dokumentation beschrieben.

### Changed
- Im Zuge des internen Umbaus von Backbone.js zu Vue.js wurden zahlreiche Module refactoriert oder neu erstellt. Folgende Module sind jetzt auf Basis von Vue.js: Alerting, ConfirmAction, Controls, Footer, Language, Map, MapMarker, RemoteInterface, ScaleLine, Title, Tools, Zahlreiche weitere Utils.
- Der Ladebildschirm wurde überarbeitet.
- Es werden nun alle URLs vom Portal direkt angefragt, ohne den Umweg über einen Proxy zu gehen, da von der GDI-DE empfohlen wird serverseitig einen CORS-Header einzurichten. Siehe dazu https://www.gdi-de.org/SharedDocs/Downloads/DE/GDI-DE/Dokumente/Architektur_GDI-DE_Bereitstellung_Darstellungsdienste.pdf?__blob=publicationFile Kapitel 4.7.1. Es besteht aber die Möglichkeit gezielt URLs bestimmter Dienste über einen Proxy umzuleiten. Diese Möglichkeit ist jedoch deprecated.
- Das Tool "GFI" wurde überarbeitet und funktioniert nun auf Basis von Vue.js. Gleichzeitig wurden die speziellen Themes ausgelagert als Addons. Es gibt im Masterportal selber nur noch die Themes "default" zur tabellarischen Darstellung und "sensor" zur grafischen Anzeige von Sensordaten mit Zuständen/Status z.B. Elektroladesäulen. Die Verwendung infoFormates "text/html" ist weiterhin möglich, benötigt jedoch eine Tabelle zur Anzeige.
- Im GFI Theme "default" werden Icons eingeblendet, um von dort andere Tools anzusteuern. Zur Verfügung stehen Icons für die Werkzeuge "routing" und "compareFeatures".
- Das Tool "Draw" wurde überarbeitet und funktioniert nun auf Basis von Vue.js. Das Zeichnen von Punkten wurde geändert, alle Punkte basieren jetzt auf Bild-Dateien. Größe und Deckkraft können nicht mehr eingestellt werden, für diese Funktionalität steht das Zeichnen von Kreisen zur Verfügung. Das Bereitstellen von anderen Bilddateien wurde angepasst, siehe Doku der config.json.
- Das Menü wurde dahingehend angepasst, dass für Layer kein Info-Icon angezeigt wird, wenn hierfür explizit "false" in der services-internet.json angegeben wurde.
- Das Tool "KML-Import" wurde überarbeitet und heißt fortan "Datei-Import".
- Babel wurde, um einen Support für alte Browser zu gewährleisten, auf den aktuellen Stand gebracht. Dazu wurde die Bibliothek core-js sowie eine babel.config.js hinzugefügt. Dadurch sind weitere Polyfills, die ES6 betreffen nun nicht mehr notwendig.
- Die Version des Packages fs-extra wurde in der package.json aktualisiert.
- Die Version des Packages replace-in-file wurde in der package.json aktualisiert.
- Die Version des Packages mini-css-extract-plugin wurde in der package.json aktualisiert.
- Die Version des Packages null-loader wurde in der package.json aktualisiert.
- Die Version des Packages https-proxy-agent wurde in der package.json aktualisiert.
- Die Version des Packages zip-a-folder wurde in der package.json aktualisiert.
- Das Package moment-timezone-data-webpack-plugin wurde entfernt.
- In der index.html ist unter der id "loader" und ein neuer css-Loader eingebunden, dessen Darstellung über css geändert werden kann. Oberhalb davon werden Portaltitel und Portallogo während des Ladens des masterportals gezeigt. Sie sind in der index.html unter der id "portal-logo-box" zu finden.
- In der Konfiguration des Werkzeugs "Strecke/Fläche messen" kann jetzt der Erdradius angegeben werden.
- Das Modul MapMarker funktioniert nun auf Basis von Vue.js. Es ist nun möglich den Style für Punkt- und Polygon-Marker in der Style.json zu konfigurieren.
- Bei Tool WMS-hinzufügen, darf externe Layer nur ab Version 1.3 importiert werden.
- Bei Tool WMS-hinzufügen, darf externe Layer außer Portalextent nicht importiert werden.
- Bei Tool Druck, die Layers, die nicht "visible" in Dreuckmaßstab sind, werden "invisible" beim Druck.

### Deprecated
- Die Möglichkeit URLs über einen Proxy umzuleiten (useProxy) ist deprecated.
- RemoteInterface via Backbone Radio ist ab jetzt deprecated.
- WfsFeatureFilter ist deprecated. Bitte das Modul Filter benutzen.
- ExtendedFilter ist deprecated. Bitte das Modul Filter benutzen.
- Das Attribut coord für das Modul zur Koordinatenabfrage ist deprecated. Bitte das Attribut supplyCoord benutzen.

### Removed
- Tool "Alerting" wurde entfernt und durch ein neues Tool ersetzt
- @babel/polyfill wurde aus der package.json entfernt.
- style-loader wurde aus der package.json entfernt.
- es6-promise wurde aus der package.json entfernt.
- url-polyfill wurde aus der package.json entfernt.
- fs wurde aus der package.json entfernt.
- Der Requestor wurde direkt in dem Tool featurelister integriert und daher entfernt.
- Vom Tool "Draw" wird der Typ "glyphicon" nicht mehr von der iconList unterstützt, er wurde entfernt. Es sollen nur Bild-Dateien genutzt werden, siehe Doku der config.json.
- Die Beta-Warnung für die Schrägluftbilder wurde entfernt.

### Fixed
- GFI Darstellung von HTML wurde überarbeitet.
- Mehrere Bugs beim Schulinformationssystem wurden behoben.
- Ein Bug wurde behoben, durch den die Legende bei Gruppenlayern nicht funktionierte.
- Ein Bug wurde behoben, durch den das Mobile Menu doppelt angezeigt wurde.
- Mit Google Earth erstellte KML Dateien werden mit dem Tool "Datei-Import" nun besser dargestellt.
- Ein Problem wurde behoben, durch das der Footer kaputt gegangen ist, wenn keine URLs konfiguriert waren.
- Im Themenbaum wurden fehlende Übersetzungen hinzugefügt und im "custom tree" lassen sich die "Titel" der Ordner jetzt übersetzen.
- Ein Fehler in der VisibleVector Suche wurde behoben. Dieser hatte verhindert, dass Suchergebnisse, die ein Leerzeichen beinhalten, gefunden werden.
- In Geo-Online kann der Marker wieder über die URL gesetzt werden.
- Zeichnen über das remote interface: centerPoint-Koordinaten werden erzeugt und heruntergeladen, kein freehand zu Beginn.
- Im Styling wurde das Feld legendValue nicht ausgelesen. Dies funktioniert nun wieder.
- Im Kontaktformular werden auch Email-Adressen mit einer Domain-Endung die länger als 2 Zeichen ist als gültig anerkannt (z.B. name@foo.hamburg).
- Unstimmigkeiten beim Messen mit dem Werkzeug "Strecke/Fläche messen" wurden beseitigt.
- Ein Problem mit Geo-JSOn Layern wurde behoben.
- In der URL angegebene Layereigenschaften, wie Transparenz werden nun übernommen.
- Viele weitere Bugfixes

---

## v2.5.5 - 2020-09-24
### Fixed
- SpecialWFS sucher funktioniert über mehere angegebene propertyNames im Array.

---

## v2.5.4 - 2020-08-27
### Fixed
- 3D Tileset Layer werden nun korrekt über die Legende aktiviert/deaktiviert
- Ein Fehler in der Suche mittels des Gazetters, der bei Hausnummern mit Zusatz aufgetreten ist wurde behoben.

---

## v2.5.3 - 2020-06-29
### Added
- Multipolygone werden nun von der SpecialWFS Suche verarbeitet. Interne Polygone bspw. von B-Plänen werden fortan berücksichtigt und bei der Darstellung ausgespart.
- Ein Konfigurationsparameter für das ZoomLevel bei der BKG-Suche wurde eingeführt.
- In der BKG-Suche wurden die Parameter zoomToResultOnHover und zoomToResultOnClick zum Steuern der Anzeige der Suchergebnisse eingeführt.

### Changed
- Der erste Buchstabe wird für Einträge in der Legend aus WFS-Diensten nun immer groß geschrieben.
- Das Werkzeug zur Koordinatenabfrage zeigt die Koordinatensysteme nun enstprechend der Reihenfolge der konfigurierten namedProjections aus der config.js an.

### Deprecated
- Der URL-Parameter zoomToResult ist deprecated. Bitte zoomToResultOnHover und zoomToResultOnClick benutzen.

### Fixed
- Die Legende für GruppenLayer wird nun wieder dargestellt.
- Themenbaum/ Externe Fachdaten: Ein visuelles Problem beim Schliessen der Ordners wurde beseitigt.
- Der Titel wird im Druckmodul nun beibehalten wenn der Maßstab geändert oder in der Karte gezoomt wird.
- Die Legende wir für GruppenLayer wird nun nur noch einmal angezeigt.
- Im Ausdrucken aus dem Druckmodul wird nun die Legende für GruppenLayer wieder angezeigt.

---

## v2.5.2 - 2020-06-09
### Fixed
- Die Portal-Konfiguration "singleBaselayer": "true" führt jetzt dazu, dass immer nur ein Hauptlayer ausgewählt werden kann.
- Das Label der Version im Footer wird jetzt korrekt übersetzt.
- Legenden, die den gleichen Namen und das gleiche Image haben, werden nur noch einmal für jeden Layer dargestellt.
- In der Layerinformation wird, wenn keine Metadaten geladen wurden, der Link für "weitere Metadaten" nicht mehr dargestellt.
- Der Infotext für Checkboxen wird nun beim Start nicht mehr ausgeklappt und hat nun den richtigen Style.
- Die Quickhelp wird nun wieder richtig positioniert.

---

## v2.5.1 - 2020-05-29
### Added
- Internationalisierung ergänzt für:
    - den Parameter Flur in der Flurstückssuche
    - den Menüparameter Information
    - die Themenbäume (default und custom)
- Die Konventionen zu folgenden Themen erweitert:
    - Die Nutzung von Underscore.js
    - Ort für Templates
    - Schreiben des Changelogs
- Der Pfad zu den Sprachdateien ist jetzt in der config.js konfigurierbar und kann jetzt eine Funktion, einen Pfad oder eine Url enthalten.
- Es wurde ein Konfigurationsparameter für das Druckwerkzeug eingefügt: currentLayoutName. Dadurch lässt sich das Standardlayout beim Starten des Werkzeugs konfigurieren.

### Changed
- Die Dokumentation wurde an einigen Stellen verbessert und der fehlende Teil für das Werkzeug AddWMS wurde hinzugefügt.
- Die Überschriften in dem Control Layerattributions werden nun in der Schriftgröße 14px und nicht mehr fett dargestellt.
- Die Meldung, die beim Fehlschlagen der GFI angezeigt wird, wurde überarbeitet.
- In den Layerinformationen wird nun der Text "Keine Metadaten vorhanden." angezeigt, wenn keine Daten geladen wurden.
- Bei abrufen des Druckreports wird die printAppId nun im Pfad mit angegeben.

### Deprecated

### Removed
- Underscore.js wurde aus der Package.json entfernt

### Fixed
- Ein Problem wurde behoben, sodass der Maßstab nun auch bei besonders kleinen Maßstäben nicht umbricht.
- Der URL-Parameter "LNG" funktioniert nun ausschließlich wenn die Mehrsprachigkeit in den Portalconfigs aktiviert wurde und wirft keinen Fehler mehr.
- Die Scrollbar beim Starten im IE11 wurde entfernt
- Ein Problem, dass beim parametrisierten Aufruf mit ?config= auftrat, wurde behoben
- Ein Problem wurde behoben, welches mit fehlernder Konfiguration des Portaltitels auftrat
- Das Problem, das bei der Änderung der Sprache bei einem geöffneten Werkzeug auftrat und zu einer falschen Darstellung führte, wurde behoben
- Im Footer können nun wieder eigene Einträge konfiguriert werden, die durch die Mehrsprachigkeit nicht mehr fehlerhaft angezeigt werden.
- Ein Fehler wurde behoben, durch den Werkzeuge nach der Umschaltung der Sprache nicht mehr angezeigt wurden, da dort noch keine Mehrsprachigkeit implementiert ist
- Die fehlerhafte Übersetzung mittels des URL Parameters ?lng= bei nicht konfigurierter Mehrsprachigkeit wurde behoben
- Layer-Info-Fenster ist nun maximal 600px breit
- Sensordaten werden nun wieder live gestylt.
- Bei der Suche nach multipart Polygonen wurde lediglich auf eines der Teilpolygone gezoomt und dieses gehighlighted, nun geschieht dies für das gesamte multipart Polygon.
- Ein Problem beim Anzeigen des Loader-gif wurde behoben.
- Bei Vektordaten (WFS) wird nun auch die Legende wieder aus dem Parameter legendURL ausgelesen, wenn dieser angegeben wurde.
- Bei ausgegrauten Layern wird die Legende nun nicht mehr gedruckt.

---

## v2.5.0 - 2020-04-06
### Added
- CustomTree: Der Parameter singleBaselayer wurde hinzugefügt. Steuert, ob nur ein einzelner Baselayer auf einmal wählbar sein soll oder nicht.
- Sensordaten:
    - Ladestrategien für http- und mqtt-Protokolle wurden in extra Module ausgelagert.
    - Abonnements können auf Browserextent reduziert werden.
    - Abruf von sämtlichen Daten läuft nun komplett asynchron.
    - Letzter Status kann direkt beim Abonnieren geholt werden (Retain-Message).
    - Konfigurierbarkeit für Sensordaten im GFI wurde erweitert.
- GeoJson: Werden als default in EPSG:4326 gelesen, können aber über crs einen eigenen EPSG Code mitgeben.
- Parametric URL: Neue Parameter zoomToExtent und zoomToGeometry, zoomt auf einen in der URL angegebenen Kartenausschnitt bzw. auf eine ausgewählte Geometrie.
- MasterportalAPI: Einbinden der MasterportalAPI als Kern des Masterportals.
- Heatmap: Erweitert für WFS und GeoJson.
- end2end-Test: Die Möglichkeit end2end-Tests zu schreiben wurde implementiert.
- Snippet graphicalsselect: Neues Snippet um verschiedene graphische Auswahlmöglichkeiten in der Karte zu haben.
- Logo von *MasterPortal* wird beim Laden angezeigt
- Es können nun eigene Module - sogenannte *Addons* - in Portale eingebunden werden. Weitere Infos siehe **addons.md**.
- Suche:
    - Nach Klicken auf *alle Ergebnisse anzeigen* kann nun auch auf eine Gruppe geklickt werden, um diese zu öffnen.
    - Wenn ein Thema ausgewählt wird, wird die entsprechende Ebene aktiviert.
- Tools
    - StyleIds können nun vom Typ Array sein
    - Zeichnen: Das Tool wurde erweitert und verbessert. Es können nun beispielsweise auch Doppelkreise gezeichnet werden.
    - Zeichnung Herunterladen: Funktion wurde erweitert
- Internationalisierung wurde in einigen Modulen hinzugefügt
- Sidebar: Breite ist nun konfigurierbar
- Layerslider: Das Tool wurde erweitert und verbessert.
- 3D:
    - 3D: Features eines Layers können zum Ausblenden in 3D in der config.json konfiguriert werden.
    - Map-Marker kann nun 3D-Koordinaten bekommen. Dies ist möglich durch eine Konfiguration des Markers als Ebene.
    - VectorLayer können nun ihre 3D-Koordinate oder durch Konfiguration erhöht dargestellt werden.
- GFI:
    - Konfigurierbar, um Vektordaten bei GFI Abfrage anders darzustellen.
    - Neues GFI-Theme *sensor*, *bildungatlas*
- Layer:
    - GeoJson-Layer um subTyp *opensensemap* für *Opensensemap API* erweitert
    - URL in Layer-Information kann nun durch Konfiguration versteckt werden
- Neuer Pre-Push-Hook erstellt Documentation und überprüft diese
- Dokumentation für *Addons* hinzugefügt

### Changed
- VectorStyling: Neues Vektorstyling. Ermöglicht das Einlesen von gemischten Geometrien über GeoJSON oder WFS, und das Verarbeiten von Multigeometrien.
- Suche: Die Konfigurierbarkeit der Elastic-Search Suche wurde erweitert.
- Build-Script:
    - Erstellt nun sämtliche Portale in angegebenen Ordner
    - Erstellt nun Mastercode-Ordner
    - Für Cross-Plattform angepasst
- Konsolidierung:
    - Hamburg-spezifischer Code wurden entfernt
    - Hamburg-spezifische Tools wurden in die neuen *Addons* umgezogen
- Doku:
    - *setup.md* wurde angepasst
- Konventionen: Wurden erweitert und überarbeitet.
- Eslint: Überarbeitung der Regel function-paren-newline, sobald bei einem Parameter einer Funktion ein Zeilenumbruch verwendet wird ist dies bei allen Parametern erforderlich.
- master Portale: Intranet URL's entfernt.
- Fonts: Erzeugung einer eigenen Fontclass MasterportalFont, um den Font des Masterportals zentral setzen zu können.
- camelCase: Umbenennung diverser Ordner und Dateien entsprechend der camelCase Konvention.

### Deprecated
- Das **[alte Vektorstyling](doc/style.json-deprecated.md)** ist deprecated. Bitte das **[neue Vektorstyling](doc/style.json.md)** benutzen.
- Der URL-Parameter STARTUPMODUL ist deprecated. Bitte ISINITOPEN benutzen.
- Der URL-Parameter BEZIRK ist deprecated. Bitte ZOOMTOGEOMETRY benutzen.

### Fixed
- Draw-Tool: Gezeichnete Features werden im gleichen Stil gedruckt, in dem sie gezeichnet wurden. Text behält auch im Druck seine Position bei.
- Layer: Gemergde Layer behalten ihre GFI-Attribute und können abgefragt werden.
- Layer: Fortan können auch Layer deaktiviert werden, die im aktuellen Maßstab nicht sichtbar sind.
- Filter: Der Filter kann im Internet Explorer wieder geöffnet werden.
- Filter: Ein Fehler verhinderte die Verwendung des Filters. Dieser wurde behoben.
- Elastic-Search: Es kann wieder nach konfigurierten Fachthemen gesucht werden.
- Suche: Ein Fehler wurde beseitig, der beim Entfernen des eingegebenen Suchbegriffs aufgetreten ist.
- Messtool: Die voreingestellte Einheit (m² oder m) wurde auf die jeweilige Auswahl (Fläche oder Strecke) abgestimmt.
- Themenbaum: Der Themenbaum lässt sich wieder inital öffnen.
- Legende: Die Symbole in der Legende wurden sehr klein skaliert, nun werden sie in einer annehmbaren Größe dargestellt.
- Graph: Verschiedene fixes für das graph Modul.
- Case-sensitive Dateisysteme: Doppeltes Module quickhelp gelöscht.
- Arrow functions: Arrow functions(=>) in Templates führen zu Fehlern im IE 11, daher entfernt.
- Gruppenlayer: Fehlerhändling, wenn die Dienste nicht antworten.
- Layerinformation: Fehlerhandling, wenn keine Metadaten gefunden werden.
- FreezeWindow: Drehte sich mit der Table Navigation
- Filter: Keine Filter-Inhalte vorhanden bei isIntiOpen = true
- Fehler beseitigt, durch welchen unsichtbare Ebenen in der Legende angezeigt wurden
- Fehler beseitigt, durch welchen Ebenen fälschlicherweise ausgeblendet wurden
- Fehler beseitigt, durch welchen man nur im initialen Maßstab drucken konnte
- Legende: Darstellungsreihenfolge der Ebenen in der Legende war nicht gleich der Reihenfolge in der Themenauswahl
- Hintergrundgrafik kann nun korrekt deaktiviert werden
- Filter: Funktioniert nun auch mit Heatmaps in Kombination mit deren DataLayern.
- Karte:
    - Maßstabsdarstellung ändert sich in seiner Länge nicht mehr beim Zoomen
- Header bricht nicht mehr um bei bestimmten Breiten
- Anpinnen einer Ebene beeinträchtigt nicht mehr die Usability im Layerinfo-Fenster
- Überflüssige Projektionen wurden entfernt
- Mobile: Es kann nun in den Suchergebnissen gescrollt werden
- BackgroundCanvas kann nun wieder konfiguriert werden.
- diverse Bugfixes.

---

## v2.4.3 - 2019-11-14
### Fixed
  - KML-Import: Ein Fehler wurde behoben, der verhindert hat, dass von QGIS exportierte KML-Dateien geladen werden.
  - GFI: Das GFI wird nun auch bei größeren Datenmengen innerhalb des Portals dargestellt.
  - GFI: Das GFI wird nun immer nach dem Schließen eines anderen Werkzeugs aktiviert.
  - Tools: Die Minimierung von Werkzeugen wird nun richtig dargestellt.
  - Menü: Die Menüleiste ist nun auch nach einer Suche noch intakt.
  - 3D-Modus: Die 3D-Navigation per Mausrad im Firefox funktioniert nun.
  - 3D-Modus: Die 3D-Navigation über den Kompass lässt sich nun wieder deaktivieren.
  - GFI: Für sich überlagernde WFS- und WMS-Features werden nun die jeweils richtigen Informationen abgerufen.

---

## v2.4.2 - 2019-09-09
### Changed
  - GFI: Links die mit dem Prefix "file" beginnen sind nun klickbar

### Fixed
  - Shadow-Tool: Das Schattentool ist nun mobil nicht mehr verfügbar
  - QuickHelp: Ein Bug wurde gefixt, der verhindert hat, dass die Bilder über den angegebenen Dateipfad geladen werden
  - Themenbaum: Es wird nun im DefaultTree nach der Suche eines Themas auf den entsprechenden Eintrag gescrollt
  - Searchbar: Ein Fehler wurde behoben der die Hausnummernsuche in der Gazetteer-Suche blockiert hat
  - WFS: Geoserver-WFS werden nun angezeigt

---

## v2.4.1 - 2019-08-23
### Fixed
  - Shadow-Tool: Das Schattentool ist nun nur noch im 3D-Modus verfügbar
  - Print: Ein Fehler wurde behoben der dazu führte, dass die Beschreibungen der WFS-Features nicht gedruckt wurden
  - LayerTree: Layer mit dem Attribut "styles" werden nun wieder im Themenbaum dargestellt
  - PortalTitle: Attribute zur Konfiguration des Portaltitels sind nun Abwärtskompatibel

---

## v2.4.0 - 2019-08-21
### Added
  - Dependencies: Die Äbhängigkeit "lgv-config" wird nicht mehr benötigt, extern geladene Dateien (z.B. "services.json") werden über einen direkten Pfad oder eine URL bezogen
  - Dependencies: Aktualisierung der Versionen diverser Abhängigkeiten
  - Basic-Portal: Das Basic-Portal wurde überarbeitet und enthält nun einen "resources" Ordner mit Beispiel Daten
  - Pre-push-Hook: Code wird beim Pushen vor dem Push mit ES-Lint überprüft
  - GroupLayer: Es ist nun möglich, bei Gruppenlayern die Attribute "layerAttribution", "mouseHoverField", "maxScale" und "minScale" zu konfigurieren
  - Shadow-Tool: Im 3D-Modus gibt es jetzt ein Werkzeug zur Darstellung des Schattenwurfes, mit einstellbarem Datum und Uhrzeit-
  - Buildprozess: Es gibt nun einen Buildprozess, der es ermöglicht mehrerer Portale zu bauen

### Deprecated
  - HTML-Container: Id "lgv-container" wurde in "masterportal-container" umbenannt (index.html)
  - config.json: Das Attribut "Baumtyp" wurde in "treeType" umbenannt
  - config.json: Das Attribut "totalview" wurde in "totalView" umbenannt
  - config.json: Das Attribut "overviewmap" wurde in "overviewMap" umbenannt
  - config.json: Das Attribut "backforward" wurde in "backForward" umbenannt
  - config.json: Das Attribut "baselayer" im Control overviewMap wurde in "layerId" umbenannt
  - config.json: Das Attribut "tootip" im portalTitle wurde in "toolTip" umbenannt
  - config.json: Das Attribut "layerslider" wurde in "layerSlider" umbenannt

### Fixed
  - GFI: Beim Klick auf mehrere Features werden nun alle nicht fehlerhaften GFI angezeigt
  - Print: Das Druckmodul wurde verbessert
  - Diverse Bugfixes

---

## v2.3.2 - 2019-06-20
### Added
  - Config: Neuer Config-Parameter "metaDataCatalogueId" in config.js; Metadatenkatalog-URL kann nun gepflegt werden
  - Themenbaum: Neue Datenlayer werden initial immer über allen anderen Datenlayern platziert
  - Themenbaum: Neue Hintergrundlayer werden initial immer über allen anderen Hintergrundlayern platziert
  - Build-Script für Portale verbessert

### Fixed
  - Reihenfolge von Layern: Render-Reihenfolge von Layern im Themenbaum sowie auf der Karte war nicht immer korrekt
  - Flurstücksuche: Bug der Zoomfunktionalität bei der Flächeninfo behoben

---

## v2.3.1 - 2019-05-08
### Fixed

  - GFI: lässt sich nun bei geöffnetem Filter nutzen
  - GFI: Klick auf Features von externen Diensten funktioniert wieder
  - Suche: Bei Verwendung des Parameters query; bei eindeutigem Suchtreffer direkter Zoom auf Ergebnis
  - Themenbaum: Richtige Reihenfolge der Layer wird beim Ein- und Ausblenden nun beibehalten

---

## v2.3.0 - 2019-04-16
### Added
  - Neues GFI-Theme: "Dauerradzählstellen"
  - Neues Control: "Backforward", zum Vor- und Zurückspulen des Kartenzustandes
  - JSDOC: teilweise implementiert
  - Suche funktioniert nun bei Cluster-Features und GEOJSON-Layer
  - BKG-Suche: Zoom auf Ergebnis ist nun konfigurierbar
  - OSM-Suche: Erweitert um Parameter "county"
  - Footer: Versionsnummer des Portals ist nun anzeigbar
  - Shadow-Tool: Schatten-Implementierung für 3D-View
  - Filter: Optimierung für Touch-Table-UI
  - Proxy-Host ist nun konfigurierbar
  - Custom-Modules lassen sich nun mithilfe von Unit-Tests testen
  - GFI zeigt nun Infos zu mehreren Features eines WFS
  - GFI: Hit-Tolerance bei Vektor-Layern konfigurierbar
  - Zeichnen-Modul: Per Remote-Interface steuerbar

### Fixed
 - Diverse Bugfixes


## v2.2.6 - 2019-02-28
### Fixed
  - 184198d7f Cesium wird nun über die index.html geladen

---

## v2.2.5 - 2019-02-25
### Fixed
  - 61eaf2c18 Der Filter zeigt jetzt bei jedem öffnen die detailview an

---

## v2.2.4 - 2019-02-20
### Fixed
  - 49cee3555 Die Reihenfolge der Pendleranimationen wird nun beim Drucken korrekt eingehalten
  - a3c1fbcaa Die Darstellung der Symbole beim Verwenden von zoomToFeature kann jetzt über die style_v2.json konfiguriert werden
  - ba18ea631 PLZ und Ort wurden vom Schulwegrouting entfernt
  - e3c3c1fd2 Die Layerreihenfolge wird beim verwenden von Auswahl speichern nun beibehalten

---

## v2.2.3 - 2019-01-31
### Fixed
  - ed565a391 Die Information im Filter werden nun wieder dargestellt. Ein Fehler der das Starten in einer lokalen Entwicklungsumgebung verhindert wurde behoben.
  - 1ef6166db Hinweise im Einwohnertool wurden angepasst

---

## v2.2.2 - 2019-01-21
### Added
  - 4154b06a1 Nun werden auch zu einer Adresse mit dem Adresszusatz "Haus" Schulen im Schulwegrouting gefunden.

### Fixed
  - d28cc48f6 Beim schließen des Measuretools werden nicht beendete Zeichnungen nun entfernt.
  - 2ba7934f3 Diverse Fehler im Einwohnertool wurden behoben.
  - 907afb415 Ein Fehler in der Metadatenkopplung wurde behoben.

---

## v2.2.1 - 2018-12-10
### Added
  - f84b1fe74 hotfix Funktion zum bauen der Portale für eine Stable Version geht jetzt function for build all portals for new stable version and git ignore new portals

### Fixed
  - d8723bb51 - Schrägluftbildmodus springt in die richtige Zoomstufe
  - 24d3849f2 Die Videokameras funktionieren jetzt wieder mobil. Die Darstellungsreihenfolge der Attribute im GFI sind nun in allen Browsern gleich
  - 87e208519 der Marker wird im Tool Koordinaten Abfragen jetzt wieder richtig positioniert
  - f84b1fe74 Funktion zum bauen der Portale für eine Stable Version geht jetzt add function for build all portals for new stable version and git ignore new portals
  - ff65eab95 Der Titel wird nun beim Drucken richtig dargestellt
  - 8627b6579 Das Them für die Radverkehrszählsäulen wird nun wieder richtig dargestellt
  - 7a03233c6 Fehler in der Searchbar wurden behoben

---

## v2.2.0 - 2018-11-29
### Added
  - 8de8d34a5 Darstellung im GFI (WMS) mehrfach vergebener Attribute mit gleichem Namen
  - cb7b25aa2 - 3d Modus inkl. Geländemodell und Gebäude Layer für Hamburg.
  - 9f4a21ad5 import of customModules  to webpack
  - c473c3450 Druckfunktion funktioniert jetzt auch für GruppenLayer
  - 207320b8b Glyphicons werden für das Menü und die Tools per Default gesetzt
  - 26abf2c8c initial layer search Merged in SchBe/mplgv-8 (pull request #870)
  - f6800524a Beim Verwenden des Moduls Koordinaten abfragen wird nun beim einfrieren der Koordinate ein MapMarker angezeigt. Dadurch lässt sich das Tool nun auch mobil verwenden
  - 7e1afecd5 methode um gfi eines spezifischen layers an bestimmter Position zu setzen
  - 162ef6a14 cswParser, all modules that need metadata trigger cswParser
  - 2c1a96bb2 css to less syntax by css2less.net
  - 5fb9ef36b mapfish_print_3 can print user styled wms with sld_body
  - f12c29e9d take the icons from the origin server the app is running on Merged in print_imagepath_from_origin (pull request #840)
  - b9848fcad GFI Support für Links auf JPEG und GIF
  - fe634e78c Wechsel des Webbundlers von Browserify auf Webpack. Dieser wird zum installieren des Packages BrowserMqtt.js benötigt.
  - 2f8a1d2d0 printModule with Mapfish print 3 and refactor modellist
  - ed84d41df layerslider zum sliden von Layern nach definierbarem Zeitintervall
  - 85eadd186 Dokumentation zur Verwendung vom Tool addWMS
  - c846b7685 Tooltips in Searchbar-Hitlist für Themensuche, OSM und BKG damit Einträge unterscheidbar werden
  - 995cf7844 Verwendung von LESS anstatt von CSS im gesamten Repo
  - 7a39ac43e tests for styleable layers
  - 35d2ba452 WMS cache-handling für TileWMS eingeschaltet
  - 58f1aa58e layer autorefresh Konfiguration für automatischen Refresh gemäß Konfiguration für (fast) jeden Layertyp
  - 54e86c51b Konventionen für Änderungen der Konfigurationsparamter
  - 7a5c1fa79 Layerkonfiguration auch als openlayers layerGroup möglich

### Fixed
  - 93bbf9961 Graph für mobile ansichten optimiert Merged in fix_stabel_23_iphone (pull request #981)
  - 9ad3722b5 Schulwegrouting zeigt auch kurze Strecken
  - 4bee2580e Druckmodul kann auch WFS Gruppenlayer drucken
  - 5cab3a42e buttons haben hamburgstyle conforme farben Merged in fix_stable_40 (pull request #980)
  - e9ed46478 KML-importierte Features werden nun wieder in ihrer entsprechenden Farbe dargestellt
  - 523dc353e druckmodul
  - b87a82684 Reihenfolge der Zeichenelemente in der Karte entsprechend Digitalisierreihenfolge
  - 2e874be85 Einwohnertool richtiger Rasterlayer eingebunden Merged in 85_stable_candidate_einwohnertool (pull request #978)
  - 05b399b8d schulwegrouting layer wird nicht mehr an oder ausgeschaltet Merged in 80_stable_candidate_schulwegrouting (pull request #979)
  - ab355672c Fehlermeldung der CompareList wurde für kleine Bildschirme angepasst
  - 1eefc9271 Ein Fehler wurden behoben der verhindert hat, dass der Platzhalter (placeholder) für die Searchbar aus der config.json geladen wurde.
  - d61460962 fehlender afterRender Trigger im detached unterband videostreaming
  - 07f15af6c Einen Fehler in der Flurstückssuche, der verhindert, das die Flur ausgewählt werden konnte
  - 8674869d4 searchbar hover on item in recommended list zooms to result
  - cdd02d1d6 ein Fehler der das aufziehen eines Kreises im Einwohnertool verhindert hat wurde behoben
  - 8f608bb27 ein Fehler in der Liste, der das Icon beim hovern verschwinden lässt, wurde behoben
  - 1164b9f23 Auswahl speichern schließt jetzt andere Tools vollständig
  - 517cd9635 print circle geometries printable
  - b565b14f4 Print polygon styles in legend
  - a77e23d8f Labels werden custom Featurestyles jetzt zentriert angezeigt
  - 9f651d311 Sidebar wurde nicht mehr in mobiler Darstellung ausgespielt
  - b9e5efa82 Feature bekommt im Zeichenmodul korrekten Style zugewiesen
  - 1d78053d5 Graph-Modul überarbeitet und Diagramm Darstellung vereinheitlicht
  - 94211b475 uiStyle in GFI-Model wegen Ladereihenfolge nicht vorhanden
  - f4dc4fe12 webpack rules for dev and prod
  - e796997b6 print feature with multiple styles
  - 0f4f3eee5 pendler can be printed with new print module
  - 7d068a884 drawModule eventlistener and refactor buttonhandling
  - 603f90a51 metadata can also be requested from internet explorer
  - a307af473 styleWMS classifications are removed on change attribute or change number of classes update mrh stylewms
  - 4af961cbc update neues Filtermodul funktioniert jetzt auch mit dem customTree und GroupLayer; WFS Styles innerhalb eines GroupLayers
  - 7f63674c2 download circlegeometries
  - c31caaa39 tests for parser
  - 969f945e0 drawCursor stays at mouse-position on move
  - 6a249b664 Glyphicons werden jetzt direkt aus Bootstrap geladen
  - 9aaa67ef4 Pfad zu zum Styling
  - b61d1a55c das Tool zur Koordinatenabfrage zeigt nun in der mobilen Version einen Marker
  - ef521974a print canvas gets removed on closed print module
  - e16fb4a1d missing bootstrap tooltip
  - b9283eb6a kein FlurstücksHighlighting bei gfi detached im flaecheninfo
  - 720ac7a8e pendler lines have correct text style
  - 767ab71a9 layerslider funktionierte nicht mit treetype=custom
  - 79583f9e8 Die Reihenfolge der aktiven Layer im CustomTree entspricht nun der des Themenbaumes
  - b9437ecf1 Ein Fehler wurde behoben der durch Konfiguration eines Custom-Stylings auftrat, wenn kein Alpha-Wert (Opazität bzw. Transparenz) angegeben wurde
  - f9f7ee677 renderToDOM parcelSearch und searchbar ohne Funktion
  - 3a2743278 Ein Fehler wurde behoben der verhindert hat, dass bei einigen Layern das GFI nicht mehr funktionierte, wenn bestimmte Layer aktiviert waren
  - 91f9578ff Fehler wurden behoben, durch die keine Schulen im Schulwegrouting zu einer gefundenen Adresse in den Browsern Internet Explorer und Edge angezeigt wurden
  - 9c54d7a48 Ein Fehler wurde behoben, der die Definition eines Legenden-Images für den GeoJSON-Layer verhindert hat
  - 9c934ac04 Routingmodul wertete BKG-Adressabfragen wegen fehlendem Proxyeintrag nicht aus
  - f79a18470 autostart über URL funktioniert nicht wegen veränderter Ladereihenfolge
  - 5a61d5b3f Standardpfad für Glyphicons variabel gemacht um Entwicklungs- und Produktionsumgebung abzubilden
  - ca1367822 Measure Modul zeigte falsche Einheiten für Strecke
  - a38bd35a0 bei Auswahl eines neuen Tools bei minimiertem Routing konnte Routing nicht beendet werden
  - 24022ae1b missing glyphicons weil less path auf falschen Ordner zeigt
  - 3de99be7d switch zw desktop und mobile menu führte zu error in console
  - c81273418 scaleline ohne footer wirft Fehler in console
  - 331b67b78 grouplayer wurden in parametrisierten Aufrufen wegen unklarer id ignoriert
  - 8d2349b40 Beim navigieren mit den Pfeiltasten in der Suche springt der Cursor nun immer ans Ende der Eingabe
  - e3094b642 Die Version zum Laden der Legende eines WMS wird jetzt aus der services.json verwendet
  - 409a65c02 Fehler im KML Import der nach erneutem Export auftrat
  - 6fe334a4f parcelSearch flur getter
  - ee0793d51 metaidtomerge nicht alle objekte wurden gruppiert

---

## v2.1.3 - 2018-09-21
### Fixed
  - 48b55e8f8 Fehler wurden behoben, durch die keine Schulen im Schulwegrouting zu einer gefundenen Adresse in den Browsern Internet Explorer und Edge angezeigt wurden
  - 62e9c8da0 Schulen mit dem gleichen Namen im Schulwegrouting können nun durch die Anzeige der Adresse unterschieden werden
  - 8dd4f82b5 Ein Fehler in der Nomatim-Suche (OSM), durch den einige Suchergebnisse nicht angezeigt worden sind, wurde behoben

---

## v2.1.2 - 2018-09-05
### Fixed
  - 688f637b Es wurde ein Problem im Schulwegrouting behoben, welches den Aufruf einiger Adressen verhinderte. Das GFI wird beim wechseln der Schule oder Adresse im Schulwegrouting nun automatisch geschlossen.

---

## v2.1.1 - 2018-08-14
### Fixed
  - a2bce8dc metaidtomerge nicht alle objekte wurden gruppiert
  - 3ec4b257 parcelSearch view getter entfernt, wms crossOrigiin entfernt, wfsfeaturefilter feature übergeben bei defaultStyle und marker und zoomlevel bei suche nach Schulstandorten

---

## v2.1.0 - 2018-08-07
### Added
  - b5e4ece5 new layertype sensorLayer for sensorThings-API
  - 966711f0 groupLayer rawlayerlist
  - 4e53968d osm search by grid
  - 11bc78fa table-ui and freezecontrol
  - f4822098 control visibility of the "SelectAll"-checkbox within leaf-folders
  - 45dca5d1 merge confilcts and unittest for parseRoute
  - 5b526f6d Transparency To Table LayerMenu
  - fb807917 style-param-test
  - 16abe7d7 measure Tool
  - 1587ce39 table-gfi-design
  - b38afd98 tablenav tools menu
  - cc21bf2a Werkzeug-Button für table - Menü
  - 9d090108 menutemplate for table
  - 595af610 parameter for table ui

### Fixed
  - f1147895 Videostreaming mobil wurde nicht mit HLS sondern Flash gestreamt
  - 714df6f7 bkg query neuenfelder straße
  - 77bee217 mapMarker view Fehler bei Layer sichtbar schalten über searchbar
  - e1d8d303 table theme height zu schmal bei vielen Einträgen
  - c985d399 initiale Suche nach Straße + Hausnummer über query Parameter schlug fehl
  - 0e4851cf im IE wird beim schalten in den fullScreen-Mode ein weißer Rand angezeigt
  - 5b2c7718 sinnvolle default Koordinatensysteme für Hamburg
  - 0c14730a Dipas 99 bug query
  - 6f8defe3 update merge dev, merge conflicts
  - 4e82ca43 mapSize mit Menu falsch berechnet was zu falscher Koordinatenangabe führte
  - b292e9bb mapheight on resize
  - 25fd5fdf UrlParams funktionieren nicht mehr
  - 0fdfd56b Flurstückssuche löscht default Flurstücksnenner beim Wechsel der Gemarkung bei parcelDenominator = true
  - 63fbbbd4 Flash-Videostream im Chrome konnnte nicht abgespielt werden
  - dd8e5d30 contact tests wenn keine portalconfig geladen wird
  - 2f9102eb betrieb contact configjson new portaltitleObject
  - 8db97eed filter dropdown css overflow-y hinzugefügt

---

## v2.0.4 - 2018-06-20
### Fixed
  - c128bf6f template layerinformation legendurl
  - a6d8b6e5 bootstrap-select Version auf 1.12 beschränken, weil 1.13 noch buggy

---

## v2.0.3 - 2018-05-09
### Fixed
  - 817a2f0 bkg search triggers searchbar to render recommended list
  - 69342d6 Flurstückssuche löscht default Flurstücksnenner beim Wechsel der Gemarkung bei parcelDenominator = true

---

## v2.0.2 - 2018-04-17
### Fixed
  - 8ddf9ebd contact tests wenn keine portalconfig geladen wird
  - f774a5c1 contact an neues object in config.json angepasst
  - 85083af4 filter dropdown css overflow-y hinzugefügt

---

## v2.0.1 - 2018-04-05
### Fixed
  - b8bae19dd Theme Radverkehrsstellen falsche Sortierung bei Wochenansicht
  - d7ff9768d Theme Radverkehrsstellen falsche Sortierung bei Tagesansicht

---

## v2.0.0 - 2018-03-29
### Added
  - f4f34f02e Totalview Button (switch auf default-Ansicht)
  - 63679a50a fehlende dokus ergänzt
  - dd56e0885 multipoint Layer
  - a338b9339 GFI-Theme für radverkehr mit Diagram

### Fixed
  - 31b061f5e attributions glyph passt sich an wenn ovm versteckt
  - 2cd457956 diverse Bugs, die beim Testen mit FF aufgefallen sind
  - 3b32ea5ed overviewmap in mastertree wirft console Fehler
  - 1bf49caca diverse Bugs, die beim Testen mit IE aufgefallen sind
  - 2714554c3 search durch regexp ersetzt für Überprüfung auf Dateiendungen
  - d6627f8f1 jumping Window unter Firefox und IE behoben
  - c3320fbb0 max- und minScale werteten keine scientificNotation aus
  - ad6b53dfb 183 diverse Bugfixes
  - 190e0f7f7 Themes mit default extenden Parameter nicht von superclass
  - 4581bf54b auswahl speichern light tree
  - b20699dae falsches Theme in list ausgewählt
  - ea8ecb2c2 nach Auswahl einer Adresse wird name nicht in searchbar übernommen
  - 4ed4fcdbe nach Auswahl einer Adresse wird name nicht in searchbar übernommen
  - d7706e58c configYAML wurde nicht aus config.json ausgelesen
  - da18c6567 Util.getPath Error

---

# v1.5.2 - 2018-03-12
### Fixed
  - 798923ae betrieb 647 contact cc array mehrmaliges Absenden ließ array volllaufen
  - 5b6d8e01 betrieb 238 metaIdToMerge fehlerunanfälliger
  - 70e08d3e light tree auswahl speichern
  - 03317d46 wfs legendURL Parameter aus json in Legende nutzbar

---

## v1.5.1 - 2018-01-17
### Fixed
  - c39c1122 falsche reihenfolge des mapView Parameters zoomlevel führte zu Laufzeitfehler
  - 1815d4f9 nach Auswahl einer Adresse wird name nicht in searchbar übernommen
  - 615635b7 configYAML

---

## v1.5.0 - 2017-12-13
### Added
  - 9a74933 end2end-test-infrastruktur
  - ee4dd43 overviewmap als control
  - 8279f7f Merge branch '81_add_removeFilter' into 80_suche_nach_schulnamen reset Filter on Search

### Fixed
  - f789319 hotfixes kw 45 fix csw Parameter aus config.js Pfad angepasst, legende zeichnet sich nicht über Tabelle von fluechtlingsunterkuenfte, verkehrsstaerken Theme Pfad zu Datei angepasst ohne Datum
  - ca4cd86 gfi-detached opens initially on right side
  - 6f0c43f Adresssuche in der Searchbar führte zum Füllen der Suggestliste vom viomRouting
  - 8bc2a82 WMS-Adresse für Bezirkslayer wurde nicht angezeigt, weil id nicht in RawLayerList gefunden werden konnte
  - 92849aa drawmodulstyle
  - f029a7b gfi always on
  - 3786af7 Scrollleiste in Themenbaum light
  - cf931a1 fix UrlParams zoomlevel und Center fix Canvas wird defaultmäßig nicht erzeugt fix UrlParam featureId über LayerIds Parameter StartupModul behalten

---

## v1.4.8 - 2017-12-13
### Fixed
  - c54708ef sgvonline theme attr amtliche adresse immer nein

---

## v1.4.7 - 2017-11-20
### Fixed
  - d1db2bd fix csw Parameter aus config.js Pfad angepasst
  - 340700f fix legende zeichnet sich nicht über Tabelle von fluechtlingsunterkuenfte

---

# v1.4.6 - 2017-10-27
### Fixed
  - 1a7337a Drucken mit GFI

---

## v1.4.5 - 2017-10-18
### Fixed
  - b033e0e gfi mobil rendert sich auf volle breite Merged in hotfix_gif_mobil (pull request #567)
  - d176616 gfi initial links im ie

---

## v1.4.4 - 2017-10-12
### Fixed
  - d1766166 gfi initial links im ie

---

## v1.4.3 - 2017-10-12
- Keine Einträge

---

## v1.4.2 - 2017-10-10
- Keine Einträge

---

## v1.4.1 - 2017-10-06
### Fixed
  - 427a269 Adresssuche in der Searchbar führte zum Füllen der Suggestliste vom viomRouting
  - 73114e6 WMS-Adresse für Bezirkslayer wurde nicht angezeigt, weil id nicht in RawLayerList gefunden werden konnte

---

## v1.4.0 - 2017-09-18
### Added
  - 35ae3ff 1.Version Features-Filter
  - 1b9ed32 epsg code in wfs-request ergänzt

### Fixed
  - 118a569 Änderung der Layerreihenfolge wurde im Tree nicht umgesetzt
  - f36cf06 wenn android tastatur aufpoppt wurde window vom footer geteilt und eine Eingabe war nur schlecht möglich
  - 442ef1a im IE wird bei abfragen der Layerinformationen ein Fehler geworfen, wenn keine Layerattribute definiert sind.
  - 03d2ac1 wurde in der navbar gescrollt, scrollte auch #map, weil die navbar relativ positioniert war
  - a15def9 drawmodul style
  - c9e0aa8 Titelzeile wird zweizeilig weil render nicht bei switch mobile<->desktop erneut ausgeführt wurde
  - 0fdc72a beim Entfernen eines Layers in non-simple-tree wurde falscher IDX-Layer entfernt, wodurch andere Layer nicht mehr unvisible/visible geswitched werden konnten
  - ad30a70 klick auf Menü wirft Fehler in console, weil models[0] war undefined
  - 47ebe3c gfi always on
  - 5bdf0ff Koordinatensuche nach WGS84 (mit Dezimalgrad) funktioniert nicht, wegen parseFloat Problem
  - d046d4e WFS mit png wird nicht mehr geladen
  - 0b357de Scrollleiste in Themenbaum light
  - f7c15bc fix UrlParams zoomlevel und Center fix Canvas wird defaultmäßig nicht erzeugt fix UrlParam featureId über LayerIds Parameter StartupModul behalten
  - 4fd80fa Bild wird im GFI als Bild und als Link angezeigt, soll nur Bild sein
  - 7d36d03 AutostartModul beendet sich nach einmaligem vollständigem Startvorgang selbst
  - 9b9ddb3 272 LegendeSwitch
  - 1e23b31 271 param
  - fc87c13 mapview-options aus config werden nicht übernommen
  - 3fdd4f6 keine Koppelung der LegendURL mit Dowmload im Layerinfo Fenster
  - 71dc8f4 multipoint mousehover position
  - 37c3ad0 schließe GFI nach Adresssuche-hit
  - 8f5f06d kml ie punkte linien und polygone
  - 326bad7 lighttree laeuft ueber
  - 9cd072c safari drucken
  - a3c4633 mrh drucken
  - ed8b4c6 layerinfos gruppenlayer unvollstaendig

---

## v1.3.3 - 2017-08-16
- Keine Einträge

---

## v1.3.2 - 2017-06-21
### Fixed
  - d7d98f21 mrh print benötigt _print für speziellen proxy

---

## v1.3.1 - 2017-06-06
- Keine Einträge

---

## v1.3.0 - 2017-05-31
### Added
  - 798a35e gfi-theme für sgv-online
  - 81bb340 Anwender-Dokumentation
  - 6907236 modul autostarter, um Tools per Parameter STARTUPMODUL starten zu können
  - ac54221 Merge branch 'dev' into RemoteInterface + EPSG definitions for masterTree && FHH Atlas

### Fixed
  - d735d0c Ungültiger Wert für Flurstücksnummer wird bei der Eingabe abgefangen.
  - 3c94d2f portaltitel geoportal-verkehr springt nicht mehr in zweite zeile
  - 7b14c38 - Animation Tool wirft beim Schließen einen Fehler
  - ff9d07c routing url über proxy leiten
  - ed6a75e tree layer über config.json sichtbar werden bei paramAufruf layerids visibility false
  - e0424bd urlparameter layerids, visibility & transparency werden nicht in Karte übernommen
  - 987da2f urlparameter bezirk funktioniert nicht
  - 89f3080 mergeconflict
  - 13468d7 Drucken von Gruppenlayern kann zu Problemen führen
  - 70d0bf5 wfs esri polygon
  - c3cca96 drucken gfi marker und linter fehler
  - b8e64dd group Layer funktionierte nicht mehr
  - c6ecb1f orientation module auch auf localhost anbieten.
  - 22591c1 Fehler in console, wenn keine MetadatenId zum Layer vorhanden ist
  - e84c5fa flurstuecksnummernenner
  - 7f01ca8 Lokalisierungs-Button ist ausgegraut, falls die Funktion deaktiviert ist
  - c3c98d0 wird das Portal über https aufgerufen, funktioniert die Lokalisierung in allen Browsern
  - 0d2c861 printError mit neuem GFI Modul
  - e8286a8 routing
  - 0b65b2f Portal wird nicht geladen, wenn LayerID in JSON nicht definiert
  - 8d721c8 Layerinformationen von Hintergrundlayern wurden  nicht angezeigt und Title war nicht Datensatzname
  - 3da16b7 GFI wird beim drucken immer mit ausgegeben, auch wenn GFI wieder geschlossen
  - 22811e5 Fehler beim Suchen von Baselayern in Suchschlitz behoben

---

## v1.2.4 - 2017-02-07
### Fixed
  - 760c7c1 hotfix 332 flurstueckssuche

---

## v1.2.3 - 2017-01-30
### Fixed
  - 3b2e44b layerid URL-parameter werden zugeladen falls vorhanden aber nicht konfiguriert

---

## v1.2.2 - 2017-01-24
### Fixed
  - ce3e3ae7 gfipopup größe verändert sich nicht durch verschieben vom popup
  - ccd07347 viomrouting
  - 8f6aca60 Portal wird nicht geladen, wenn LayerID in JSON nicht definiert
  - c8be5d5d Layerinformationen von Hintergrundlayern wurden nicht angezeigt und Title war nicht Datensatzname

---

## v1.2.1 - 2017-01-06
### Fixed
  - 00917df Portal-Titel wurde in "kleinen" Themenportalen initial nicht angezeigt

---

# v1.2.0 - 2016-12-16
### Added
  - c1ad7b6 Bei der Animation wird auf die Gemeinde gezoomt und ein Marker auf der karte gesetzt
  - 0932b5d Legende für Pendler-Animation in der Werkzeug-Oberfläche implementiert
  - f8d8e61 Unterstützung von setElement() für parcelSearch
  - 0551722 GFIs können in Tabellenform dargestellt werden
  - 97517de Bei der Animation werden dei Punkte anhängig von Pendlerdanzahl und Landkreis dargestellt
  - 90be2d3 Themenbaum kann in kleinen Themenportalen initial aufgeklappt werden

### Fixed
  - d466fb5 keinStartupModul in URL möglich
  - d32423e KML Import Problem im Internet-Explorer
  - b44b62c länge Portaltitel - Die Länge des Portaltitels passt sich an verfügbaren Platz in der Menüleiste an
  - e903ba5 lighttree Sortierung - In kleinen Themenportalen entsprach die Reihenfolge im Themenbaum nicht der Reihenfolge auf der Karte
  - 9522f0c Messen Label - Durch das Verändern der Einheit beim Messen (km/km² in m/m² und umgekehrt), wurde der Messwert der zuletzt gezeichneten Strecke/Fläche entsprechenden umgerechnet
  - ef49ad2 mobile Legende - Beim Wechsel der Anwendungssicht (desktop <=> mobil) wurde die Legende nicht mehr angezeigt.
  - fb24d98 werden Layer im Portal parametrisiert aufgerufen, wurden die entsprechenden Layer zwar im Baum selektiert, aber nicht auf der Karte angezeigt
  - 3d9a209 im IE wurde GFI wegen Overflow-y (css) nicht korrekt dargestellt.
  - ac48f29 BackgroundSwitch-Button nur sichtbar, wenn auch konfiguriert
  - b945614 Mobil wurde das Routingmodul nicht initial geladen.
  - de4a32e fix quickhelp Fehler in console und quickhelp-Button neben searchbar wurde nicht angezeigt
  - 7eadc7f verkehrsfunction Util Fehler
  - 893c2c6 Quickhelp wird in einem starren Fenster gerendered
  - 95ff542 Breite des GFI-Popup von 50% auf 25% der Bildschirmhälfte gesetzt
  - 1f2f810 Beim Messen wird wieder das Tooltip angezeigt
  - f90f787 Suche springt während des Tippens nicht mehr automatisch auf eine gefundene Adresse oder Thema
  - ea888a8 hintergrundkarten werden bei themensuche immer eingeklappt, auch wenn sie ausgeklappt waren
  - 4b135db controls in config.json werden auch auf true/false geprüft
  - 32f0022 Routenplaner verwendet den richtigen Routing-Dienst
  - b6ea8d3 "in meiner Nähe" - Attribute nicht mehr doppelt
  - b12c6d5 portallogo configurierbar

---

##  v1.1.6 - No Data
### Fixed
  - 97ad0aa csw falsches Datum ausgelesen, da erneut über ganze csw Datei gesucht wurde
  - 59fae85 Parameter &LAYERIDS in URL wurden nicht mit SimpleTree ausgewertet. &CLICKCOUNTER jetzt überflüssig.

---

# v1.1.5 - 2016-11-15
### Fixed
  - 658d016 startcenter wurde nicht ausgelesen aus config.json

---

# v1.1.4 - 2016-10-27
### Fixed
  - 11e3138 Die Reihenfolge der Themen auf der Karte entsprach nicht immer der korrekten Reihenfolge der Themen in der Auswahl

---

## v1.1.3 - 2016-10-26
### Fixed
  - c05d205 Zeichnungen werden nicht gedruckt

---

## v1.1.2 - 2016-10-24
### Fixed
  - a27eb17 gfi Attribute werden nur noch nach Datum formatiert wenn sie ISO 8601 entsprechen

---

# v1.1.1 - 2016-10-20
### Fixed
  - b759d17 Auswahl speichern - Beim Öffnen einer gespeicherten Auswahl wurden immer alle Layer auf der Karte angezeigt, unabhängig davon ob der Layer sichtbar war oder nicht.

---

## v1.1.0 - 2016-10-18
### Added
  - 32964b6 Style WMS - Layer können jetzt im Client neu gestylt werden. Vorläufige Einschränkung: Nur mit Flächengeometrien im Zusammenspiel mit SLD v1.0.0 möglich
  - 6f0dff6 kml import tool zugefügt
  - d448742 Navigation für mobile Endgeraete bzw. fuer Bildschirmbreiten bis zu 768px komplett ueberarbeitet (Design und Usability)
  - 2b8bb1b custom js für bauinfo

### Fixed
  - 06935f3 Legende wird im Infofenster erst angezeigt wenn der Layer sichtbar ist
  - df8d671 Measure- und Zeichenlayer immer an oberster Stelle
  - 9639ab9 maxscale initial ignoriert
  - 698594f WFS-Layer können verschiedene Styles zugewiesen werden
  - 582de4c Searchbar springt nicht mehr aus der Menüleiste
  - 7e3d0fe Searchbar springt nicht mehr aus der Menueleiste
  - 176d2bf GFI Abfrage funktioniert jetzt auch bei extern hinzugefügten WMS-Layern
  - 07aeee9 Das Kontaktformular wird direkt bei der Texteingabe validiert.
  - bb1fb95 initiale Strassensuche auch mit " " und "-" möglich
  - baf3f4e Lokalisierung in Chrome ist nur noch von HTTPS möglich
  - ffc0bcc drucken von KML-Features möglich
  - 4304704 GFI-Reihenfolge wird in der richtigen Reihenfolge dargestellt
  - faa9133 GFIPopup hat eine maximale Höhe in Relation zur Fensterhöhe

---

## v1.0.6 - 2015-03-18
- Keine Einträge

---

## v1.0.5 - 2015-03-12
- Keine Einträge

---

## v1.0.4 - 2015-03-06
- Keine Einträge

---

## v1.0.3 - 2015-02-29
- Keine Einträge

---
