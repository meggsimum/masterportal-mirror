/* eslint-disable prefer-rest-params */

/*
 * Scripts meant for execution within driver.executeScript function.
 * Rest params can not be used; see docs on why arguments is used.
 * https://selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/ie_exports_Driver.html#executeScript
 */

/**
 * Mocks the browser's GeoLocationAPI to make it usable in tests.
 * From https://github.com/janmonschke/GeoMock/blob/master/geomock.js
 */
const mockGeoLocationAPI = `
(function() {
    (function() {
        if (typeof navigator === "undefined" || navigator === null) {
            window.navigator = {};
        }
        if (navigator.geolocation == null) {
            window.navigator.geolocation = {};
        }
        navigator.geolocation.mock = true;
        navigator.geolocation.delay = 1000;
        navigator.geolocation.shouldFail = false;
        navigator.geolocation.failsAt = -1;
        navigator.geolocation.errorMessage = "There was an error retrieving the position!";
        navigator.geolocation.currentTimeout = -1;
        navigator.geolocation.lastPosReturned = 0;
        navigator.geolocation._sanitizeLastReturned = function() {
            if (this.lastPosReturned > this.waypoints.length - 1) {
                return this.lastPosReturned = 0;
            }
        };
        navigator.geolocation._geoCall = function(method, success, error) {
            var _this = this;
            if (this.shouldFail && (error != null)) {
                return this.currentTimeout = window[method].call(null, function() {
                    return error(_this.errorMessage);
                }, this.delay);
            } else {
                if (success != null) {
                    return this.currentTimeout = window[method].call(null, function() {
                        success(_this.waypoints[_this.lastPosReturned++]);
                        return _this._sanitizeLastReturned();
                    }, this.delay);
                }
            }
        };
        navigator.geolocation.getCurrentPosition = function(success, error) {
            return this._geoCall("setTimeout", success, error);
        };
        navigator.geolocation.watchPosition = function(success, error) {
            this._geoCall("setInterval", success, error);
            return this.currentTimeout;
        };
        navigator.geolocation.clearWatch = function(id) {
            return clearInterval(id);
        };
        return navigator.geolocation.waypoints = [
            { coords: { latitude: 53.553567, longitude: 9.993051, accuracy: 1500 } },
            { coords: { latitude: 53.553546, longitude: 9.993097, accuracy: 1334 } },
            { coords: { latitude: 53.553530, longitude: 9.993132, accuracy: 631 } },
            { coords: { latitude: 53.553509, longitude: 9.993175, accuracy: 361 } },
            { coords: { latitude: 53.553485, longitude: 9.993213, accuracy: 150 } },
            { coords: { latitude: 53.553469, longitude: 9.993245, accuracy: 65 } },
            { coords: { latitude: 53.553475, longitude: 9.993307, accuracy: 65 } },
            { coords: { latitude: 53.553507, longitude: 9.993374, accuracy: 65 } },
            { coords: { latitude: 53.553542, longitude: 9.993463, accuracy: 65 } },
            { coords: { latitude: 53.553574, longitude: 9.993541, accuracy: 65 } }
        ];
    })();
}).call(this);
`;

/**
 * Scrolls the first given argument up.
 * Needed since selenium does not support scrolling.
 * @param {WebElement} x element to scroll
 * @returns {void}
 */
function mouseWheelUp () {
    arguments[0].dispatchEvent(new WheelEvent("wheel", {
        view: window,
        bubbles: true,
        cancelable: true,
        deltaY: -100
    }));
}

/**
 * Scrolls the first given argument down.
 * Needed since selenium does not support scrolling.
 * @param {WebElement} x element to scroll
 * @returns {void}
 */
function mouseWheelDown () {
    arguments[0].dispatchEvent(new WheelEvent("wheel", {
        view: window,
        bubbles: true,
        cancelable: true,
        deltaY: 100
    }));
}

/**
 * Checks whether a layer is visible.
 * @param {String} layerId id of layer to check
 * @param {String} [opacity="1"] expected value between 0 and 1
 * @returns {boolean} true if AND(layer exists, layer is visible, layer opacity is as expected)
 */
function isLayerVisible () {
    const map = Backbone.Radio.request("Map", "getMap"),
        expectedOpacity = typeof arguments[1] === "undefined" ? "1" : arguments[1];
    let layer = false;

    map.getLayers().forEach(l => {
        if (l.get("id") === arguments[0]) {
            layer = l;
        }
    });

    return layer
        ? layer.getVisible() && layer.getOpacity() === Number(expectedOpacity)
        : false;
}
/**
 * Returns true, if mapMarker with name "markerPoint" is visible.
 * @returns {boolean} true, if mapMarker is visible
 */
