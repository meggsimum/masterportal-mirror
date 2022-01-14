# Changelog masterportalAPI
 All important changes in this project are stored in this file.

 The [Semantic Versioning](https://semver.org/spec/v2.0.0.html) is used.

## Unreleased - in development
### Added
- An alias is added to the coordinate system. This is required by GeoServer services.
- Added possibility to add any rawLayer attribute to wms layer request.
- Added VectorBaseLayer to layers
- The follow package were added 
    - @parcel/transformer-sass version 2.2.0
    - parcel version 2.2.0
    - regenerator-runtime 0.13.9

### Changed
- The follow package were updated 
    - ol: from 6.9.0 to version 6.11.0
    - @babel/core: from 7.15.0 to version 7.16.7
    - @babel/plugin-transform-modules-commonjs: from 7.15.0 to version 7.16.8
    - jest: from 27.0.6 to version 27.4.0
- babel.config.js was replaced by babel.config.json. Now it can be watched for changes, and Babel transformations can be cached.
- The overall script tag needs the attribute type="module" to enable module usage. Look at the index.html in example-folder.

### Deprecated

### Removed
- The follow package were removed 
    - @babel/preset-env: because Parcel includes transpilation by default
    - babel-jest
    - babel-polyfill
    - parcel-bundler: replaced by parcel

### Fixed

---

## 1.7.1 - 2022-01-11
### Added

### Changed

### Removed

### Fixed
- WFS-Layer: the WFS version is taken into account when generating the WFS format.

---

## 1.7.0 - 2021-12-27
### Added
- An alias is added to the coordinate system. This is required by GeoServer services.
- Added WFS Layer that creates a VectorLayer and a VectorSource. Layer-params and loading-params can be passed as function parameters, options may contain functions to filter and style features. Clustering and WFS-filter are supported.
- Added possibility to add the parameter TIME to the wms layer request.
- Examples were extended by WFS-Layer.

### Changed
- The constructor of createMap in the abstraction layer changed. The order of the parameters (config, settings = {}, mapMode = "2D") changes to (config, mapMode = "2D", settings = {}).
- abstraction\ol\map.js was renamed to abstraction\ol\olMap.js and abstraction\olcs\map.js was renamed to abstraction\olcs\olcsMap.js

---

## 1.6.1 - 2021-12-07
### Changed
- SessionID from the WMS layer was removed and replaced by the CacheID in order to deal with deegree services.

---

## 1.6.0 - 2021-11-10
### Added
- The library Cesium is loaded on demand to generate a 3D map. Cesium must be provided by the user of this library.
- A 3D map can be generated. The generation of 2D and 3D maps is controlled by an abstraction layer.
- The example allows to switch between 2d and 3d map.
### Changed
- OpenLayers package updated from 6.6.1 to 6.9.0
- The WMS layer has been extended with layerParams and options. The LayerSource now contains a TileGrid if there are resolutions in the options. The source can also contain attributions.

---

## 1.5.0 - 2021-08-16
### Added
- The engine for npm version ">= 6.13.4" was added in the package.json
- The package "@babel/preset-env" version 7.15.0 was added.
- The package "core-js" version 3.16.1 was added.
- The package "husky" version 7.0.1 was added. In this case a pre-push hook to run unit tests and eslint before every git push.

### Changed
- The engine for node was updated to ">= 10.18.0" in the package.json
- The follow package were updated and in this case the eslint rules and the babel.config were adjusted
    - ol: from 6.5.0 to version 6.6.1
    - proj4: from 2.5.0 to version 2.7.5
    - xml2js: from 0.4.19 to version 0.4.23
    - @babel/core: from 7.1.6 to version 7.15.0
    - @babel/plugin-transform-modules-commonjs: from 7.1.0 to version 7.15.0
    - babel-jest: from 23.6.0 to version 27.0.6
    - canvas: from 2.1.0 to version 2.8.0
    - eslint: from 5.12.0 to version 7.32.0
    - jest-canvas-mock: from 1.1.0 to version 2.3.1
    - jsdoc: from 3.5.5 to version 3.6.7
    - parcel-bundler: from 1.10.3 to version 1.12.5
    - sass: from 1.14.3 to version 1.37.5

### Removed
- The package "babel-core" was removed.
- The package "babel-preset-es2015" was removed.

---

## 1.4.0 - 2021-05-27
### Changed
- OpenLayers package from 6.3.1 to 6.5.0
- Default backgroundImage is changed to ""

---

## 1.3.0 - 2020-05-25
### Added
- New parameters constrainResolution and constrainOnlyCenter to create the map view

---

## 1.2.0 - 2020-05-14
### Changed
- The dependency on the OL package has been updated to version 6:
    - The function getGetFeatureInfoUrl is changed into getFeatureInfoUrl
    - The function ol/source/Vector#clear() is changed into ol/source/Vector#refresh() to re-render a vector layer

### Fixed
- Loading layer form separat Layer file in unit test

---

## 1.1.0 - 2020-04-14
### Added
- New function to set the start resolution by resolution or zoom level
- An error handling during initial loading of the LayerList was added

### Changed
- The function getMapProjection is now available globally

### Fixed
- Fixes a timeout problem that occurred when initializing the layerList
- The projections have delivered duplicates, these are now filtered out

---

## 1.0.0 - 2019-07-29
- Initial implementation.
