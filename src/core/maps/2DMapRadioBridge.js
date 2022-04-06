import mapCollection from "../dataStorage/mapCollection";
import mapMode from "./store/actions/actionsMapMode.js";
import store from "../../app-store";

const channel = Radio.channel("Map");

channel.reply({
    "getLayers": function () {
        return mapCollection.getMap("2D").getLayers();
    },
    "createLayerIfNotExists": function (layerName) {
        return store.dispatch("Maps/addNewLayerIfNotExists", {layerName});
    },
    "getSize": function () {
        return mapCollection.getMap("2D").getSize();
    },
    "registerListener": function (event, callback, context) {
        store.dispatch("Maps/registerListener", {event: event, callback: callback, context: context});
    },
    "getMap": function () {
        return mapCollection.getMap("2D");
    },
    "getLayerByName": function (name) {
        return store.dispatch("Maps/getLayerByName", name);
    },
    "getMapMode": mapMode.getMapMode()
});

channel.on({
    "addLayerToIndex": function (args) {
        store.dispatch("Maps/addLayerToIndex", {layer: args[0], zIndex: args[1]});
    },
    "addLayerOnTop": function (layer) {
        store.dispatch("Maps/addLayer", layer);
    },
    "addOverlay": function (overlay) {
        mapCollection.getMap("2D").addOverlay(overlay);
    },
    "addInteraction": function (interaction) {
        store.dispatch("Maps/addInteraction", interaction);
    },
    "removeLayer": function (layer) {
        mapCollection.getMap("2D").removeLayer(layer);
    },
    "removeOverlay": function (overlay) {
        mapCollection.getMap("2D").removeOverlay(overlay);
    },
    "removeInteraction": function (interaction) {
        store.dispatch("Maps/removeInteraction", interaction);
    },
    "setBBox": function (bbox) {
        store.commit("Maps/setBBox", {bbox: bbox});
    },
    "render": function () {
        mapCollection.getMap("2D").render();
    },
    "zoomToExtent": function (extent, options) {
        store.dispatch("Maps/zoomToExtent", {extent: extent, options: options});
    },
    "zoomToProjExtent": function (data) {
        store.dispatch("Maps/zoomToProjExtent", {data: data});
    },
    "zoomToFilteredFeatures": function (ids, layerId, zoomOptions) {
        store.dispatch("Maps/zoomToFilteredFeatures", {ids: ids, layerId: layerId, zoomOptions: zoomOptions});
    },
    "registerListener": function (event, callback) {
        store.dispatch("Maps/registerListener", {event: event, callback: callback});
    },
    "unregisterListener": function (event, callback) {
        store.dispatch("Maps/unregisterListener", {event: event, callback: callback});
    },
    "updateSize": function () {
        mapCollection.getMap("2D").updateSize();
    }
});