function isMarkerPointVisible () {
    const map = Backbone.Radio.request("Map", "getMap");
    let layer = false;

    map.getLayers().forEach(l => {
        if (l.get("name") === "markerPoint") {
            layer = l;
        }
    });
    if (layer) {
        return layer.getVisible();
    }
    return false;
}
/**
 * Returns the coordinates of the mapMarker with name "markerPoint" or null, if no marker exists.
 * @returns {Array} containing the coordinates
 */
function getMarkerPointCoord () {
    const map = Backbone.Radio.request("Map", "getMap");
    let layer = false;

    map.getLayers().forEach(l => {
        if (l.get("name") === "markerPoint") {
            layer = l;
        }
    });
    if (layer) {
        const feature = layer.getSource().getFeatures()[0];

        if (feature) {
            return feature.getGeometry().getCoordinates();
        }
    }
    return null;
}


/**
 * @param {string} name name of layer to check features of
 * @param {number} length expected length of feature list
 * @returns {boolean} true if layer with "name" exists and its source has "length" features
 */
function hasVectorLayerLength () {
    const layer = Backbone.Radio.request("Map", "getMap")
        .getLayers()
        .getArray()
        .filter(l => l.get("name") === arguments[0])[0];

    return layer
        ? layer.getSource()
            .getFeatures()
            .length === arguments[1]
        : false;
}

/**
 * Function used to check a vector layer's style.
 * Extend whenever further properties are needed for a comparison.
 * @param {string} name name of layer to check style of
 * @param {object} params set of optional parameters to check for
 * @param {(string|object)} [params.stroke.color] expected color of stroke
 * @param {(string|object)} [params.fill.color] expected color of fill
 * @returns {boolean} true if layer with "name" exists and its source has "length" features
 */
function hasVectorLayerStyle () {
    const layer = Backbone.Radio.request("Map", "getMap")
            .getLayers()
            .getArray()
            .filter(l => l.get("name") === arguments[0])[0],
        {stroke, fill} = arguments[1];

    if (stroke) {
        if (stroke.color) {
            if (JSON.stringify(layer.getSource().getFeatures()[0].getStyle()[0].getStroke().getColor()) !== JSON.stringify(stroke.color)) {
                return false;
            }
        }
    }

    if (fill) {
        if (fill.color) {
            if (JSON.stringify(layer.getSource().getFeatures()[0].getStyle()[0].getFill().getColor()) !== JSON.stringify(fill.color)) {
                return false;
            }
        }
    }

    return true;
}

/**
 * Checks whether layers are present in given order. Additional layers may be present.
 * @param {String[]} layerIds layers should be present left-to-right (equals bottom-to-top)
 * @returns {boolean} true if all given layers found and in requested order
 */
function areLayersOrdered () {
    const layerIds = arguments[0],
        map = Backbone.Radio.request("Map", "getMap");

    map.getLayers().forEach(l => {
        if (l.get("id") === layerIds[0]) {
            layerIds.shift();
        }
    });

    return layerIds.length === 0;
}

/**
 * Checks whether a layer exists with the specified features.
 * @param {object[]} features feature-defining array; following object fields are checked
 *                            "coordinate": whether the feature is at this coordinate
 *                            "image": whether the feature is styled to have this image set (optional)
 *                            add more fields as needed
 * @returns {boolean} true if a layer was found that holds all features as specified
 */
function doesLayerWithFeaturesExist () {
    const map = Backbone.Radio.request("Map", "getMap"),
        searched = arguments[0];
    let found = false;

    map.getLayers().forEach(layer => {
        if (found) {
            return;
        }

        // if all searched features are found, mark found=true
        for (const {coordinate, image} of searched) {
            const features = layer.getSource && layer.getSource().getFeatures && layer.getSource().getFeatures();

            if (!features) {
                return;
            }

            let feature = null;

            for (const option of features) {
                const currentCoordinate = option.getGeometry().flatCoordinates;

                if (currentCoordinate && coordinate[0] === currentCoordinate[0] && coordinate[1] === currentCoordinate[1]) {
                    feature = option;
                    break;
                }
            }

            // if no feature at coordinate or feature does not have matching set image, it's not the right feature
            if (!feature || (image && feature.getStyle() && feature.getStyle().getImage().iconImage_.src_ !== image)) {
                return;
            }
        }

        found = true;
    });

    return found;
}

