# Changelog masterportalAPI
 All important changes in this project are stored in this file.

 The [Semantic Versioning](https://semver.org/spec/v2.0.0.html) is used.

## Unreleased - in development
### Added
- New parameters constrainResolution and constrainOnlyCenter to create the map view
### Changed
- The function getGetFeatureInfoUrl is changed into getFeatureInfoUrl
- The function ol/source/Vector#clear() is changed into ol/source/Vector#refresh() to re-render a vector layer 
### Deprecated

### Removed

### Fixed
- Loading layer form separat Layer file in unit test 

---

## 1.2.0 - 2020-05-14
### Changed
- The dependency on the OL package has been updated to version 6

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
