# Changelog masterportalAPI
 All important changes in this project are stored in this file.

 The [Semantic Versioning](https://semver.org/spec/v2.0.0.html) is used.

## Unreleased - in development
### Added
- The library Cesium is loaded on demand to generate a 3D map. Cesium must be provided by the user of this library.
- A 3D map can be generated. The generation of 2D and 3D maps is controlled by an abstraction layer.
- The example also contains an example for creating a 3D map.
### Changed
- OpenLayers package updated from 6.6.1 to 6.9.0
- The WMS layer has been extended with layerParams and options. The LayerSource now contains a TileGrid if there are resolutions in the options. The source can also contain attributions.

### Deprecated

### Removed

### Fixed

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