/** @returns {boolean} true if all of map.getLayers have visibility set to false */
function areAllLayersHidden () {
    return !Backbone.Radio
        .request("Map", "getMap")
        .getLayers()
        .getArray()
        .map(l => l.getVisible())
        .reduce((acc, next) => acc || next, false);
}

/**
 * Function will check if none of a layer's features' style hold 'null'.
 * @param {string} id id of layer to check
 * @returns {boolean} true if all features of a layer are visible
 */
function areAllFeaturesOfLayerVisible () {
    return Backbone.Radio
        .request("Map", "getMap")
        .getLayers()
        .getArray()
        .find(l => l.get("id") === arguments[0])
        .getSource()
        .getFeatures()
        .map(f => f.getStyle())
        .reduce((accumulator, current) => accumulator && current !== null, true);
}

/**
 * @param {string[]} texts texts to search for
 * @returns {boolean} true if all texts are found in order as feature texts
 */
function areRegExpsInMeasureLayer () {
    const texts = Backbone.Radio.request("Map", "getMap")
            .getLayers()
            .getArray()
            .filter(l => l.get("name") === "measure_layer")[0]
            .getSource()
            .getFeatures()
            .map(f => f.getStyle())
            .filter(s => s)
            .reduce((acc, curr) => [...acc, ...curr], [])
            .map(s => s.getText().getText()),
        regExps = arguments[0].map(s => new RegExp(s));

    for (const re of regExps) {
        let found = false;

        for (const text of texts) {
            if (re.test(text)) {
                found = true;
                break;
            }
        }
        if (!found) {
            return false;
        }
    }

    return true;
}

/**
 * Returns the etxts contained in styles of measure_layer.
 * @returns {string} the texts
 */
function getMeasureLayersTexts () {
    const texts = Backbone.Radio.request("Map", "getMap")
        .getLayers()
        .getArray()
        .filter(l => l.get("name") === "measure_layer")[0]
        .getSource()
        .getFeatures()
        .map(f => f.getStyle())
        .filter(s => s)
        .reduce((acc, curr) => [...acc, ...curr], [])
        .map(s => s.getText().getText());

    return texts;
}
/**
 * @param {number} x number of feature to return coordinates of
 * @param {string} name name of layer to retrieve feature of
 * @returns {(Array.<number[]> | null)} coordinates or null if layer or feature not found
 */
function getCoordinatesOfXthFeatureInLayer () {
    const layer = Backbone.Radio.request("Map", "getMap")
        .getLayers()
        .getArray()
        .filter(l => l.get("name") === arguments[1])[0];

    if (layer) {
        const feature = layer.getSource().getFeatures()[arguments[0]];

        if (feature) {
            return feature.getGeometry().getCoordinates();
        }
    }

    return null;
}
/**
 * Returns true, if loader is no longer visible.
 * @returns {void}
 */
function isInitalLoadingFinished () {
    return typeof window.INITIAL_LOADING === "boolean" && window.INITIAL_LOADING === false;
}

/**
 * @param {HTMLElement} img image to check
 * @returns {boolean} true if image loaded */
function imageLoaded () {
    return arguments[0].complete &&
        typeof arguments[0].naturalWidth !== "undefined" &&
        arguments[0].naturalWidth > 0;
}

/** @returns {boolean} true if oblique map responds to be turned on */
function isObModeOn () {
    return Backbone.Radio.request("ObliqueMap", "isActive");
}

/**
 * Checks whether browser is in fullscreen mode.
 * @returns {boolean} true if fullscreen is detected
 */
function isFullscreen () {
    // should be used according to MDN https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
    return Boolean(document.fullscreenElement);
}

/**
 * @returns {ol/coordinate~Coordinate} center coordinate
 */
function getCenter () {
    return Backbone.Radio.request("MapView", "getCenter");
}
/**
 * @returns {ol/coordinate~Coordinate} the extent
 */
function getExtent () {
    return Backbone.Radio.request("MapView", "getCurrentExtent");
}
/**
 * @returns {Number} heading in 3D mode
 */
function get3DHeading () {
    return Backbone.Radio.request("Map", "getMap3d").getCamera().getHeading();
}
/**
 * @returns {Number} tilt in 3D mode
 */
function get3DTilt () {
    return Backbone.Radio.request("Map", "getMap3d").getCamera().getTilt();
}
/**
 * @returns {Number} altitude in 3D mode
 */
function get3DAltitude () {
    return Backbone.Radio.request("Map", "getMap3d").getCamera().getAltitude();
}

/**
 * @returns {String} The scale of the map.
 */
