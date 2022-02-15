import mapCollection from "../dataStorage/mapCollection";
import {getMapMode} from "./maps.js";

const channel = Radio.channel("Map");

channel.reply({
    "getLayers": function () {
        return mapCollection.getMap("ol", "2D").getLayers();
    },
    "createLayerIfNotExists": function (name) {
        return mapCollection.getMap("ol", "2D").addNewLayerIfNotExists(name);
    },
    "getSize": function () {
        return mapCollection.getMap("ol", "2D").getSize();
    },
    "registerListener": function (event, callback, context) {
        mapCollection.getMap("ol", "2D").registerListener(event, callback, context);
    },
    "getMap": function () {
        return mapCollection.getMap("ol", "2D");
    },
    "getLayerByName": function (name) {
        return mapCollection.getMap("ol", "2D").getLayerByName(name);
    },
    "getMapMode": getMapMode
});

channel.on({
    "addLayerToIndex": function (args) {
        mapCollection.getMap("ol", "2D").addLayerToIndex(args[0], args[1]);
    },
    "addLayerOnTop": function (layer) {
        mapCollection.getMap("ol", "2D").addLayer(layer);
    },
    "addOverlay": function (overlay) {
        mapCollection.getMap("ol", "2D").addOverlay(overlay);
    },
    "addInteraction": function (interaction) {
        mapCollection.getMap("ol", "2D").addInteraction(interaction);
    },
    "removeLayer": function (layer) {
        mapCollection.getMap("ol", "2D").removeLayer(layer);
    },
    "removeOverlay": function (overlay) {
        mapCollection.getMap("ol", "2D").removeOverlay(overlay);
    },
    "removeInteraction": function (interaction) {
        mapCollection.getMap("ol", "2D").removeInteraction(interaction);
    },
    "setBBox": function (bbox) {
        mapCollection.getMapView("ol", "2D").setBBox(bbox);
    },
    "render": function () {
        mapCollection.getMap("ol", "2D").render();
    },
    "zoomToExtent": function (extent, options) {
        mapCollection.getMapView("ol", "2D").zoomToExtent(extent, options);
    },
    "zoomToProjExtent": function (data) {
        mapCollection.getMapView("ol", "2D").zoomToProjExtent(data);
    },
    "zoomToFilteredFeatures": function (ids, layerId, zoomOptions) {
        mapCollection.getMapView("ol", "2D").zoomToFilteredFeatures(ids, layerId, zoomOptions);
    },
    "registerListener": function (event, callback, context) {
        mapCollection.getMap("ol", "2D").registerListener(event, callback, context);
    },
    "unregisterListener": function (event, callback, context) {
        mapCollection.getMap("ol", "2D").unregisterListener(event, callback, context);
    },
    "updateSize": function () {
        mapCollection.getMap("ol", "2D").updateSize();
    }
});
