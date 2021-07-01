/**
 * @module olcs.WMSRasterSynchronizer
 */
import olLayerGroup from "ol/layer/Group.js";
import {getUid} from "olcs/util.js";
import TileWMS from "ol/source/TileWMS.js";
import olcsAbstractSynchronizer from "olcs/AbstractSynchronizer.js";
import olcsCore from "olcs/core.js";
import {Tile, Image as ImageLayer} from "ol/layer.js";
import {stableSort} from "ol/array.js";
import {getBottomLeft, getBottomRight, getTopRight, getTopLeft} from "ol/extent.js";
import {transformExtent} from "ol/proj.js";
import StaticImageSource from "ol/source/ImageStatic";
import proj4 from "proj4";

/**
 * Represents a WMSRasterSynchronizer.
 */
class WMSRasterSynchronizer extends olcsAbstractSynchronizer {
    /**
     * This object takes care of one-directional synchronization of
     * Openlayers WMS raster layers to the given Cesium globe. This Synchronizer
     * assumes that the given WMS supports EPSG Code 4326 (WGS84)
     * @param {!ol.Map} map -
     * @param {!Cesium.Scene} scene -
     * @constructor
     * @extends {olcs.AbstractSynchronizer.<Cesium.ImageryLayer>}
     * @api
     * @struct
     */
    constructor (map, scene) {
        super(map, scene);
        /**
         * @type {!Cesium.ImageryLayerCollection}
         * @private
         */
        this.cesiumLayers = scene.imageryLayers;

        /**
         * @type {!Cesium.ImageryLayerCollection}
         * @private
         */
        this.ourLayers = new Cesium.ImageryLayerCollection();
    }


    /**
     * @inheritDoc
     */
    addCesiumObject (object) {
        this.cesiumLayers.add(object);
        this.ourLayers.add(object);
    }


    /**
     * @inheritDoc
     */
    destroyCesiumObject (object) {
        object.destroy();
    }


    /**
     * @inheritDoc
     */
    removeSingleCesiumObject (object, destroy) {
        this.cesiumLayers.remove(object, destroy);
        this.ourLayers.remove(object, false);
    }


    /**
     * @inheritDoc
     */
    removeAllCesiumObjects (destroy) {
        for (let i = 0; i < this.ourLayers.length; ++i) {
            this.cesiumLayers.remove(this.ourLayers.get(i), destroy);
        }
        this.ourLayers.removeAll(false);
    }


    /**
     * Creates an array of Cesium.ImageryLayer.
     * May be overriden by child classes to implement custom behavior.
     * The default implementation handles tiled imageries in EPSG:4326 or
     * EPSG:3859.
     * @param {!ol.layer.Base} olLayer -
     * @param {?ol.proj.Projection} viewProj Projection of the view.
     * @return {?Array.<!Cesium.ImageryLayer>} array or null if not possible
     * (or supported)
     * @protected
     */
    convertLayerToCesiumImageries (olLayer, viewProj) {
        let layerOptions = {
                "show": false
            },
            source = {},
            cesiumLayer = {},
            provider = null;

        if (!(olLayer instanceof Tile) && !(olLayer instanceof ImageLayer)) {
            return null;
        }

        source = olLayer.getSource();

        if (source instanceof TileWMS) {
            const params = source.getParams(),
                options = {
                    "url": source.getUrls()[0],
                    "parameters": params,
                    "layers": params.LAYERS,
                    "show": false
                },
                tileGrid = source.getTileGrid();

            if (tileGrid) {
                const ext = olLayer.getExtent();

                if (ext && viewProj) {
                    options.rectangle = olcsCore.extentToRectangle(ext, viewProj);
                    const minMax = this.getMinMaxLevelFromTileGrid(tileGrid, ext, viewProj);

                    options.tileWidth = tileGrid.getTileSize(0)[0];
                    options.tileHeight = tileGrid.getTileSize(0)[1];
                    options.minimumLevel = minMax[0];
                    options.maximumLevel = minMax[1];
                }
            }

            provider = new Cesium.WebMapServiceImageryProvider(options);
        }
        else if (source instanceof StaticImageSource) {
            const extent = source.getImageExtent(),
                options = {
                    "url": source.getUrl(),
                    "show": false
                },
                bottomLeftCorner = proj4("EPSG:25832", "EPSG:4326", getBottomLeft(extent)),
                topRightCorner = proj4("EPSG:25832", "EPSG:4326", getTopRight(extent));

            options.rectangle = Cesium.Rectangle.fromDegrees(bottomLeftCorner[0], bottomLeftCorner[1], topRightCorner[0], topRightCorner[1]);
            provider = new Cesium.SingleTileImageryProvider(options);

        }
        else {
        // sources other than TileImage are currently not supported
            return null;
        }

        // the provider is always non-null if we got this far
        layerOptions = {
            "show": false
        };
        cesiumLayer = new Cesium.ImageryLayer(provider, layerOptions);

        return cesiumLayer ? [cesiumLayer] : null;
    }