function getScale () {
    const options = Backbone.Radio.request("MapView", "getOptions");

    return options ? options.scale : null;
}

/**
 * @returns {Number} current resolution of MapView
 */
function getResolution () {
    const options = Backbone.Radio.request("MapView", "getOptions");

    return options ? options.resolution : null;
}

/**
 * @returns {Number} tilt value in 3D mode
 */
function getTilt () {
    return Backbone.Radio.request("Map", "getMap3d").getCamera().getTilt();
}

/**
 * @returns {Number} heading value in 3D mode
 */
function getHeading () {
    return Backbone.Radio.request("Map", "getMap3d").getCamera().getHeading();
}

/** @returns {(Number | null)} currently active OB mode direction flag */
function getDirection () {
    const currentDirection = Backbone.Radio.request("ObliqueMap", "getCurrentDirection");

    return currentDirection ? currentDirection.direction : null;
}

/** @returns {(Number | null)} OB mode resolution */
function getObModeResolution () {
    const currentDirection = Backbone.Radio.request("ObliqueMap", "getCurrentDirection");

    return currentDirection ? currentDirection.currentView.view.getResolution() : null;
}

/**
 * @param {Number[]} coords target coordinates
 * @returns {void}
 */
function setCenter () {
    Backbone.Radio.trigger("MapView", "setCenter", arguments[0], arguments[1]);
}

/**
 * @param {Number} tilt value for 3D mode
 * @returns {void}
 */
function setTilt (tilt) {
    Backbone.Radio.request("Map", "getMap3d").getCamera().setTilt(tilt);
}

/**
 * Increases zoom level by 1.
 * @returns {void}
 */
function zoomIn () {
    Backbone.Radio.trigger("MapView", "setZoomLevelUp");
}

/**
 * Reduces zoom level by 1.
 * @returns {void}
 */
function zoomOut () {
    Backbone.Radio.trigger("MapView", "setZoomLevelDown");
}

/**
 * Sets resolution to given value.
 * @returns {void}
 */
function setResolution () {
    Backbone.Radio.trigger("MapView", "setResolution", arguments[0]);
}

/**
 * Function will sort out special layers not in tree, e.g. 3D layers, invisible layers, mapMarker layer.
 * @returns {string[]} layers by id
 */
function getOrderedLayerIds () {
    return Backbone
        .Radio
        .request("Map", "getMap")
        .getLayers()
        .getArray()
        .sort((layer1, layer2) => {
            const a = layer1.get("zIndex"),
                b = layer2.get("zIndex");

            if (a < b) {
                return -1;
            }
            if (a > b) {
                return 1;
            }
            return 0;
        })
        .map(layer => {
            if (layer.get("id")) {
                // if id available, use it
                return layer.get("id");
            }
            if (layer.get("layers")) {
                // if children available, fetch their ids (flattened)
                return layer.get("layers").array_.map(l => l.get("id"));
            }
            // else return false to sort layer out
            return false;
        })
        .filter(id => id) // sort out functional layers, e.g. mapMarker layer
        .filter(id => !["12883", "12884", "13032", "zoom_to_feature_layer", "measure_layer", "import_draw_layer"].includes(id)) // sort out e.g. oblique layer not initially visible
        .map(id => Array.isArray(id) ? id[0] : id) // MP always uses first id as representant
        .map(id => String(parseInt(id, 10))) // e.g. "1933geofox_stations" should only be 1933 for comparison
        .reverse(); // layers are returned in "inverted" order (last is first in tree)
}

module.exports = {
    mockGeoLocationAPI,
    mouseWheelUp,
    mouseWheelDown,
    areAllLayersHidden,
    areRegExpsInMeasureLayer,
    areAllFeaturesOfLayerVisible,
    get3DHeading,
    get3DTilt,
    get3DAltitude,
    getMarkerPointCoord,
    getMeasureLayersTexts,
    isFullscreen,
    isLayerVisible,
    isMarkerPointVisible,
    imageLoaded,
    isInitalLoadingFinished,
    isObModeOn,
    getOrderedLayerIds,
    getObModeResolution,
    getCoordinatesOfXthFeatureInLayer,
    hasVectorLayerLength,
    hasVectorLayerStyle,
    areLayersOrdered,
    doesLayerWithFeaturesExist,
    getCenter,
    getExtent,
    getResolution,
    getScale,
    getTilt,
    getHeading,
    getDirection,
    setCenter,
    setResolution,
    setTilt,
    zoomIn,
    zoomOut
};

/* eslint-enable prefer-rest-params */
