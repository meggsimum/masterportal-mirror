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
        store.dispatch("Maps/registerListener", {type: event, listener: callback, context: context});
    },
    "getMap": function () {
        return mapCollection.getMap("2D");
    },
    "getLayerByName": function (name) {
        // eslint-disable-next-line new-cap
        return store.getters["Maps/getLayerByName"](name);
    },
    "getMapMode": function () {
        return store.getters["Maps/mode"];
    }
});

channel.on({
    "addLayerToIndex": function (args) {
        store.dispatch("Maps/addLayerToIndex", {layer: args[0], zIndex: args[1]});
    },
    "addLayerOnTop": function (layer) {
        store.dispatch("Maps/addLayer", layer);
    },
    "addOverlay": async function (overlay) {
        await mapCollection.getMap("2D").addOverlay(overlay);
    },
    "addInteraction": function (interaction) {
        store.dispatch("Maps/addInteraction", interaction);
    },
    "removeLayer": function (layer) {
        mapCollection.getMap("2D").removeLayer(layer);
    },
    "removeOverlay": async function (overlay) {
        await mapCollection.getMap("2D").removeOverlay(overlay);
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
    "zoomToExtent": function (extentOptions) {
        store.dispatch("Maps/zoomToExtent", {extent: extentOptions.extent, options: extentOptions.options});
    },
    "zoomToProjExtent": function (data) {
        store.dispatch("Maps/zoomToProjExtent", {data: data});
    },
    "zoomToFilteredFeatures": function (ids, layerId, zoomOptions) {
        store.dispatch("Maps/zoomToFilteredFeatures", {ids: ids, layerId: layerId, zoomOptions: zoomOptions});
    },
    "registerListener": function (event, callback) {
        store.dispatch("Maps/registerListener", {type: event, listener: callback});
    },
    "unregisterListener": function (event, callback) {
        store.dispatch("Maps/unregisterListener", {type: event, listener: callback});
    },
    "updateSize": function () {
        mapCollection.getMap("2D").updateSize();
    }
});
