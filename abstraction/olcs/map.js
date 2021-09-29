import OLCesium from "olcs/OLCesium.js";
import VectorSynchronizer from "olcs/VectorSynchronizer.js";
import FixedOverlaySynchronizer from "./3dUtils/fixedOverlaySynchronizer.js";
import WMSRasterSynchronizer from "./3dUtils/wmsRasterSynchronizer.js";
import {transform, get} from "ol/proj.js";

let interactions = [],
    mapIdCounter = 0;


/**
 * Reacts to 3d click event in cesium scene.
 * @param {Object} map3d The 3D map.
 * @param {Object} mapProjection The map projection.
 * @param {Event} event The cesium event.
 * @returns {void}
*/
function reactTo3DClickEvent (map3d, mapProjection, event) {
    const scene = map3d.getCesiumScene(),
        ray = scene.camera.getPickRay(event.position),
        cartesian = scene.globe.pick(ray, scene);
    let height,
        coords,
        cartographic,
        distance,
        resolution,
        transformedCoords,
        transformedPickedPosition,
        pickedPositionCartesian,
        cartographicPickedPosition;

    if (cartesian) {
        if (document.querySelector(".nav li") && document.querySelector(".nav li").classList.contains("open")) {
            document.querySelector(".nav li").classList.remove("open");
        }
        cartographic = scene.globe.ellipsoid.cartesianToCartographic(cartesian);
        coords = [window.Cesium.Math.toDegrees(cartographic.longitude), window.Cesium.Math.toDegrees(cartographic.latitude)];
        height = scene.globe.getHeight(cartographic);
        if (height) {
            coords = coords.concat([height]);
        }

        distance = window.Cesium.Cartesian3.distance(cartesian, scene.camera.position);
        resolution = map3d.getCamera().calcResolutionForDistance(distance, cartographic.latitude);
        transformedCoords = transform(coords, get("EPSG:4326"), mapProjection);
        transformedPickedPosition = null;

        if (scene.pickPositionSupported) {
            pickedPositionCartesian = scene.pickPosition(event.position);
            if (pickedPositionCartesian) {
                cartographicPickedPosition = scene.globe.ellipsoid.cartesianToCartographic(pickedPositionCartesian);
                transformedPickedPosition = transform([window.Cesium.Math.toDegrees(cartographicPickedPosition.longitude), window.Cesium.Math.toDegrees(cartographicPickedPosition.latitude)], get("EPSG:4326"), mapProjection);
                transformedPickedPosition.push(cartographicPickedPosition.height);
            }
        }

        // store.dispatch("Map/updateClick", {map3d, position: event.position, pickedPosition: transformedPickedPosition, coordinate: transformedCoords, latitude: coords[0], longitude: coords[1], resolution: resolution, originalEvent: event, map: map3d});
        interactions.forEach(interaction => {
            event.coordinate = transformedCoords;
            event.cartesian = cartesian;
            interaction.handler(event);
        });
    }
}

/**
     * Logic to listen to click events in 3d mode.
     * @param {Object} map3D The 3D map.
     * @param {Object} mapProjection The map projection.
     * @returns {void}
     */
function handle3DEvents (map3D, mapProjection) {
    const eventHandler = new window.Cesium.ScreenSpaceEventHandler(map3D.getCesiumScene().canvas);

    eventHandler.setInputAction(reactTo3DClickEvent.bind(null, map3D, mapProjection), window.Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

export default {
    /**
     * Creates a 3D-map.
     * @param {Object} settings The settings for the 3D-map.
     * @param {module:ol/PluggableMap~PluggableMap} settings.map2D The 2D-Map.
     * @param {Cesium.JulianDate} settings.shadowTime The shadow time in julian date format if undefined olcs default is Cesium.JulianDate.now().
     * @returns {void}
     */
    createMap: function (settings) {
        const map3D = new OLCesium({
            map: settings.map2D,
            time: settings.shadowTime ? settings.shadowTime : undefined,
            sceneOptions: {
                shadows: false
            },
            stopOpenLayersEventsPropagation: true,
            createSynchronizers: (olMap, scene) => {
                return [new WMSRasterSynchronizer(olMap, scene), new VectorSynchronizer(olMap, scene), new FixedOverlaySynchronizer(olMap, scene)];
            }
        });

        map3D.id = `map3D_${mapIdCounter}`;
        map3D.mapMode = "3D";
        mapIdCounter = mapIdCounter + 1;
        handle3DEvents(map3D, settings.mapProjection);

        return map3D;
    },


    /**
     * Adds an interaction to list of interactions. The handler of it is executed  after click with the param event.
     * @param {Object} interaction the interaction to execute
     * @returns {void}
     */
    addInteraction (interaction) {
        interactions.push(interaction);
    },

    /**
     * Removes an interaction from list of interactions.
     * @param {Object} interactionToRemove to remove
     * @returns {void}
     */
    removeInteraction (interactionToRemove) {
        interactions = interactions.filter(interaction => interaction !== interactionToRemove);
    }
};