    /**
     *
     * @param {ol.Extent} extent -
     * @param {ol.ProjectionLike} projection -
     * @return {Array.<Cesium.Cartographic>} -
     * @private
     */
    getExtentPoints (extent, projection) {
        const wgs84Extent = transformExtent(extent, projection, "EPSG:4326"),
            olCoords = [
                getBottomLeft(wgs84Extent),
                getBottomRight(wgs84Extent),
                getTopRight(wgs84Extent),
                getTopLeft(wgs84Extent)
            ];

        return olCoords.map(coord => Cesium.Cartographic.fromDegrees(coord[0], coord[1]));
    }
    /**
     *
     * @param {ol.tilegrid.TileGrid} tilegrid -
     * @param {ol.Extent} extent -
     * @param {ol.ProjectionLike} projection -
     * @return {Array.<Number>} -
     */
    getMinMaxLevelFromTileGrid (tilegrid, extent, projection) {
        const olCoords = [
                getBottomLeft(extent),
                getBottomRight(extent),
                getTopRight(extent),
                getTopLeft(extent)
            ],
            resolution = tilegrid.getResolutions().slice(-1).pop(),
            tileCoordsLocal = olCoords.map(position => tilegrid.getTileCoordForCoordAndResolution(position, resolution)),
            distanceLocalX = Math.abs(tileCoordsLocal[0][1] - tileCoordsLocal[1][1]),
            distanceLocalY = Math.abs(tileCoordsLocal[0][2] - tileCoordsLocal[3][2]),
            extentCoords = this.getExtentPoints(extent, projection),
            tilingScheme = new Cesium.GeographicTilingScheme({});
        let minLevel = 0,
            maxLevel = 20;

        while (minLevel < maxLevel) {
            /* eslint-disable no-loop-func */

            const tileCoords = extentCoords.map(position => tilingScheme.positionToTileXY(position, minLevel)),
                distances = [];
            /* eslint-enable  no-loop-func */

            distances.push(Math.abs(tileCoords[0].x - tileCoords[1].x));
            distances.push(Math.abs(tileCoords[0].y - tileCoords[3].y));
            if (distances[0] > 1 || distances[1] > 1) {
                minLevel--;
                break;
            }
            minLevel++;
        }
        while (maxLevel > minLevel) {
            /* eslint-disable no-loop-func */

            const tileCoords = extentCoords.map(position => tilingScheme.positionToTileXY(position, maxLevel)),
                distances = [];
            /* eslint-enable  no-loop-func */

            distances.push(Math.abs(tileCoords[0].x - tileCoords[1].x));
            distances.push(Math.abs(tileCoords[0].y - tileCoords[3].y));
            if (distances[0] < distanceLocalX || distances[1] < distanceLocalY) {
                maxLevel++;
                break;
            }
            maxLevel--;
        }
        return [minLevel, maxLevel];
    }

    /**
     * @inheritDoc
     */
    createSingleLayerCounterparts (olLayerWithParents) {
        const olLayer = olLayerWithParents.layer,
            uid = getUid(olLayer).toString(),
            viewProj = this.view.getProjection(),
            cesiumObjects = this.convertLayerToCesiumImageries(olLayer, viewProj);

        if (cesiumObjects) {
            const listenKeyArray = [];

            [olLayerWithParents.layer].concat(olLayerWithParents.parents).forEach((olLayerItem) => {
                listenKeyArray.push(olLayerItem.on(["change:opacity", "change:visible"], () => {
                // the compiler does not seem to be able to infer this
                    /* eslint-disable no-console */

                    console.assert(cesiumObjects);
                    /* eslint-enable no-console */
                    for (let i = 0; i < cesiumObjects.length; ++i) {
                        olcsCore.updateCesiumLayerProperties(olLayerWithParents, cesiumObjects[i]);
                    }
                }));
            });

            for (let i = 0; i < cesiumObjects.length; ++i) {
                olcsCore.updateCesiumLayerProperties(olLayerWithParents, cesiumObjects[i]);
            }

            // there is no way to modify Cesium layer extent,
            // we have to recreate when OpenLayers layer extent changes:
            listenKeyArray.push(olLayer.on("change:extent", function () {
                for (let i = 0; i < cesiumObjects.length; ++i) {
                    this.cesiumLayers.remove(cesiumObjects[i], true); // destroy
                    this.ourLayers.remove(cesiumObjects[i], false);
                }
                delete this.layerMap[getUid(olLayer)]; // invalidate the map entry
                this.synchronize();
            }, this));

            listenKeyArray.push(olLayer.on("change", function () {
                // when the source changes, re-add the layer to force update
                for (let i = 0; i < cesiumObjects.length; ++i) {
                    const position = this.cesiumLayers.indexOf(cesiumObjects[i]);

                    if (position >= 0) {
                        this.cesiumLayers.remove(cesiumObjects[i], false);
                        this.cesiumLayers.add(cesiumObjects[i], position);
                    }
                }
            }.bind(this)));

            this.olLayerListenKeys[uid].push(...listenKeyArray);
        }

        return Array.isArray(cesiumObjects) ? cesiumObjects : null;
    }

    /**
     * Order counterparts using the same algorithm as the Openlayers renderer:
     * z-index then original sequence order.
     * @override
     * @protected
     */
    orderLayers () {
        const layers = [],
            zIndices = {},
            queue = [this.mapLayerGroup];

        while (queue.length > 0) {
            const olLayer = queue.splice(0, 1)[0];

            layers.push(olLayer);
            zIndices[getUid(olLayer)] = olLayer.getZIndex();

            if (olLayer instanceof olLayerGroup) {
                const sublayers = olLayer.getLayers();

                if (sublayers) {
                    // Prepend queue with sublayers in order
                    queue.unshift(...sublayers.getArray());
                }
            }
        }

        stableSort(layers, (layer1, layer2) => zIndices[getUid(layer1)] - zIndices[getUid(layer2)]);

        layers.forEach(function (olLayer) {
            const olLayerId = getUid(olLayer).toString(),
                cesiumObjects = this.layerMap[olLayerId];

            if (cesiumObjects) {
                cesiumObjects.forEach(this.raiseToTop, this);
            }
        }, this);
    }

    /**
     * @param {Cesium.ImageryLayer} counterpart -
     * @returns {void}
     */
    raiseToTop (counterpart) {
        this.cesiumLayers.raiseToTop(counterpart);
    }
}

export default WMSRasterSynchronizer;
